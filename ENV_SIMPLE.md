# Environment Configuration - Simplified

## 📁 Single `.env` File

The project uses **one `.env` file** in the root directory for both Docker and local development.

```
project-root/
├── .env                    # Single environment file (Docker & local)
├── .env.template           # Template to copy from
├── api/
│   └── src/
│       └── config/
│           └── index.js    # Loads ../.env automatically
└── docker-compose.yml      # Uses env_file: .env
```

## ✅ How It Works

### The config file (`api/src/config/index.js`) automatically loads `.env` from root:

```javascript
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
```

This means:
- ✅ Docker containers read from root `.env` via `env_file`
- ✅ Local scripts read from root `.env` via config module
- ✅ **Same configuration everywhere**
- ✅ No file duplication
- ✅ No sync needed

## 🚀 Setup

### 1. Create `.env` file

```bash
cp .env.template .env
```

### 2. Edit with your credentials

```env
# AWS Configuration
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_VECTOR_BUCKET=media-matching-articles
S3_VECTOR_INDEX=articles-index

# OpenAI
OPENAI_API_KEY=sk-your-key

# NewsAPI (optional)
NEWS_API_KEY=your_newsapi_key
```

### 3. Use anywhere

```bash
# Docker mode
make dev
make init
make seed

# Local mode (same .env!)
cd api
npm run init
npm run seed

# Debug mode (same .env!)
Press F5 → Debug Seed Script
```

## 🎯 Advantages

✅ **One source of truth** - Single `.env` file  
✅ **Zero duplication** - No need to copy files  
✅ **Auto-loaded** - Config module handles it  
✅ **Works everywhere** - Docker, local, debug  
✅ **Simple** - Just edit `.env` and go  

## 📊 How Variables Are Loaded

### Docker Containers
```
docker-compose.yml
  └─ env_file: .env
      └─ Loads all variables into container
```

### Local Scripts
```
npm run seed
  └─ Runs src/scripts/seed.js
      └─ Requires ../services/...
          └─ Requires ../config/index.js
              └─ Loads ../../.env
```

### VS Code Debugger
```
.vscode/launch.json
  └─ Has env variables embedded
      └─ (Could also use envFile: "${workspaceFolder}/.env")
```

## 🔧 Debugging Configuration

If you want, you can simplify `.vscode/launch.json` to use the `.env` file:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Seed Script",
  "program": "${workspaceFolder}/api/src/scripts/seed.js",
  "cwd": "${workspaceFolder}/api",
  "envFile": "${workspaceFolder}/.env",
  "console": "integratedTerminal"
}
```

But the current setup with embedded variables works too!

## 🆘 Troubleshooting

### "Config values are undefined"

**Problem:** `.env` file doesn't exist or is in wrong location

**Solution:**
```bash
# Check if .env exists in root
ls -la .env

# If not, create it
cp .env.template .env
```

### "Module not found: dotenv"

**Problem:** Dependencies not installed

**Solution:**
```bash
cd api
npm install
```

### "Environment variables not loaded in Docker"

**Problem:** Docker needs to be restarted after `.env` changes

**Solution:**
```bash
make down
make dev
```

## 💡 Best Practice

**Edit `.env` in root and everything just works!**

No copying, no syncing, no confusion.
