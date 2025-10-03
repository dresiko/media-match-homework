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
  DeleteIndexCommand,
  GetIndexCommand,
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
        if (
          error.name === "NotFound" ||
          error.$metadata?.httpStatusCode === 404
        ) {
          // Bucket doesn't exist, create it
          console.log(`Creating vector bucket '${this.bucket}'...`);

          const createCommand = new CreateBucketCommand({
            Bucket: this.bucket,
            CreateBucketConfiguration: {
              LocationConstraint:
                config.aws.region !== "us-east-1"
                  ? config.aws.region
                  : undefined,
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
      const getIndexCommand = new GetIndexCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
      });

      try {
        const response = await this.clientVector.send(getIndexCommand);
        console.log(`✓ Vector index '${this.index}' already exists`);
        console.log(`  - Status: ${response.status}`);
        console.log(`  - Vector dimensions: ${response.vectorDimensions}`);
        return false;
      } catch (error) {
        if (
          error.name === "ResourceNotFoundException" ||
          error.$metadata?.httpStatusCode === 404
        ) {
          // Index doesn't exist, create it
          console.log(`Creating vector index '${this.index}'...`);

          const createCommand = new CreateIndexCommand({
            vectorBucketName: this.bucket,
            indexName: this.index,
            dataType: "float32",
            dimension: config.openai.embeddingDimensions, // 768 for text-embedding-3-small
            distanceMetric: "cosine",
            indexType: "HNSW", // Hierarchical Navigable Small World - best for semantic search
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

  async deleteVectorIndex() {
    try {
      const deleteCommand = new DeleteIndexCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
      });
      await this.clientVector.send(deleteCommand);
      console.log(`✓ Vector index '${this.index}' deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting vector index: ${error.message}`);
      throw error;
    }
  }

  async getVectorIndex() {
    try {
      const getIndexCommand = new GetIndexCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
      });
      const response = await this.clientVector.send(getIndexCommand);
      console.log(`✓ Vector index '${this.index}' retrieved successfully`);
      return response;
    } catch (error) {
      console.error(`Error getting vector index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize S3 Vector storage (create bucket and index if needed)
   * @returns {Promise<Object>} Status of initialization
   */
  async initialize() {
    try {
      console.log("🔧 Initializing S3 Vector storage...\n");

      const bucketCreated = await this.createVectorBucketIfNotExists();
      const indexCreated = await this.createVectorIndexIfNotExists();

      console.log("\n✅ S3 Vector storage initialized");

      return {
        bucketCreated,
        indexCreated,
        bucket: this.bucket,
        index: this.index,
      };
    } catch (error) {
      console.error(
        "❌ Failed to initialize S3 Vector storage:",
        error.message
      );
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
        author: article.author,
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
        indexName: this.index,
        returnMetadata: true,
      });

      const response = await this.clientVector.send(command);
      if (!response.vectors || response.vectors.length === 0) {
        return [];
      }
      return response.vectors;
    } catch (error) {
      console.error("Error listing articles from S3:", error.message);
      throw error;
    }
  }

  /**
   * Search for similar articles using vector similarity
   * No hard filters - pure semantic similarity lets the best matches rise to the top
   *
   * @param {Array<number>} queryEmbedding - Query vector
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array<Object>>} Array of similar articles with scores
   */
  async searchSimilar(queryEmbedding, limit = 10) {
    try {
      console.log("Searching for similar articles...");
      const embeddingFloat32 = Float32Array.from(queryEmbedding);
      console.log("Limit:", limit);
      const command = new QueryVectorsCommand({
        vectorBucketName: this.bucket,
        indexName: this.index,
        queryVector: { float32: Array.from(embeddingFloat32) },
        topK: limit,
        returnMetadata: true,
      });
      const response = await this.clientVector.send(command);
      return response.vectors;
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
