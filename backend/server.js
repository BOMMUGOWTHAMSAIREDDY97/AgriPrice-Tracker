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

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend Static Assets in Production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root health & welcome for API-only mode
  app.get('/', (req, res) => {
    res.json({
      name: "AgriPrice Tracker Backend API",
      version: "1.0.0",
      docs: "/api/health",
      status: "active"
    });
  });
}

async function startServer() {
  try {
    console.log('Initializing AgriPrice Tracker data service...');
    await dataService.loadData();
    app.listen(PORT, () => {
      console.log(`🌾 AgriPrice Tracker Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
