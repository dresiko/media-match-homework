# Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Setup (First Time)

### 1. Create Environment File

```bash
# Copy the template
cp .env.template .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

Add your actual credentials:
```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=aws_access_key_id
AWS_SECRET_ACCESS_KEY=aws_secret_access_key
S3_VECTOR_BUCKET=media-matching-articles
S3_VECTOR_INDEX=articles-index
OPENAI_API_KEY=sk-proj-your-key
NEWS_API_KEY=your_newsapi_key
```

### 2. Start the Application

```bash
make dev
```

This will:
- Build Docker images
- Start API on http://localhost:3001
- Start Frontend on http://localhost:3000

### 3. Initialize Storage

In a new terminal:

```bash
make init
```

This creates:
- S3 bucket for vectors
- HNSW index for semantic search

### 4. Seed Articles

```bash
make seed
```

This will:
- Fetch 50 articles from NewsAPI
- Generate embeddings with OpenAI
- Store in S3 Vectors

Expected output:
```
🌱 Starting article ingestion and vectorization...

🔧 Initializing S3 Vector storage...
✓ Vector bucket 'media-matching-articles' already exists
✓ Vector index 'articles-index' already exists

📰 Step 1: Fetching articles from NewsAPI...
✓ Fetched 50 articles

🤖 Step 2: Generating embeddings with OpenAI...
Processing batch 1/5...
✓ Generated 50 embeddings

☁️  Step 3: Storing articles in AWS S3 Vectors...
✓ Stored 50 articles

✅ Seeding completed successfully!
```

### 5. Open the App

Visit http://localhost:3000 in your browser!

## 🎯 Common Commands

```bash
make dev        # Start everything
make down       # Stop everything
make logs       # View logs
make logs-api   # View API logs only
make init       # Initialize storage
make seed       # Seed articles
make help       # See all commands
```

## 🐛 For Debugging

Debug locally using the same `.env` file:

```bash
# Install dependencies
cd api
npm install

# Run with debugger
npm run seed:debug

# Or use VS Code
# Press F5 → Select "Debug Seed Script"
```

## 📊 Verify Everything Works

```bash
# Check API health
curl http://localhost:3001/health

# Check article stats
curl http://localhost:3001/api/articles/stats

# List articles
curl http://localhost:3001/api/articles
```

## 🔄 Daily Workflow

```bash
# Start work
make dev

# Make changes to code...
# (Code hot-reloads automatically)

# View logs if needed
make logs-api

# Done for the day
make down
```

## 🆘 Troubleshooting

### "Cannot find module"
```bash
make down
make build
make dev
```

### "The specified bucket does not exist"
```bash
make init
```

### Environment variables not working
```bash
# Check .env exists in root
ls -la .env

# Restart containers
make down
make dev
```

### Want to reset everything
```bash
make clean    # Removes containers and volumes
make dev      # Start fresh
make init     # Recreate storage
make seed     # Re-seed articles
```

## 📚 Next Steps

- Read [ENV_SIMPLE.md](ENV_SIMPLE.md) for detailed environment configuration
- Read [STORAGE_INIT.md](STORAGE_INIT.md) for S3 Vector details
- Read [DEBUGGING.md](DEBUGGING.md) for debugging tips
- Read [INGESTION.md](INGESTION.md) for article ingestion details

## 💡 Pro Tips

1. **Keep Docker running** - Use `make dev` in one terminal, work in another
2. **Check logs often** - `make logs-api` shows what's happening
3. **Single .env file** - Edit root `.env` and it works everywhere (Docker & local)
4. **Debug locally** - For breakpoints and step-through debugging
5. **Use make help** - Discover all available commands
