# S3 Vector Storage Initialization

This guide explains how to initialize your S3 Vector storage (bucket and index) for the Media Matching application.

## 🎯 What Gets Created

The initialization process creates:

1. **S3 Vector Bucket** - The bucket that will store your article vectors
2. **Vector Index** - An HNSW (Hierarchical Navigable Small World) index for fast semantic search
   - Dimensions: 1536 (matches OpenAI's text-embedding-3-small)
   - Type: HNSW (optimized for similarity search)

## 🚀 Methods to Initialize

### Method 1: Automatic (During Seeding)

The seed script automatically initializes storage before ingesting articles:

```bash
# Local
cd api
npm run seed

# Docker
make seed
```

### Method 2: Standalone Initialization

Initialize storage separately before seeding:

```bash
# Local
cd api
npm run init

# Docker
make init
```

Expected output:
```
🚀 Initializing S3 Vector Storage...

🔧 Initializing S3 Vector storage...

✓ Vector bucket 'media-matching-articles' already exists
✓ Vector index 'articles-index' already exists
  - Status: ACTIVE
  - Vector dimensions: 1536

✅ S3 Vector storage initialized

📊 Initialization Summary:
   Bucket: media-matching-articles
   Index: articles-index
   Bucket Created: No (already existed)
   Index Created: No (already existed)

✅ Storage initialization completed successfully!
```

### Method 3: Via API Endpoint

Call the initialization endpoint:

```bash
curl -X POST http://localhost:3001/api/articles/init
```

Response:
```json
{
  "message": "Storage initialized successfully",
  "bucketCreated": false,
  "indexCreated": false,
  "bucket": "media-matching-articles",
  "index": "articles-index"
}
```

## 📋 Service Methods

The S3VectorService now includes these methods:

### `createVectorBucketIfNotExists()`

```javascript
const result = await s3VectorService.createVectorBucketIfNotExists();
// Returns: true if bucket was created, false if it already existed
```

**What it does:**
- Checks if the bucket exists using `HeadBucketCommand`
- If not found, creates it with `CreateBucketCommand`
- Handles region-specific bucket configuration
- Returns creation status

### `createVectorIndexIfNotExists()`

```javascript
const result = await s3VectorService.createVectorIndexIfNotExists();
// Returns: true if index was created, false if it already existed
```

**What it does:**
- Checks if the index exists using `DescribeIndexCommand`
- If not found, creates it with `CreateIndexCommand`
- Configures:
  - Vector dimensions: 1536 (from config)
  - Index type: HNSW (best for semantic search)
- Returns creation status

### `initialize()`

```javascript
const result = await s3VectorService.initialize();
/* Returns:
{
  bucketCreated: boolean,
  indexCreated: boolean,
  bucket: string,
  index: string
}
*/
```

**What it does:**
- Calls both creation methods in sequence
- Provides comprehensive initialization summary
- Handles errors gracefully

## 🔧 Configuration

Ensure your `.env` file has:

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_VECTOR_BUCKET=media-matching-articles
S3_VECTOR_INDEX=articles-index
```

## ⚙️ Index Configuration

The HNSW index is configured with:

- **Vector Dimensions**: 1536
  - Matches OpenAI's `text-embedding-3-small` model
  - Can be changed in `api/src/config/index.js`

- **Index Type**: HNSW
  - Hierarchical Navigable Small World algorithm
  - Excellent for approximate nearest neighbor search
  - Balances speed and accuracy

## 🛠️ Troubleshooting

### Bucket Already Exists (Different Region)

If you get an error about bucket already existing:
- S3 bucket names are globally unique
- Use a different bucket name in your `.env`
- Or use the existing bucket if you own it

### Permission Errors

Ensure your AWS credentials have permissions for:
- `s3:CreateBucket`
- `s3:HeadBucket`
- `s3vectors:CreateIndex`
- `s3vectors:DescribeIndex`

### Index Creation Pending

Index creation may take a few moments:
- Status will be `CREATING` initially
- Wait for it to become `ACTIVE`
- The seed script will proceed once created

## 📊 Verifying Initialization

Check if everything is set up correctly:

```bash
# Via API
curl http://localhost:3001/api/articles/stats

# Via CLI
cd api
node -e "
  require('dotenv').config();
  const s3 = require('./src/services/s3vector.service');
  s3.getIndexStats().then(console.log);
"
```

## 🔄 Re-initialization

Running initialization multiple times is safe:
- Existing bucket: No action taken
- Existing index: No action taken
- Only creates resources if they don't exist

## 💡 Best Practices

1. **Initialize First**: Run `npm run init` before `npm run seed`
2. **Check Status**: Verify initialization succeeded before ingesting
3. **Use Same Config**: Keep bucket/index names consistent across environments
4. **Document Settings**: Note your bucket and index names for the team

## 🎓 Understanding HNSW

HNSW (Hierarchical Navigable Small World) is ideal for:
- **Fast Similarity Search**: Quickly finds similar vectors
- **Scalability**: Handles millions of vectors efficiently
- **Accuracy**: High recall rates for nearest neighbors
- **Memory Efficient**: Optimized data structures

Perfect for our media matching use case where we need to quickly find reporters who've written about similar topics.
