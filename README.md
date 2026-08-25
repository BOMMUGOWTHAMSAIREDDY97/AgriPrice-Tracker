# 🌾 AgriPrice Tracker

> **Full-Stack Agricultural Market Intelligence & Machine Learning Price Forecasting Platform**

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-ML%20Scikit--Learn-3776ab?logo=python&logoColor=white)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Problem Statement

Agricultural commodity prices fluctuate continuously due to seasonality, localized mandi arrivals, supply shocks, and multi-market arbitrage. 

**AgriPrice Tracker** empowers farmers, aggregators, traders, and agri-businesses with real-time price discovery, market comparison across 1,600+ mandis, and recursive machine learning forecasts that generate actionable **BUY / SELL / WAIT / MONITOR** signals.

---

## ✨ Key Features

- 📊 **Agricultural Intelligence Dashboard**: Live KPI momentum metrics, multi-timeframe price charts (7D, 30D, 90D, 1Y), and moving averages (7D / 14D).
- 🔍 **Pan-India Price Explorer**: High-performance searchable & filterable table across **298,232+ mandi records** covering **123 commodities** and **31 States/UTs**.
- 📈 **Multi-Market Comparison**: Direct side-by-side mandi benchmark ranking with automatic arbitrage opportunity detection.
- 🔮 **ML Price Forecasting Engine**:
  - Recursive multi-step price projection (7-day, 14-day, 30-day horizons) using **Gradient Boosting Regressor** and **Random Forest**.
  - Standard error confidence intervals (upper/lower bounds).
  - Decision Intelligence recommendation engine (**BUY / SELL / WAIT / MONITOR**) with confidence scoring.
- 💰 **"What-If" Profit Simulator**: Computes projected financial gain/loss per quintal and total inventory valuation based on ML target prices.
- 📉 **Market Anomaly & Volatility Insights**: Identifies top rising/falling crops, highly volatile commodities, and unusual market price spikes.
- 🏛️ **Live Government Data Sync**: Direct API connector for **api.data.gov.in (OGD India / Agmarknet)** and automated Kaggle dataset loader.
- 🌌 **Modern Vertical Sidebar Layout**: Sleek obsidian auroral design with glassmorphism and mobile responsiveness.

---

## 🛠️ Architecture & Tech Stack

```
agriprice-tracker/
├── frontend/             # React + Vite + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── components/   # Sidebar, DecisionBadge, KPICard, Charts, ProfitSimulator
│   │   ├── pages/        # Dashboard, PriceExplorer, MarketComparison, ForecastPage, Insights, Alerts
│   │   └── services/     # API client
├── backend/              # Express.js REST API & In-Memory High-Performance Store
│   ├── controllers/      # Price discovery & analytics endpoints
│   ├── routes/           # API routes
│   └── services/         # DataService, MLBridge, DataGovSync
├── ml/                   # Machine Learning Engine
│   ├── features.py       # Time-series feature engineering (Lags, Rolling MA, Volatility)
│   ├── forecast.py       # Recursive ML forecasting with confidence bounds
│   └── train.py          # Model validation & benchmarking (MAE, RMSE, MAPE)
└── data/                 # Raw & Processed Mandi Datasets
    ├── raw/              # Multi-year Kaggle Mandi dataset & wholesale feeds
    ├── process_dataset.py# Automated data ingestion and standardization pipeline
    └── load_kaggle_dataset.py
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)

### 1. Clone the Repository
```bash
git clone https://github.com/BOMMUGOWTHAMSAIREDDY97/AgriPrice-Tracker.git
cd AgriPrice-Tracker
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

**Python ML Engine:**
```bash
cd ../ml
pip install -r requirements.txt
```

### 3. Run the Application

**Start Backend Server (Port 5000):**
```bash
cd backend
npm start
```

**Start Frontend Server (Port 3000):**
```bash
cd frontend
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📊 Dataset Ingestion & Live Sync

- **Process local dataset**:
  ```bash
  python data/process_dataset.py
  ```
- **Load Kaggle 2023-2025 dataset**:
  ```bash
  python data/load_kaggle_dataset.py
  ```
- **Sync Live from Data.gov.in Agmarknet API**:
  ```bash
  python data/sync_data_gov.py --api-key YOUR_API_KEY --limit 100 --save
  ```

---

## 📄 License
This project is licensed under the MIT License.
