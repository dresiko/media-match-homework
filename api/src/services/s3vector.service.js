const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const {
  S3VectorsClient,
  PutVectorsCommand,
  QueryVectorsCommand,
  ListVectorsCommand
} = require("@aws-sdk/client-s3vectors");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");

class S3VectorService {
  constructor() {
    this.client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    this.clientVector = new S3VectorsClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    this.bucket = config.aws.s3.vectorBucket;
    this.index = config.aws.s3.vectorIndex;
  }

  /**
   * Store an article with its embedding in S3
   * @param {Object} article - Article object
   * @param {Array<number>} embedding - Vector embedding
   * @returns {Promise<Object>} Stored article metadata
   */
  async storeArticle(article, embedding) {
    try {
      const articleId = uuidv4();
      const key = `${this.index}/${articleId}.json`;

      const articleData = {
        id: articleId,
        ...article,
        embedding: embedding,
        storedAt: new Date().toISOString(),
      };

      const embeddingFloat32 = Float32Array.from(embedding);

      const command = new PutVectorsCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
        vectors: [
          {
            key: articleId,
            data: { float32: Array.from(embeddingFloat32) }, // array of floats
            metadata: articleData, // must be a JSON object
          },
        ],
      });

      await this.clientVector.send(command);
      console.log(`Stored article: ${articleId} - ${article.title}`);

      return {
        id: articleId,
        key: key,
        title: article.title,
        author: article.author,
        source: article.source,
      };
    } catch (error) {
      console.error("Error storing article in S3:", error.message);
      throw error;
    }
  }

  /**
   * Store multiple articles with embeddings
   * @param {Array<Object>} articles - Array of article objects
   * @param {Array<Array<number>>} embeddings - Array of embeddings
   * @returns {Promise<Array<Object>>} Array of stored article metadata
   */
  async storeArticlesBatch(articles, embeddings) {
    if (articles.length !== embeddings.length) {
      throw new Error("Number of articles must match number of embeddings");
    }

    const results = [];

    for (let i = 0; i < articles.length; i++) {
      try {
        const result = await this.storeArticle(articles[i], embeddings[i]);
        results.push(result);
      } catch (error) {
        console.error(`Failed to store article ${i}:`, error.message);
        // Continue with other articles
      }
    }

    return results;
  }

  /**
   * Retrieve an article by ID
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} Article with embedding
   */
  async getArticle(articleId) {
    try {
      const key = `${this.index}/${articleId}.json`;

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const body = await response.Body.transformToString();
      return JSON.parse(body);
    } catch (error) {
      console.error("Error retrieving article from S3:", error.message);
      throw error;
    }
  }

  /**
   * List all articles in the index
   * @returns {Promise<Array<string>>} Array of article IDs
   */
  async listArticles() {
    try {
      const command = new ListVectorsCommand({
        vectorBucketName: this.bucket,
        indexName: this.index
      });

      const response = await this.clientVector.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      return response.Contents.map((item) => {
        const filename = item.Key.split("/").pop();
        return filename.replace(".json", "");
      });
    } catch (error) {
      console.error("Error listing articles from S3:", error.message);
      throw error;
    }
  }

  /**
   * Search for similar articles using vector similarity
   * This is a simple implementation that loads all vectors and computes similarity
   * In production, you would use AWS S3 Vector's native search capabilities
   *
   * @param {Array<number>} queryEmbedding - Query vector
   * @param {number} limit - Number of results to return
   * @param {Object} filters - Optional filters (source, author, etc.)
   * @returns {Promise<Array<Object>>} Array of similar articles with scores
   */
  async searchSimilarArticles(queryEmbedding, limit = 10, filters = {}) {
    try {
      console.log("Searching for similar articles...");

      // Get all article IDs
      const articleIds = await this.listArticles();

      if (articleIds.length === 0) {
        console.warn("No articles found in index");
        return [];
      }

      console.log(`Found ${articleIds.length} articles to search`);

      // Load all articles and compute similarity
      const articlesWithScores = [];

      for (const id of articleIds) {
        try {
          const article = await this.getArticle(id);

          // Apply filters
          if (filters.source && article.source !== filters.source) continue;
          if (filters.author && article.author !== filters.author) continue;

          // Compute cosine similarity
          const similarity = this.cosineSimilarity(
            queryEmbedding,
            article.embedding
          );

          articlesWithScores.push({
            ...article,
            similarityScore: similarity,
          });
        } catch (error) {
          console.error(`Error loading article ${id}:`, error.message);
        }
      }

      // Sort by similarity and return top results
      articlesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      return articlesWithScores.slice(0, limit);
    } catch (error) {
      console.error("Error searching articles:", error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
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
   * Get statistics about the index
   */
  async getIndexStats() {
    try {
      const articleIds = await this.listArticles();

      return {
        totalArticles: articleIds.length,
        index: this.index,
        bucket: this.bucket,
      };
    } catch (error) {
      console.error("Error getting index stats:", error.message);
      throw error;
    }
  }
}

module.exports = new S3VectorService();
