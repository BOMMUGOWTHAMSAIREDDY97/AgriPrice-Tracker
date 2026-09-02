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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://agriprice-tracker.vercel.app',
  'https://agriprice-tracker-2.onrender.com',
  // allow any vercel.app preview deployments
  /\.vercel\.app$/,
  // Allow any onrender.com deployments
  /\.onrender\.com$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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
