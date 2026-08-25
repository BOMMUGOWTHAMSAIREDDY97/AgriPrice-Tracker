import pandas as pd
import numpy as np

def create_time_series_features(df, target_col='modal_price'):
    """
    Creates chronological features for time-series forecasting:
    - Lag 1, 3, 7, 14
    - 7-day, 14-day, 30-day moving averages
    - 7-day, 30-day price momentum changes
    - Calendar features: month, day of week, day of year
    """
    df = df.copy()
    df['arrival_date'] = pd.to_datetime(df['arrival_date'])
    df = df.sort_values(by='arrival_date').reset_index(drop=True)
    
    # Lag features
    df['lag_1'] = df[target_col].shift(1)
    df['lag_3'] = df[target_col].shift(3)
    df['lag_7'] = df[target_col].shift(7)
    df['lag_14'] = df[target_col].shift(14)
    
    # Moving averages
    df['ma_7'] = df[target_col].rolling(window=7, min_periods=1).mean()
    df['ma_14'] = df[target_col].rolling(window=14, min_periods=1).mean()
    df['ma_30'] = df[target_col].rolling(window=30, min_periods=1).mean()
    
    # Momentum / Price Changes
    df['pct_change_7'] = (df[target_col] - df[target_col].shift(7)) / (df[target_col].shift(7) + 1e-5) * 100
    df['pct_change_30'] = (df[target_col] - df[target_col].shift(30)) / (df[target_col].shift(30) + 1e-5) * 100
    
    # Calendar features
    df['month'] = df['arrival_date'].dt.month
    df['day_of_week'] = df['arrival_date'].dt.dayofweek
    df['day_of_year'] = df['arrival_date'].dt.dayofyear
    
    # Drop initial rows with NaNs from lags
    feature_cols = [
        'lag_1', 'lag_3', 'lag_7', 'lag_14',
        'ma_7', 'ma_14', 'ma_30',
        'pct_change_7', 'pct_change_30',
        'month', 'day_of_week', 'day_of_year'
    ]
    
    # Backfill or fillna for earliest rows
    df[feature_cols] = df[feature_cols].bfill().ffill()
    
    return df, feature_cols
