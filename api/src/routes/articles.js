const express = require('express');
const router = express.Router();

// GET /api/articles - Fetch articles
router.get('/', async (req, res) => {
  try {
    // TODO: Implement article fetching from S3
    res.json({
      articles: [],
      message: 'Articles endpoint - Coming soon'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/ingest - Ingest new articles
router.post('/ingest', async (req, res) => {
  try {
    // TODO: Implement article ingestion
    res.json({
      message: 'Article ingestion - Coming soon',
      count: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

