const express = require('express');
const router = express.Router();
const controller = require('../controllers/priceController');
const dataService = require('../services/dataService');

// Middleware to ensure dataset is loaded during serverless execution
router.use(async (req, res, next) => {
  try {
    await dataService.ensureLoaded();
  } catch (err) {
    console.error('Error ensuring dataService is loaded:', err);
  }
  next();
});

// Health check
router.get('/health', controller.getHealth);

// Metadata lookups
router.get('/categories', controller.getCategories);
router.get('/commodities', controller.getCommodities);
router.get('/states', controller.getStates);
router.get('/markets', controller.getMarkets);
router.get('/districts', controller.getDistricts);
router.get('/varieties', controller.getVarieties);
router.get('/summary', controller.getSummary);

// Price queries & charts
router.get('/prices', controller.getPrices);
router.get('/price-history', controller.getPriceHistory);
router.get('/kpis', controller.getDashboardKPIs);

// Market Comparison
router.get('/market-comparison', controller.getMarketComparison);

// ML Forecast
router.post('/forecast', controller.getForecast);

// Market Intelligence Insights
router.get('/insights', controller.getInsights);
router.get('/live-rates', controller.getLiveRates);

// Google Gemini AI Advisory & Copilot
router.post('/gemini/advisory', controller.getGeminiAdvisory);
router.post('/gemini/chat', controller.chatGemini);
router.post('/gemini/tts', controller.getGeminiTTS);
router.get('/gemini/tts-audio', controller.getTTSAudio);

// Data.gov.in Live Agmarknet Sync
router.post('/sync-data-gov', controller.syncDataGov);
router.get('/data-gov-info', controller.getDataGovInfo);

module.exports = router;

