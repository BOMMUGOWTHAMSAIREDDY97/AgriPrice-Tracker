require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dataService = require('./services/dataService');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes — must be registered BEFORE static/catch-all
app.use('/api', apiRoutes);

// Serve built React frontend (production)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const indexHtml = path.join(frontendDist, 'index.html');

if (fs.existsSync(indexHtml)) {
  // Serve static assets (JS, CSS, images)
  app.use(express.static(frontendDist));

  // SPA catch-all: send index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  // Development / API-only mode
  app.get('/', (req, res) => {
    res.json({
      name: 'AgriPrice Tracker Backend API',
      version: '1.0.0',
      docs: '/api/health',
      status: 'active'
    });
  });
}

async function startServer() {
  try {
    console.log('Initializing AgriPrice Tracker data service...');
    await dataService.loadData();
    app.listen(PORT, () => {
      console.log(`AgriPrice Tracker running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
