import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

# import AI module
ai_module = None

def get_ai_module():
    global ai_module
    if ai_module is None:
        try:
            import ai_price_suggestion_new as ai
            ai_module = ai
        except Exception as e:
            app.logger.error(f"Failed to load AI module: {e}")
            traceback.print_exc()
            raise
    return ai_module

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "AgroLink Price AI"}), 200

@app.route('/suggest-price', methods=['POST'])
def suggest_price():
    try:
        data = request.get_json()
        item_name = data.get('item_name', '').strip()
        test_size = int(data.get('test_size', 2))
        use_saved = data.get('use_saved', True)

        if not item_name:
            return jsonify({
                "success": False,
                "message": "item_name is required"
            }), 400

        app.logger.info(f"Processing price suggestion for: {item_name} (use_saved: {use_saved})")

        ai = get_ai_module()

        mongo_uri = os.getenv('MONGODB_URI')
        mongo_db = os.getenv('MONGO_DB', 'test')
        mongo_coll = os.getenv('MONGO_COLLECTION', 'pricesuggestions')

        if not mongo_uri:
            return jsonify({
                "success": False,
                "message": "Database connection not configured"
            }), 500

        # Load data from MongoDB
        df = ai.load_from_mongo(mongo_uri, mongo_db, mongo_coll)
        
        if df.empty:
            return jsonify({
                "success": False,
                "message": f"No historical data found in database for collection: {mongo_coll}"
            }), 404

        app.logger.info(f"Loaded {len(df)} records from database")

        # Run prediction with saved models priority
        result = ai.suggest_for_item_from_df(
            df, 
            item_name, 
            test_size,
            use_saved=use_saved,
            mongo_uri=mongo_uri,
            mongo_db=mongo_db
        )

        if "error" in result:
            app.logger.warning(f"Suggestion error: {result['error']}")
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 404

        from_saved = result.get("fromSavedModels", False)
        app.logger.info(f"Price suggestion generated: ₱{result.get('suggestedPrice')} (from_saved: {from_saved})")

        return jsonify({
            "success": True,
            "message": "Fast prediction from saved models" if from_saved else "🤖 Generated new prediction",
            "data": result,
            "suggestedPrice": result.get("suggestedPrice"),
            "bestModel": result.get("bestModel"),
            "fromSavedModels": from_saved
        }), 200

    except Exception as e:
        app.logger.error(f"suggest-price error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Internal error: {str(e)}"
        }), 500

@app.errorhandler(500)
def handle_error(e):
    return jsonify({
        "success": False,
        "message": "Internal Server Error"
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)