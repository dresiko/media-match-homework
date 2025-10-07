# Design Note: Reporter Matching System

**Author:** Honeyjar Media Matching System  
**Version:** 1.0  
**Date:** October 2025

---

## 1. Data Model

### Core Entities

```
Article
├── id: string (URL hash)
├── title: string
├── description: string
├── url: string (unique)
├── author: string
├── source: { id, name }
├── publishedAt: ISO timestamp
├── content: string
└── embedding: vector[1536] (OpenAI text-embedding-3-small)

Reporter (derived)
├── name: string
├── outlet: string
├── matchScore: number (0-100)
├── recentArticles: Article[]
├── totalRelevantArticles: number
├── email: string | null
├── linkedin: string | null
└── twitter: string | null

ContactInfo (mock data)
├── key: string (sanitized name)
├── name: string
├── email: string
├── linkedin: string
└── twitter: string
```

### Storage Architecture

**AWS S3 Vectors (Primary Vector Store)**
- Index: `articles-index`
- Dimensions: 1536 (OpenAI text-embedding-3-small)
- Similarity: Cosine distance
- Metadata: Article fields stored alongside vectors
- Key: URL (unique identifier)

**In-Memory (Mock Contacts)**
- 50 verified Guardian reporter contacts
- Covers all three test case scenarios
- Key: sanitized reporter name

---

## 2. Ranking Formula & Weights

### Current Implementation: Additive Scoring

```javascript
// Base score from best matching article
baseScore = (1 - bestArticle.distance) * 100

// Bonus from additional relevant articles
bonus = 0
for (article in additionalArticles[1,2]) {
  articleScore = (1 - article.distance) * 100
  bonus += articleScore * articleScore / 1000
}

// Final score (capped at 100)
matchScore = Math.min(baseScore + bonus, 100)
```

**Rationale:**
- **Quality first**: Best article determines the base (reporter has proven coverage ability)
- **Consistency bonus**: Additional relevant articles add score * score / 1000
- **Diminishing returns**: Only top 3 articles counted to avoid over-rewarding prolific writers
- **Simplicity**: Easy to explain to users and tune

**Example:**
```
Reporter A:
- Article 1: 0.46 distance → 54% score (base)
- Article 2: 0.59 distance → 41% score → +1.7% bonus
- Article 3: 0.61 distance → 39% score → +1.5% bonus
- **Final: 54 + 1.7 + 1.5 = 57%** ⭐
```

### Query Enhancement Weights

```javascript
queryText = [
  storyBrief,           // Weight: 2x (repeated)
  storyBrief,           // Ensures core topic dominates
  outletKeywords,       // Weight: 1x (soft guidance)
  geographyContext,     // Weight: 1x (soft guidance)
  targetPublications,   // Weight: 1x (optional)
  competitors          // Weight: 1x (optional context)
].join(' ')
```

**No hard filters** - All filtering happens through semantic similarity. This allows unexpected but highly relevant matches to surface.

---

## 3. Commercial Data Integration Strategy

### Phase 1: Enhanced Contact Data (Months 1-2)

**RocketReach API Integration**
```javascript
// Real-time enrichment
async function enrichReporter(name, outlet) {
  const contact = await rocketReach.findContact({
    name,
    company: outlet,
    role: 'reporter OR journalist OR writer'
  });
  
  return {
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    twitter: contact.twitter,
    confidence: contact.confidence, // 0-100
    lastVerified: contact.lastVerified
  };
}
```

**Cost Optimization:**
- Cache enriched contacts (TTL: 90 days)
- Batch enrichment during off-peak hours
- Only enrich top 15 matched reporters per query
- Estimated cost: $0.10-0.20 per search

### Phase 2: Historical Article Data (Months 2-4)

**LexisNexis Integration**
```javascript
// Comprehensive article history
async function fetchReporterHistory(reporter) {
  const articles = await lexisNexis.search({
    author: reporter.name,
    dateRange: 'last 2 years',
    limit: 100,
    sources: 'news AND trade publications'
  });
  
  // Generate embeddings for historical articles
  const embeddings = await generateEmbeddingsBatch(articles);
  
  // Store in vector index
  await storeArticlesBatch(articles, embeddings);
}
```

**Benefits:**
- **10,000+ news sources** (TechCrunch, WSJ, Bloomberg, Reuters, etc.) vs. current 1 (The Guardian only)
- Better beat detection and expertise mapping across different outlets
- Improved match accuracy with larger, more diverse dataset

**Challenges:**
- Cost: ~$50-100/month for API access + embedding costs
- Volume: 100K+ articles → $20-30 in OpenAI embedding costs
- Storage: S3 Vectors scales well, but costs increase
- Refresh: Need incremental updates, not full re-ingestion

### Phase 3: Real-time Media Monitoring (Months 4-6)

**Continuous Ingestion Pipeline**
- Daily fetch from LexisNexis/Meltwater
- Incremental vector index updates
- Reporter beat tracking over time
- Trending topic detection

---

## 4. Enterprise Readiness

### Multi-Tenancy

**Data Isolation Strategy:**
```javascript
// Tenant-specific vector indices
S3 Vector Index: articles-{tenantId}
Contact Data: contacts-{tenantId}

// Query scoping
async function searchReporters(storyBrief, { tenantId, userId }) {
  const index = `articles-${tenantId}`;
  const results = await s3VectorService.search(index, queryEmbedding);
  
  // Audit logging
  await auditLog.record({
    tenantId,
    userId,
    action: 'SEARCH_REPORTERS',
    query: storyBrief,
    resultCount: results.length,
    timestamp: new Date()
  });
  
  return results;
}
```

**Benefits:**
- Data isolation (regulatory compliance)
- Per-tenant customization (custom contact databases, preferred outlets)
- Independent scaling per tenant
- Usage tracking and billing

### Role-Based Access Control (RBAC)

**Permission Model:**
```javascript
Roles:
  - viewer: Read-only access to search results
  - member: Search + export contacts + view analytics
  - admin: All member permissions + manage team + configure sources
  - owner: All admin permissions + billing + tenant settings

Resources:
  - reporters:search
  - reporters:export
  - reporters:contact-info
  - analytics:view
  - team:manage
  - settings:configure

// Middleware enforcement
async function checkPermission(req, res, next) {
  const { userId, tenantId } = req.auth;
  const requiredPermission = req.route.permission; // e.g., 'reporters:export'
  
  const hasPermission = await rbac.check(userId, tenantId, requiredPermission);
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  next();
}
```

**Implementation:**
- JWT tokens with embedded role claims
- Per-endpoint permission checks
- Granular permissions (search vs. export vs. contact access)
- Team member invitations with role assignment

### Auditability

**Comprehensive Audit Trail:**
```javascript
AuditLog Entry:
├── id: uuid
├── tenantId: string
├── userId: string
├── action: enum (SEARCH, EXPORT, VIEW_CONTACT, etc.)
├── resource: { type, id }
├── metadata: {
│   query: string (story brief),
│   filters: object,
│   resultCount: number,
│   exportedReporters: string[]
│ }
├── ipAddress: string
├── userAgent: string
├── timestamp: ISO timestamp
└── status: success | failure

// Queryable audit logs
async function getAuditTrail(tenantId, filters) {
  return await db.auditLogs
    .where({ tenantId })
    .whereBetween('timestamp', [filters.startDate, filters.endDate])
    .where('action', 'in', filters.actions)
    .orderBy('timestamp', 'desc')
    .limit(100);
}
```

**Use Cases:**
- Compliance reporting (GDPR, SOC 2)
- Security investigations
- Usage analytics and billing
- User activity monitoring
- Export tracking (who accessed which reporter contacts)

**Retention:**
- Hot storage: 90 days (queryable UI)
- Cold storage: 7 years (S3 Glacier for compliance)
- Anonymization: After user deletion (GDPR right to be forgotten)

---

## 5. Future Improvements

### 5.1 Query Pre-processing & Optimization

**Problem:** Current system embeds the entire enhanced query including all contextual keywords, which can dilute the core story signal.

**Solution:** Intelligent query preprocessing
```javascript
async function preprocessQuery(userInput) {
  // Extract core story elements using GPT-4
  const structured = await openai.chat({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'Extract: company, industry, angle, key topics, announcement type'
    }, {
      role: 'user',
      content: userInput.storyBrief
    }]
  });
  
  // Build separate embeddings for different aspects
  const coreEmbedding = await embed(structured.keyTopics.join(' '));
  const contextEmbedding = await embed(structured.industry + ' ' + structured.angle);
  
  // Weighted combination
  const queryEmbedding = combine(
    coreEmbedding * 0.7,
    contextEmbedding * 0.3
  );
  
  return queryEmbedding;
}
```

**Benefits:**
- Cleaner signal separation (what vs. how to cover it)
- More control over semantic search
- Better handling of complex multi-topic stories
- A/B testable weighting strategies

### 5.2 Comprehensive Reporter Profiles

**Problem:** Only showing relevant articles; users can't assess reporter's full beat and expertise.

**Solution:** Fetch broader article portfolio
```javascript
async function buildReporterProfile(reporter) {
  // Get relevant articles (for matching)
  const relevantArticles = await searchSimilarArticles(queryEmbedding, {
    author: reporter.name,
    limit: 10
  });
  
  // Get recent articles (full portfolio)
  const recentArticles = await getReporterArticles(reporter.name, {
    dateRange: 'last 6 months',
    limit: 20,
    orderBy: 'publishedAt DESC'
  });
  
  // Detect beat/expertise
  const topics = await extractTopics(recentArticles);
  const primaryBeat = topics[0];
  
  return {
    ...reporter,
    relevantArticles,      // For match justification
    recentPortfolio,       // For beat assessment
    primaryBeat,           // Detected expertise
    articleCount30d: recentArticles.filter(a => isLast30Days(a)).length
  };
}
```

**Benefits:**
- Users can validate reporter expertise beyond current match
- Better assessment of reporter availability (publishing frequency)
- Beat detection helps avoid mis-pitching
- Portfolio view builds pitch confidence

### 5.3 Intelligent Match Score Calculation

**Current Formula:** Simple additive (base + 10% bonuses)

**Problems:**
- No recency weighting (6-month-old article = yesterday's article)
- No diminishing returns for quantity (10 articles ≠ 10x better than 1)
- No outlet tier consideration (TechCrunch = niche blog)

**Proposed Improvements:**

```javascript
function calculateIntelligentMatchScore(articles, reporter) {
  // Sort by relevance (distance) and recency
  const sorted = articles.sort((a, b) => {
    const relevanceA = (1 - a.distance);
    const relevanceB = (1 - b.distance);
    const recencyA = getRecencyBonus(a.publishedAt);
    const recencyB = getRecencyBonus(b.publishedAt);
    return (relevanceB * recencyB) - (relevanceA * recencyA);
  });
  
  // Base score from best article with recency boost
  const best = sorted[0];
  const baseScore = (1 - best.distance) * 100;
  const recencyBonus = getRecencyBonus(best.publishedAt);
  const recencyAdjustedBase = baseScore * recencyBonus;
  
  // Consistency bonus: diminishing returns for quantity
  let consistencyBonus = 0;
  for (let i = 1; i < Math.min(sorted.length, 5); i++) {
    const article = sorted[i];
    const articleScore = (1 - article.distance) * 100;
    const recencyWeight = getRecencyBonus(article.publishedAt);
    const positionWeight = 1 / (i + 1); // Diminishing: 50%, 33%, 25%, 20%
    
    consistencyBonus += articleScore * recencyWeight * positionWeight * 0.15;
  }
  
  // Outlet tier bonus
  const tierBonus = getOutletTierBonus(reporter.outlet);
  
  // Final score
  const finalScore = Math.min(
    recencyAdjustedBase + consistencyBonus + tierBonus,
    100
  );
  
  return {
    score: Math.round(finalScore),
    breakdown: {
      base: recencyAdjustedBase,
      consistency: consistencyBonus,
      tier: tierBonus
    }
  };
}

function getRecencyBonus(publishedAt) {
  const daysAgo = (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60 * 24);
  
  if (daysAgo <= 7) return 1.15;      // 15% boost for last week
  if (daysAgo <= 30) return 1.10;     // 10% boost for last month
  if (daysAgo <= 90) return 1.0;      // No change for last quarter
  if (daysAgo <= 180) return 0.95;    // 5% penalty for older
  return 0.90;                        // 10% penalty for 6+ months
}

function getOutletTierBonus(outlet) {
  const tier1 = ['TechCrunch', 'WSJ', 'Bloomberg', 'NYT', 'Reuters'];
  const tier2 = ['Forbes', 'Business Insider', 'The Guardian', 'Wired'];
  
  if (tier1.some(t => outlet.includes(t))) return 5;
  if (tier2.some(t => outlet.includes(t))) return 2;
  return 0;
}
```

**Example Comparison:**

```
Reporter A (Current System):
  Article 1: 54% (6 months old)
  Article 2: 41% (1 week old)
  Final: 54 + 4.1 = 58%

Reporter A (Improved System):
  Article 1: 54% × 0.90 = 48.6% (recency penalty)
  Article 2: 41% × 1.15 = 47.15% (recency boost - now prioritized!)
  Consistency: 47.15 × 0.5 × 0.15 = 3.5%
  Tier: +2 (Guardian)
  Final: 47.15 + 3.5 + 2 = 52.7% ≈ 53%
  
  → Better reflects current coverage relevance!
```

**Benefits:**
- Recent coverage weighted higher (reporter is actively covering the beat)
- Diminishing returns for quantity (10 articles ≠ linear improvement)
- Outlet quality consideration (tier 1 publications boosted)
- Explainable breakdown for users
- More nuanced ranking that reflects pitch success probability

---

## 6. Performance & Scalability

**Current (MVP):**
- 100 articles, 1 source (Guardian)
- ~1s search (fast response without justifications)
- ~3-4s total (with AI justifications)
- $0.001 per query

**Future (Enterprise Scale):**
- 100K+ articles, 1000+ sources
- S3 Vectors HNSW index: <500ms search
- Cached embeddings: No regeneration
- Pre-computed reporter profiles: Instant enrichment
- Estimated: $0.01-0.02 per query (with RocketReach)

---

**Document Version:** 1.0 | **Last Updated:** October 2025

