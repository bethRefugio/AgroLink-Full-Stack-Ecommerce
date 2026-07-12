import os
import sys
import json
import pickle
import joblib
import argparse
from datetime import datetime
from typing import Dict, Any, Optional

import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import MinMaxScaler
from prophet import Prophet
import xgboost as xgb
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from pymongo import MongoClient



MODEL_SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

# save functions for different model types

def save_prophet_model(model, item_name: str, metrics: dict, version: int = 1) -> str:
    """Save a Prophet model artifact to disk."""
    filename = f"prophet_{item_name.replace(' ', '_')}_v{version}.pkl"
    filepath = os.path.join(MODEL_SAVE_DIR, filename)

    # Persist the model object so it can be served later without retraining.
    with open(filepath, 'wb') as f:
        pickle.dump(model, f)

    return filepath

def save_xgboost_model(model, item_name: str, metrics: dict, version: int = 1) -> str:
    """Save an XGBoost model artifact to disk."""
    filename = f"xgboost_{item_name.replace(' ', '_')}_v{version}.pkl"
    filepath = os.path.join(MODEL_SAVE_DIR, filename)

    # Use joblib for efficient serialization of scikit-learn compatible models.
    joblib.dump(model, filepath)

    return filepath

def save_lstm_model(model, scaler, item_name: str, metrics: dict, version: int = 1) -> str:
    """Save an LSTM model and its scaler to disk."""
    filename = f"lstm_{item_name.replace(' ', '_')}_v{version}.h5"
    scaler_file = f"lstm_scaler_{item_name.replace(' ', '_')}_v{version}.pkl"

    filepath = os.path.join(MODEL_SAVE_DIR, filename)
    scaler_path = os.path.join(MODEL_SAVE_DIR, scaler_file)

    # LSTM models use a separate scaler for inverse-transforming predictions.
    model.save(filepath)
    joblib.dump(scaler, scaler_path)

    return filepath

# load functions for different model types

def load_prophet_model(filepath: str):
    """Load a saved Prophet model from disk."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Prophet model not found: {filepath}")

    with open(filepath, 'rb') as f:
        return pickle.load(f)

def load_xgboost_model(filepath: str):
    """Load a saved XGBoost model from disk."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"XGBoost model not found: {filepath}")

    return joblib.load(filepath)

def load_lstm_model(filepath: str):
    """Load a saved LSTM model and its scaler."""
    from tensorflow.keras.models import load_model as keras_load

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"LSTM model not found: {filepath}")

    scaler_path = filepath.replace('.h5', '.pkl').replace('lstm_', 'lstm_scaler_')

    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"LSTM scaler not found: {scaler_path}")

    model = keras_load(filepath)
    scaler = joblib.load(scaler_path)

    return model, scaler

# load saved models from MongoDB

# Update the load_saved_models function to add better error handling:

def load_saved_models(item_name: str, mongo_uri: str, mongo_db: str):
    """Load saved model metadata from MongoDB for an item."""
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client[mongo_db]
        models_collection = db['saved_models']

        best_models = {}

        # Query each supported model type and grab the active model with smallest RMSE.
        for model_type in ['Prophet', 'XGBoost', 'LSTM']:
            best_doc = models_collection.find_one(
                {
                    'item': item_name.lower().strip(),
                    'modelType': model_type,
                    'isActive': True
                },
                sort=[('accuracy.rmse', 1)]
            )

            if best_doc and best_doc.get('modelPath'):
                print(
                    f"Found saved {model_type} model v{best_doc.get('version', 1)} - "
                    f"RMSE: {best_doc.get('accuracy', {}).get('rmse')}",
                    file=sys.stderr
                )

                best_models[model_type] = {
                    'doc': best_doc,
                    'path': best_doc['modelPath'],
                    'version': best_doc.get('version', 1),
                    'rmse': best_doc.get('accuracy', {}).get('rmse'),
                    'mae': best_doc.get('accuracy', {}).get('mae')
                }
            else:
                print(f"No saved {model_type} model found for '{item_name}'", file=sys.stderr)

        client.close()

        if best_models:
            print(f"Loaded {len(best_models)} saved models for '{item_name}'", file=sys.stderr)
            return best_models
        print(f"No saved models found for '{item_name}'", file=sys.stderr)
        return None

    except Exception as e:
        print(f"Error loading saved models from DB: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None

# use saved models for prediction

def use_saved_models(item_name: str, best_models: dict) -> Dict[str, Any]:
    """Load saved artifacts and make a prediction from them."""
    try:
        predictions = {}
        metrics = {}
        model_info = {}

        for model_type, model_data in best_models.items():
            pred: Optional[float] = None
            try:
                model_path = model_data['path']

                if not os.path.exists(model_path):
                    print(f"Warning: Model file not found: {model_path}", file=sys.stderr)
                    continue

                # Load and score each model type using its native API.
                if model_type == 'Prophet':
                    model = load_prophet_model(model_path)
                    future = model.make_future_dataframe(periods=1)
                    forecast = model.predict(future)
                    pred = float(forecast.iloc[-1]['yhat'])

                elif model_type == 'XGBoost':
                    model = load_xgboost_model(model_path)
                    # Placeholder input vector for XGBoost feature space.
                    pred = float(model.predict(np.array([[1, 1, 1]]))[0])

                elif model_type == 'LSTM':
                    model, scaler = load_lstm_model(model_path)
                    # Dummy sequence shaped for the saved LSTM.
                    dummy_seq = np.array([[[0.5], [0.5], [0.5]]])
                    pred_scaled = model.predict(dummy_seq, verbose=0)
                    pred = float(scaler.inverse_transform(pred_scaled)[0][0])

                if pred is None:
                    continue
                predictions[model_type] = float(pred)
                metrics[model_type] = {
                    'MAE': model_data.get('mae'),
                    'RMSE': model_data.get('rmse')
                }
                model_info[model_type] = f"v{model_data.get('version', 1)}"

            except Exception as e:
                print(f"Error loading {model_type} model: {e}", file=sys.stderr)
                continue

        if not predictions:
            return {"error": "Could not load any saved models"}

        # Choose the best loaded model based on RMSE.
        best_model = min(
            [(k, v) for k, v in metrics.items() if v.get('RMSE') is not None],
            key=lambda x: x[1]['RMSE']
        )[0]

        recommended = {}
        for k, v in predictions.items():
            suggested = suggest_price(v)
            recommended[k] = float(suggested) if suggested is not None else float(v)

        return {
            "item": item_name,
            "next_preds": predictions,
            "recommended": recommended,
            "metrics": metrics,
            "bestModel": best_model,
            "suggestedPrice": float(recommended[best_model]),
            "dataPoints": "N/A (using saved models)",
            "modelInfo": model_info,
            "fromSavedModels": True
        }

    except Exception as e:
        print(f"Error using saved models: {e}", file=sys.stderr)
        return {"error": str(e)}

# functions for data handling and prediction

def suggest_price(price: float, discount_percent: int = 5) -> Optional[float]:
    """Apply a markup percentage to a raw predicted price."""
    if price is None or price <= 0:
        return None
    return price * (1 + discount_percent / 100)

def split_train_test(df, test_size=2):
    """Split the time series data into training and hold-out test portions."""
    train = df.iloc[:-test_size].copy()
    test = df.iloc[-test_size:].copy()
    return train, test

# to the load_from_mongo function:

def load_from_mongo(mongo_uri: str, db_name: str, collection_name: str, commodity: Optional[str] = None) -> pd.DataFrame:
    """Load price history data from MongoDB and normalize it for modeling."""
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        collection = db[collection_name]

        query = {}
        if commodity:
            query['commodity'] = {'$regex': commodity, '$options': 'i'}

        # Fetch records and drop MongoDB _id field.
        records = list(collection.find(query, {'_id': 0}))
        client.close()

        if not records:
            print(f"No records found in {db_name}.{collection_name}", file=sys.stderr)
            return pd.DataFrame()

        df = pd.DataFrame(records)

        # Normalize the date information into a Prophet-compatible 'ds' field.
        if 'ds' not in df.columns:
            if 'date' in df.columns:
                df['ds'] = pd.to_datetime(df['date'], errors='coerce')
            elif 'year' in df.columns and 'month' in df.columns:
                month_map = {
                    'january': 1, 'february': 2, 'march': 3, 'april': 4,
                    'may': 5, 'june': 6, 'july': 7, 'august': 8,
                    'september': 9, 'october': 10, 'november': 11, 'december': 12
                }
                df['month_num'] = df['month'].astype(str).str.lower().map(month_map)
                df['ds'] = pd.to_datetime(
                    df['year'].astype(str) + '-' + df['month_num'].astype(str) + '-01',
                    errors='coerce'
                )
            else:
                df['ds'] = pd.Timestamp.now()
        else:
            df['ds'] = pd.to_datetime(df['ds'], errors='coerce')

        # Normalize the price and item text fields.
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        if 'item' in df.columns:
            df['item'] = df['item'].astype(str).str.lower().str.strip()
        else:
            print("Warning: 'item' column not found", file=sys.stderr)
            return pd.DataFrame()

        df = df.dropna(subset=['price', 'ds', 'item'])

        keep_cols = ['ds', 'price', 'item']
        if 'commodity' in df.columns:
            keep_cols.append('commodity')
        df = df[keep_cols].reset_index(drop=True)

        print(f"Loaded {len(df)} records from MongoDB", file=sys.stderr)
        return df

    except Exception as e:
        print(f"MongoDB load error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return pd.DataFrame()

def load_and_clean(csv_path: str) -> pd.DataFrame:
    """Load CSV price history and normalize the columns."""
    df = pd.read_csv(csv_path)
    df['ds'] = pd.to_datetime(df['date'])
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['item'] = df['item'].str.lower().str.strip()
    return df[['ds', 'price', 'item']].dropna()

def prophet_predict(train_df: pd.DataFrame, test_df: pd.DataFrame) -> tuple[np.ndarray, float, Prophet, np.ndarray, np.ndarray]:
    """Train Prophet and return forecasts for test and next period."""
    model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False, interval_width=0.95)
    model.fit(train_df[['ds', 'price']].rename(columns={'price': 'y'}))

    future = model.make_future_dataframe(periods=len(test_df) + 1)
    forecast = model.predict(future)

    test_pred = forecast.iloc[-len(test_df)-1:-1]['yhat'].values
    next_pred = float(forecast.iloc[-1]['yhat'])

    full_pred = np.concatenate([train_df['price'].values, test_pred])
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return test_pred, next_pred, model, all_dates, full_pred

def xgboost_predict(train_df: pd.DataFrame, test_df: pd.DataFrame) -> tuple[np.ndarray, float, xgb.XGBRegressor, np.ndarray, np.ndarray]:
    """Train XGBoost using index-based features for sequence prediction."""
    X_train = np.arange(len(train_df)).reshape(-1, 1)
    y_train = train_df['price'].astype(float).values

    model = xgb.XGBRegressor(n_estimators=100, max_depth=3, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)

    X_test = np.arange(len(train_df), len(train_df) + len(test_df)).reshape(-1, 1)
    test_pred = model.predict(X_test)
    next_pred = float(model.predict([[len(train_df) + len(test_df)]])[0])

    full_pred = np.concatenate([train_df['price'].values, test_pred])
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return test_pred, next_pred, model, all_dates, full_pred

def lstm_predict(train_df: pd.DataFrame, test_df: pd.DataFrame) -> tuple[np.ndarray, float, Optional[Sequential], np.ndarray, np.ndarray, Optional[MinMaxScaler]]:
    """Train a small LSTM on price history and generate future values."""
    prices = train_df['price'].astype(float).values.reshape(-1, 1)

    if len(prices) < 3:
        # Not enough sequence history to train an LSTM, so fallback to the last value.
        last_val = float(prices[-1])
        test_pred = np.full(len(test_df), last_val)
        next_pred = last_val
        full_pred = np.concatenate([prices.flatten(), test_pred])
        all_dates = pd.concat([train_df['ds'], test_df['ds']]).values
        return np.array(test_pred), float(next_pred), None, all_dates, np.array(full_pred), None

    scaler = MinMaxScaler()
    scaled_prices = scaler.fit_transform(prices)

    window = 3
    X, y = [], []
    for i in range(window, len(scaled_prices)):
        X.append(scaled_prices[i - window:i])
        y.append(scaled_prices[i])
    X, y = np.array(X), np.array(y)

    model = Sequential()
    model.add(LSTM(50, activation="tanh", return_sequences=False, input_shape=(X.shape[1], 1)))
    model.add(Dense(1))
    model.compile(optimizer="adam", loss="mse")
    model.fit(X, y, epochs=50, batch_size=8, verbose=0)

    last_seq = scaled_prices[-window:]
    test_pred_scaled = []
    seq = last_seq.copy()
    for _ in range(len(test_df)):
        p = model.predict(seq.reshape(1, window, 1), verbose=0)
        test_pred_scaled.append(p[0])
        seq = np.vstack([seq[1:], p])

    test_pred = scaler.inverse_transform(test_pred_scaled).flatten()
    p_next = model.predict(seq.reshape(1, window, 1), verbose=0)
    next_pred = float(scaler.inverse_transform(p_next)[0][0])

    full_pred = np.concatenate([train_df['price'].values, test_pred])
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred), scaler

# main suggestion function

def suggest_for_item_from_df(df: pd.DataFrame, item_name: str, test_size: int = 2,
                             save_models: bool = False, version: int = 1,
                             use_saved: bool = True,
                             mongo_uri: Optional[str] = None,
                             mongo_db: Optional[str] = None) -> Dict[str, Any]:
    """Generate suggestions by loading saved models first, otherwise training new ones."""

    if use_saved and mongo_uri and mongo_db:
        print(f"Attempting to load saved models for '{item_name}'...", file=sys.stderr)
        best_models = load_saved_models(item_name, mongo_uri, mongo_db)
        if best_models:
            print(f"Found {len(best_models)} saved models! Using them...", file=sys.stderr)
            result = use_saved_models(item_name, best_models)
            if 'error' not in result:
                return result

    # If no saved model is available, train models on the fly.
    print(f"No saved models found. Training new models for '{item_name}'...", file=sys.stderr)

    item_name_lower = item_name.lower().strip()
    item_df = df[df['item'] == item_name_lower].copy()
    if item_df.empty:
        item_df = df[df['item'].str.contains(item_name_lower, case=False, na=False)].copy()
        if item_df.empty:
            available_items = sorted(df['item'].unique().tolist())
            return {
                "error": f"Item '{item_name}' not found in database. "
                         f"Available items ({len(available_items)}): {', '.join(available_items[:20])}"
            }

    if len(item_df) < test_size + 3:
        return {"error": f"Not enough historical data for '{item_name}'. "
                         f"Found {len(item_df)} records, need at least {test_size + 3}"}

    train_df, test_df = split_train_test(item_df, test_size=test_size)

    # Train each model and collect predictions.
    prophet_test_pred, prophet_next_pred, prophet_model, prophet_dates, prophet_full_pred = prophet_predict(train_df, test_df)
    xgb_test_pred, xgb_next_pred, xgb_model, xgb_dates, xgb_full_pred = xgboost_predict(train_df, test_df)
    lstm_test_pred, lstm_next_pred, lstm_model, lstm_dates, lstm_full_pred, lstm_scaler = lstm_predict(train_df, test_df)

    metrics = {}
    model_paths = {}

    for name, preds, model, scaler in [
        ('Prophet', prophet_test_pred, prophet_model, None),
        ('XGBoost', xgb_test_pred, xgb_model, None),
        ('LSTM', lstm_test_pred, lstm_model, lstm_scaler)
    ]:
        try:
            mae = float(mean_absolute_error(test_df['price'].astype(float), preds))
            rmse = float(np.sqrt(mean_squared_error(test_df['price'].astype(float), preds)))
        except Exception:
            mae, rmse = None, None

        metrics[name] = {"MAE": mae, "RMSE": rmse}

        # Save successful models if requested.
        if save_models and mae is not None and rmse is not None and model is not None:
            try:
                if name == 'Prophet':
                    model_paths[name] = save_prophet_model(model, item_name, metrics[name], version)
                elif name == 'XGBoost':
                    model_paths[name] = save_xgboost_model(model, item_name, metrics[name], version)
                elif name == 'LSTM':
                    model_paths[name] = save_lstm_model(model, scaler, item_name, metrics[name], version)
            except Exception as e:
                print(f"Warning: Failed to save {name} model: {e}", file=sys.stderr)

    next_preds = {
        "Prophet": float(prophet_next_pred),
        "XGBoost": float(xgb_next_pred),
        "LSTM": float(lstm_next_pred)
    }
    recommended = {}
    for k, v in next_preds.items():
        suggested = suggest_price(v)
        recommended[k] = float(suggested) if suggested is not None else float(v)

    valid = {k: v['RMSE'] for k, v in metrics.items() if v['RMSE'] is not None}
    best = min(valid.items(), key=lambda kv: kv[1])[0] if valid else 'Prophet'

    return {
        "item": item_name,
        "next_preds": next_preds,
        "recommended": recommended,
        "metrics": metrics,
        "bestModel": best,
        "suggestedPrice": float(recommended[best]),
        "dataPoints": len(item_df),
        "modelPaths": model_paths if save_models else {},
        "fromSavedModels": False
    }

def _np_encoder(obj):
    """Convert NumPy types to native Python types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

# main suggestion function

def main():
    """CLI entry point to run price suggestions from the command line."""
    parser = argparse.ArgumentParser(description="Price suggestion using saved or new models.")
    parser.add_argument("--item", "-i", required=True, help="Item name to predict")
    parser.add_argument("--mongo-uri", dest="mongo_uri", default=None, help="MongoDB URI")
    parser.add_argument("--mongo-db", dest="mongo_db", default=None, help="MongoDB database")
    parser.add_argument("--mongo-collection", dest="mongo_coll", default="pricesuggestions", help="MongoDB collection")
    parser.add_argument("--csv", "-c", default="price_list.csv", help="CSV fallback")
    parser.add_argument("--test-size", "-t", type=int, default=2, help="Test size")
    parser.add_argument("--no-saved", action="store_true", help="Skip saved models, train new ones")
    parser.add_argument("--save-models", action="store_true", help="Save trained models")
    parser.add_argument("--version", type=int, default=1, help="Model version")

    args = parser.parse_args()

    try:
        if args.mongo_uri:
            df = load_from_mongo(args.mongo_uri, args.mongo_db or 'test', args.mongo_coll)
            if df.empty:
                result = {"error": f"No data in MongoDB collection '{args.mongo_coll}'"}
                print(json.dumps(result, default=_np_encoder))
                sys.exit(1)
        else:
            df = load_and_clean(args.csv)

        result = suggest_for_item_from_df(
            df,
            args.item,
            args.test_size,
            save_models=args.save_models,
            use_saved=not args.no_saved,
            mongo_uri=args.mongo_uri,
            mongo_db=args.mongo_db or 'test'
        )
        print(json.dumps(result, default=_np_encoder))

    except Exception as e:
        err = {"error": str(e)}
        print(json.dumps(err, default=_np_encoder))
        sys.exit(1)

if __name__ == "__main__":
    main()