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
    const { category } = req.query;
    const list = dataService.getCommodities(category);
    res.json({ commodities: list, total: list.length, category: category || 'All' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = dataService.getCategories();
    res.json({ categories, total: Object.keys(categories).length });
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
    const { commodity, state, category } = req.query;
    const list = dataService.getMarkets({ commodity, state, category });
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

exports.getLiveRates = async (req, res) => {
  try {
    const { category, limit, search } = req.query;
    const result = dataService.getLiveMarketRates({ category, limit, search });
    res.json(result);
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
    res.json({
      resource_id: '9ef84268-d588-465a-a308-a864a43d0070',
      title: 'Current Daily Price and Arrival of Agricultural Commodities in Mandis',
      source: 'data.gov.in',
      api_base: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGeminiAdvisory = async (req, res) => {
  try {
    const geminiService = require('../services/geminiService');
    const result = await geminiService.getAdvisory(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.chatGemini = async (req, res) => {
  try {
    const geminiService = require('../services/geminiService');
    const result = await geminiService.chat(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Gemini TTS – generates speech audio for a given text and language
exports.getGeminiTTS = async (req, res) => {
  try {
    const { text, language = 'English', bcp47 = 'en-IN' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });

    const geminiService = require('../services/geminiService');
    const audioResult = await geminiService.textToSpeech({ text, language, bcp47 });
    res.json(audioResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Direct Audio Stream (MP3) for any Indian Language
exports.getTTSAudio = async (req, res) => {
  try {
    const text = req.query.text || '';
    const tl = req.query.tl || 'en';
    if (!text.trim()) {
      return res.status(400).send('Missing text parameter');
    }

    const geminiService = require('../services/geminiService');
    const audioBuffer = await geminiService.fetchTTSAudio({ text, tl });
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400'
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('getTTSAudio error:', error.message);
    res.status(500).send('Audio generation failed');
  }
};




