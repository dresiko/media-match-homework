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
  "pageSize": 100,
  "pages": 1,
  "fromPage": 1,
  "daysBack": 90,
  "query": "technology"
}
```

**Parameters:**
- `pageSize` (number, optional): Number of articles per page (default: 100, max: 200)
- `pages` (number, optional): Number of pages to fetch (default: 1)
- `fromPage` (number, optional): Starting page number (default: 1)
- `daysBack` (number, optional): How many days back to fetch articles (default: 90)
- `query` (string, optional): Search query to filter articles (default: general tech/business articles)

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
# Basic ingest (100 articles from last 90 days)
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 100}'

# Ingest multiple pages
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 50, "pages": 3, "fromPage": 1}'

# Ingest articles from last 30 days with query filter
curl -X POST http://localhost:3001/api/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"pageSize": 100, "daysBack": 30, "query": "artificial intelligence"}'
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
  -d '{"pageSize": 100}'
```

3. **Check statistics**:
```bash
curl http://localhost:3001/api/articles/stats
```

4. **Search for reporters** - see test cases below

5. **Get justifications** (optional, frontend does this automatically):
```bash
curl -X POST http://localhost:3001/api/reporters/justifications \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Your story brief...",
    "reporters": [...]
  }'
```

---

## Test Cases

These test cases demonstrate the system's ability to match reporters across different story types and industries.

### Test Case A: Battery Startup - Materials Innovation

**Scenario:** Battery startup using domestically-sourced metallurgical silicon

**How to Use in Chat Interface:**
1. **Story Brief:** "We're a battery startup using domestically-sourced metallurgical silicon for breakthrough materials in EVs. Our angle focuses on materials innovation, climate/EV technology, and US supply chain advantages in the clean energy sector."
2. **Outlet Types:** Select `National Business/Tech` and `Trade/Specialist`
3. **Geography:** Select `US`
4. **Target Publications:** "Climate tech publications, EV-focused outlets"
5. **Competitors:** "Traditional lithium battery manufacturers"

**API Request:**
```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "We are a battery startup using domestically-sourced metallurgical silicon for breakthrough materials in EVs. Our angle focuses on materials innovation, climate/EV technology, and US supply chain advantages in the clean energy sector.",
    "outletTypes": ["national-business-tech", "trade-specialist"],
    "geography": ["US"],
    "targetPublications": "Climate tech publications, EV-focused outlets",
    "competitors": "Traditional lithium battery manufacturers",
    "limit": 15
  }'
```

**Expected Results:**
- Reporters covering climate tech, EVs, and materials science
- National business/tech outlets (TechCrunch, WSJ, etc.)
- Trade publications covering battery technology
- US-focused coverage

**Key Success Factors:**
- Angle is embedded in the story brief
- Semantic search picks up keywords: "materials innovation," "climate," "supply chain"
- Outlet type filters guide toward national tech and specialist publications

---

### Test Case B: Restaurant Robotics - $12M Seed Round

**Scenario:** Restaurant robotics platform announcing funding

**How to Use in Chat Interface:**
1. **Story Brief:** "Announcing our $12M Seed round for our restaurant robotics platform that's automating quick-serve operations and addressing labor challenges. Our angle emphasizes automation technology, workforce solutions, and fundraising momentum in the robotics space."
2. **Outlet Types:** Select `National Business/Tech` and `Trade/Specialist`
3. **Geography:** Select `US` and `Global`
4. **Target Publications:** "Robotics and automation trade press"
5. **Competitors:** "Labor automation companies, restaurant tech funding announcements"

**API Request:**
```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Announcing our $12M Seed round for our restaurant robotics platform that is automating quick-serve operations and addressing labor challenges. Our angle emphasizes automation technology, workforce solutions, and fundraising momentum in the robotics space.",
    "outletTypes": ["national-business-tech", "trade-specialist"],
    "geography": ["US", "Global"],
    "targetPublications": "Robotics and automation trade press",
    "competitors": "Labor automation companies, restaurant tech funding announcements",
    "limit": 15
  }'
```

**Expected Results:**
- Reporters covering robotics and automation
- Business/tech reporters focusing on funding rounds
- Trade publications covering restaurant technology
- Outlets covering labor and workforce trends
- Mix of US and global robotics press

**Key Success Factors:**
- Funding amount ($12M Seed) included in brief signals finance/VC reporters
- Keywords: "automation," "labor challenges," "robotics" guide semantic search
- Global geography allows for international robotics press inclusion

---

### Test Case C: Mortgage/Fintech + AWS Partnership

**Scenario:** Fintech platform partnering with AWS for infrastructure

**How to Use in Chat Interface:**
1. **Story Brief:** "We're partnering with AWS to power our mortgage platform, delivering infrastructure improvements in cost, latency, and compliance for the financial services industry. Our angle highlights cloud infrastructure wins, operational efficiency, and regulatory compliance technology."
2. **Outlet Types:** Select `National Business/Tech` and `Trade/Specialist`
3. **Geography:** Select `US`
4. **Target Publications:** "Fintech outlets, cloud infrastructure press, AWS partnership coverage"
5. **Competitors:** "Other fintech-AWS partnerships, mortgage tech infrastructure announcements"

**API Request:**
```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "We are partnering with AWS to power our mortgage platform, delivering infrastructure improvements in cost, latency, and compliance for the financial services industry. Our angle highlights cloud infrastructure wins, operational efficiency, and regulatory compliance technology.",
    "outletTypes": ["national-business-tech", "trade-specialist"],
    "geography": ["US"],
    "targetPublications": "Fintech outlets, cloud infrastructure press, AWS partnership coverage",
    "competitors": "Other fintech-AWS partnerships, mortgage tech infrastructure announcements",
    "limit": 15
  }'
```

**Expected Results:**
- Fintech reporters covering infrastructure and technology
- Cloud/AWS beat reporters
- Business press covering strategic partnerships
- Outlets focusing on financial services technology
- Reporters covering compliance and regulatory tech

**Key Success Factors:**
- "AWS" and "partnership" keywords attract cloud infrastructure beat reporters
- "Fintech," "mortgage," "compliance" terms guide toward financial services specialists
- Business press interested in strategic partnership announcements

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

