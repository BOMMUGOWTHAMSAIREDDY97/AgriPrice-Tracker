import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime

def process_all_datasets():
    data_dir = os.path.dirname(__file__)
    raw_dir = os.path.join(data_dir, "raw")
    processed_dir = os.path.join(data_dir, "processed")
    os.makedirs(processed_dir, exist_ok=True)

    kaggle_raw = os.path.join(raw_dir, "Kaggle_Mandi_Prices_2023_2025.csv")
    wholesale_raw = os.path.join(raw_dir, "Daily_Wholesale_Commodity_Prices.csv")

    all_frames = []

    # 1. Process Multi-Year Real Mandi Dataset (737K+ records from 2023-2025)
    if os.path.exists(kaggle_raw):
        print(f"Loading Multi-Year Kaggle Mandi Dataset from: {kaggle_raw}")
        df_k = pd.read_csv(kaggle_raw)
        print(f"Loaded {len(df_k):,} raw rows from Kaggle Mandi Dataset.")

        # Standardize columns
        df_k = df_k.rename(columns={
            'STATE': 'state',
            'District Name': 'district',
            'Market Name': 'market',
            'Commodity': 'commodity',
            'Variety': 'variety',
            'Grade': 'grade',
            'Min_Price': 'min_price',
            'Max_Price': 'max_price',
            'Modal_Price': 'modal_price',
            'Price Date': 'arrival_date'
        })

        # Clean text
        for col in ['state', 'district', 'market', 'commodity', 'variety', 'grade']:
            df_k[col] = df_k[col].astype(str).str.strip().str.title()

        # Clean numeric
        for col in ['min_price', 'max_price', 'modal_price']:
            df_k[col] = pd.to_numeric(df_k[col], errors='coerce').fillna(0)

        df_k = df_k[df_k['modal_price'] > 0].copy()

        # Parse dates to ISO YYYY-MM-DD
        print("Parsing dates for Kaggle records...")
        df_k['arrival_date'] = pd.to_datetime(df_k['arrival_date'], format='%d/%m/%Y', errors='coerce')
        # Fallback for M/D/YYYY format
        df_k['arrival_date'] = df_k['arrival_date'].fillna(pd.to_datetime(df_k['arrival_date'], errors='coerce'))
        df_k = df_k.dropna(subset=['arrival_date'])
        df_k['arrival_date'] = df_k['arrival_date'].dt.strftime('%Y-%m-%d')
        df_k['is_synthetic'] = False

        all_frames.append(df_k)
        print(f"Cleaned {len(df_k):,} valid multi-year records.")

    # 2. Process Diverse Wholesale Dataset (123 crops including Spices, Fruits, Cash Crops)
    if os.path.exists(wholesale_raw):
        print(f"Loading Wholesale Commodity Dataset from: {wholesale_raw}")
        df_w = pd.read_csv(wholesale_raw)
        print(f"Loaded {len(df_w):,} raw rows from Wholesale Dataset.")

        col_map = {
            'State': 'state',
            'District': 'district',
            'Market': 'market',
            'Commodity': 'commodity',
            'Variety': 'variety',
            'Grade': 'grade',
            'Arrival_Date': 'arrival_date',
            'Min_x0020_Price': 'min_price',
            'Max_x0020_Price': 'max_price',
            'Modal_x0020_Price': 'modal_price'
        }
        df_w = df_w.rename(columns=lambda c: col_map.get(c.strip(), c.strip().lower().replace(' ', '_')))

        for col in ['state', 'district', 'market', 'commodity', 'variety', 'grade']:
            if col in df_w.columns:
                df_w[col] = df_w[col].astype(str).str.strip().str.title()
            else:
                df_w[col] = ''

        for col in ['min_price', 'max_price', 'modal_price']:
            df_w[col] = pd.to_numeric(df_w[col], errors='coerce').fillna(0)

        df_w = df_w[df_w['modal_price'] > 0].copy()
        
        # Parse dates
        parsed_dates = pd.to_datetime(df_w['arrival_date'], format='%d/%m/%Y', errors='coerce')
        df_w['arrival_date'] = parsed_dates.dt.strftime('%Y-%m-%d').fillna(datetime.now().strftime('%Y-%m-%d'))
        df_w['is_synthetic'] = False

        all_frames.append(df_w)
        print(f"Cleaned {len(df_w):,} wholesale records.")

    if not all_frames:
        raise FileNotFoundError("No raw CSV files found in data/raw directory.")

    print("Merging datasets into unified master agricultural price engine...")
    unified_df = pd.concat(all_frames, ignore_index=True)

    # Standard column ordering
    cols = ['state', 'district', 'market', 'commodity', 'variety', 'grade', 'arrival_date', 'min_price', 'max_price', 'modal_price', 'is_synthetic']
    unified_df = unified_df[[c for c in cols if c in unified_df.columns]]

    # Remove strict exact duplicates
    unified_df = unified_df.drop_duplicates(subset=['state', 'district', 'market', 'commodity', 'variety', 'grade', 'arrival_date'], keep='last')
    unified_df = unified_df.sort_values(by=['commodity', 'market', 'arrival_date']).reset_index(drop=True)

    out_csv = os.path.join(processed_dir, "processed_prices.csv")
    print(f"Writing {len(unified_df):,} records to: {out_csv}...")
    unified_df.to_csv(out_csv, index=False)
    print("CSV saved successfully.")

    # Generate metadata summary
    commodities = sorted(unified_df['commodity'].dropna().unique().tolist())
    markets = sorted(unified_df['market'].dropna().unique().tolist())
    states = sorted(unified_df['state'].dropna().unique().tolist())
    date_min = str(unified_df['arrival_date'].min())
    date_max = str(unified_df['arrival_date'].max())

    summary = {
        "dataset_name": "Pan-India National Mandi Agricultural Price Intelligence Dataset",
        "total_records": len(unified_df),
        "total_commodities": len(commodities),
        "total_markets": len(markets),
        "total_states": len(states),
        "date_range": {
            "start": date_min,
            "end": date_max
        },
        "price_fields": ["min_price", "max_price", "modal_price"],
        "top_commodities": commodities[:30],
        "top_markets": markets[:30],
        "states": states,
        "last_updated": datetime.now().isoformat()
    }

    summary_path = os.path.join(processed_dir, "summary.json")
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\nMetadata Summary saved to: {summary_path}")
    print(json.dumps({k: v for k, v in summary.items() if k not in ['top_commodities', 'top_markets', 'states']}, indent=2))
    print(f"\n[DONE] Pipeline Complete! {len(unified_df):,} records across {len(commodities)} commodities and {len(markets)} markets.")

if __name__ == "__main__":
    process_all_datasets()
