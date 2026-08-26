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
    df['lag_1'] = df[target_col].shift(1).bfill().ffill().fillna(df[target_col])
    df['lag_3'] = df[target_col].shift(3).bfill().ffill().fillna(df[target_col])
    df['lag_7'] = df[target_col].shift(7).bfill().ffill().fillna(df[target_col])
    df['lag_14'] = df[target_col].shift(14).bfill().ffill().fillna(df[target_col])
    
    # Moving averages
    df['ma_7'] = df[target_col].rolling(window=7, min_periods=1).mean().bfill().ffill().fillna(df[target_col])
    df['ma_14'] = df[target_col].rolling(window=14, min_periods=1).mean().bfill().ffill().fillna(df[target_col])
    df['ma_30'] = df[target_col].rolling(window=30, min_periods=1).mean().bfill().ffill().fillna(df[target_col])
    
    # Momentum / Price Changes (percentage)
    shift_7 = df[target_col].shift(7)
    df['pct_change_7'] = np.where(
        shift_7.notna() & (shift_7 > 0),
        (df[target_col] - shift_7) / shift_7 * 100,
        0.0
    )
    
    shift_30 = df[target_col].shift(30)
    df['pct_change_30'] = np.where(
        shift_30.notna() & (shift_30 > 0),
        (df[target_col] - shift_30) / shift_30 * 100,
        0.0
    )
    
    # Calendar features
    df['month'] = df['arrival_date'].dt.month
    df['day_of_week'] = df['arrival_date'].dt.dayofweek
    df['day_of_year'] = df['arrival_date'].dt.dayofyear
    
    feature_cols = [
        'lag_1', 'lag_3', 'lag_7', 'lag_14',
        'ma_7', 'ma_14', 'ma_30',
        'pct_change_7', 'pct_change_30',
        'month', 'day_of_week', 'day_of_year'
    ]
    
    # Ensure zero NaNs or Infs across all feature columns
    for col in feature_cols:
        df[col] = df[col].replace([np.inf, -np.inf], 0.0)
        df[col] = df[col].bfill().ffill().fillna(0.0)
    
    return df, feature_cols
