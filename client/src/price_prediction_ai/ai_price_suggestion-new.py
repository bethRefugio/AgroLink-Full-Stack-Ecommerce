"""
AI Price Suggestion Script

Purpose
- Predict next-month prices for a specific item using time-series and ML models
  (Prophet, XGBoost, and a small LSTM), then recommend a selling price with a
  small markup.
- Can read training data from:
  1) MongoDB pricesuggestions collection (real-time), OR
  2) CSV file (fallback).

Usage (MongoDB real-time; recommended)
  python ai_price_suggestion.py --item "red onion" \
    --mongo-uri "mongodb+srv://user:pass@cluster/dbname?retryWrites=true&w=majority" \
    --mongo-db "dbname" \
    --mongo-collection "pricesuggestions" \
    --test-size 2

Usage (CSV fallback)
  python ai_price_suggestion.py --item "red onion" --csv "./price_list.csv" --test-size 2

Notes
- The script prints a single JSON line to stdout with fields:
  {
    "item": "...",
    "next_preds": { "Prophet": ..., "XGBoost": ..., "LSTM": ... },
    "recommended": { "Prophet": ..., "XGBoost": ..., "LSTM": ... },
    "metrics": { "Prophet": {"MAE": ..., "RMSE": ...}, ... },
    "bestModel": "Prophet|XGBoost|LSTM",
    "suggestedPrice": <float>  # recommended price from best model
  }
- Optional: --plot to visualize (requires matplotlib).
"""

from __future__ import annotations

import argparse
import json
import sys
import warnings
from typing import Dict, Any, Tuple

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# Optional plotting (only when --plot)
try:
    import matplotlib.pyplot as plt
except Exception:
    plt = None

# Optional MongoDB import (only needed when --mongo-uri is used)
try:
    from pymongo import MongoClient  # pip install pymongo
    _HAVE_PYMONGO = True
except Exception:
    _HAVE_PYMONGO = False

# ML/TS libs
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


# -------------------------------
# Helpers: Cleaning & Preparation
# -------------------------------

def _ensure_month_num(series: pd.Series) -> pd.Series:
    """
    Convert a 'month' column (string full month, short month, or numeric) into numeric month 1..12.
    Falls back to 1 if parsing fails.
    """
    s = series.astype(str).str.strip()

    # Try full month name: January, February, ...
    try:
        return pd.to_datetime(s, format='%B', errors='coerce').dt.month.fillna(
            pd.to_datetime(s, format='%b', errors='coerce').dt.month
        ).fillna(pd.to_numeric(s, errors='coerce')).fillna(1).astype(int)
    except Exception:
        # Final fallback: numeric conversion or 1
        return pd.to_numeric(s, errors='coerce').fillna(1).astype(int)


def _clean_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize dataframe columns and types expected by models.
    Required columns (case-insensitive semantic):
      - year (int)
      - month (string or int, full/short name or numeric)
      - item (string)
      - commodity (string)
      - unit (string)
      - price (numeric)
    Adds:
      - month_num (1..12)
      - ds (datetime first day of month)
    Filters rows without valid ds or price.
    """
    df = df.copy()

    # Normalize column names just in case
    df.columns = [c.strip() for c in df.columns]

    # Coerce price to numeric, fill reasonable gaps
    df['price'] = pd.to_numeric(df.get('price'), errors='coerce')
    df['price'] = df['price'].interpolate().bfill().ffill()

    # Year
    if 'year' not in df.columns:
        raise ValueError("Input data requires a 'year' column")
    df['year'] = pd.to_numeric(df['year'], errors='coerce').astype('Int64')

    # Month -> month_num
    if 'month' not in df.columns:
        raise ValueError("Input data requires a 'month' column")
    df['month_num'] = _ensure_month_num(df['month'])

    # DS (date stamp = first day of month)
    df['ds'] = pd.to_datetime(
        df['year'].astype(str) + '-' + df['month_num'].astype(str) + '-01',
        errors='coerce'
    )

    # Ensure expected strings exist
    for col in ['item', 'commodity', 'unit']:
        if col not in df.columns:
            df[col] = ''
        df[col] = df[col].astype(str)

    # Normalize item names to lowercase for case-insensitive matching
    df['item'] = df['item'].str.lower().str.strip()

    # Drop invalid rows
    df = df.dropna(subset=['ds', 'price'])

    # Sort for good measure
    df = df.sort_values('ds').reset_index(drop=True)
    return df


def load_and_clean(csv_path: str) -> pd.DataFrame:
    """Load from CSV and clean."""
    df = pd.read_csv(csv_path)
    return _clean_df(df)


def load_from_mongo(mongo_uri: str, db_name: str, collection_name: str, commodity_filter: str = None) -> pd.DataFrame:
    """
    Load data from MongoDB pricesuggestions collection.
    Expected fields: item, commodity, unit, price, year, month
    """
    if not _HAVE_PYMONGO:
        raise ImportError("pymongo not installed. Run: pip install pymongo")
    
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.server_info()
        
        db = client[db_name]
        collection = db[collection_name]
        
        # Build query
        query = {}
        if commodity_filter:
            query['commodity'] = {'$regex': commodity_filter, '$options': 'i'}
        
        # Fetch all documents
        cursor = collection.find(query)
        docs = list(cursor)
        client.close()
        
        if not docs:
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(docs)
        
        # Ensure required columns exist
        required = ['item', 'price', 'year', 'month']
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")
        
        # Clean and normalize
        return _clean_df(df)
        
    except Exception as e:
        raise Exception(f"MongoDB load error: {str(e)}")


def split_train_test(df: pd.DataFrame, test_size: int = 2) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Chronological split. If too few rows, ensures we can still 'train'.
    """
    df_sorted = df.sort_values('ds')
    if test_size < 1:
        test_size = 1

    if len(df_sorted) <= test_size:
        test_df = df_sorted.tail(1)
        train_df = df_sorted.iloc[:-1]
        if train_df.empty:
            train_df = test_df.copy()
    else:
        test_df = df_sorted.tail(test_size)
        train_df = df_sorted.iloc[:-test_size]

    return train_df.reset_index(drop=True), test_df.reset_index(drop=True)


# -------------------------------
# Models
# -------------------------------

def prophet_predict(train_df: pd.DataFrame, test_df: pd.DataFrame):
    """
    Basic Prophet forecast:
    - Train on train_df
    - Predict test_df ds values
    - Predict next month from last train date
    """
    prophet_df = train_df[['ds', 'price']].rename(columns={'price': 'y'})
    model = Prophet(seasonality_mode='multiplicative')
    try:
        model.fit(prophet_df)
    except TypeError:
        # Some combinations of prophet/cmdstanpy may not accept extra args; retry bare fit.
        model.fit(prophet_df)

    # Predict test period
    future = pd.DataFrame({'ds': test_df['ds']})
    forecast = model.predict(future)
    test_pred = forecast['yhat'].values

    # Predict next month
    last_date = prophet_df['ds'].max()
    next_month = last_date + pd.DateOffset(months=1)
    next_pred = float(model.predict(pd.DataFrame({'ds': [next_month]}))['yhat'].iloc[0])

    # Full series pred (train + test)
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values
    all_forecast = model.predict(pd.DataFrame({'ds': pd.to_datetime(all_dates)}))
    full_pred = all_forecast['yhat'].values

    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred)


def xgboost_predict(train_df: pd.DataFrame, test_df: pd.DataFrame):
    """
    Small tabular model using encoded categorical features and (year, month_num).
    """
    combined = pd.concat([train_df, test_df], ignore_index=True)

    le_item = LabelEncoder().fit(combined['item'].astype(str))
    le_comm = LabelEncoder().fit(combined['commodity'].astype(str))
    le_unit = LabelEncoder().fit(combined['unit'].astype(str))

    train_df = train_df.copy()
    test_df = test_df.copy()

    train_df['item_enc'] = le_item.transform(train_df['item'].astype(str))
    train_df['commodity_enc'] = le_comm.transform(train_df['commodity'].astype(str))
    train_df['unit_enc'] = le_unit.transform(train_df['unit'].astype(str))

    test_df['item_enc'] = le_item.transform(test_df['item'].astype(str))
    test_df['commodity_enc'] = le_comm.transform(test_df['commodity'].astype(str))
    test_df['unit_enc'] = le_unit.transform(test_df['unit'].astype(str))

    features = ['year', 'month_num', 'commodity_enc', 'item_enc', 'unit_enc']
    X_train = train_df[features].astype(float)
    y_train = train_df['price'].astype(float)
    X_test = test_df[features].astype(float)

    model = xgb.XGBRegressor(n_estimators=120, objective='reg:squarederror', verbosity=0)
    model.fit(X_train, y_train)

    test_pred = model.predict(X_test)

    # Next month from last train row
    last_row = train_df.iloc[-1]
    next_year = int(last_row['year'])
    next_month = int(last_row['month_num']) + 1
    if next_month > 12:
        next_month = 1
        next_year += 1

    next_features = pd.DataFrame([{
        'year': next_year,
        'month_num': next_month,
        'commodity_enc': last_row['commodity_enc'],
        'item_enc': last_row['item_enc'],
        'unit_enc': last_row['unit_enc']
    }])

    next_pred = float(model.predict(next_features)[0])

    # Full series prediction
    all_df = pd.concat([train_df, test_df], ignore_index=True)
    all_X = all_df[features].astype(float)
    full_pred = model.predict(all_X)
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred)


def lstm_predict(train_df: pd.DataFrame, test_df: pd.DataFrame):
    """
    Tiny LSTM on the univariate price series. If too little data, fall back to last value.
    """
    prices = train_df['price'].astype(float).values.reshape(-1, 1)
    if len(prices) < 3:
        last_val = float(prices[-1])
        test_pred = np.full(len(test_df), last_val)
        next_pred = last_val
        full_pred = np.concatenate([prices.flatten(), test_pred])
        all_dates = pd.concat([train_df['ds'], test_df['ds']]).values
        return np.array(test_pred), float(next_pred), None, all_dates, np.array(full_pred)

    scaler = MinMaxScaler()
    scaled_prices = scaler.fit_transform(prices)

    # Window the sequence (3 months)
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

    # Forecast test period
    last_seq = scaled_prices[-window:]
    test_pred_scaled = []
    seq = last_seq.copy()
    for _ in range(len(test_df)):
        p = model.predict(seq.reshape(1, window, 1), verbose=0)
        test_pred_scaled.append(p[0])
        seq = np.vstack([seq[1:], p])

    test_pred = scaler.inverse_transform(test_pred_scaled).flatten()

    # Next month
    p_next = model.predict(seq.reshape(1, window, 1), verbose=0)
    next_pred = float(scaler.inverse_transform(p_next)[0][0])

    # Full series
    full_pred = np.concatenate([train_df['price'].values, test_pred])
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred)


# -------------------------------
# Recommendation & Visualization
# -------------------------------

def suggest_price(price: float, markup: float = 0.05) -> float:
    """Apply a small markup to predicted price."""
    return round(float(price) * (1 + float(markup)), 2)


def plot_forecast_like_image(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    all_dates,
    history_prices,
    pred_dates_dict: Dict[str, Any],
    pred_values_dict: Dict[str, Any],
    next_month,
    next_preds: Dict[str, float],
    item_name: str
):
    """Simple visualization for debugging/analysis (requires matplotlib)."""
    if plt is None:
        return
    plt.figure(figsize=(10, 5))
    plt.plot(all_dates, history_prices, label='Historical Price', color='tab:blue', linewidth=2)

    colors = {'Prophet': 'orange', 'XGBoost': 'green', 'LSTM': 'purple'}
    linestyles = {'Prophet': '--', 'XGBoost': '-.', 'LSTM': ':'}

    for model_name in pred_dates_dict:
        plt.plot(pred_dates_dict[model_name],
                 pred_values_dict[model_name],
                 label=f'{model_name} Predicted Price',
                 color=colors.get(model_name, 'gray'),
                 linestyle=linestyles.get(model_name, '-'), linewidth=2)
        plt.scatter([next_month], [next_preds[model_name]],
                    color=colors.get(model_name, 'gray'), edgecolor='black',
                    label=f'{model_name} Next Month Prediction', zorder=5, s=80)

    plt.title(f"Price Forecast for '{item_name}'")
    plt.xlabel("Date")
    plt.ylabel("Price")
    plt.legend(loc='best')
    plt.tight_layout()
    plt.show()


# -------------------------------
# Main task: suggest for one item
# -------------------------------

def suggest_for_item_from_df(df: pd.DataFrame, item_name: str, test_size: int = 2) -> Dict[str, Any]:
    """
    Filter by item, split, run models, compute metrics, and decide best.
    """
    # Normalize search term to lowercase
    item_name_lower = item_name.lower().strip()
    
    # Filter for the specific item (case-insensitive) - already normalized in _clean_df
    item_df = df[df['item'] == item_name_lower].copy()
    
    if item_df.empty:
        # Try partial matching if exact match fails
        item_df = df[df['item'].str.contains(item_name_lower, case=False, na=False)].copy()
        
        if item_df.empty:
            available_items = sorted(df['item'].unique().tolist())
            return {
                "error": f"Item '{item_name}' not found in database. Available items ({len(available_items)}): {', '.join(available_items[:20])}"
            }
    
    # Check if we have enough data
    if len(item_df) < test_size + 3:
        return {
            "error": f"Not enough historical data for '{item_name}'. Found {len(item_df)} records, need at least {test_size + 3}"
        }

    train_df, test_df = split_train_test(item_df, test_size=test_size)

    # Models
    prophet_test_pred, prophet_next_pred, _, prophet_dates, prophet_full_pred = prophet_predict(train_df, test_df)
    xgb_test_pred, xgb_next_pred, _, xgb_dates, xgb_full_pred = xgboost_predict(train_df, test_df)
    lstm_test_pred, lstm_next_pred, _, lstm_dates, lstm_full_pred = lstm_predict(train_df, test_df)

    # Metrics (test set)
    metrics = {}
    for name, preds in zip(['Prophet', 'XGBoost', 'LSTM'], [prophet_test_pred, xgb_test_pred, lstm_test_pred]):
        try:
            mae = float(mean_absolute_error(test_df['price'].astype(float), preds))
            rmse = float(np.sqrt(mean_squared_error(test_df['price'].astype(float), preds)))
        except Exception:
            mae, rmse = None, None
        metrics[name] = {"MAE": mae, "RMSE": rmse}

    next_preds = {
        "Prophet": float(prophet_next_pred),
        "XGBoost": float(xgb_next_pred),
        "LSTM": float(lstm_next_pred)
    }
    recommended = {k: float(suggest_price(v)) for k, v in next_preds.items()}

    # Choose best by RMSE (ignore None). Fallback: Prophet.
    valid = {k: v['RMSE'] for k, v in metrics.items() if v['RMSE'] is not None}
    best = min(valid.items(), key=lambda kv: kv[1])[0] if valid else 'Prophet'

    return {
        "item": item_name,
        "next_preds": next_preds,
        "recommended": recommended,
        "metrics": metrics,
        "bestModel": best,
        "suggestedPrice": float(recommended[best]),
        "dataPoints": len(item_df)
    }


# -------------------------------
# JSON encoder for numpy/pandas
# -------------------------------

def _np_encoder(obj):
    """Safely convert numpy/pandas objects to JSON-serializable primitives."""
    try:
        import numpy as _np
        if isinstance(obj, (_np.integer,)):
            return int(obj)
        if isinstance(obj, (_np.floating,)):
            return float(obj)
        if isinstance(obj, _np.ndarray):
            return obj.tolist()
    except Exception:
        pass

    try:
        import pandas as _pd
        if isinstance(obj, _pd.Timestamp):
            return obj.isoformat()
    except Exception:
        pass

    return str(obj)


# -------------------------------
# CLI entry
# -------------------------------

def main():
    parser = argparse.ArgumentParser(description="Price suggestion for an item using real-time DB or CSV data.")
    parser.add_argument("--item", "-i", required=True, help="Item name to predict (case-insensitive)")
    # Mongo options (preferred for real-time)
    parser.add_argument("--mongo-uri", dest="mongo_uri", default=None, help="MongoDB URI (if provided, DB will be used)")
    parser.add_argument("--mongo-db", dest="mongo_db", default=None, help="MongoDB database name (optional if in URI)")
    parser.add_argument("--mongo-collection", dest="mongo_coll", default="pricesuggestions", help="MongoDB collection name")
    parser.add_argument("--commodity", dest="commodity", default=None, help="Optional commodity filter when loading from DB")
    # CSV fallback
    parser.add_argument("--csv", "-c", default="price_list.csv", help="CSV path fallback")
    # Other options
    parser.add_argument("--test-size", "-t", type=int, default=2, help="Test set size (last N months)")
    parser.add_argument("--plot", action="store_true", help="Plot series (requires matplotlib)")

    args = parser.parse_args()

    try:
        # 1) Prefer Mongo if URI is provided
        if args.mongo_uri:
            # Best effort to infer DB name if not explicitly provided
            db_name = args.mongo_db
            if not db_name:
                try:
                    db_name = args.mongo_uri.rsplit('/', 1)[-1].split('?', 1)[0] or 'test'
                except Exception:
                    db_name = 'test'

            df = load_from_mongo(args.mongo_uri, db_name, args.mongo_coll, args.commodity)
            
            if df.empty:
                result = {"error": f"No data found in MongoDB collection '{args.mongo_coll}'"}
                print(json.dumps(result, default=_np_encoder))
                sys.exit(1)
        else:
            # 2) Fallback to CSV
            df = load_and_clean(args.csv)

        result = suggest_for_item_from_df(df, args.item, args.test_size)

        # Optional: plotting (still prints JSON first for programmatic usage)
        if args.plot and plt is not None and not result.get("error"):
            item_df = df[df['item'].str.lower() == args.item.lower()]
            train_df, test_df = split_train_test(item_df, args.test_size)

            p_test, p_next, p_model, p_dates, p_full = prophet_predict(train_df, test_df)
            x_test, x_next, x_model, x_dates, x_full = xgboost_predict(train_df, test_df)
            l_test, l_next, l_model, l_dates, l_full = lstm_predict(train_df, test_df)

            all_dates = p_dates  # shared timeline
            history_prices = np.concatenate([train_df['price'].values, test_df['price'].values])
            pred_dates = {'Prophet': p_dates, 'XGBoost': x_dates, 'LSTM': l_dates}
            pred_values = {'Prophet': p_full, 'XGBoost': x_full, 'LSTM': l_full}
            next_month = train_df['ds'].max() + pd.DateOffset(months=1)
            next_preds = {'Prophet': p_next, 'XGBoost': x_next, 'LSTM': l_next}

            # Print JSON first
            print(json.dumps(result, default=_np_encoder))
            # Then show plot (blocks)
            plot_forecast_like_image(train_df, test_df, all_dates, history_prices,
                                     pred_dates, pred_values, next_month, next_preds, args.item)
            return

        # Print JSON result
        print(json.dumps(result, default=_np_encoder))
    except Exception as e:
        err = {"error": str(e)}
        print(json.dumps(err, default=_np_encoder))
        sys.exit(1)


if __name__ == "__main__":
    main()