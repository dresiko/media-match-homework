module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      vectorBucket: process.env.S3_VECTOR_BUCKET || 'media-matching-vectors',
      vectorIndex: process.env.S3_VECTOR_ARTICLES_INDEX || 'articles-index'
    }
  },
  
  // API Keys
  newsApiKey: process.env.NEWS_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // OpenAI Configuration
  openai: {
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 1536
  },
  
  // Article Ingestion Configuration
  ingestion: {
    defaultPageSize: 100,
    defaultDaysBack: 30, // Fetch articles from last 30 days
    sources: [
      'techcrunch',
      'the-wall-street-journal',
      'the-verge',
      'wired',
      'business-insider',
      'fortune',
      'forbes',
      'bloomberg',
      'cnbc',
      'reuters'
    ],
    domains: [
      'techcrunch.com',
      'wsj.com',
      'theverge.com',
      'wired.com',
      'businessinsider.com',
      'fortune.com',
      'forbes.com',
      'bloomberg.com',
      'cnbc.com',
      'reuters.com'
    ]
  }
};

