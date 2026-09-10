const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for cross-origin local development (e.g., React on Vite :5173)
app.use(cors());
app.use(express.json());

// Load Bangalore pincodes dataset
let pincodeData = [];
try {
  pincodeData = require('../../data/bangalore-pincodes.json');
  console.log(`[API] Successfully loaded ${pincodeData.length} Bangalore postal records.`);
} catch (error) {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'bangalore-pincodes.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    pincodeData = JSON.parse(rawData);
    console.log(`[API] Successfully loaded ${pincodeData.length} records via filesystem fallback.`);
  } catch (fsError) {
    console.error('[API] Failed to load dataset:', error, fsError);
  }
}

// Popular locations for quick UI shortcuts
const POPULAR_LOCATIONS = [
  'Whitefield',
  'Koramangala',
  'Indiranagar',
  'HSR Layout',
  'Electronic City',
  'Bellandur'
];

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'bangalore-pincode-explorer-api'
  });
});

/**
 * Popular Bangalore locations endpoint
 * GET /api/popular
 */
app.get('/api/popular', (req, res) => {
  res.json({
    popular: POPULAR_LOCATIONS
  });
});

/**
 * Search endpoint by pincode or area name
 * GET /api/search?q=...
 */
app.get('/api/search', (req, res) => {
  const rawQ = req.query.q;

  // Validation: q must exist and not be empty
  if (typeof rawQ !== 'string' || rawQ.trim() === '') {
    return res.status(400).json({
      message: 'Search query is required.'
    });
  }

  const q = rawQ.trim().toLowerCase();
  const isPincode = /^\d+$/.test(q);

  // If input contains only digits, it must be exactly 6 digits
  if (isPincode && !/^\d{6}$/.test(q)) {
    return res.status(400).json({
      message: 'A pincode must contain exactly 6 digits.'
    });
  }

  let results = [];
  let searchType = 'area';

  if (isPincode) {
    searchType = 'pincode';
    // Exact match for pincode
    results = pincodeData.filter((item) => item.pincode === q);
  } else {
    // Case-insensitive partial matching for area name
    results = pincodeData.filter((item) =>
      item.area.toLowerCase().includes(q)
    );
  }

  return res.json({
    query: rawQ.trim(),
    type: searchType,
    count: results.length,
    results
  });
});

// Start listening if executed directly (e.g., node src/index.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[API] Bangalore Pincode Explorer server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

