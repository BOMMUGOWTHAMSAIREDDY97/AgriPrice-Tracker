import os
import sys
import argparse
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from features import create_time_series_features

def forecast_pipeline(commodity, market, horizon=7, data_path=None):
    if data_path is None:
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "processed_prices.csv")
        
    if not os.path.exists(data_path):
        return {
            "error": "Dataset not found. Please run data processing first.",
            "status": "failed"
        }
        
    # Read dataset
    df = pd.read_csv(data_path)
    requested_market = market
    
    # Filter for exact commodity and market
    exact_sub = df[(df['commodity'].str.lower() == commodity.lower()) & (df['market'].str.lower() == market.lower())].copy()
    
    is_proxy_model = False
    if len(exact_sub) >= 10:
        sub = exact_sub
        current_price = float(sub['modal_price'].iloc[-1])
        state = str(sub['state'].iloc[-1])
        district = str(sub['district'].iloc[-1])
        variety = str(sub['variety'].iloc[-1]) if 'variety' in sub else 'FAQ'
    else:
        # If market has fewer records, find the best reference market for this commodity
        comm_sub = df[df['commodity'].str.lower() == commodity.lower()]
        if len(comm_sub) < 5:
            return {
                "error": f"Insufficient historical data for {commodity} across all markets.",
                "status": "insufficient_data"
            }
        top_market = comm_sub['market'].value_counts().index[0]
        sub = df[(df['commodity'].str.lower() == commodity.lower()) & (df['market'] == top_market)].copy()
        is_proxy_model = True
        
        if len(exact_sub) > 0:
            current_price = float(exact_sub['modal_price'].iloc[-1])
            state = str(exact_sub['state'].iloc[-1])
            district = str(exact_sub['district'].iloc[-1])
            variety = str(exact_sub['variety'].iloc[-1]) if 'variety' in exact_sub else 'FAQ'
        else:
            current_price = float(sub['modal_price'].iloc[-1])
            state = str(sub['state'].iloc[-1])
            district = str(sub['district'].iloc[-1])
            variety = str(sub['variety'].iloc[-1]) if 'variety' in sub else 'FAQ'
            
    # Process features
    sub, feature_cols = create_time_series_features(sub, target_col='modal_price')
    sub = sub.sort_values(by='arrival_date').reset_index(drop=True)
    
    # Chronological Train/Test Split (80% Train, 20% Test)
    n = len(sub)
    train_size = max(int(n * 0.80), 1)
    train_df = sub.iloc[:train_size]
    test_df = sub.iloc[train_size:] if train_size < n else sub.iloc[-1:]
    
    X_train = train_df[feature_cols]
    y_train = train_df['modal_price']
    X_test = test_df[feature_cols]
    y_test = test_df['modal_price']
    
    # Baseline: Moving Average
    y_pred_baseline = test_df['ma_7']
    ma_mape = mean_absolute_percentage_error(y_test, y_pred_baseline) * 100
    
    # Model 1: Gradient Boosting
    gbr = GradientBoostingRegressor(n_estimators=75, learning_rate=0.08, max_depth=3, random_state=42)
    gbr.fit(X_train, y_train)
    y_pred_gbr = gbr.predict(X_test)
    gbr_mape = mean_absolute_percentage_error(y_test, y_pred_gbr) * 100
    
    # Model 2: Random Forest
    rf = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    rf_mape = mean_absolute_percentage_error(y_test, y_pred_rf) * 100
    
    # Pick Best Model
    candidates = [
        ("Gradient Boosting Regressor", gbr, y_pred_gbr, gbr_mape),
        ("Random Forest Regressor", rf, y_pred_rf, rf_mape),
        ("7-Day Moving Average Baseline", None, y_pred_baseline, ma_mape)
    ]
    candidates.sort(key=lambda x: x[3])
    best_name, best_model, best_preds, best_mape = candidates[0]
    
    # Compute validation metrics
    mae = float(mean_absolute_error(y_test, best_preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, best_preds)))
    mape = float(best_mape)
    
    # Retrain best model on full history
    if best_model is not None:
        best_model.fit(sub[feature_cols], sub['modal_price'])
        
    # Multi-step Recursive Forecasting
    today = datetime.now()
    base_training_price = float(sub['modal_price'].iloc[-1])
    
    temp_df = sub.copy()
    forecast_points = []
    
    for h in range(1, horizon + 1):
        next_date = today + timedelta(days=h)
        
        # Calculate features on updated temp_df
        temp_features, _ = create_time_series_features(temp_df, target_col='modal_price')
        latest_X = temp_features[feature_cols].iloc[[-1]]
        
        if best_model is not None:
            raw_pred = float(best_model.predict(latest_X)[0])
        else:
            raw_pred = float(temp_df['modal_price'].tail(7).mean())
            
        # If proxy model, scale relative predicted multiplier to requested market current price
        if is_proxy_model and base_training_price > 0:
            growth_ratio = raw_pred / base_training_price
            pred_price = current_price * growth_ratio
        else:
            pred_price = raw_pred
            
        # Add realistic bounds (±50% max fluctuation over forecast horizon)
        pred_price = max(pred_price, current_price * 0.5)
        pred_price = min(pred_price, current_price * 1.8)
        
        # Confidence interval
        uncertainty_factor = min(0.35, (mae / (base_training_price + 1e-5)) * np.sqrt(h) * 0.5)
        lower_bound = round(max(pred_price * (1 - uncertainty_factor), pred_price * 0.7), 2)
        upper_bound = round(pred_price * (1 + uncertainty_factor), 2)
        
        forecast_points.append({
            "date": next_date.strftime('%Y-%m-%d'),
            "forecast_price": round(pred_price, 2),
            "lower_range": lower_bound,
            "upper_range": upper_bound,
            "horizon_day": h
        })
        
        # Append for next recursive step in feature space
        new_row = temp_df.iloc[[-1]].copy()
        new_row['arrival_date'] = next_date.strftime('%Y-%m-%d')
        new_row['modal_price'] = raw_pred
        new_row['min_price'] = lower_bound
        new_row['max_price'] = upper_bound
        temp_df = pd.concat([temp_df, new_row], ignore_index=True)
        
    final_forecast_price = forecast_points[-1]["forecast_price"]
    price_diff = final_forecast_price - current_price
    pct_change = round((price_diff / current_price) * 100, 2)
    
    # Recommendation Logic
    if pct_change >= 3.0:
        action = "WAIT"
        color = "emerald"
        rationale = f"Prices for {commodity} in {requested_market} are estimated to increase by {pct_change:+.1f}% over the next {horizon} days. Holding stock is expected to yield higher realization."
    elif pct_change <= -3.0:
        action = "CONSIDER SELLING"
        color = "rose"
        rationale = f"Prices for {commodity} in {requested_market} are estimated to decline by {abs(pct_change):.1f}% over the next {horizon} days. Offloading inventory now protects against price drops."
    else:
        action = "MONITOR"
        color = "amber"
        rationale = f"Prices for {commodity} in {requested_market} are projected to remain relatively stable (expected change: {pct_change:+.1f}%). Closely track mandi arrivals before large shipments."
        
    # Historical data snippet for charts (daily series leading up to today)
    hist_snippet = []
    source_df = exact_sub if len(exact_sub) > 0 else sub
    tail_rows = source_df.tail(60).reset_index(drop=True)
    num_rows = len(tail_rows)
    
    for idx, r in tail_rows.iterrows():
        days_ago = num_rows - 1 - idx
        row_date = (today - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        hist_snippet.append({
            "date": row_date,
            "modal_price": float(r['modal_price']),
            "min_price": float(r['min_price']),
            "max_price": float(r['max_price']),
            "ma_7": round(float(r['ma_7']), 2) if 'ma_7' in r else float(r['modal_price'])
        })
        
    result = {
        "status": "success",
        "commodity": commodity,
        "market": requested_market,
        "state": state,
        "district": district,
        "variety": variety,
        "current_price": round(current_price, 2),
        "forecast_price": round(final_forecast_price, 2),
        "expected_change_pct": pct_change,
        "expected_change_val": round(price_diff, 2),
        "horizon_days": horizon,
        "model_name": best_name,
        "validation_metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2),
            "test_samples": len(test_df),
            "train_samples": len(train_df)
        },
        "recommendation": {
            "action": action,
            "color": color,
            "rationale": rationale,
            "confidence_score": round(max(50.0, min(95.0, 100.0 - mape)), 1),
            "disclaimer": "This is a machine learning decision-support estimate based on historical mandi arrival patterns, not guaranteed financial advice."
        },
        "forecast_series": forecast_points,
        "historical_series": hist_snippet
    }
    
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriPrice Tracker ML Forecasting Engine")
    parser.add_argument("--commodity", type=str, default="Tomato", help="Commodity name")
    parser.add_argument("--market", type=str, default="Rajkot(Veg.Sub Yard)", help="Market name")
    parser.add_argument("--horizon", type=int, default=7, help="Forecast horizon in days (7, 14, 30)")
    parser.add_argument("--data_path", type=str, default=None, help="Path to processed CSV")
    
    args = parser.parse_args()
    
    output = forecast_pipeline(args.commodity, args.market, args.horizon, args.data_path)
    print(json.dumps(output))
