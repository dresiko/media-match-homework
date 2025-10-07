# Reporter Matching System

This document explains how the reporter matching algorithm works - from user input to ranked reporter list.

## 🎯 Overview

The system takes a story brief and user preferences, then finds the best-fit reporters using semantic search and intelligent ranking.

## 📊 How It Works

### Step 1: Gather User Inputs

The system collects:
- **Story Brief** (required): Full description of what you want to pitch (include angle, hook, key points)
- **Outlet Types**: National business/tech, trade, regional, newsletters, podcasts
- **Geography**: US only, US + EU/UK, global
- **Target Publications** (optional): Specific outlets to focus on
- **Competitors** (optional): Related companies/announcements for context

### Step 2: Build Enhanced Query

The `QueryService` prepares a semantic search query by:

1. **Repeating the story brief** (2x weight for importance)
2. **Including outlet type keywords** to guide search:
   - National business/tech → "technology business innovation enterprise startups"
   - Trade/specialist → "industry trade specialist vertical sector analysis"
   - Regional → "regional local community metro area"
   - Newsletters → "newsletter subscriber publication analysis"
   - Podcasts → "podcast audio interview discussion"

3. **Geographic context**
4. **Target publications**
5. **Competitor/related context**

**Example:**

```javascript
// User input:
{
  storyBrief: "Battery startup using domestically-sourced metallurgical silicon for EVs. Materials breakthrough for climate/EV sector strengthening US supply chain.",
  outletTypes: ["national-business-tech", "trade-specialist"],
  geography: ["US"]
}

// Enhanced query:
"Battery startup using domestically-sourced metallurgical silicon for EVs. Materials breakthrough for climate/EV sector strengthening US supply chain. 
Battery startup using domestically-sourced metallurgical silicon for EVs. Materials breakthrough for climate/EV sector strengthening US supply chain. 
technology business innovation enterprise startups industry trade specialist 
Geographic focus: US"
```

### Step 3: Generate Query Embedding

The query text is converted to a 1536-dimensional vector using OpenAI's `text-embedding-3-small`:

```javascript
const queryEmbedding = await embeddingsService.generateEmbeddings(queryText);
// Returns: [0.123, -0.456, 0.789, ...] (1536 numbers)
```

This embedding captures the **semantic meaning** of the story.

### Step 4: Search Similar Articles

The query embedding is compared against **ALL** article embeddings in S3 using **cosine similarity**:

```javascript
const similarArticles = await s3VectorService.searchSimilarArticles(
  queryEmbedding,
  limit * 3  // Get extra articles to find unique reporters
  // No filters! Let similarity do the ranking
);
```

**Why no filters?**
- User preferences (outlet types, geography) are already embedded in the query
- Hard filters would exclude potentially perfect matches
- A European reporter might cover US stories brilliantly
- Let semantic similarity be the judge

**Cosine Similarity** measures how similar two vectors are:
- 1.0 = identical
- 0.0 = unrelated
- Higher = more similar

### Step 5: Extract & Rank Reporters

From the similar articles, we:

1. **Group by reporter** (name + outlet combination)
2. **Aggregate their articles**:
   - Count relevant articles
   - Calculate average similarity score
   - Collect article details

3. **Rank by average similarity**:
   - Reporters who wrote multiple highly-relevant articles rank higher
   - Consistency matters more than single hits

4. **Generate justifications**:
   - Why this reporter is a good match
   - Link to specific articles as evidence

### Step 6: Return Ranked Results

```json
{
  "query": {
    "storyBrief": "...",
    "angle": "...",
    "outletTypes": ["national-business-tech"],
    "geography": ["US"],
    "keyTopics": ["battery", "silicon", "EV", "supply chain", "climate"]
  },
  "reporters": [
    {
      "rank": 1,
      "name": "Sarah Chen",
      "outlet": "TechCrunch",
      "matchScore": 89,
      "justification": "Wrote 3 highly relevant articles; Recently covered similar topics (5 days ago); Covers for TechCrunch",
      "recentArticles": [
        {
          "title": "Battery Startup Revolutionizes EV Supply Chain...",
          "url": "https://...",
          "publishedAt": "2024-01-15T10:00:00Z",
          "similarity": 0.92,
          "description": "..."
        }
      ],
      "totalRelevantArticles": 3,
      "email": null,
      "linkedin": null,
      "twitter": null
    }
  ],
  "totalArticlesAnalyzed": 45
}
```

## 🧮 Ranking Formula

**Current Implementation:** Additive scoring that balances quality with consistency.

```javascript
// Base score from best matching article
baseScore = (1 - bestArticle.distance) * 100

// Bonus from additional relevant articles (10% each)
for (article in additionalArticles[1,2]) {
  articleScore = (1 - article.distance) * 100
  bonus += articleScore * 0.10
}

// Final score (capped at 100)
matchScore = Math.min(baseScore + bonus, 100)
```

**Why this approach?**
- **Quality first**: Best article determines the base (proven coverage ability)
- **Consistency bonus**: Additional relevant articles add score * score / 1000
- **Diminishing returns**: Only top 3 articles counted
- **Simple & explainable**: Easy to understand and tune

**Example:**

Reporter A:
- Article 1: 0.46 distance → 54% score (base)
- Article 2: 0.59 distance → 41% score → +1.7% bonus
- Article 3: 0.61 distance → 39% score → +1.5% bonus
- **Final: 54 + 1.7 + 1.5 = 57%** ⭐

**See [DESIGN_NOTE.md](./DESIGN_NOTE.md)** for detailed scoring algorithm and future improvements including recency weighting and outlet tier bonuses.

## 🔍 Key Components

### QueryService (`query.service.js`)

**Main Methods:**

1. **`prepareQueryText(userInput)`**
   - Combines user inputs into enhanced search query
   - Adds contextual keywords for outlet types
   - Returns weighted query string

2. **`generateQueryEmbedding(userInput)`**
   - Creates query embedding from user inputs
   - Uses OpenAI embedding model
   - Returns 768-dimensional vector

3. **`extractKeyTopics(storyBrief)`**
   - Identifies main topics for display
   - Helps users understand what we're searching for
   - Returns array of keywords

4. **`buildSearchFilters(userInput)`**
   - Converts preferences into search filters
   - Geography, outlet types, publications
   - Returns filter object

### Reporters Route (`routes/reporters.js`)

**Main Functions:**

1. **`extractReportersFromArticles(articles, limit)`**
   - Groups articles by reporter
   - Calculates aggregate statistics
   - Sorts by average similarity
   - Returns top N reporters

2. **`generateJustification(reporter)`**
   - Creates human-readable explanation
   - Links to evidence (articles)
   - Explains why this is a good match

## 💡 Why This Approach Works

### Semantic Search > Keyword Search

**Traditional keyword approach:**
- "battery" matches articles about phone batteries, car batteries, battery litigation
- Misses articles about "energy storage" or "power cells"
- No understanding of context

**Semantic embedding approach:**
- Understands "domestically-sourced metallurgical silicon for EVs" means:
  - Clean energy / climate tech
  - Manufacturing / supply chain
  - Electric vehicles
  - Materials innovation
- Finds articles even if they don't use exact words
- Captures meaning and context

### Outlet Type Context (Soft Guidance, Not Hard Filters)

Adding keywords like "technology business innovation" when user selects "national business/tech" helps the search naturally favor:
- Articles from business/tech outlets
- Coverage with business/innovation angle
- Business-focused reporters

But it doesn't exclude other matches! If a lifestyle reporter wrote an amazing piece on your topic, they'll still appear - just ranked lower by similarity.

### Story Brief Weight

Repeating the story brief gives it 2x weight in the embedding, ensuring the core topic dominates the search even with all the additional context.

**Best Practice:** Include everything important in the story brief itself - the angle, hook, key benefits, and context. OpenAI's embedding model will understand it all.

### No Hard Filters = Better Results

We intentionally don't filter out articles by:
- Geography - A London-based reporter might cover Silicon Valley
- Outlet type - A podcast host might also write articles
- Publication - The best match might be from an unexpected source

The query embedding naturally biases toward your preferences, but leaves room for surprises!

## 🧪 Example Queries

### Query 1: Battery Startup

**Input:**
```json
{
  "storyBrief": "Battery startup using domestically-sourced metallurgical silicon for EVs. Materials breakthrough for climate/EV sector strengthening US supply chain.",
  "outletTypes": ["national-business-tech", "trade-specialist"],
  "geography": ["US"]
}
```

**Finds:**
- Reporters covering EV technology
- Climate tech specialists
- Supply chain analysts
- Materials science writers

### Query 2: Restaurant Robotics

**Input:**
```json
{
  "storyBrief": "Restaurant robotics platform raising $12M Seed round. Automation technology for quick-serve operations addressing labor challenges in food service.",
  "outletTypes": ["national-business-tech", "trade-specialist"],
  "geography": ["US", "global"]
}
```

**Finds:**
- Robotics/automation reporters
- Food tech specialists
- VC/funding beat reporters
- Labor/future of work writers

### Query 3: Fintech + AWS

**Input:**
```json
{
  "storyBrief": "Mortgage/fintech platform partners with AWS to modernize infrastructure. Partnership delivers cost savings, reduced latency, and improved compliance capabilities.",
  "outletTypes": ["national-business-tech"],
  "targetPublications": "Forbes, Bloomberg, Business Insider",
  "geography": ["US"]
}
```

**Finds:**
- Fintech reporters
- Cloud infrastructure specialists
- Enterprise tech writers
- At the specified publications

## 🔮 Future Enhancements

1. **Contact Enrichment**
   - Integrate RocketReach API
   - Email validation
   - Social media profiles

2. **Recency Weighting**
   - Boost reporters who covered topic recently
   - Decay old articles
   - Factor in publish frequency

3. **Publication Quality Scoring**
   - Tier outlets by reach/authority
   - Boost tier 1 publications
   - Match tier to user needs

4. **Beat Detection**
   - Identify reporter's primary beat
   - Match beat to story category
   - Find specialists vs generalists

5. **Response Rate Prediction**
   - Track historical engagement
   - Predict likelihood to respond
   - Optimize outreach timing

## 🎓 Technical Details

**Embedding Model:** `text-embedding-3-small`
- Dimensions: 768
- Cost-effective
- High quality for semantic search
- Fast inference

**Similarity Metric:** Cosine Similarity
- Range: -1 to 1 (we see 0 to 1 in practice)
- Independent of vector magnitude
- Standard for text embeddings

**Search Strategy:** Exhaustive (MVP)
- Load all article vectors
- Compute similarity for each
- Sort and return top results
- Future: Use S3 Vectors native search

## 📊 Performance

With 50 articles:
- Query embedding: ~500ms
- Similarity search: ~2s (exhaustive)
- Reporter extraction: ~100ms
- **Total: ~2.6s**

With 10,000 articles (future):
- Use S3 Vectors HNSW index
- Expected: ~500ms total
