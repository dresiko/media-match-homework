const express = require('express');
const router = express.Router();
const queryService = require('../services/query.service');
const s3VectorService = require('../services/s3vector.service');

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
        articleCount: 0
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
  });

  // // Convert to array and sort by average similarity
  // const reporters = Array.from(reporterMap.values())
  //   .sort((a, b) => b.averageSimilarity - a.averageSimilarity)
  //   .slice(0, limit)
  //   .map((reporter, index) => ({
  //     rank: index + 1,
  //     name: reporter.name,
  //     outlet: reporter.outlet,
  //     matchScore: Math.round(reporter.averageSimilarity * 100),
  //     justification: generateJustification(reporter),
  //     recentArticles: reporter.relevantArticles
  //       .sort((a, b) => b.similarity - a.similarity)
  //       .slice(0, 3), // Top 3 most relevant articles
  //     totalRelevantArticles: reporter.articleCount,
  //     email: null, // TODO: Add contact enrichment
  //     linkedin: null,
  //     twitter: null
  //   }));

  return Array.from(reporterMap.values());
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

module.exports = router;

