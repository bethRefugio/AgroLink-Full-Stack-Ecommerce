from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Import your AI functions
sys.path.append(os.path.dirname(__file__))
from ai_price_suggestion_new import suggest_for_item_from_df, load_from_mongo

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'AgroLink AI Price Suggestion Service',
        'status': 'running',
        'endpoints': {
            'POST /suggest-price': 'Get price suggestion for an item'
        }
    })

@app.route('/suggest-price', methods=['POST'])
def suggest_price():
    try:
        data = request.json
        item_name = data.get('item_name')
        
        if not item_name:
            return jsonify({
                'success': False, 
                'message': 'item_name is required'
            }), 400
        
        # Get MongoDB connection from environment
        mongo_uri = os.environ.get('MONGODB_URI')
        mongo_db = os.environ.get('MONGO_DB', 'test')
        mongo_collection = os.environ.get('MONGO_COLLECTION', 'pricesuggestions')
        
        if not mongo_uri:
            return jsonify({
                'success': False,
                'message': 'MongoDB URI not configured'
            }), 500
        
        # Load data from MongoDB
        df = load_from_mongo(mongo_uri, mongo_db, mongo_collection)
        
        # Get price suggestion
        result = suggest_for_item_from_df(df, item_name, test_size=2)
        
        if 'error' in result:
            return jsonify({
                'success': False, 
                'message': result['error']
            }), 404
            
        return jsonify({
            'success': True,
            'data': result,
            'suggestedPrice': result['suggestedPrice'],
            'bestModel': result['bestModel']
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)