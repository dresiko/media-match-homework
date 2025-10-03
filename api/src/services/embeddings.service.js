const OpenAI = require('openai');
const config = require('../config');

class EmbeddingsService {
  constructor() {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey
      });
    } else {
      console.warn('OPENAI_API_KEY not configured');
    }
    this.model = config.openai.embeddingModel;
    this.dimensions = config.openai.embeddingDimensions;
  }

  /**
   * Generate embeddings for text using OpenAI
   * @param {string|Array<string>} text - Text or array of texts to embed
   * @returns {Promise<Array>} Array of embeddings
   */
  async generateEmbeddings(text) {
    if (!this.openai) {
      console.warn('OpenAI not configured, using mock embeddings');
      return this.getMockEmbedding(text);
    }

    try {
      const input = Array.isArray(text) ? text : [text];
      
      console.log(`Generating embeddings for ${input.length} text(s)...`);
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: input,
        dimensions: this.dimensions
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error.message);
      throw error;
    }
  }

  /**
   * Generate embedding for a single article
   * @param {Object} article - Article object
   * @returns {Promise<Array>} Embedding vector
   */
  async generateArticleEmbedding(article) {
    // Combine article fields for embedding
    const text = this.prepareArticleText(article);
    const embeddings = await this.generateEmbeddings(text);
    return embeddings[0];
  }

  /**
   * Prepare article text for embedding
   * Combines title, description, and content with appropriate weighting
   */
  prepareArticleText(article) {
    const parts = [];
    
    if (article.author) {
      parts.push("Author: " + article.author);
    }

    // Title is most important (repeat for emphasis)
    if (article.title) {
      parts.push("Title: " + article.title);
      parts.push(article.title);
    }
    
    // Description
    if (article.description) {
      parts.push("Description: " + article.description);
    }

    if (article.source) {
      parts.push("SourceId: " + article.source.id);
      parts.push("SourceName: " + article.source.name);
    }
    
    // Content (truncate if too long)
    if (article.content) {
      const maxContentLength = 20000;
      const content = article.content.length > maxContentLength
        ? article.content.substring(0, maxContentLength) + '...'
        : article.content;
      parts.push("Content: " + content);
    }

    if(article.contributorBio) {
      parts.push("ContributorBio: " + article.contributorBio);
    }

    if(article.contributorTwitter) {
      parts.push("ContributorTwitter: " + article.contributorTwitter);
    }

    if(article.publishedAt) {
      parts.push("PublishedAt: " + article.publishedAt);
    }

    if(article.url) {
      parts.push("Url: " + article.url);
    }

    if(article.urlToImage) {
      parts.push("UrlToImage: " + article.urlToImage);
    }
    
    return parts.join(' ');
  }

  /**
   * Batch generate embeddings for multiple articles
   * @param {Array<Object>} articles - Array of article objects
   * @param {number} batchSize - Number of articles to process at once
   * @returns {Promise<Array>} Array of embeddings
   */
  async generateArticleEmbeddingsBatch(articles, batchSize = 10) {
    const embeddings = [];
    
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      const texts = batch.map(article => this.prepareArticleText(article));
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)}...`);
      
      const batchEmbeddings = await this.generateEmbeddings(texts);
      embeddings.push(...batchEmbeddings);
      
      // Small delay to respect rate limits
      if (i + batchSize < articles.length) {
        await this.sleep(100);
      }
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mock embedding for testing
   */
  getMockEmbedding(text) {
    const input = Array.isArray(text) ? text : [text];
    return input.map(() => {
      // Generate a random vector of the correct dimensions
      return Array.from({ length: this.dimensions }, () => Math.random() - 0.5);
    });
  }
}

module.exports = new EmbeddingsService();

