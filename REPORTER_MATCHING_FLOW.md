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
│    storyBrief: "Battery startup using silicon for EVs...",      │
│    outletTypes: ["national-business-tech"],                     │
│    geography: ["US"],                                           │
│    targetPublications: "TechCrunch, WSJ",                       │
│    competitors: "QuantumScape"                                  │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. QUERY PREPARATION (query.service.js)                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Combine story brief with context                             │
│  • Add outlet type keywords (technology, business, etc.)        │
│  • Add geography context                                        │
│  • Weight story brief (repeat for emphasis)                     │
│                                                                 │
│  Enhanced Query:                                                │
│  "Battery startup silicon EVs... [repeated] technology          │
│   business innovation, Geographic focus: US..."                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. GENERATE EMBEDDING (openai.service.js)                      │
│  ─────────────────────────────────────────────────────────────  │
│  • Call OpenAI text-embedding-3-small                           │
│  • Convert query text → 1536-dim vector                         │
│                                                                 │
│  Result: [0.023, -0.041, 0.018, ..., 0.007]                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. SEMANTIC SEARCH (s3vector.service.js)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Query S3 Vector index with embedding                         │
│  • Find top N most similar articles by cosine similarity        │
│  • No hard filters - similarity handles relevance               │
│                                                                 │
│  Returns: 50+ articles with distance scores                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. EXTRACT REPORTERS (reporters.js)                            │
│  ─────────────────────────────────────────────────────────────  │
│  • Group articles by author + outlet                            │
│  • Track each reporter's relevant articles                      │
│  • Calculate additive score: best + small % taken from top 2 & 3│
│  • Sort by calculated score (highest first)                     │
│  • Take top 15 reporters                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. ENRICH CONTACTS (reporters-contact.service.js)              │
│  ─────────────────────────────────────────────────────────────  │
│  • Look up email, LinkedIn, Twitter                             │
│  • 50 reporters have mocked contact info                        │
│  • Others could get null for missing fields                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. INITIAL RESPONSE (Fast ~1 second)                           │
│  ─────────────────────────────────────────────────────────────  │
│  {                                                              │
│    reporters: [                                                 │
│      {                                                          │
│        rank: 1,                                                 │
│        name: "John Smith",                                      │
│        outlet: "TechCrunch",                                    │
│        matchScore: 87,                                          │     │
│        recentArticles: [...],                                   │
│        email: "john@techcrunch.com",                            │
│        linkedin: "...",                                         │
│        twitter: "@johnsmith"                                    │
│      },                                                         │
│      ...14 more                                                 │
│    ],                                                           │
│    totalArticlesAnalyzed: 52                                    │
│  }                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. BACKGROUND: GENERATE JUSTIFICATIONS (openai.service.js)     │
│  ─────────────────────────────────────────────────────────────  │
│  • Frontend calls /api/reporters/justifications                 │
│  • For each of 15 reporters (parallel execution)                |                    
│  • Send story brief + reporter's top 3 articles to GPT-4o-mini  |      
│  • Generate unique 2-3 sentence explanation                     │
│  • Frontend updates UI progressively with skeleton loaders      │
│  • Total time: ~2-3 seconds after initial response              │
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

### Step 6: Enrich Contacts
For each reporter, the system looks up contact information from the contact database:
- Email address
- LinkedIn profile URL
- Twitter handle

Currently, 50 reporters have mocked contact information covering all three test case scenarios (Battery/EV/Climate, Robotics/AI, and Mortgage/Fintech). Others receive `null` for missing fields.

### Step 7: Initial Response (Fast)
The API immediately returns results with:
- Array of 15 ranked reporters with all details
- Justifications set to `null` (placeholder)
- Total number of articles analyzed
- The original query parameters for reference
- **Response time: ~1 second** ✨

### Step 8: Background Justification Generation
After the initial response, the frontend automatically fetches AI justifications:
- Calls `POST /api/reporters/justifications` with story brief and reporters
- For each of the top 15 reporters, GPT-4o-mini generates a unique explanation
- All 15 justifications are generated in parallel for speed
- The frontend displays skeleton loaders and updates progressively
- **Additional time: ~2-3 seconds**

This progressive loading approach provides instant results with AI enhancements streaming in, dramatically improving perceived performance.

## Key Technical Decisions

### Why No Hard Filters?
Unlike traditional search systems that filter by outlet type or geography, this system bakes user preferences into the query embedding. This approach:
- Allows semantic similarity to naturally prioritize relevant matches
- Avoids excluding potentially perfect reporters who don't fit rigid criteria
- Provides more nuanced, context-aware results

### Why Repeat the Story Brief?
Repeating the story brief in the query text increases its weight in the embedding, ensuring the core story remains the primary matching criterion over secondary factors like geography or outlet type.

### Why Progressive Justification Loading?
Originally, generating 15 AI justifications blocked the entire response for 3-4 seconds. By separating this into two phases:
1. **Initial response (~1s)**: Users see reporters immediately with all data except justifications
2. **Background loading (~2-3s)**: AI justifications load with skeleton loaders

This provides a **3-4x better perceived performance** - users can start reviewing reporters, copying emails, and reading articles while justifications load in the background.

### Why Parallel Justifications?
Within the background loading phase, generating 15 justifications sequentially would take 10-15 seconds. Running them in parallel (using `Promise.all`) reduces this to 2-3 seconds.

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

## Visual Features

### Traffic Light Scoring
Match scores and article relevance use intuitive color coding:
- **Green** (≥50%): Excellent match - high relevance
- **Orange** (40-49%): Good match - solid relevance  
- **Red** (<40%): Lower match - may need review

This color system is applied to:
- Match score progress circles
- Article relevance badges
- Article left border indicators

The visual feedback helps users quickly identify the strongest matches at a glance.

## Related Documentation

- [API.md](./API.md) - Complete API documentation with test cases
- [README.md](./README.md) - Quick start and overview
