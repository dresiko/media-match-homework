const express = require("express");
const router = express.Router();
const queryService = require("../services/query.service");
const s3VectorService = require("../services/s3vector.service");
const reportersContactService = require("../services/reporters-contact.service");
const openaiService = require("../services/openai.service");

// POST /api/reporters/match - Match reporters to story brief
router.post("/match", async (req, res) => {
  try {
    const {
      storyBrief,
      outletTypes = [],
      geography = [],
      targetPublications,
      competitors,
      limit = 15,
    } = req.body;

    // Validate required fields
    if (!storyBrief) {
      return res.status(400).json({
        error: "Story brief is required",
      });
    }

    console.log("🔍 Matching reporters for story...");

    // Step 1: Prepare user input
    const userInput = {
      storyBrief,
      outletTypes,
      geography,
      targetPublications,
      competitors,
    };

    // Step 2: Generate query embedding from user inputs
    const queryEmbedding = await queryService.generateQueryEmbedding(userInput);
    console.log(
      `✓ Generated query embedding (${queryEmbedding.length} dimensions)`
    );

    // Step 3: Search for similar articles (no hard filters - let similarity do the ranking)
    const similarArticles = await s3VectorService.searchSimilar(queryEmbedding);
    console.log(`✓ Found ${similarArticles.length} similar articles`);

    // Step 4: Extract and rank reporters
    const reporters = await extractReportersFromArticles(similarArticles, limit, storyBrief);
    console.log(`✓ Extracted ${reporters.length} unique reporters with AI justifications`);

    // Step 5: Extract key topics for explainability
    const keyTopics = queryService.extractKeyTopics(storyBrief);

    res.json({
      query: {
        storyBrief,
        outletTypes,
        geography,
        keyTopics,
      },
      reporters,
      totalArticlesAnalyzed: similarArticles.length,
      similarArticles,
    });
  } catch (error) {
    console.error("Error matching reporters:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Extract unique reporters from articles and rank them
 */
async function extractReportersFromArticles(articles, limit, storyBrief) {
  const reporterMap = new Map();

  articles.forEach((article) => {
    const articleMetadata = article.metadata;
    const author = articleMetadata.author || "Unknown";
    const source =
      articleMetadata.sourceName || articleMetadata.source?.name || "Unknown";

    // Skip unknown authors
    if (author === "Unknown" || !author) return;
    // Create unique key for reporter
    const key = `${author}|${source}`;
    if (!reporterMap.has(key)) {
      let data = {
        name: author,
        outlet: source,
        relevantArticles: [],
        totalRecentArticles: 0,
        lowestDistance: Infinity,
      };
      const contactInfo = reportersContactService.getReporterContact(author);
      if (contactInfo) {
        console.log("Contact info found for:", contactInfo);
        data = {
          ...data,
          email: contactInfo.email,
          linkedin: contactInfo.linkedin,
          twitter: contactInfo.twitter,
        };
      } else {
        console.log("No contact info found for:", author);
      }
      reporterMap.set(key, data);
    }

    const reporter = reporterMap.get(key);

    // Add article to reporter's portfolio
    reporter.relevantArticles.push({
      title: articleMetadata.title,
      url: articleMetadata.url,
      publishedAt: articleMetadata.publishedAt,
      distance: article.distance,
      description: article.description,
    });

    reporter.totalRecentArticles += 1;
    reporter.lowestDistance = Math.min(
      reporter.lowestDistance,
      article.distance
    );
  });

  // Convert to array and sort by lowest distance
  const sortedReporters = Array.from(reporterMap.values())
    .sort((a, b) => a.lowestDistance - b.lowestDistance)
    .slice(0, limit);

  // Generate AI justifications for each reporter (parallel execution)
  console.log(`🤖 Generating AI justifications for ${sortedReporters.length} reporters...`);
  
  const reportersWithJustifications = await Promise.all(
    sortedReporters.map(async (reporter, index) => {
      const recentArticles = reporter.relevantArticles
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Top 3 most relevant articles

      // Generate justification using LLM
      const justification = await openaiService.generateReporterJustification({
        storyBrief,
        reporter: {
          name: reporter.name,
          outlet: reporter.outlet,
          articleCount: reporter.totalRecentArticles
        },
        recentArticles
      });

      return {
        rank: index + 1,
        name: reporter.name,
        outlet: reporter.outlet,
        matchScore: Math.round((1 - reporter.lowestDistance) * 100),
        justification,
        recentArticles,
        totalRelevantArticles: reporter.totalRecentArticles,
        email: reporter.email || null,
        linkedin: reporter.linkedin || null,
        twitter: reporter.twitter || null
      };
    })
  );

  return reportersWithJustifications;
}

// GET /api/reporters/contact?name=Reporter Name - Get contact info by name
router.get("/contact", (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        error: "Reporter name is required as query parameter",
      });
    }

    const contact = reportersContactService.getReporterContact(name);

    if (!contact) {
      return res.status(404).json({
        error: "Reporter not found",
        sanitizedName: reportersContactService.sanitizeName(name),
      });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error fetching reporter contact:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/contact/:name - Get contact info by name (path param)
router.get("/contact/:name", (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        error: "Reporter name is required",
      });
    }

    const contact = reportersContactService.getReporterContact(name);

    if (!contact) {
      return res.status(404).json({
        error: "Reporter not found",
        sanitizedName: reportersContactService.sanitizeName(name),
      });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error fetching reporter contact:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/search?q=query - Search reporters by name
router.get("/search", (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Search query (q) is required",
      });
    }

    const results = reportersContactService.searchReporters(q);

    res.json({
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error searching reporters:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reporters/all - Get all reporters (for testing)
router.get("/all", (req, res) => {
  try {
    const reporters = reportersContactService.getAllReporters();

    res.json({
      reporters,
      count: reporters.length,
    });
  } catch (error) {
    console.error("Error fetching all reporters:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
