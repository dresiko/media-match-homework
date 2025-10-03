// Config file loads .env from root automatically
const s3VectorService = require('../services/s3vector.service');

async function initializeStorage() {
  console.log('🚀 Initializing S3 Vector Storage...\n');

  try {
    const result = await s3VectorService.initialize();

    console.log('\n📊 Initialization Summary:');
    console.log(`   Bucket: ${result.bucket}`);
    console.log(`   Index: ${result.index}`);
    console.log(`   Bucket Created: ${result.bucketCreated ? 'Yes' : 'No (already existed)'}`);
    console.log(`   Index Created: ${result.indexCreated ? 'Yes' : 'No (already existed)'}`);

    console.log('\n✅ Storage initialization completed successfully!');
    console.log('\nYou can now run the seed script to ingest articles.');
  } catch (error) {
    console.error('\n❌ Error during initialization:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the initialization
initializeStorage();
