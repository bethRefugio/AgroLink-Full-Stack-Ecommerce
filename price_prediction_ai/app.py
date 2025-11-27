from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# package-relative import (folder has __init__.py)
from .ai_price_suggestion_new import suggest_for_item_from_df, load_from_mongo

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET', 'HEAD'])
def home():
    return jsonify({
        'service': 'AgroLink AI Price Suggestion',
        'status': 'ok'
    }), 200

@app.route('/suggest-price', methods=['POST'])
def suggest_price():
    try:
        data = request.get_json(force=True) or {}
        item_name = (data.get('item_name') or '').strip()
        test_size = int(data.get('test_size') or 2)

        if not item_name:
            return jsonify({'success': False, 'message': 'item_name is required'}), 400

        mongo_uri = os.environ.get('MONGODB_URI')
        mongo_db = os.environ.get('MONGO_DB', 'AgroLink')
        mongo_collection = os.environ.get('MONGO_COLLECTION', 'pricesuggestions')

        if not mongo_uri:
            return jsonify({'success': False, 'message': 'MONGODB_URI not configured'}), 500

        df = load_from_mongo(mongo_uri, mongo_db, mongo_collection)
        result = suggest_for_item_from_df(df, item_name, test_size=test_size)

        if isinstance(result, dict) and result.get('error'):
            return jsonify({'success': False, 'message': result['error']}), 404

        return jsonify({
            'success': True,
            'data': result,
            'suggestedPrice': result.get('suggestedPrice'),
            'bestModel': result.get('bestModel')
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Do not run app.run on Render; Gunicorn starts the app