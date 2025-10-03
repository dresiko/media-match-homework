# Debugging the Seed Script

## Option 1: VS Code Debugger (Recommended) 🐛

The easiest way to debug the seed script with breakpoints.

### Steps:

1. **Make sure you have `.env` file in root** with your credentials
   ```bash
   # Check it exists
   cat .env
   ```

2. **Open the seed script** in VS Code
   ```
   api/src/scripts/seed.js
   ```

3. **Set breakpoints** 
   - Click in the gutter (left of line numbers) on any line you want to pause at
   - Common places:
     - Line 14: Before fetching articles
     - Line 24: After fetching, before embeddings
     - Line 30: Before storing in S3

4. **Start debugging**
   - Press `F5` or click the debug icon in sidebar
   - Select **"Debug Seed Script"** from dropdown
   - Click the green play button ▶️

5. **Debug controls**
   - **F10**: Step over (next line)
   - **F11**: Step into (go inside function)
   - **Shift+F11**: Step out
   - **F5**: Continue
   - Hover over variables to see values

### What You Can Do:

- ✅ Set breakpoints anywhere
- ✅ Inspect variables
- ✅ Step through line by line
- ✅ See call stack
- ✅ Watch expressions
- ✅ See console output

---

## Option 2: Command Line with Debugger

If you prefer terminal debugging:

```bash
cd api
node --inspect-brk src/scripts/seed.js
```

Then in Chrome:
1. Open `chrome://inspect`
2. Click "Open dedicated DevTools for Node"
3. Use Chrome DevTools to debug

---

## Option 3: Debug Inside Docker

If you need to debug inside Docker (less common):

### Method A: Remote Debugging

1. **Update docker-compose.yml** to expose debug port:
   ```yaml
   api:
     ports:
       - "3001:3001"
       - "9229:9229"  # Debug port
   ```

2. **Run seed with debug flag**:
   ```bash
   docker-compose exec api node --inspect=0.0.0.0:9229 src/scripts/seed.js
   ```

3. **Attach VS Code debugger**:
   Add this to `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "attach",
     "name": "Attach to Docker",
     "address": "localhost",
     "port": 9229,
     "localRoot": "${workspaceFolder}/api",
     "remoteRoot": "/app"
   }
   ```

### Method B: Just Use Logs

Add console.log statements and run:
```bash
make seed
make logs-api
```

---

## Common Debugging Scenarios

### Debug Guardian API Fetch

Set breakpoint in `api/src/services/newsapi.service.js`:
- Line 61: Before API call
- Line 64: After response
- Line 97: In normalizeArticles

**Check:**
- Is `this.apiKey` set?
- What does `response.data` contain?
- Are articles being filtered correctly?

### Debug Embedding Generation

Set breakpoint in `api/src/services/embeddings.service.js`:
- Line 22: Before OpenAI call
- Line 25: After response

**Check:**
- Is `this.openai` initialized?
- What's in the `input` array?
- Did OpenAI return embeddings?

### Debug S3 Storage

Set breakpoint in `api/src/services/s3vector.service.js`:
- Line 159: Before storing article
- Line 173: After S3 command

**Check:**
- Is `this.clientVector` initialized?
- What's in `articleData`?
- Did S3 return success?

---

## Quick Tips

### 1. Add Temporary Logs

```javascript
console.log('🔍 DEBUG:', { 
  variable: someVariable,
  type: typeof someVariable,
  length: someVariable?.length 
});
```

### 2. Use Debugger Statement

Add this anywhere in code to auto-breakpoint:
```javascript
debugger; // Execution will pause here when debugging
```

### 3. Check Config Loading

Add breakpoint in `api/src/config/index.js` line 3 to see if `.env` loads.

### 4. Isolate the Problem

Test each service independently:

```javascript
// In Node REPL (cd api && node)
require('dotenv').config({ path: '../.env' });
const guardian = require('./src/services/newsapi.service');
guardian.fetchArticles({ pageSize: 5 }).then(console.log);
```

---

## Troubleshooting

### "Cannot find module"
```bash
cd api
yarn install
```

### ".env not loading"
- Make sure `.env` is in **project root**, not `api/`
- Config loads from `../../.env` relative to config file

### "Breakpoints not hitting"
- Make sure you selected "Debug Seed Script" configuration
- Check you're debugging the right file
- Try adding `debugger;` statement

### "API keys not working"
Add this at top of seed.js to verify:
```javascript
console.log('ENV Check:', {
  hasGuardian: !!process.env.GUARDIAN_API_KEY,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasAWS: !!process.env.AWS_ACCESS_KEY_ID
});
```

---

## Recommended Workflow

1. **First run**: Use VS Code debugger (F5)
2. **Set breakpoints** at key points
3. **Step through** to find the issue
4. **Fix** the problem
5. **Run without debugger** to verify:
   ```bash
   cd api
   npm run seed
   ```

6. **Then test in Docker**:
   ```bash
   make seed
   ```

---

## Example Debug Session

```javascript
// 1. Set breakpoint at line 14 in seed.js
await s3VectorService.initialize();

// 2. Press F5, select "Debug Seed Script"
// 3. When paused, check Variables panel:
//    - s3VectorService.bucket = "media-matching-articles" ✓
//    - s3VectorService.index = "articles-index" ✓

// 4. Press F10 to step over
// 5. See console output:
//    "✓ Vector bucket 'media-matching-articles' already exists"

// 6. Continue debugging line by line...
```

Happy debugging! 🐛✨
