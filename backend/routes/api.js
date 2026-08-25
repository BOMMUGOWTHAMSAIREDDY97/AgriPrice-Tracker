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

// Data.gov.in Live Sync API
router.post('/sync-data-gov', controller.syncDataGov);
router.get('/data-gov-info', controller.getDataGovInfo);

module.exports = router;
