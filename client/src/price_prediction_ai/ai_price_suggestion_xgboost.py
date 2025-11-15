import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt

def load_and_clean(csv_path):
    df = pd.read_csv(csv_path)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['price'] = df['price'].fillna(method='ffill')
    df['price'] = df['price'].fillna(df['price'].median())
    # Month to number
    df['month_num'] = pd.to_datetime(df['month'], format='%B').dt.month
    # Date for plotting
    df['ds'] = pd.to_datetime(df['year'].astype(str) + '-' + df['month_num'].astype(str) + '-01')
    return df

def encode_features(df):
    encoders = {}
    for col in ['commodity', 'item', 'unit']:
        le = LabelEncoder()
        df[col + '_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    return df, encoders

def train_and_predict(df, item_name):
    # Encode features
    df, encoders = encode_features(df)
    # Select only the requested item
    item_df = df[df['item'].str.lower() == item_name.lower()]
    if item_df.empty:
        raise ValueError(f"Item '{item_name}' not found in dataset.")
    # Feature columns
    features = ['year', 'month_num', 'commodity_enc', 'item_enc', 'unit_enc']
    X = item_df[features]
    y = item_df['price']
    # Train XGBoost regressor
    model = xgb.XGBRegressor(n_estimators=100, objective='reg:squarederror')
    model.fit(X, y)
    # Predict next month
    last_row = item_df.iloc[-1]
    next_year = int(last_row['year'])
    next_month = int(last_row['month_num']) + 1
    if next_month > 12:
        next_month = 1
        next_year += 1
    # Prepare next month features
    next_features = pd.DataFrame([{
        'year': next_year,
        'month_num': next_month,
        'commodity_enc': int(last_row['commodity_enc']),
        'item_enc': int(last_row['item_enc']),
        'unit_enc': int(last_row['unit_enc'])
    }])
    predicted_price = model.predict(next_features)[0]
    return predicted_price, item_df, model, encoders, next_year, next_month

def suggest_price(predicted_price, markup=0.05):
    return round(predicted_price * (1 + markup), 2)

def plot_prices(item_df, model, encoders, next_year, next_month, predicted_price, item_name):
    # Historical
    plt.figure(figsize=(10,5))
    plt.plot(item_df['ds'], item_df['price'], label='Historical Price')
    # Predicted
    next_date = pd.to_datetime(f"{next_year}-{next_month:02d}-01")
    plt.scatter(next_date, predicted_price, color='red', label='Next Month Prediction')
    plt.title(f"XGBoost Price Forecast for '{item_name}'")
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.tight_layout()
    plt.show()

def suggest_for_item(csv_path, item_name, show_plot=True):
    df = load_and_clean(csv_path)
    predicted_price, item_df, model, encoders, next_year, next_month = train_and_predict(df, item_name)
    recommended_price = suggest_price(predicted_price)
    print(f"Predicted price for '{item_name}' next month: {predicted_price:.2f}")
    print(f"Recommended selling price (+5% markup): {recommended_price:.2f}")
    if show_plot:
        plot_prices(item_df, model, encoders, next_year, next_month, predicted_price, item_name)

# Example usage:
if __name__ == "__main__":
    csv_path = "price_list.csv"
    while True:
        item_name = input("Enter product name (e.g., 'special rice') or type 'exit' to quit: ").strip()
        if item_name.lower() == 'exit':
            print("Exiting price suggestion tool.")
            break
        try:
            suggest_for_item(csv_path, item_name)
        except Exception as e:
            print(f"Error: {e}")