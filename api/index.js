const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Import Bangalore pincodes dataset (automatically bundled by Vercel NFT)
let pincodeData = [];
try {
  pincodeData = require('../data/bangalore-pincodes.json');
  console.log(`[API] Loaded ${pincodeData.length} postal records.`);
} catch (error) {
  console.error('[API] Failed to load dataset:', error);
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

// Start listening if run directly (e.g. node api/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`[API] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
