const express = require('express');
const router = express.Router();
const newsApiService = require('../services/newsapi.service');
const openaiService = require('../services/openai.service');
const s3VectorService = require('../services/s3vector.service');

// POST /api/articles/init - Initialize S3 Vector storage
router.post('/init', async (req, res) => {
  try {
    const result = await s3VectorService.initialize();
    res.json({
      message: 'Storage initialized successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/index/truncate - Truncate S3 Vector storage
router.post('/index/truncate', async (req, res) => {
  try {
    const results = [];
    const deleteResult = await s3VectorService.deleteVectorIndex();
    results.push(deleteResult);
    const createResult = await s3VectorService.createVectorIndexIfNotExists();
    results.push(createResult);
    res.json({
      message: 'Storage truncated successfully',
      deleteResult,
      createResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/index', async (req, res) => {
  try {
    const index = await s3VectorService.getVectorIndex();
    res.json(index);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles - List articles from S3
router.get('/', async (req, res) => {
  try {
    const articleIds = await s3VectorService.listArticles();
    res.json({
      count: articleIds.length,
      articleIds: articleIds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/stats - Get index statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await s3VectorService.getIndexStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/:id - Get specific article
router.get('/:id', async (req, res) => {
  try {
    const article = await s3VectorService.getArticle(req.params.id);
    res.json(article);
  } catch (error) {
    res.status(404).json({ error: 'Article not found' });
  }
});

// POST /api/articles/ingest - Ingest new articles
router.post('/ingest', async (req, res) => {
  try {
    const { pageSize = 50, query } = req.body;
    
    // Fetch articles
    const articles = await newsApiService.fetchArticles({ pageSize, query });
    
    if (articles.length === 0) {
      return res.json({
        message: 'No articles found',
        count: 0
      });
    }

    // Generate embeddings
    const embeddings = await openaiService.generateArticleEmbeddingsBatch(articles, 10);
    
    // Store in S3
    const results = await s3VectorService.storeArticlesBatch(articles, embeddings);
    
    res.json({
      message: 'Articles ingested successfully',
      count: results.length,
      articles: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

