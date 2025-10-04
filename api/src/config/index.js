// Load environment variables from root .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

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
      vectorIndex: process.env.S3_VECTOR_INDEX || 'articles-index'
    }
  },
  
  // API Keys
  newsApiKey: process.env.NEWS_API_KEY,
  guardianApiKey: process.env.GUARDIAN_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // OpenAI Configuration
  openai: {
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 768
  },
  
  // Article Ingestion Configuration (Guardian API)
  ingestion: {
    defaultPageSize: parseInt(process.env.INGESTION_PAGE_SIZE || '100', 10), // Guardian API max
    defaultDaysBack: parseInt(process.env.INGESTION_DAYS_BACK || '90', 10), // Fetch articles from last X days
    defaultPages: parseInt(process.env.INGESTION_PAGES || '5', 10), // Number of pages to fetch
    defaultFromPage: parseInt(process.env.INGESTION_FROM_PAGE || '6', 10), // Page to start fetching from
    sections: [
      'technology',
      'business',
      'us-news',
      'world/world',
      'money',
      'science',
      'media',
      'environment'
    ]
  }
};

