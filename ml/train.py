import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from features import create_time_series_features

def evaluate_models_on_dataset():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "processed_prices.csv")
    df = pd.read_csv(data_path)
    
    top_combos = [
        ("Tomato", "Rajkot(Veg.Sub Yard)"),
        ("Onion", "Surat"),
        ("Potato", "Panipat"),
        ("Wheat", "Kota"),
        ("Banana", "Mukkom"),
        ("Green Chilli", "Kukatpally(Rythu Bazar)")
    ]
    
    results = []
    for comm, mkt in top_combos:
        sub = df[(df['commodity'] == comm) & (df['market'] == mkt)].copy()
        if len(sub) < 20:
            continue
            
        sub, feature_cols = create_time_series_features(sub)
        n = len(sub)
        train_size = int(n * 0.80)
        train_df = sub.iloc[:train_size]
        test_df = sub.iloc[train_size:]
        
        X_train, y_train = train_df[feature_cols], train_df['modal_price']
        X_test, y_test = test_df[feature_cols], test_df['modal_price']
        
        # Moving Average
        y_pred_ma = test_df['ma_7']
        mape_ma = mean_absolute_percentage_error(y_test, y_pred_ma) * 100
        
        # GBR
        gbr = GradientBoostingRegressor(n_estimators=75, learning_rate=0.08, max_depth=3, random_state=42)
        gbr.fit(X_train, y_train)
        y_pred_gbr = gbr.predict(X_test)
        mape_gbr = mean_absolute_percentage_error(y_test, y_pred_gbr) * 100
        mae_gbr = mean_absolute_error(y_test, y_pred_gbr)
        
        # RF
        rf = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
        rf.fit(X_train, y_train)
        y_pred_rf = rf.predict(X_test)
        mape_rf = mean_absolute_percentage_error(y_test, y_pred_rf) * 100
        mae_rf = mean_absolute_error(y_test, y_pred_rf)
        
        results.append({
            "Commodity": comm,
            "Market": mkt,
            "MA_Baseline_MAPE": f"{mape_ma:.2f}%",
            "GBR_MAPE": f"{mape_gbr:.2f}%",
            "RF_MAPE": f"{mape_rf:.2f}%",
            "Best_Model": "Gradient Boosting" if mape_gbr <= mape_rf else "Random Forest"
        })
        
    res_df = pd.DataFrame(results)
    print("=== Model Benchmark Summary ===")
    print(res_df.to_string(index=False))
    return res_df

if __name__ == "__main__":
    evaluate_models_on_dataset()
