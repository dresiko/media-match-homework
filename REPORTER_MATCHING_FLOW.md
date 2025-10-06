# Reporter Matching Flow

This document explains the complete flow of how the system matches reporters to a story brief using semantic search and AI-powered justifications.

## Overview

The reporter matching system uses a multi-step process that combines semantic search (via AWS S3 Vectors and OpenAI embeddings) with AI-generated justifications to find and rank the most relevant journalists for your story.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER INPUT                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  POST /api/reporters/match                                      │
│  {                                                              │
│    storyBrief: "Battery startup using silicon for EVs...",     │
│    outletTypes: ["national-business-tech"],                    │
│    geography: ["US"],                                           │
│    targetPublications: "TechCrunch, WSJ",                       │
│    competitors: "QuantumScape"                                  │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. QUERY PREPARATION (query.service.js)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Combine story brief with context                            │
│  • Add outlet type keywords (technology, business, etc.)       │
│  • Add geography context                                        │
│  • Weight story brief (repeat for emphasis)                    │
│                                                                 │
│  Enhanced Query:                                                │
│  "Battery startup silicon EVs... [repeated] technology         │
│   business innovation, Geographic focus: US..."                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. GENERATE EMBEDDING (openai.service.js)                     │
│  ─────────────────────────────────────────────────────────────  │
│  • Call OpenAI text-embedding-3-small                          │
│  • Convert query text → 1536-dim vector                        │
│                                                                 │
│  Result: [0.023, -0.041, 0.018, ..., 0.007]                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. SEMANTIC SEARCH (s3vector.service.js)                      │
│  ─────────────────────────────────────────────────────────────  │
│  • Query S3 Vector index with embedding                        │
│  • Find top N most similar articles by cosine similarity       │
│  • No hard filters - similarity handles relevance              │
│                                                                 │
│  Returns: 50+ articles with distance scores                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. EXTRACT REPORTERS (reporters.js)                           │
│  ─────────────────────────────────────────────────────────────  │
│  • Group articles by author + outlet                           │
│  • Track each reporter's relevant articles                     │
│  • Calculate best match score per reporter                     │
│  • Sort by lowest distance (highest relevance)                 │
│  • Take top 15 reporters                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. ENRICH CONTACTS (reporters-contact.service.js)             │
│  ─────────────────────────────────────────────────────────────  │
│  • Look up email, LinkedIn, Twitter                            │
│  • 38 reporters have verified contact info                     │
│  • Others get null for missing fields                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. GENERATE JUSTIFICATIONS (openai.service.js)                │
│  ─────────────────────────────────────────────────────────────  │
│  • For each of 15 reporters (parallel execution)               │
│  • Send story brief + reporter's top 3 articles to GPT-4o-mini │
│  • Generate unique 2-3 sentence explanation                    │
│  • Calculate match score: (1 - distance) × 100                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. RESPONSE                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  {                                                              │
│    reporters: [                                                 │
│      {                                                          │
│        rank: 1,                                                 │
│        name: "John Smith",                                      │
│        outlet: "TechCrunch",                                    │
│        matchScore: 87,                                          │
│        justification: "John extensively covers...",             │
│        recentArticles: [...],                                   │
│        email: "john@techcrunch.com",                            │
│        linkedin: "...",                                         │
│        twitter: "@johnsmith"                                    │
│      },                                                         │
│      ...14 more                                                 │
│    ],                                                           │
│    totalArticlesAnalyzed: 52                                    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Step Breakdown

### Step 1: User Input
The user submits their story details via the frontend or directly to the API endpoint `POST /api/reporters/match`.

**Required:**
- `storyBrief`: The main story description

**Optional:**
- `outletTypes`: Array of outlet type preferences
- `geography`: Array of geographic regions
- `targetPublications`: Specific publications to prioritize
- `competitors`: Related companies or announcements for context
- `limit`: Number of reporters to return (default: 15)

### Step 2: Query Preparation
The `query.service.js` enhances the raw story brief by:
- Repeating the story brief twice for increased weight in semantic search
- Adding contextual keywords based on outlet types
- Including geographic context
- Appending target publications and competitor information

This creates a rich query text that helps the semantic search understand intent.

### Step 3: Generate Embedding
The enhanced query text is sent to OpenAI's `text-embedding-3-small` model, which converts it into a 1536-dimensional vector. This vector represents the semantic meaning of the query in a way that can be compared mathematically with article embeddings.

### Step 4: Semantic Search
The query embedding is sent to AWS S3 Vectors, which:
- Performs a cosine similarity search across all stored article embeddings
- Returns the top N most similar articles (typically 50+)
- Each result includes the article metadata and a distance score (0 = perfect match, 1 = no similarity)

**Key Design Decision:** No hard filters are applied. The semantic similarity naturally handles relevance, avoiding the risk of filtering out potentially great matches.

### Step 5: Extract Reporters
The system processes the similar articles to identify unique reporters:
- Groups articles by `author + outlet` combination
- Tracks all relevant articles for each reporter
- **Calculates additive match score**:
  - Base score from best matching article
  - +10% of each additional article's score as bonus
  - Capped at 100 (perfect match)
  - Simple: quality first, then bonuses for volume
- Sorts reporters by their calculated score
- Takes the top 15 reporters

See [MATCH_SCORING.md](./MATCH_SCORING.md) for detailed scoring algorithm.

### Step 6: Enrich Contacts
For each reporter, the system looks up contact information from the contact database:
- Email address
- LinkedIn profile URL
- Twitter handle

Currently, 38 reporters have verified contact information. Others receive `null` for missing fields.

### Step 7: Generate Justifications
This is where AI adds significant value. For each of the top 15 reporters:
- The system sends the original story brief plus the reporter's top 3 most relevant articles to GPT-4o-mini
- The AI generates a unique, contextual explanation of why this reporter is a good fit
- All 15 justifications are generated in parallel for speed
- A match score (0-100) is calculated from the distance: `(1 - distance) × 100`

### Step 8: Response
The API returns a complete response with:
- Array of 15 ranked reporters with all details
- Total number of articles analyzed
- The original query parameters for reference

## Key Technical Decisions

### Why No Hard Filters?
Unlike traditional search systems that filter by outlet type or geography, this system bakes user preferences into the query embedding. This approach:
- Allows semantic similarity to naturally prioritize relevant matches
- Avoids excluding potentially perfect reporters who don't fit rigid criteria
- Provides more nuanced, context-aware results

### Why Repeat the Story Brief?
Repeating the story brief in the query text increases its weight in the embedding, ensuring the core story remains the primary matching criterion over secondary factors like geography or outlet type.

### Why Parallel Justifications?
Generating 15 AI justifications sequentially would take 10-15 seconds. Running them in parallel (using `Promise.all`) reduces total time to 2-3 seconds, providing a much better user experience.

### Why Top 3 Articles Per Reporter?
Including the most relevant 3 articles provides:
- Context for the AI to write accurate justifications
- Evidence for users to validate the match
- A balance between comprehensiveness and API cost/speed

## Performance Characteristics

**Initial Response (Fast):**
- Query preparation: < 10ms
- Embedding generation: 200-500ms
- S3 Vector search: 100-300ms
- Reporter extraction: < 50ms
- Contact enrichment: < 10ms
- **Initial Results: ~1 second** ✨

**Background Justification Loading:**
- Justification generation (parallel): 2-3s
- **Total with justifications: ~3-4 seconds**

**User Experience:**
- Users see results in ~1 second
- AI justifications stream in progressively with skeleton loaders
- Perceived performance: Much faster!

**API Costs per Query:**
- OpenAI embedding: $0.00002 (1 query)
- OpenAI justifications: $0.00015 (15 × GPT-4o-mini calls)
- S3 Vector search: < $0.001
- **Total: < $0.001 per query**

## Related Documentation

- [REPORTER_MATCHING.md](./REPORTER_MATCHING.md) - Detailed explanation of the matching algorithm
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete system implementation
- [README.md](./README.md) - Quick start and overview
