# Honeyjar Media Matching MVP

A media matching system that helps PR professionals and founders quickly research and connect with the best-fit reporters for their stories using AI-powered semantic search with Amazon S3 Vectors.

## 🎯 Features

- **Chat-First Interface**: Interactive conversation flow to gather story details
- **Smart Reporter Matching**: Semantic search using Amazon S3 Vectors to find relevant journalists
- **Explainable Results**: Each match includes justification with linked articles
- **Contact Enrichment**: Email discovery with confidence scores
- **Multi-Filter Support**: Filter by outlet type, geography, and specific publications
- **CSV Export**: Exportable media lists for outreach campaigns

## 🏗️ Architecture

- **Backend**: Node.js/Express API
- **Frontend**: React-based chat interface
- **Vector Storage**: Amazon S3 Vectors for semantic search
- **Embeddings**: Sentence transformers for article vectorization

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- AWS Account with S3 access
- (Optional) NewsAPI key for article ingestion

### Setup

1. **Clone the repository**
   ```bash
   cd /Users/avarkriss/Projects/honey-jar-media-matching-homework
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
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
```

## 📝 Usage

1. Open http://localhost:3000 in your browser
2. Enter your story brief in the chat
3. Answer clarifying questions:
   - Select outlet types (national business/tech, trade, regional, newsletters, podcasts)
   - Choose geography (US only, US + EU/UK, global)
   - (Optional) Specify target publications or competitors
4. Review matched reporters with justifications
5. Export results as CSV or copy email list

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

```bash
make dev           # Start development environment
make build         # Build Docker images
make up            # Start containers (detached)
make down          # Stop containers
make clean         # Remove containers and volumes
make seed          # Seed sample data
make logs          # View all logs
make logs-api      # View API logs
make shell-api     # Open shell in API container
```

## 📦 Project Structure

```
.
├── api/                    # Node.js API
│   ├── src/
│   │   ├── index.js       # Main application entry
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── scripts/       # Seed scripts
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region for S3 | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `S3_VECTOR_BUCKET` | S3 bucket name for vectors | Yes |
| `NEWS_API_KEY` | NewsAPI key for ingestion | No |

## 📄 License

MIT

