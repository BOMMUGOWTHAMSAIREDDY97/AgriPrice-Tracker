import kagglehub
import os
import pandas as pd

def load_mandi_dataset():
    """
    Downloads and loads the latest Indian Agricultural Mandi Prices (2023-2025) dataset from Kaggle.
    Dataset: arjunyadav99/indian-agricultural-mandi-prices-20232025
    """
    print("Downloading/Locating dataset from Kaggle...")
    path = kagglehub.dataset_download("arjunyadav99/indian-agricultural-mandi-prices-20232025")
    print(f"Dataset cached at: {path}")
    
    # Locate the CSV file inside the downloaded path
    csv_files = [f for f in os.listdir(path) if f.endswith('.csv')]
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {path}")
    
    file_path = os.path.join(path, csv_files[0])
    print(f"Loading CSV: {file_path}")
    
    df = pd.read_csv(file_path)
    print(f"\nSuccessfully loaded {len(df):,} records with columns:")
    print(df.columns.tolist())
    
    print("\n--- First 5 Records ---")
    print(df.head())
    
    print("\n--- Dataset Summary ---")
    print(f"Unique Commodities: {df['Commodity'].nunique()} -> {df['Commodity'].unique().tolist()}")
    print(f"Unique States: {df['STATE'].nunique()}")
    print(f"Unique Markets: {df['Market Name'].nunique()}")
    if 'Price Date' in df.columns:
        print(f"Date Sample: {df['Price Date'].iloc[0]} to {df['Price Date'].iloc[-1]}")
    
    return df

if __name__ == "__main__":
    df = load_mandi_dataset()
