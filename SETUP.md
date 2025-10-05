# Quick Setup Guide

## Prerequisites

1. **AWS S3 Vector Bucket** - Create a bucket with vector search enabled
2. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
3. **NewsAPI Key** (optional) - Get from https://newsapi.org/

## Environment Setup

1. Copy the template environment file:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` with your credentials:
   ```env
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_actual_key
   AWS_SECRET_ACCESS_KEY=your_actual_secret
   S3_VECTOR_BUCKET=your-bucket-name
   S3_VECTOR_ARTICLES_INDEX=articles-index
   
   # OpenAI
   OPENAI_API_KEY=sk-your-actual-key
   
   # NewsAPI (optional)
   GUARDIAN_API_KEY=your_newsapi_key
   ```

## Running the Application

### Option 1: Using Make (Recommended)

```bash
# Start the application (uses yarn via Docker)
make dev

# Run in another terminal to seed articles
make seed

# View logs
make logs

# Stop everything
make down
```

### Option 2: Using Docker Compose

```bash
# Start services
docker-compose up --build

# Run seed script
docker-compose exec api npm run seed

# Stop services
docker-compose down
```

## Testing the System

### 1. Check API Health

```bash
curl http://localhost:3001/health
```

### 2. Initialize Storage (First Time Only)

Create the S3 bucket and vector index:

```bash
# Using Make
make init

# Or directly
cd api
npm run init

# Or via API
curl -X POST http://localhost:3001/api/articles/init
```

### 3. Seed Articles

```bash
# Using Make
make seed

# Or via API
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 50}'
```

### 4. Check Statistics

```bash
curl http://localhost:3001/api/articles/stats
```

Expected response:
```json
{
  "totalArticles": 50,
  "index": "articles",
  "bucket": "your-bucket-name"
}
```

### 5. List Articles

```bash
curl http://localhost:3001/api/articles
```

### 6. Get Specific Article

```bash
curl http://localhost:3001/api/articles/{article-id}
```

## Troubleshooting

### AWS Credentials Error

If you see AWS credential errors:
- Verify your AWS credentials in `.env`
- Ensure the bucket exists and has the correct permissions
- Check that the region is correct

### OpenAI API Error

If embeddings fail:
- Verify your OpenAI API key is valid
- Check you have sufficient credits
- The system will fall back to mock embeddings if key is missing

### NewsAPI Error

If article fetching fails:
- The system will automatically use mock articles
- Verify your NewsAPI key if you want real articles
- Free tier has limits (100 requests/day)

## Next Steps

After seeding articles, you can:
1. Test the chat interface at http://localhost:3000
2. Build the reporter matching functionality
3. Implement contact enrichment
4. Add CSV export features

## File Structure

```
api/
├── src/
│   ├── config/           # Configuration
│   ├── services/         # Business logic
│   │   ├── newsapi.service.js
│   │   ├── embeddings.service.js
│   │   └── s3vector.service.js
│   ├── routes/           # API routes
│   └── scripts/
│       └── seed.js       # Ingestion script
```

## Useful Commands

```bash
# View API logs
make logs-api

# View frontend logs
make logs-frontend

# Open shell in API container
make shell-api

# Clean up everything (including volumes)
make clean
```

