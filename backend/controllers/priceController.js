const dataService = require('../services/dataService');
const mlBridge = require('../services/mlBridge');

exports.getHealth = async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'AgriPrice Tracker API',
      timestamp: new Date().toISOString(),
      dataset_loaded: dataService.isLoaded,
      total_records: dataService.records.length,
      total_commodities: dataService.commodities.length,
      total_markets: dataService.markets.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCommodities = async (req, res) => {
  try {
    const list = dataService.getCommodities();
    res.json({ commodities: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStates = async (req, res) => {
  try {
    const list = dataService.getStates();
    res.json({ states: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMarkets = async (req, res) => {
  try {
    const { commodity, state } = req.query;
    const list = dataService.getMarkets({ commodity, state });
    res.json({ markets: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    const list = dataService.getDistricts(state);
    res.json({ districts: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVarieties = async (req, res) => {
  try {
    const { commodity } = req.query;
    const list = dataService.getVarieties(commodity);
    res.json({ varieties: list, total: list.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPrices = async (req, res) => {
  try {
    const result = dataService.getPrices(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPriceHistory = async (req, res) => {
  try {
    const { commodity, market, timeframe } = req.query;
    const result = dataService.getPriceHistory({ commodity, market, timeframe });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardKPIs = async (req, res) => {
  try {
    const { commodity, market } = req.query;
    const result = dataService.getDashboardKPIs({ commodity, market });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMarketComparison = async (req, res) => {
  try {
    const { commodity } = req.query;
    const result = dataService.getMarketComparison(commodity || 'Tomato');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { commodity = 'Tomato', market = 'Rajkot(Veg.Sub Yard)', horizon = 7 } = req.body || {};
    const parsedHorizon = parseInt(horizon, 10) || 7;

    const forecastResult = await mlBridge.runForecast({
      commodity,
      market,
      horizon: parsedHorizon
    });

    res.json(forecastResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const insights = dataService.getInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    res.json(dataService.summary || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.syncDataGov = async (req, res) => {
  try {
    const dataGovSync = require('../services/dataGovSync');
    const { apiKey, limit, offset, state, commodity } = req.body || {};
    const result = await dataGovSync.fetchRecords({ apiKey, limit, offset, state, commodity });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDataGovInfo = async (req, res) => {
  try {
    const dataGovSync = require('../services/dataGovSync');
    res.json(dataGovSync.getInfo());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

