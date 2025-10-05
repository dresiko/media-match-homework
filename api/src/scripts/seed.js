// Config file loads .env from root automatically
const newsApiService = require('../services/newsapi.service');
const openaiService = require('../services/openai.service');
const s3VectorService = require('../services/s3vector.service');
const config = require('../config');

async function seed() {
  console.log('🌱 Starting article ingestion and vectorization...\n');
  console.log(`Parameters:`)
  console.log(`  - fetch from ${config.ingestion.defaultDaysBack} days ago`);
  console.log(`  - size of page: ${config.ingestion.defaultPageSize}`);
  console.log(`  - number of pages: ${config.ingestion.defaultPages}`);
  console.log(`  - starting from page: ${config.ingestion.defaultFromPage}`);

  try {
    // Step 0: Initialize S3 Vector storage (create bucket and index if needed)
    await s3VectorService.initialize();

    // Step 1: Fetch articles from Guardian API
    console.log('\n📰 Step 1: Fetching articles from The Guardian API...');
    const articles = await newsApiService.fetchArticles({
      pageSize: config.ingestion.defaultPageSize,
      pages: config.ingestion.defaultPages,
      fromPage: config.ingestion.defaultFromPage
    });

    if (articles.length === 0) {
      console.log('No articles found. Exiting.');
      return;
    }

    console.log(`✓ Fetched ${articles.length} articles\n`);

    // Step 2: Generate embeddings for articles
    console.log('🤖 Step 2: Generating embeddings with OpenAI...');
    const embeddings = await openaiService.generateArticleEmbeddingsBatch(articles, 10);
    console.log(`✓ Generated ${embeddings.length} embeddings\n`);

    // Step 3: Store articles with embeddings in S3
    console.log('☁️  Step 3: Storing articles in AWS S3 Vectors...');
    const results = await s3VectorService.storeArticlesBatch(articles, embeddings);
    console.log(`✓ Stored ${results.length} articles\n`);

    // Step 4: Display summary
    console.log('📊 Summary:');
    console.log(`   Total articles processed: ${articles.length}`);
    console.log(`   Successfully stored: ${results.length}`);
    console.log(`   Failed: ${articles.length - results.length}`);
    
    // Show sample of stored articles
    console.log('\n📝 Sample of stored articles:');
    results.slice(0, 5).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title}`);
      console.log(`      Author: ${result.author} | Source: ${result.source}`);
      console.log(`      ID: ${result.id}\n`);
    });

    // Get index stats
    const stats = await s3VectorService.getIndexStats();
    console.log('📈 Index Statistics:');
    console.log(`   Bucket: ${stats.bucket}`);
    console.log(`   Index: ${stats.index}`);
    console.log(`   Total articles in index: ${stats.totalArticles}`);

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
console.log('🌱 Starting article ingestion and vectorization...\n');
// Run the seed function
seed();

