import os
import sys
import json
import argparse
import requests
import pandas as pd
from datetime import datetime

DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{DATA_GOV_RESOURCE_ID}"

def fetch_data_gov_prices(api_key, limit=100, offset=0, state=None, commodity=None, format="json"):
    """
    Fetches real-time agricultural mandi prices from api.data.gov.in Agmarknet endpoint.
    Resource: 9ef84268-d588-465a-a308-a864a43d0070 (Daily Wholesale Prices & Arrivals)
    """
    params = {
        "api-key": api_key,
        "format": format,
        "limit": limit,
        "offset": offset
    }
    
    # Optional filters
    filters = {}
    if state:
        filters["state"] = state
    if commodity:
        filters["commodity"] = commodity
        
    for k, v in filters.items():
        params[f"filters[{k}]"] = v

    print(f"Connecting to Data.gov.in API (Resource: {DATA_GOV_RESOURCE_ID})...")
    try:
        response = requests.get(BASE_URL, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
        
        records = data.get("records", [])
        total = data.get("total", len(records))
        print(f"Successfully retrieved {len(records)} records (Total available: {total})")
        return records, total
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to api.data.gov.in: {e}")
        return None, 0

def format_records(raw_records):
    """
    Standardizes Data.gov.in fields to AgriPrice Tracker schema:
    [state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price]
    """
    formatted = []
    for r in raw_records:
        # Standardize date to YYYY-MM-DD
        raw_date = r.get("arrival_date") or r.get("Arrival_Date") or datetime.now().strftime("%d/%m/%Y")
        try:
            parsed_date = pd.to_datetime(raw_date, format="%d/%m/%Y", errors="coerce")
            if pd.isna(parsed_date):
                parsed_date = pd.to_datetime(raw_date, errors="coerce")
            clean_date = parsed_date.strftime("%Y-%m-%d") if not pd.isna(parsed_date) else datetime.now().strftime("%Y-%m-%d")
        except Exception:
            clean_date = datetime.now().strftime("%Y-%m-%d")

        try:
            min_p = float(r.get("min_price") or r.get("Min_Price") or 0)
            max_p = float(r.get("max_price") or r.get("Max_Price") or 0)
            modal_p = float(r.get("modal_price") or r.get("Modal_Price") or 0)
        except (ValueError, TypeError):
            continue

        if modal_p <= 0:
            continue

        formatted.append({
            "state": str(r.get("state") or r.get("State") or "").strip(),
            "district": str(r.get("district") or r.get("District") or "").strip(),
            "market": str(r.get("market") or r.get("Market") or "").strip(),
            "commodity": str(r.get("commodity") or r.get("Commodity") or "").strip(),
            "variety": str(r.get("variety") or r.get("Variety") or "Normal").strip(),
            "grade": str(r.get("grade") or r.get("Grade") or "FAQ").strip(),
            "arrival_date": clean_date,
            "min_price": min_p,
            "max_price": max_p,
            "modal_price": modal_p,
            "is_synthetic": False
        })
    return formatted

def main():
    parser = argparse.ArgumentParser(description="Sync Live Mandi Prices from api.data.gov.in")
    parser.add_argument("--api-key", required=True, help="Your api.data.gov.in API key")
    parser.add_argument("--limit", type=int, default=100, help="Number of records to fetch (max 1000)")
    parser.add_argument("--state", type=str, default=None, help="Filter by state (e.g. Gujarat)")
    parser.add_argument("--commodity", type=str, default=None, help="Filter by commodity (e.g. Tomato)")
    parser.add_argument("--save", action="store_true", help="Save directly to data/processed dataset")
    
    args = parser.parse_args()

    raw_records, total = fetch_data_gov_prices(
        api_key=args.api_key,
        limit=args.limit,
        state=args.state,
        commodity=args.commodity
    )

    if not raw_records:
        print("No records retrieved. Check your API key and filter parameters.")
        sys.exit(1)

    clean_records = format_records(raw_records)
    print(f"Cleaned {len(clean_records)} valid price records.")

    if clean_records:
        print("\nSample Synced Records:")
        df = pd.DataFrame(clean_records)
        print(df[["state", "market", "commodity", "arrival_date", "modal_price"]].head(5))

    if args.save:
        save_path = os.path.join(os.path.dirname(__file__), "processed", "processed_prices.csv")
        if os.path.exists(save_path):
            existing_df = pd.read_csv(save_path)
            combined = pd.concat([existing_df, pd.DataFrame(clean_records)], ignore_index=True)
            combined = combined.drop_duplicates(subset=["state", "market", "commodity", "variety", "arrival_date"], keep="last")
            combined.to_csv(save_path, index=False)
            print(f"\nSuccessfully merged {len(clean_records)} records into {save_path} (Total now: {len(combined):,})")

if __name__ == "__main__":
    main()
