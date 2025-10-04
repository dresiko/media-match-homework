# Media Matching MVP

A media matching system that helps PR professionals and founders quickly research and connect with the best-fit reporters for their stories using AI-powered semantic search with Amazon S3 Vectors.

## 🎯 Features

- **Conversational Wizard UI**: Beautiful multi-step form guiding users through story brief, outlet selection, and geography
- **Smart Reporter Matching**: Semantic search using Amazon S3 Vectors to find relevant journalists
- **AI-Powered Justifications**: GPT-4o-mini generates unique explanations for each match
- **Contact Enrichment**: 38 reporters with verified email, LinkedIn, and Twitter
- **Multi-Filter Support**: Filter by outlet type, geography, and specific publications
- **CSV Export & Email Copy**: One-click exports for immediate outreach
- **Recent Articles**: See 2-3 most relevant articles per reporter with relevance scores

## 🏗️ Architecture

- **Backend**: Node.js/Express API (managed with Yarn)
- **Frontend**: React-based chat interface (managed with Yarn)
- **Vector Storage**: Amazon S3 Vectors for semantic search
- **Embeddings**: OpenAI text-embedding-3-small for article vectorization
- **Package Manager**: Yarn (faster, more reliable than npm)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- AWS Account with S3 access
- Yarn (for local development) - `npm install -g yarn`
- (Optional) NewsAPI or Guardian API key for article ingestion

### Setup

1. **Clone the repository**
   ```bash
   cd /Users/avarkriss/Projects/honey-jar-media-matching-homework
   ```

2. **Configure environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your AWS credentials and API keys
   ```

3. **Start the application**
   ```bash
   make dev
   # or
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Health check: http://localhost:3001/health

### Seed Data

Load sample articles into the system:
```bash
make seed
# or locally: cd api && yarn seed
```

## 📝 Usage

1. Open http://localhost:3000 in your browser
2. **Step 1:** Enter your story brief (minimum 10 characters)
3. **Step 2:** Select outlet types (national business/tech, trade, regional, newsletters, podcasts)
4. **Step 3:** Choose geography (US only, US + EU/UK, global)
5. **Step 4:** (Optional) Add target publications or competitor context
6. **Results:** View top 15 reporters with:
   - Match scores (0-100)
   - AI-generated justifications
   - Contact info (email, LinkedIn, Twitter)
   - Recent relevant articles
7. **Export:** Download CSV or copy emails for outreach

## 🧪 Test Briefs

Try these sample briefs:

**A. Battery Startup**
```
We're a battery startup using domestically-sourced metallurgical silicon for breakthrough materials in EVs. Looking for coverage on our materials innovation and US supply chain advantage.
```

**B. Restaurant Robotics**
```
Announcing our $12M Seed round for our restaurant robotics platform that's automating quick-serve operations and addressing labor challenges.
```

**C. Mortgage/Fintech + AWS**
```
We're partnering with AWS to power our mortgage platform, delivering infrastructure improvements in cost, latency, and compliance.
```

## 🛠️ Development Commands

### Using Make (Docker - Recommended)
```bash
make dev           # Start development environment (uses Yarn via Docker)
make build         # Build Docker images
make up            # Start containers (detached)
make down          # Stop containers
make clean         # Remove containers and volumes
make init          # Initialize S3 storage
make seed          # Seed sample data (uses Yarn)
make logs          # View all logs
make logs-api      # View API logs
make shell-api     # Open shell in API container
```

### Local Development (Yarn)
```bash
cd api
yarn install       # Install dependencies
yarn dev           # Start API server
yarn seed          # Seed articles
yarn seed:debug    # Debug seed script

cd frontend
yarn install       # Install dependencies
yarn start         # Start React dev server
yarn build         # Build for production
```

## 📦 Project Structure

```
.
├── api/                    # Node.js API
│   ├── src/
│   │   ├── index.js       # Main application entry
│   │   ├── routes/        # API routes
│   │   │   ├── reporters.js      # Reporter matching endpoint
│   │   │   ├── articles.js       # Article management
│   │   │   ├── chat.js           # Chat interface (future)
│   │   │   └── export.js         # Export utilities
│   │   ├── services/      # Business logic
│   │   │   ├── openai.service.js        # Embeddings & justifications
│   │   │   ├── s3vector.service.js      # Vector storage
│   │   │   ├── query.service.js         # Query preparation
│   │   │   ├── newsapi.service.js       # Article ingestion
│   │   │   └── reporters-contact.service.js  # Contact database
│   │   ├── config/        # Configuration
│   │   └── scripts/       # Seed & init scripts
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.js         # Main app with step management
│   │   ├── App.css        # Complete styling
│   │   └── components/    # UI components
│   │       ├── StoryBriefStep.js
│   │       ├── OutletTypesStep.js
│   │       ├── GeographyStep.js
│   │       ├── OptionalQuestionsStep.js
│   │       ├── ResultsView.js
│   │       └── ReporterCard.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── Makefile
├── README.md
├── TESTING.md             # Test guide
└── IMPLEMENTATION_SUMMARY.md  # Complete summary
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region for S3 | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `S3_VECTOR_BUCKET` | S3 bucket name for vectors | Yes |
| `S3_VECTOR_ARTICLES_INDEX` | S3 vector index name | Yes |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | Yes |
| `NEWS_API_KEY` | NewsAPI key for ingestion | No |

### API Endpoints

**Reporter Matching**
- `POST /api/reporters/match` - Find top reporters for a story brief
  - Body: `{ storyBrief, outletTypes[], geography[], targetPublications?, competitors?, limit }`
  - Returns: Top 15 reporters with justifications, contact info, and articles
- `GET /api/reporters/contact?name=` - Get contact info by reporter name
- `GET /api/reporters/search?q=` - Search reporters by name
- `GET /api/reporters/all` - List all reporters with contact info

**Articles**
- `POST /api/articles/init` - Initialize S3 Vector storage
- `GET /api/articles` - List all articles
- `GET /api/articles/stats` - Get index statistics
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles/ingest` - Ingest new articles

**Health**
- `GET /health` - API health check

## 📄 License

MIT

