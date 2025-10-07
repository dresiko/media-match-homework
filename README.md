# Media Matching MVP

A media matching system that helps PR professionals and founders quickly research and connect with the best-fit reporters for their stories using AI-powered semantic search with Amazon S3 Vectors.

## 🎯 Features

- **Chat-First Interface**: Interactive bot-driven conversation with message history and embedded controls
- **Smart Reporter Matching**: Semantic search using Amazon S3 Vectors with weighted scoring that rewards both quality and consistency ([see flow](./REPORTER_MATCHING_FLOW.md))
- **AI-Powered Justifications**: GPT-4o-mini generates unique explanations for each match (with progressive loading)
- **Fast Results**: ~1 second initial response with skeleton loaders for AI justifications
- **Contact Enrichment**: reporters contact info api with mocked data including email, LinkedIn, and Twitter
- **Multi-Select Buttons**: Pill-style buttons embedded in chat bubbles for outlet and geography selection
- **CSV Export & Email Copy**: One-click exports for immediate outreach
- **Recent Articles**: See most relevant articles per reporter with relevance scores (capped on top 3)

## 🏗️ Architecture

- **Backend**: Node.js/Express API (managed with Yarn)
- **Frontend**: React-based chat interface (managed with Yarn)
- **Vector Storage**: Amazon S3 Vectors for semantic search
- **Embeddings**: OpenAI text-embedding-3-small for article vectorization
- **Package Manager**: Yarn

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- AWS Account with S3 access
- OpenAI API Key
- Yarn (for local development) - `npm install -g yarn`
- Guardian API key for article ingestion

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd honey-jar-media-matching-homework
   ```

2. **Configure environment variables**
   
   ```bash
   cp .env.template .env
   ```

   Edit the .env file and set:
   - AWS Account credentials
   - AWS Vectorial Bucket and index setup
   - OpenAI API Key
   - The Guardian API Keys
   - Ingestion parameters

   ```bash   
   # AWS ACCOUNT
   AWS_ACCESS_KEY_ID=aws_access_key_id
   AWS_SECRET_ACCESS_KEY=aws_secret_access_key

   # VECTORIAL BUCKET AND INDEX
   AWS_REGION=us-east-2
   S3_VECTOR_BUCKET=media-matching-articles
   S3_VECTOR_INDEX=articles-index

   # OPEN AI
   OPENAI_API_KEY=openai_api_key

   # THE GUARDIAN API FOR INGESTION
   GUARDIAN_API_KEY=guardian_api_key

   # ARTICLE INGESTION PARAMS
   INGESTION_DAYS_BACK=120
   INGESTION_PAGE_SIZE=100
   INGESTION_FROM_PAGE=1
   INGESTION_PAGES=5
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

### Ingest Data

Load sample articles into the system:
```bash
make ingest
# or locally: cd api && yarn ingest
```

## 📝 Usage

1. Open http://localhost:3000 in your browser
2. **Chat with the bot:**
   - 🤖 Bot asks: "What are you looking to pitch?"
   - 👤 You type your story brief and angle
   - 🤖 Bot asks: "What outlet types?" (with multi-select buttons)
   - 👤 You select options and submit
   - 🤖 Bot asks: "What geography?" (with buttons)
   - 👤 You select and submit
   - 🤖 Bot asks: "Any specific publications?" (optional - leave blank to skip)
   - 👤 You type publications or leave blank
   - 🤖 Bot asks: "Any competitors or announcements?" (optional - leave blank to skip)
   - 👤 You add context or leave blank
   - 🤖 Bot searches and shows 15 matches!
3. **View Results:** Top 15 reporters with:
   - Match scores (0-100)
   - AI-generated justifications
   - Contact info (email, LinkedIn, Twitter)
   - Recent relevant articles
4. **Export:** Download CSV or copy emails for outreach

## 🧪 Test Briefs

Try these sample briefs from the project requirements. Each includes the angle within the story brief itself:

### A. Battery Startup - Materials Innovation

**Step 1: Story Brief & Angle**
```
We're a battery startup using domestically-sourced metallurgical silicon for breakthrough materials in EVs. Our angle focuses on materials innovation, climate/EV technology, and US supply chain advantages in the clean energy sector.
```

**Step 2: Outlet Types**
- Select: `National Business/Tech`, `Trade/Specialist`

**Step 3: Geography**
- Select: `US`

**Step 4: Target Publications** (optional)
```
Climate tech publications, EV-focused outlets
```

**Step 5: Competitors** (optional)
```
Traditional lithium battery manufacturers
```

---

### B. Restaurant Robotics - $12M Seed Round

**Step 1: Story Brief & Angle**
```
Announcing our $12M Seed round for our restaurant robotics platform that's automating quick-serve operations and addressing labor challenges. Our angle emphasizes automation technology, workforce solutions, and fundraising momentum in the robotics space.
```

**Step 2: Outlet Types**
- Select: `National Business/Tech`, `Trade/Specialist`

**Step 3: Geography**
- Select: `US`, `Global`

**Step 4: Target Publications** (optional)
```
Robotics and automation trade press
```

**Step 5: Competitors** (optional)
```
Labor automation companies, restaurant tech funding announcements
```

---

### C. Mortgage/Fintech + AWS Partnership

**Step 1: Story Brief & Angle**
```
We're partnering with AWS to power our mortgage platform, delivering infrastructure improvements in cost, latency, and compliance for the financial services industry. Our angle highlights cloud infrastructure wins, operational efficiency, and regulatory compliance technology.
```

**Step 2: Outlet Types**
- Select: `National Business/Tech`, `Trade/Specialist`

**Step 3: Geography**
- Select: `US`

**Step 4: Target Publications** (optional)
```
Fintech outlets, cloud infrastructure press, AWS partnership coverage
```

**Step 5: Competitors** (optional)
```
Other fintech-AWS partnerships, mortgage tech infrastructure announcements
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
make ingest        # Ingest sample data (uses Yarn)
make logs          # View all logs
make logs-api      # View API logs
make shell-api     # Open shell in API container
```

### Local Development (Yarn)
```bash
cd api
yarn install       # Install dependencies
yarn dev           # Start API server
yarn ingest        # Ingest articles

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
│   │   │   ├── newsapi.service.js       # Article ingestion (Guardian API)
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
├── API.md                 # Complete API documentation
├── REPORTER_MATCHING_FLOW.md  # Detailed flow diagram
├── TESTING.md             # Test guide
└── REPORTER_MATCHING.md   # Matching algorithm details
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
| `GUARDIAN_API_KEY` | The Guardian API key for ingestion | No |

### API Endpoints

See **[API.md](./API.md)** for complete API documentation with examples.

**Key Endpoints:**
- `POST /api/reporters/match` - Match reporters to your story (~1s response)
- `POST /api/reporters/justifications` - Generate AI explanations (background)
- `GET /api/reporters/contact` - Get contact info by name
- `POST /api/articles/ingest` - Ingest articles from Guardian API
- `GET /health` - Health check

## 📄 License

MIT

