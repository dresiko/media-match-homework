# API Documentation

Complete API reference for the Media Matching system.

## Base URL

```
http://localhost:3001
```

## Table of Contents

- [Health Check](#health-check)
- [Reporter Matching](#reporter-matching)
- [Article Management](#article-management)

---

## Health Check

### Check API Health

Get the health status of the API.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

## Reporter Matching

### Match Reporters to Story

Find the top reporters for your story using semantic search.

**Endpoint:** `POST /api/reporters/match`

**Request Body:**
```json
{
  "storyBrief": "Battery startup using domestically-sourced silicon for EVs",
  "outletTypes": ["national-business-tech", "trade-specialist"],
  "geography": ["US"],
  "targetPublications": "TechCrunch, WSJ",
  "competitors": "QuantumScape",
  "limit": 15
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `storyBrief` | string | ✅ Yes | Your story or announcement description |
| `outletTypes` | array | No | Outlet type preferences (see options below) |
| `geography` | array | No | Geographic preferences (see options below) |
| `targetPublications` | string | No | Specific publications you want to target |
| `competitors` | string | No | Related companies or announcements for context |
| `limit` | number | No | Number of reporters to return (default: 15) |

**Outlet Type Options:**
- `"national-business-tech"` - National business & tech outlets
- `"trade-specialist"` - Industry trade & specialist publications
- `"regional"` - Regional & local outlets
- `"newsletters"` - Newsletters & independent publications
- `"podcasts"` - Podcasts & audio media

**Geography Options:**
- `"US"` - United States
- `"US-West"` - US West Coast
- `"US-East"` - US East Coast
- `"Europe"` - Europe
- `"UK"` - United Kingdom
- `"Global"` - Global coverage

**Response:**
```json
{
  "query": {
    "storyBrief": "Battery startup using silicon for EVs...",
    "outletTypes": ["national-business-tech"],
    "geography": ["US"],
    "keyTopics": ["battery", "silicon", "EV"]
  },
  "reporters": [
    {
      "rank": 1,
      "name": "Dan Milmo",
      "outlet": "The Guardian",
      "matchScore": 87,
      "justification": null,
      "recentArticles": [
        {
          "title": "Electric vehicle battery breakthrough...",
          "url": "https://...",
          "publishedAt": "2024-01-10T08:00:00Z",
          "distance": 0.13
        }
      ],
      "totalRelevantArticles": 8,
      "email": "dan.milmo@theguardian.com",
      "linkedin": "https://linkedin.com/in/...",
      "twitter": "@danmilmo"
    }
  ],
  "totalArticlesAnalyzed": 52
}
```

**Response Time:** ~1 second (justifications load separately)

**Example:**
```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Battery startup using silicon for EVs",
    "outletTypes": ["national-business-tech"],
    "geography": ["US"],
    "limit": 15
  }'
```

---

### Generate AI Justifications

Generate AI-powered justifications for matched reporters (called automatically by frontend).

**Endpoint:** `POST /api/reporters/justifications`

**Request Body:**
```json
{
  "storyBrief": "Battery startup using silicon for EVs...",
  "reporters": [
    {
      "name": "Dan Milmo",
      "outlet": "The Guardian",
      "totalRelevantArticles": 8,
      "recentArticles": [
        {
          "title": "Electric vehicle battery breakthrough...",
          "url": "https://...",
          "publishedAt": "2024-01-10T08:00:00Z",
          "distance": 0.13
        }
      ]
    }
  ]
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `storyBrief` | string | ✅ Yes | Original story description |
| `reporters` | array | ✅ Yes | Array of reporter objects from match endpoint |

**Response:**
```json
{
  "justifications": [
    {
      "name": "Dan Milmo",
      "outlet": "The Guardian",
      "justification": "Dan Milmo's coverage at The Guardian focuses on technology and its implications for the economy, making him well-suited to report on a battery startup's innovation in domestically-sourced metallurgical silicon..."
    }
  ],
  "count": 15
}
```

**Response Time:** ~2-3 seconds (parallel generation)

**Example:**
```bash
curl -X POST http://localhost:3001/api/reporters/justifications \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Battery startup using silicon for EVs",
    "reporters": [...]
  }'
```

---

### Get Reporter Contact Info

Get contact information for a specific reporter.

**Endpoint:** `GET /api/reporters/contact?name=Reporter+Name`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ Yes | Reporter's full name |

**Response:**
```json
{
  "name": "Dan Milmo",
  "email": "dan.milmo@theguardian.com",
  "linkedin": "https://linkedin.com/in/danmilmo",
  "twitter": "@danmilmo",
  "outlet": "The Guardian"
}
```

**Error Response (404):**
```json
{
  "error": "Reporter not found",
  "sanitizedName": "dan milmo"
}
```

**Example:**
```bash
curl "http://localhost:3001/api/reporters/contact?name=Dan+Milmo"
```

---

### Search Reporters

Search for reporters by name.

**Endpoint:** `GET /api/reporters/search?q=search+term`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ Yes | Search query |

**Response:**
```json
{
  "query": "dan",
  "results": [
    {
      "name": "Dan Milmo",
      "email": "dan.milmo@theguardian.com",
      "linkedin": "https://linkedin.com/in/danmilmo",
      "twitter": "@danmilmo",
      "outlet": "The Guardian"
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl "http://localhost:3001/api/reporters/search?q=dan"
```

---

### List All Reporters

Get all reporters with contact information.

**Endpoint:** `GET /api/reporters/all`

**Response:**
```json
{
  "reporters": [
    {
      "name": "Dan Milmo",
      "email": "dan.milmo@theguardian.com",
      "linkedin": "https://linkedin.com/in/danmilmo",
      "twitter": "@danmilmo",
      "outlet": "The Guardian"
    }
  ],
  "count": 38
}
```

**Example:**
```bash
curl http://localhost:3001/api/reporters/all
```

---

## Article Management

### Initialize Vector Storage

Create S3 bucket and vector index for article storage.

**Endpoint:** `POST /api/articles/init`

**Response:**
```json
{
  "message": "Vector storage initialized successfully",
  "bucket": "media-matching-articles",
  "index": "articles-index",
  "bucketCreated": false,
  "indexCreated": false
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/articles/init
```

---

### List All Articles

Get all stored articles with metadata.

**Endpoint:** `GET /api/articles`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Maximum articles to return (default: 100) |

**Response:**
```json
{
  "articles": [
    {
      "key": "uuid-123",
      "metadata": {
        "id": "uuid-123",
        "title": "Electric vehicle battery breakthrough",
        "author": "Dan Milmo",
        "sourceName": "The Guardian",
        "publishedAt": "2024-01-10T08:00:00Z",
        "url": "https://...",
        "storedAt": "2024-01-15T10:00:00Z"
      }
    }
  ],
  "count": 52,
  "bucket": "media-matching-articles",
  "index": "articles-index"
}
```

**Example:**
```bash
curl http://localhost:3001/api/articles?limit=50
```

---

### Get Article Statistics

Get statistics about the article index.

**Endpoint:** `GET /api/articles/stats`

**Response:**
```json
{
  "totalArticles": 52,
  "index": "articles-index",
  "bucket": "media-matching-articles",
  "dimensions": 1536,
  "distanceMetric": "cosine"
}
```

**Example:**
```bash
curl http://localhost:3001/api/articles/stats
```

---

### Get Specific Article

Get a single article by ID.

**Endpoint:** `GET /api/articles/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Article UUID |

**Response:**
```json
{
  "id": "uuid-123",
  "title": "Electric vehicle battery breakthrough",
  "author": "Dan Milmo",
  "sourceName": "The Guardian",
  "publishedAt": "2024-01-10T08:00:00Z",
  "url": "https://...",
  "content": "Article content...",
  "storedAt": "2024-01-15T10:00:00Z"
}
```

**Example:**
```bash
curl http://localhost:3001/api/articles/uuid-123
```

---

### Ingest Articles

Fetch and store articles from The Guardian API.

**Endpoint:** `POST /api/articles/ingest`

**Request Body:**
```json
{
  "pageSize": 50,
  "query": "technology"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageSize` | number | No | Number of articles to fetch (default: 100, max: 200) |
| `query` | string | No | Search query for articles |

**Response:**
```json
{
  "message": "Successfully ingested 50 articles",
  "articlesIngested": 50,
  "time": "3.2s"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 50}'
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Story brief is required"
}
```

### 404 Not Found
```json
{
  "error": "Reporter not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate embeddings"
}
```

---

## Rate Limits

Currently, there are no rate limits enforced. For production deployment, consider:
- Rate limiting per IP address
- API key authentication
- Request throttling for expensive operations (embeddings, justifications)

---

## Performance Notes

### Response Times
- **Reporter matching**: ~1 second (without justifications)
- **Justifications**: ~2-3 seconds (parallel generation)
- **Article listing**: < 100ms
- **Contact lookup**: < 50ms

### Cost per Query
- Embedding generation: $0.00002
- AI justifications (15 reporters): $0.00015
- S3 Vector search: < $0.001
- **Total per search**: < $0.001

---

## Testing Examples

### Complete Workflow

1. **Initialize storage** (first time only):
```bash
curl -X POST http://localhost:3001/api/articles/init
```

2. **Ingest articles**:
```bash
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 50}'
```

3. **Check statistics**:
```bash
curl http://localhost:3001/api/articles/stats
```

4. **Search for reporters**:
```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Battery startup using silicon for EVs",
    "outletTypes": ["national-business-tech"],
    "geography": ["US"]
  }'
```

5. **Get justifications** (optional, frontend does this automatically):
```bash
curl -X POST http://localhost:3001/api/reporters/justifications \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Battery startup using silicon for EVs",
    "reporters": [...]
  }'
```

---

## Environment Variables

Required environment variables for the API:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_VECTOR_BUCKET=media-matching-articles
S3_VECTOR_ARTICLES_INDEX=articles-index

# OpenAI Configuration
OPENAI_API_KEY=sk-your-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536

# Guardian API (Optional)
GUARDIAN_API_KEY=your_guardian_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

## Related Documentation

- [README.md](./README.md) - Project overview and quick start
- [REPORTER_MATCHING_FLOW.md](./REPORTER_MATCHING_FLOW.md) - Detailed flow diagram
- [REPORTER_MATCHING.md](./REPORTER_MATCHING.md) - Matching algorithm explanation

