# Design Note: Reporter Matching System

**Version:** 1.0 | **Date:** October 2025

---

## 1. Data Model & Architecture

**Core Entities:**
- **Article**: `{id, title, url, author, source, publishedAt, content, embedding[1536]}`
- **Reporter** (derived): `{name, outlet, matchScore, recentArticles[], email, linkedin, twitter}`
- **ContactInfo** (mock): 50 verified Guardian reporters covering all test scenarios

**Storage:**
- **AWS S3 Vectors**: Primary vector store (1536-dim OpenAI embeddings, cosine similarity)
- **In-Memory**: Mock contact database (50 reporters)

---

## 2. Ranking Formula & Weights

**Additive Scoring:**
```
baseScore = (1 - bestArticle.distance) × 100
bonus = Σ(articleScore × articleScore / 1000)  // top 2-3 articles
matchScore = min(baseScore + bonus, 100)
```

**Rationale:** Quality-first (best article), consistency bonus (additional articles), diminishing returns (top 3 only), simple & explainable.

**Query Enhancement:** Story brief weighted 2× (repeated), outlet keywords 1×, geography 1×, no hard filters (semantic similarity handles all matching).

---

## 3. Commercial Data Integration

### Phase 1: Enhanced Contacts (Months 1-2)
- **RocketReach API**: Real-time contact enrichment (email, phone, LinkedIn, Twitter)
- **Cost**: $0.10-0.20/search (cache 90 days, batch enrich, top 15 only)

### Phase 2: Historical Articles (Months 2-4)
- **LexisNexis API**: 10,000+ sources (vs. 1 Guardian), 100K+ articles, 2-year history
- **Benefits**: Better beat detection, diverse dataset, improved accuracy
- **Cost**: ~$50-100/month API + $20-30 embeddings, incremental updates

### Phase 3: Real-time Monitoring (Months 4-6)
- Daily ingestion from LexisNexis/Meltwater
- Reporter beat tracking, trending topic detection

---

## 4. Enterprise Readiness

### Multi-Tenancy: Tiered Access Model

**Shared database, plan-based features** (not isolated data per tenant):

| Feature | Free | Regular | Enterprise |
|---------|------|---------|------------|
| Searches/month | 10 | 100 | Unlimited |
| Article history | 7 days | 30 days | 2 years |
| Reporters shown | 5 | 10 | 50 |
| Contact enrichment | None | Email only | Full (RocketReach) |
| Export | ✗ | ✓ | ✓ |
| Custom articles | ✗ | ✗ | ✓ (private) |
| API access | ✗ | ✗ | ✓ |

**Implementation:** Single S3 index with metadata filtering by plan tier, usage limits enforced, per-tenant billing, enterprise customers can upload private articles.

### Role-Based Access Control (RBAC)

**Roles:** Viewer (read-only) → Member (search + export) → Admin (+ team mgmt) → Owner (+ billing)

**Permissions:** `reporters:search`, `reporters:export`, `reporters:contact-info`, `analytics:view`, `team:manage`, `settings:configure`

**Enforcement:** JWT tokens with role claims, per-endpoint permission checks, granular access control.

### Auditability

**Audit Logs:** Track all searches, exports, contact views with `{tenantId, userId, action, metadata, timestamp}`

**Retention:** 90 days hot (queryable), 7 years cold (S3 Glacier), GDPR-compliant anonymization.

**Use Cases:** Compliance (SOC 2, GDPR), security investigations, usage analytics, billing verification.

---

## 5. Future Improvements

### 5.1 Query Pre-processing
**Problem:** Contextual keywords dilute core story signal.
**Solution:** Extract structured elements with GPT-4, separate core (70%) vs. context (30%) embeddings, weighted combination.

### 5.2 Comprehensive Reporter Profiles
**Problem:** Only showing relevant articles, can't assess full expertise.
**Solution:** Fetch recent portfolio (last 6 months, 20 articles), detect primary beat, show publishing frequency.

### 5.3 Intelligent Scoring
**Current:** Simple additive (base + bonuses).
**Improvements:** 
- **Recency weighting**: +15% last week, +10% last month, -5% 3-6 months, -10% 6+ months
- **Diminishing returns**: Position-based weights (50%, 33%, 25%, 20%) for articles 2-5
- **Outlet tiers**: +5 tier 1 (WSJ, Bloomberg), +2 tier 2 (Guardian, Forbes)
- **Result**: Prioritizes recent coverage and quality outlets, explainable breakdown for users

### 5.4 Search History & Result Persistence
**Problem:** Frontend sends full reporter payload to backend for justification generation (~50KB+ per request), no search history tracking.

**Solution:** Persist search results in database (MongoDB or PostgreSQL):
```
SearchHistory {
  id: uuid,
  tenantId: string,
  userId: string,
  query: { storyBrief, filters, ... },
  results: Reporter[],  // Full match results with scores
  createdAt: timestamp,
  justificationsGenerated: boolean
}
```

**Benefits:**
- **Reduced payload**: Frontend sends only `searchId` for justification generation (not full reporter data)
- **Search history**: Users can revisit past searches without re-running queries
- **Analytics**: Track popular queries, common filters, success patterns
- **Caching**: Reuse results for similar queries (fuzzy matching)
- **Audit trail**: Complete record of all searches with results

**Implementation:** `POST /api/reporters/match` returns `searchId`, `POST /api/reporters/justifications` accepts `searchId` instead of full reporter array.

---

## 6. Performance & Scalability

**Current (MVP):**
- 100 articles, 1 source → ~1s search → $0.001/query

**Future (Enterprise):**
- 100K+ articles, 1000+ sources → <500ms search (S3 HNSW) → $0.01-0.02/query (with RocketReach)

---

**Document Version:** 1.0 | **Last Updated:** October 2025

