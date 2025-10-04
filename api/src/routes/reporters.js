const express = require('express');
const router = express.Router();
const queryService = require('../services/query.service');
const s3VectorService = require('../services/s3vector.service');
const reportersContactService = require('../services/reporters-contact.service');

// POST /api/reporters/match - Match reporters to story brief
router.post('/match', async (req, res) => {
  try {
    const {
      storyBrief,
      outletTypes = [],
      geography = [],
      targetPublications,
      competitors,
      limit = 15
    } = req.body;

    // Validate required fields
    if (!storyBrief) {
      return res.status(400).json({ 
        error: 'Story brief is required' 
      });
    }

    console.log('🔍 Matching reporters for story...');

    // Step 1: Prepare user input
    const userInput = {
      storyBrief,
      outletTypes,
      geography,
      targetPublications,
      competitors
    };

    // Step 2: Generate query embedding from user inputs
    const queryEmbedding = await queryService.generateQueryEmbedding(userInput);
    console.log(`✓ Generated query embedding (${queryEmbedding.length} dimensions)`);

    // Step 3: Search for similar articles (no hard filters - let similarity do the ranking)
    const similarArticles = await s3VectorService.searchSimilar(
      queryEmbedding
    );
    console.log(`✓ Found ${similarArticles.length} similar articles`);

    // Step 4: Extract and rank reporters
    const reporters = extractReportersFromArticles(similarArticles, limit);
    console.log(`✓ Extracted ${reporters.length} unique reporters`);

    // Step 5: Extract key topics for explainability
    const keyTopics = queryService.extractKeyTopics(storyBrief);

    res.json({
      query: {
        storyBrief,
        outletTypes,
        geography,
        keyTopics
      },
      reporters,
      totalArticlesAnalyzed: similarArticles.length,
      similarArticles
    });
  } catch (error) {
    console.error('Error matching reporters:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Extract unique reporters from articles and rank them
 */
function extractReportersFromArticles(articles, limit) {
  const reporterMap = new Map();

  articles.forEach(article => {
    const articleMetadata = article.metadata;
    const author = articleMetadata.author || 'Unknown';
    const source = articleMetadata.sourceName || articleMetadata.source?.name || 'Unknown';
    
    // Skip unknown authors
    if (author === 'Unknown' || !author) return;
    // Create unique key for reporter
    const key = `${author}|${source}`;
    if (!reporterMap.has(key)) {
      reporterMap.set(key, {
        name: author,
        outlet: source,
        relevantArticles: [],
        articleCount: 0,
        lowestDistance: Infinity
      });
    }

    const reporter = reporterMap.get(key);
    
    // Add article to reporter's portfolio
    reporter.relevantArticles.push({
      title: articleMetadata.title,
      url: articleMetadata.url,
      publishedAt: articleMetadata.publishedAt,
      distance: article.distance,
      description: article.description
    });

    reporter.articleCount += 1;
    reporter.lowestDistance = Math.min(reporter.lowestDistance, article.distance);
  });

  // Convert to array and sort by lowest distance
  const reporters = Array.from(reporterMap.values())
    .sort((a, b) => a.lowestDistance - b.lowestDistance)
    .slice(0, limit)
    .map((reporter, index) => ({
      rank: index + 1,
      name: reporter.name,
      outlet: reporter.outlet,
      matchScore: Math.round((1 - reporter.lowestDistance) * 100),
      justification: generateJustification(reporter),
      recentArticles: reporter.relevantArticles
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3), // Top 3 most relevant articles
      totalRelevantArticles: reporter.articleCount,
      email: null, // TODO: Add contact enrichment
      linkedin: null,
      twitter: null
    }));

  return reporters
}

/**
 * Generate human-readable justification for why this reporter is a good match
 */
function generateJustification(reporter) {
  const points = [];

  // Coverage breadth
  if (reporter.articleCount > 1) {
    points.push(`Wrote ${reporter.articleCount} highly relevant articles`);
  } else {
    points.push(`Wrote on highly relevant topic`);
  }

  // Recent coverage
  const recentArticle = reporter.relevantArticles[0];
  if (recentArticle) {
    const publishDate = new Date(recentArticle.publishedAt);
    const daysAgo = Math.floor((Date.now() - publishDate) / (1000 * 60 * 60 * 24));
    
    if (daysAgo < 7) {
      points.push(`Published relevant coverage within the last week`);
    } else if (daysAgo < 30) {
      points.push(`Recently covered similar topics (${daysAgo} days ago)`);
    }
  }

  // Publication quality
  points.push(`Covers for ${reporter.outlet}`);

  return points.join('; ');
}

// GET /api/reporters/contact?name=Reporter Name - Get contact info by name
router.get('/contact', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ 
        error: 'Reporter name is required as query parameter' 
      });
    }

    const contact = reportersContactService.getReporterContact(name);
    
    if (!contact) {
      return res.status(404).json({ 
        error: 'Reporter not found',
        sanitizedName: reportersContactService.sanitizeName(name)
      });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching reporter contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/contact/:name - Get contact info by name (path param)
router.get('/contact/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ 
        error: 'Reporter name is required' 
      });
    }

    const contact = reportersContactService.getReporterContact(name);
    
    if (!contact) {
      return res.status(404).json({ 
        error: 'Reporter not found',
        sanitizedName: reportersContactService.sanitizeName(name)
      });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching reporter contact:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/search?q=query - Search reporters by name
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Search query (q) is required' 
      });
    }

    const results = reportersContactService.searchReporters(q);
    
    res.json({
      query: q,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching reporters:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/all - Get all reporters (for testing)
router.get('/all', (req, res) => {
  try {
    const reporters = reportersContactService.getAllReporters();
    
    res.json({
      reporters,
      count: reporters.length
    });
  } catch (error) {
    console.error('Error fetching all reporters:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

