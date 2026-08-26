const express = require('express');
const router = express.Router();
const controller = require('../controllers/priceController');

// Health check
router.get('/health', controller.getHealth);

// Metadata lookups
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

// Google Gemini AI Advisory & Copilot
router.post('/gemini/advisory', controller.getGeminiAdvisory);
router.post('/gemini/chat', controller.chatGemini);
router.post('/gemini/tts', controller.getGeminiTTS);
router.get('/gemini/tts-audio', controller.getTTSAudio);

// Data.gov.in Live Agmarknet Sync
router.post('/sync-data-gov', controller.syncDataGov);

module.exports = router;

