const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");
const {
  S3VectorsClient,
  PutVectorsCommand,
  QueryVectorsCommand,
  ListVectorsCommand,
  CreateIndexCommand,
  DescribeIndexCommand,
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
   * Create Vector Bucket if it doesn't exist
   * @returns {Promise<boolean>} True if bucket was created, false if it already existed
   */
  async createVectorBucketIfNotExists() {
    try {
      // Check if bucket exists
      const headCommand = new HeadBucketCommand({
        Bucket: this.bucket,
      });

      try {
        await this.client.send(headCommand);
        console.log(`✓ Vector bucket '${this.bucket}' already exists`);
        return false;
      } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          // Bucket doesn't exist, create it
          console.log(`Creating vector bucket '${this.bucket}'...`);
          
          const createCommand = new CreateBucketCommand({
            Bucket: this.bucket,
            CreateBucketConfiguration: {
              LocationConstraint: config.aws.region !== 'us-east-1' ? config.aws.region : undefined,
            },
          });

          await this.client.send(createCommand);
          console.log(`✓ Vector bucket '${this.bucket}' created successfully`);
          return true;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error creating vector bucket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Vector Index if it doesn't exist
   * @returns {Promise<boolean>} True if index was created, false if it already existed
   */
  async createVectorIndexIfNotExists() {
    try {
      // Check if index exists
      const describeCommand = new DescribeIndexCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
      });

      try {
        const response = await this.clientVector.send(describeCommand);
        console.log(`✓ Vector index '${this.index}' already exists`);
        console.log(`  - Status: ${response.status}`);
        console.log(`  - Vector dimensions: ${response.vectorDimensions}`);
        return false;
      } catch (error) {
        if (error.name === 'ResourceNotFoundException' || error.$metadata?.httpStatusCode === 404) {
          // Index doesn't exist, create it
          console.log(`Creating vector index '${this.index}'...`);
          
          const createCommand = new CreateIndexCommand({
            vectorBucketName: this.bucket,
            indexName: this.index,
            vectorDimensions: config.openai.embeddingDimensions, // 1536 for text-embedding-3-small
            indexType: 'HNSW', // Hierarchical Navigable Small World - best for semantic search
          });

          await this.clientVector.send(createCommand);
          console.log(`✓ Vector index '${this.index}' created successfully`);
          console.log(`  - Dimensions: ${config.openai.embeddingDimensions}`);
          console.log(`  - Type: HNSW`);
          return true;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error creating vector index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize S3 Vector storage (create bucket and index if needed)
   * @returns {Promise<Object>} Status of initialization
   */
  async initialize() {
    try {
      console.log('🔧 Initializing S3 Vector storage...\n');
      
      const bucketCreated = await this.createVectorBucketIfNotExists();
      const indexCreated = await this.createVectorIndexIfNotExists();

      console.log('\n✅ S3 Vector storage initialized');
      
      return {
        bucketCreated,
        indexCreated,
        bucket: this.bucket,
        index: this.index,
      };
    } catch (error) {
      console.error('❌ Failed to initialize S3 Vector storage:', error.message);
      throw error;
    }
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
        sourceId: article.source.id,
        sourceName: article.source.name,
        title: article.title,
        description: article.description,
        content: article.content,
        publishedAt: article.publishedAt,
        url: article.url,
        urlToImage: article.urlToImage,
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

      const result = await this.clientVector.send(command);
      console.log(`Stored article: ${articleId} - ${article.title}`);

      return {
        ...result,
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
