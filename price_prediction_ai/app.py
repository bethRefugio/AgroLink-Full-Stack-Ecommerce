import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Lazy import AI module (only when needed)
ai_module = None

def get_ai_module():
    global ai_module
    if ai_module is None:
        try:
            import ai_price_suggestion_new as ai
            ai_module = ai
        except Exception as e:
            app.logger.error(f"Failed to load AI module: {e}")
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

        if not item_name:
            return jsonify({
                "success": False,
                "message": "item_name is required"
            }), 400

        # Lazy load AI module
        ai = get_ai_module()

        # MongoDB connection from env
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
                "message": f"No historical data found in database"
            }), 404

        # Run prediction
        result = ai.suggest_for_item_from_df(df, item_name, test_size)

        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 404

        return jsonify({
            "success": True,
            "message": "Price suggestion generated",
            "data": result,
            "suggestedPrice": result.get("suggestedPrice"),
            "bestModel": result.get("bestModel")
        }), 200

    except Exception as e:
        app.logger.error(f"suggest-price error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "message": f"Internal error: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)