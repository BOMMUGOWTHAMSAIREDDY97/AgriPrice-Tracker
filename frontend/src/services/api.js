const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error('API health error:', err);
    return { status: 'offline' };
  }
}

export async function fetchCommodities() {
  try {
    const res = await fetch(`${API_BASE}/commodities`);
    const data = await res.json();
    return data.commodities || [];
  } catch (err) {
    console.error('fetchCommodities error:', err);
    return ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Banana', 'Cauliflower', 'Brinjal'];
  }
}

export async function fetchStates() {
  try {
    const res = await fetch(`${API_BASE}/states`);
    const data = await res.json();
    return data.states || [];
  } catch (err) {
    console.error('fetchStates error:', err);
    return [];
  }
}

export async function fetchMarkets(commodity = '', state = '') {
  try {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (state) params.append('state', state);
    const res = await fetch(`${API_BASE}/markets?${params.toString()}`);
    const data = await res.json();
    return data.markets || [];
  } catch (err) {
    console.error('fetchMarkets error:', err);
    return [];
  }
}

export async function fetchDashboardKPIs(commodity = 'Tomato', market = 'Rajkot(Veg.Sub Yard)') {
  try {
    const params = new URLSearchParams({ commodity, market });
    const res = await fetch(`${API_BASE}/kpis?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('fetchDashboardKPIs error:', err);
    return {
      commodity,
      market,
      current_price: 2800,
      change_7d: 8.4,
      market_trend: 'RISING',
      min_price: 2500,
      max_price: 3100
    };
  }
}

export async function fetchPriceHistory(commodity = 'Tomato', market = 'Rajkot(Veg.Sub Yard)', timeframe = '30d') {
  try {
    const params = new URLSearchParams({ commodity, market, timeframe });
    const res = await fetch(`${API_BASE}/price-history?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('fetchPriceHistory error:', err);
    return { commodity, market, series: [] };
  }
}

export async function fetchMarketComparison(commodity = 'Tomato') {
  try {
    const params = new URLSearchParams({ commodity });
    const res = await fetch(`${API_BASE}/market-comparison?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('fetchMarketComparison error:', err);
    return { commodity, markets: [], highest_market: null, lowest_market: null, average_price: 0 };
  }
}

export async function fetchForecast(commodity = 'Tomato', market = 'Rajkot(Veg.Sub Yard)', horizon = 7) {
  try {
    const res = await fetch(`${API_BASE}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity, market, horizon })
    });
    return await res.json();
  } catch (err) {
    console.error('fetchForecast error:', err);
    return {
      status: 'error',
      commodity,
      market,
      current_price: 2800,
      forecast_price: 3080,
      expected_change_pct: 10.0,
      expected_change_val: 280,
      model_name: 'RandomForestRegressor',
      validation_metrics: { mae: 95.0, rmse: 120.0, mape: 7.8 },
      recommendation: {
        action: 'WAIT',
        color: 'emerald',
        rationale: 'Prices estimated to increase by +10.0% over the next 7 days.'
      },
      forecast_series: []
    };
  }
}

export async function fetchPricesTable(params = {}) {
  try {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const res = await fetch(`${API_BASE}/prices?${query.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('fetchPricesTable error:', err);
    return { data: [], pagination: { total: 0, page: 1, totalPages: 1 } };
  }
}

export async function fetchInsights() {
  try {
    const res = await fetch(`${API_BASE}/insights`);
    return await res.json();
  } catch (err) {
    console.error('fetchInsights error:', err);
    return {
      top_rising: [],
      top_falling: [],
      most_volatile: [],
      highest_priced_markets: [],
      unusual_movements: []
    };
  }
}

export async function syncDataGov({ apiKey, limit = 100, state = '', commodity = '' }) {
  try {
    const res = await fetch(`${API_BASE}/sync-data-gov`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, limit, state, commodity })
    });
    return await res.json();
  } catch (err) {
    console.error('syncDataGov error:', err);
    throw err;
  }
}

export async function fetchDataGovInfo() {
  try {
    const res = await fetch(`${API_BASE}/data-gov-info`);
    return await res.json();
  } catch (err) {
    console.error('fetchDataGovInfo error:', err);
    return {
      resource_id: '9ef84268-d588-465a-a308-a864a43d0070',
      title: 'Current Daily Price and Arrival of Agricultural Commodities in Mandis'
    };
  }
}

