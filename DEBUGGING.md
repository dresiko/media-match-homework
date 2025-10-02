# Debugging Guide

## 🐛 How to Debug the Seed Script

### Method 1: Visual Debugger in VS Code/Cursor (Recommended)

1. **Set breakpoints** in the code where you want to pause:
   - Open `api/src/scripts/seed.js`
   - Click in the gutter (left of line numbers) to set breakpoints
   - Or add breakpoints in any service files

2. **Start debugging**:
   - Press `F5` or go to "Run and Debug" panel
   - Select **"Debug Seed Script"** from the dropdown
   - Click the green play button

3. **Debug controls**:
   - **Continue (F5)**: Resume execution
   - **Step Over (F10)**: Execute current line
   - **Step Into (F11)**: Step into function calls
   - **Step Out (Shift+F11)**: Step out of current function
   - **Stop (Shift+F5)**: Stop debugging

4. **Inspect variables**:
   - Hover over variables to see values
   - Use the Variables panel on the left
   - Add expressions to Watch panel
   - View call stack

### Method 2: Command Line Debugging

Run the seed script with Node.js debugger:

```bash
cd api
npm run seed:debug
```

Then in another terminal or in Chrome:
- Chrome: Navigate to `chrome://inspect`
- Click "Open dedicated DevTools for Node"

### Method 3: Console Debugging

Add `console.log` statements and run normally:

```bash
cd api
npm run seed
```

## 🔍 Common Debugging Scenarios

### Debug Article Fetching

Set breakpoints in:
- `api/src/services/newsapi.service.js` line 30 (`fetchArticles` method)
- Check the `response.data` to see what NewsAPI returns

### Debug Embedding Generation

Set breakpoints in:
- `api/src/services/embeddings.service.js` line 20 (`generateEmbeddings` method)
- Inspect the `input` and `response` objects

### Debug S3 Storage

Set breakpoints in:
- `api/src/services/s3vector.service.js` line 14 (`storeArticle` method)
- Check the `command` and AWS response

## 📋 Debugging Tips

### 1. Check Environment Variables

Add this to your seed script to verify config:

```javascript
console.log('Config:', {
  bucket: config.aws.s3.vectorBucket,
  region: config.aws.region,
  hasOpenAI: !!config.openaiApiKey,
  hasNewsAPI: !!config.newsApiKey
});
```

### 2. Mock Data for Testing

If you don't have API keys, the services will automatically use mock data:
- NewsAPI → `getMockArticles()`
- OpenAI → `getMockEmbedding()`

### 3. Error Handling

Wrap sections in try-catch to isolate issues:

```javascript
try {
  const articles = await newsApiService.fetchArticles();
  console.log('✓ Fetched articles:', articles.length);
} catch (error) {
  console.error('✗ Failed to fetch:', error.message);
  // Continue or exit based on your needs
}
```

### 4. Step-by-Step Verification

Test each service independently:

```bash
# In Node.js REPL
cd api
node

> require('dotenv').config();
> const newsApi = require('./src/services/newsapi.service');
> newsApi.fetchArticles({ pageSize: 5 }).then(console.log);
```

## 🎯 Debug Different Components

### Debug API Server

Use the "Debug API Server" configuration to debug the Express server:

1. Stop Docker containers: `docker-compose down`
2. Press F5 and select "Debug API Server"
3. API will run on http://localhost:3001
4. Test with curl or Postman while debugging

### Debug with Hot Reload

Use nodemon for automatic reloading:

```bash
cd api
npx nodemon --inspect src/index.js
```

Then attach the debugger from VS Code.

## 🚨 Common Issues

### Issue: "Cannot find module"
**Solution**: Make sure you ran `npm install` in the `api/` directory

### Issue: AWS credential errors
**Solution**: Verify `.env` file exists in project root with correct AWS keys

### Issue: OpenAI rate limits
**Solution**: Add longer delays between batches or reduce batch size

### Issue: Breakpoints not hitting
**Solution**: 
- Make sure you selected the right debug configuration
- Check that source maps are enabled
- Restart the debug session

## 💡 Pro Tips

1. **Use Watch Expressions**: Add expressions like `articles.length` or `embedding[0]` to watch their values
2. **Debug Console**: Execute code during debugging in the Debug Console
3. **Conditional Breakpoints**: Right-click a breakpoint to add conditions
4. **Log Points**: Right-click in gutter → Add Logpoint (logs without stopping)

## 🔗 Additional Resources

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)

