# Article Ingestion & Vectorization

This document explains how the article ingestion and vectorization process works.

## Overview

The system fetches articles from NewsAPI, generates embeddings using OpenAI, and stores them in AWS S3 Vectors for semantic search.

## Architecture

```
NewsAPI → Fetch Articles → Generate Embeddings (OpenAI) → Store in S3 Vectors
```

### Components

1. **NewsAPI Service** (`newsapi.service.js`)
   - Fetches recent articles from news sources
   - Normalizes article data (author names, source names)
   - Falls back to mock data if API key not configured

2. **Embeddings Service** (`embeddings.service.js`)
   - Generates vector embeddings using OpenAI's `text-embedding-3-small` model
   - Prepares article text by combining title, description, and content
   - Supports batch processing with rate limiting

3. **S3 Vector Service** (`s3vector.service.js`)
   - Stores articles with embeddings in AWS S3
   - Implements semantic search using cosine similarity
   - Provides index management and statistics

## Configuration

### OpenAI Embeddings

- **Model**: `text-embedding-3-small`
- **Dimensions**: 1536
- **Cost-effective** and suitable for semantic search

### The Guardian API Sections

Default sections include:
- Technology
- Business
- US News
- World News
- Money (Finance)
- Science
- Media
- Environment

## Usage

### Seed Command

The easiest way to ingest articles:

```bash
# Using Docker
make seed

# Or directly
npm run seed
```

This will:
1. Fetch up to 50 articles from NewsAPI
2. Generate embeddings for each article
3. Store them in S3 with their vectors

### API Endpoint

You can also trigger ingestion via the API:

```bash
POST /api/articles/ingest
Content-Type: application/json

{
  "pageSize": 50,
  "query": "technology OR startup"
}
```

### Check Statistics

```bash
GET /api/articles/stats
```

Returns:
```json
{
  "totalArticles": 50,
  "index": "articles",
  "bucket": "media-matching-vectors"
}
```

## Article Data Structure

Each stored article contains:

```json
{
  "id": "uuid",
  "title": "Article Title",
  "description": "Article description",
  "content": "Full article content",
  "url": "https://...",
  "author": "Reporter Name",
  "source": "Publication Name",
  "publishedAt": "2024-01-01T00:00:00Z",
  "urlToImage": "https://...",
  "embedding": [0.123, -0.456, ...],
  "storedAt": "2024-01-01T00:00:00Z"
}
```

## Embedding Strategy

The system creates embeddings by combining:
1. **Title** (weighted 2x for importance)
2. **Description**
3. **Content** (truncated to 1000 chars)
4. **Source** (for context)

This ensures the embedding captures the article's main topics and relevance.

## Search Process

When searching for similar articles:

1. Convert the query (story brief) to an embedding
2. Load all articles from S3
3. Calculate cosine similarity between query and each article
4. Rank by similarity score
5. Apply filters (source, author, etc.)
6. Return top N results

## Performance Considerations

- **Batch Processing**: Articles are processed in batches of 10 to respect rate limits
- **Rate Limiting**: 100ms delay between batches
- **Storage**: Each article is stored as a separate JSON file in S3
- **Search**: Currently loads all vectors into memory (suitable for MVP, would use native S3 Vector search in production)

## Mock Data

If API keys are not configured, the system falls back to mock data for testing:

- 5 sample articles covering the test briefs
- Random embeddings of the correct dimensions
- Allows development without API dependencies

## Cost Optimization

- **OpenAI**: Using `text-embedding-3-small` for cost efficiency
- **S3**: Standard storage class for vector data
- **NewsAPI**: Free tier provides 100 requests/day

## Future Enhancements

For production deployment:

1. Use AWS S3 Vector's native search API (when available)
2. Implement incremental updates (don't re-ingest existing articles)
3. Add deduplication logic
4. Support multiple embedding models
5. Add article freshness scoring
6. Implement article expiration/cleanup

