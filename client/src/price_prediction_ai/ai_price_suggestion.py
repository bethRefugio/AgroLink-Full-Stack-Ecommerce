import pandas as pd
import numpy as np
import argparse
import json
import sys
import warnings

warnings.filterwarnings("ignore")

# Optional plotting imports (only used when --plot is passed)
try:
    import matplotlib.pyplot as plt
except Exception:
    plt = None

from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler



def load_and_clean(csv_path):
    df = pd.read_csv(csv_path)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    # Fill missing prices sensibly
    df['price'] = df['price'].interpolate().bfill().ffill()
    # Expect columns: 'year' (int), 'month' (full month name or number), 'item', 'commodity', 'unit'
    # Normalize month to month number if textual
    if df['month'].dtype == object:
        try:
            df['month_num'] = pd.to_datetime(df['month'], format='%B').dt.month
        except Exception:
            # fallback: try parsing numeric strings
            df['month_num'] = pd.to_numeric(df['month'], errors='coerce').fillna(1).astype(int)
    else:
        df['month_num'] = df['month'].astype(int)
    # Create a date column 'ds'
    df['ds'] = pd.to_datetime(df['year'].astype(str) + '-' + df['month_num'].astype(str) + '-01', errors='coerce')
    # Drop rows without dates or prices
    df = df.dropna(subset=['ds', 'price'])
    # Ensure expected string columns exist
    for col in ['item', 'commodity', 'unit']:
        if col not in df.columns:
            df[col] = ''
        df[col] = df[col].astype(str)
    return df


def train_test_split(df, test_size=2):
    df_sorted = df.sort_values('ds')
    if test_size < 1:
        test_size = 1
    if len(df_sorted) <= test_size:
        # If not enough rows, use 1 test row and rest as train (or duplicate last row)
        test_df = df_sorted.tail(1)
        train_df = df_sorted.iloc[:-1]
        if train_df.empty:
            # duplicate to allow training
            train_df = test_df.copy()
    else:
        test_df = df_sorted.tail(test_size)
        train_df = df_sorted.iloc[:-test_size]
    return train_df.reset_index(drop=True), test_df.reset_index(drop=True)


def prophet_predict(train_df, test_df):
    prophet_df = train_df[['ds', 'price']].rename(columns={'price': 'y'})
    model = Prophet(seasonality_mode='multiplicative')
    try:
        # Do not pass verbose argument — some cmdstanpy versions don't accept it
        model.fit(prophet_df)
    except TypeError as e:
        # If an unexpected TypeError occurs, try again without any extra args
        # (keeps behavior robust across Prophet/cmdstanpy versions)
        try:
            model.fit(prophet_df)
        except Exception as e2:
            # re-raise with context for easier debugging
            raise RuntimeError(f"Prophet fit failed: {e2}") from e2

    # prepare forecast for test period
    future = pd.DataFrame({'ds': test_df['ds']})
    forecast = model.predict(future)
    test_pred = forecast['yhat'].values

    # Next month prediction
    last_date = prophet_df['ds'].max()
    next_month = last_date + pd.DateOffset(months=1)
    next_forecast = model.predict(pd.DataFrame({'ds': [next_month]}))
    next_pred = float(next_forecast['yhat'].iloc[0])

    # For full predicted series (train + test), forecast for all available dates
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values
    all_forecast = model.predict(pd.DataFrame({'ds': pd.to_datetime(np.concatenate([train_df['ds'].values, test_df['ds'].values]))}))
    full_pred = all_forecast['yhat'].values
    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred)

def xgboost_predict(train_df, test_df):
    # Prepare encoders fit on combined data
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

    model = xgb.XGBRegressor(n_estimators=100, objective='reg:squarederror', verbosity=0)
    model.fit(X_train, y_train)
    test_pred = model.predict(X_test)
    # Next month prediction based on last row
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


def lstm_predict(train_df, test_df):
    # Prepare the price data
    prices = train_df['price'].astype(float).values.reshape(-1, 1)
    if len(prices) < 3:
        # fallback: too little data
        last_val = float(prices[-1])
        test_pred = np.full(len(test_df), last_val)
        next_pred = last_val
        full_pred = np.concatenate([prices.flatten(), test_pred])
        all_dates = pd.concat([train_df['ds'], test_df['ds']]).values
        return np.array(test_pred), float(next_pred), None, all_dates, np.array(full_pred)

    # Normalize
    scaler = MinMaxScaler()
    scaled_prices = scaler.fit_transform(prices)

    # Create sequences (window = 3 months)
    window = 3
    X, y = [], []
    for i in range(window, len(scaled_prices)):
        X.append(scaled_prices[i - window:i])
        y.append(scaled_prices[i])

    X, y = np.array(X), np.array(y)

    # LSTM Model
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

    # Predict next month
    p_next = model.predict(seq.reshape(1, window, 1), verbose=0)
    next_pred = float(scaler.inverse_transform(p_next)[0][0])

    # Full series prediction (train + test)
    full_pred = np.concatenate([train_df['price'].values, test_pred])
    all_dates = pd.concat([train_df['ds'], test_df['ds']]).values

    return np.array(test_pred), float(next_pred), model, all_dates, np.array(full_pred)


def suggest_price(price, markup=0.05):
    return round(float(price) * (1 + float(markup)), 2)


def plot_forecast_like_image(train_df, test_df, all_dates, history_prices,
                             pred_dates_dict, pred_values_dict,
                             next_month, next_preds, item_name):
    if plt is None:
        return
    plt.figure(figsize=(10, 5))
    plt.plot(all_dates, history_prices, label='Historical Price', color='tab:blue', linewidth=2)
    colors = {'Prophet': 'orange', 'XGBoost': 'green', 'ARIMA': 'purple'}
    linestyles = {'Prophet': '--', 'XGBoost': '-.', 'ARIMA': ':'}
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


def suggest_for_item_json(csv_path, item_name, test_size=2):
    df = load_and_clean(csv_path)
    item_df = df[df['item'].str.lower() == item_name.lower()]
    if item_df.empty:
        return {"error": f"Item '{item_name}' not found"}
    train_df, test_df = train_test_split(item_df, test_size=test_size)
    # Prophet
    prophet_test_pred, prophet_next_pred, _, prophet_dates, prophet_full_pred = prophet_predict(train_df, test_df)
    # XGBoost
    xgb_test_pred, xgb_next_pred, _, xgb_dates, xgb_full_pred = xgboost_predict(train_df, test_df)
    # LSTM
    # LSTM
    lstm_test_pred, lstm_next_pred, _, lstm_dates, lstm_full_pred = lstm_predict(train_df, test_df)
    # Metrics
    metrics = {}
    for name, preds in zip(['Prophet', 'XGBoost', 'LSTM'], [prophet_test_pred, xgb_test_pred, lstm_test_pred]):
        try:
            mae = float(mean_absolute_error(test_df['price'].astype(float), preds))
            rmse = float(np.sqrt(mean_squared_error(test_df['price'].astype(float), preds)))
        except Exception:
            mae = None
            rmse = None
        metrics[name] = {"MAE": mae, "RMSE": rmse}
    next_preds = {"Prophet": float(prophet_next_pred), "XGBoost": float(xgb_next_pred), "LSTM": float(lstm_next_pred)}
    recommended = {k: suggest_price(v) for k, v in next_preds.items()}
    # pick best by RMSE (ignore None)
    valid_metrics = {k: v['RMSE'] for k, v in metrics.items() if v['RMSE'] is not None}
    if valid_metrics:
        best = min(valid_metrics.items(), key=lambda kv: kv[1])[0]
    else:
        # fallback: choose Prophet
        best = 'Prophet'
    result = {
        "item": item_name,
        "next_preds": {k: float(v) for k, v in next_preds.items()},
        "recommended": {k: float(v) for k, v in recommended.items()},
        "metrics": metrics,
        "bestModel": best,
        "suggestedPrice": float(recommended[best])
    }
    return result


# JSON encoder helper for numpy/pandas types
def _np_encoder(obj):
    try:
        import numpy as _np
        import pandas as _pd
    except Exception:
        _np = None
        _pd = None
    if _np is not None:
        if isinstance(obj, (_np.integer,)):
            return int(obj)
        if isinstance(obj, (_np.floating,)):
            return float(obj)
        if isinstance(obj, _np.ndarray):
            return obj.tolist()
    if 'pandas' in globals():
        try:
            import pandas as _pd2
            if isinstance(obj, _pd2.Timestamp):
                return obj.isoformat()
        except Exception:
            pass
    # fallback
    return str(obj)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--item", "-i", required=True, help="Item name")
    parser.add_argument("--csv", "-c", default="price_list.csv", help="CSV path")
    parser.add_argument("--test-size", "-t", type=int, default=2)
    parser.add_argument("--plot", action="store_true", help="Show plot (will block until closed)")
    args = parser.parse_args()

    try:
        csv_path = args.csv
        out = suggest_for_item_json(csv_path, args.item, args.test_size)
        # If user requested plotting and matplotlib is available, create plot but still print JSON
        if args.plot and plt is not None:
            # Prepare data for plotting: reuse functions to get series
            df = load_and_clean(csv_path)
            item_df = df[df['item'].str.lower() == args.item.lower()]
            train_df, test_df = train_test_split(item_df, test_size=args.test_size)
            prophet_test_pred, prophet_next_pred, prophet_model, prophet_dates, prophet_full_pred = prophet_predict(train_df, test_df)
            xgb_test_pred, xgb_next_pred, xgb_model, xgb_dates, xgb_full_pred = xgboost_predict(train_df, test_df)
            arima_test_pred, arima_next_pred, arima_model, arima_dates, arima_full_pred = arima_predict(train_df, test_df)
            all_dates = prophet_dates
            history_prices = np.concatenate([train_df['price'].values, test_df['price'].values])
            pred_dates_dict = {
                'Prophet': prophet_dates,
                'XGBoost': xgb_dates,
                'LSTM': lstm_dates
            }

            pred_values_dict = {
                'Prophet': prophet_full_pred,
                'XGBoost': xgb_full_pred,
                'LSTM': lstm_full_pred
            }
            next_month = train_df['ds'].max() + pd.DateOffset(months=1)
            next_preds = {
                'Prophet': prophet_next_pred,
                'XGBoost': xgb_next_pred,
                'LSTM': lstm_next_pred
            }
            # show plot (blocking)
            plot_forecast_like_image(train_df, test_df, all_dates, history_prices,
                                     pred_dates_dict, pred_values_dict,
                                     next_month, next_preds, args.item)
        # Print JSON for programmatic consumption
        print(json.dumps(out, default=_np_encoder))
    except Exception as e:
        err = {"error": str(e)}
        print(json.dumps(err, default=_np_encoder))
        sys.exit(1)


if __name__ == "__main__":
    main()