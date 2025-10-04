# Testing the Media Matching MVP

Quick guide to test the complete end-to-end flow.

## 🚀 Setup

### 1. Start Backend API

```bash
# From project root
cd api
yarn install
yarn dev
```

Backend runs on: http://localhost:3001

### 2. Start Frontend

```bash
# From project root (new terminal)
cd frontend
yarn install
yarn start
```

Frontend runs on: http://localhost:3000

## 🧪 Test Scenarios

### Test 1: Battery Startup (Brief A)

**Story Brief:**
```
Our battery startup is using domestically-sourced metallurgical silicon 
to create breakthrough materials for EVs, supporting US supply chain independence.
```

**Settings:**
- Outlet Types: National Tech/Business, Trade/Specialist
- Geography: US
- Skip optional fields

**Expected Results:**
- Top reporters covering climate tech, EVs, supply chain
- Reporters like: Dharna Noor, Jasper Jolly, Lauren Almeida
- Match scores 40-45%
- Contact info populated for known reporters

### Test 2: Restaurant Robotics (Brief B)

**Story Brief:**
```
Restaurant robotics platform raising a $12M Seed round for automation 
in quick-serve operations and labor optimization.
```

**Settings:**
- Outlet Types: National Tech/Business, Trade/Specialist
- Geography: US, Global
- Optional: Add "TechCrunch, The Information" to publications

**Expected Results:**
- Top reporters covering robotics, automation, AI
- Reporters like: Dara Kerr, Dan Milmo, Robert Booth
- Match scores 38-42%
- Strong justifications mentioning AI/automation expertise

### Test 3: Fintech Partnership (Brief C)

**Story Brief:**
```
Mortgage/fintech platform partners with AWS for infrastructure improvements, 
cost reduction, and compliance wins.
```

**Settings:**
- Outlet Types: National Tech/Business
- Geography: US
- Optional: Competitors: "Similar to Stripe AWS partnership"

**Expected Results:**
- Top reporters covering fintech, cloud, partnerships
- Reporters like: Kalyeena Makortoff, Nick Robins-Early, Blake Montgomery
- Match scores 40-41%
- Articles about AWS, fintech, infrastructure

## ✅ Features to Verify

### Frontend Flow

- [ ] Step 1: Story brief accepts min 10 characters
- [ ] Step 2: Can select multiple outlet types
- [ ] Step 3: Can select multiple geographies
- [ ] Step 4: Optional fields are truly optional
- [ ] Loading spinner shows during search
- [ ] Progress bar updates correctly

### Results Display

- [ ] Top 15 reporters shown
- [ ] Match scores display (0-100)
- [ ] AI justifications are unique and relevant
- [ ] Contact info shows (email, LinkedIn, Twitter)
- [ ] Recent articles expand/collapse
- [ ] Article dates show "X days ago" format
- [ ] Relevance scores display for articles

### Export Functionality

- [ ] CSV export downloads
- [ ] CSV contains all reporter data
- [ ] Email copy button works
- [ ] Email format: `Name <email@example.com>`
- [ ] Copy confirmation shows
- [ ] Disabled if no emails found

### UI/UX

- [ ] Gradient background displays
- [ ] Cards have hover effects
- [ ] Buttons respond to clicks
- [ ] Form validation works
- [ ] Error messages display if API fails
- [ ] "New Search" resets form
- [ ] Responsive on mobile

## 🔍 Backend Verification

### API Endpoint Test

```bash
curl -X POST http://localhost:3001/api/reporters/match \
  -H "Content-Type: application/json" \
  -d '{
    "storyBrief": "Battery startup using domestically-sourced silicon for EVs",
    "outletTypes": ["national-tech-business"],
    "geography": ["us"],
    "limit": 15
  }'
```

**Expected Response:**
- 200 OK
- JSON with `query`, `reporters`, `totalArticlesAnalyzed`
- Each reporter has: rank, name, outlet, matchScore, justification, contact info, articles

### Contact Info Test

```bash
curl http://localhost:3001/api/reporters/contact?name=Dan%20Milmo
```

**Expected Response:**
```json
{
  "name": "Dan Milmo",
  "email": "dan.milmo@theguardian.com",
  "linkedin": "https://www.linkedin.com/in/danmilmo",
  "twitter": "@danmilmo"
}
```

### All Reporters Test

```bash
curl http://localhost:3001/api/reporters/all
```

**Expected Response:**
- 200 OK
- 38 reporters with complete contact info

## 🐛 Common Issues

### Backend won't start
- Check `.env` file exists with all required vars
- Ensure AWS credentials are valid
- Verify OpenAI API key is set

### Frontend can't connect
- Confirm backend is running on port 3001
- Check CORS is enabled
- Create `.env` in frontend with `REACT_APP_API_URL=http://localhost:3001`

### No results returned
- Ensure articles are seeded: `cd api && yarn seed`
- Check S3 bucket has articles indexed
- Verify embeddings were generated

### Justifications are generic
- OpenAI API key must be valid
- Check API quota hasn't been exceeded
- Fallback to rule-based if API fails (this is expected behavior)

## 📊 Performance Benchmarks

**Expected timings:**
- Story brief → Results: 5-15 seconds
- CSV export: Instant
- Email copy: Instant
- API response time: 3-10 seconds
- Justification generation: 2-5 seconds (parallel)

## ✨ Success Criteria

All tests pass if:

1. ✅ Can complete full flow for all 3 briefs
2. ✅ Results are relevant and make sense
3. ✅ Justifications are unique and well-reasoned
4. ✅ Contact info populates for known reporters
5. ✅ CSV export contains all data
6. ✅ Email copy works
7. ✅ UI is responsive and attractive
8. ✅ No console errors
9. ✅ Loading states work
10. ✅ Can run multiple searches

## 🎉 Demo Script

For showing the app:

1. **Open app**: Show clean, modern UI
2. **Enter story**: Use Brief B (Restaurant Robotics)
3. **Select outlets**: Show multi-select
4. **Choose geography**: Show US + Global
5. **Skip optional**: Show it's truly optional
6. **Click search**: Show loading state
7. **View results**: Highlight match scores
8. **Expand article**: Show expandable details
9. **Click justification**: Read AI reasoning
10. **Export CSV**: Download and open in Excel
11. **Copy emails**: Paste into email client
12. **New search**: Show reset works

---

**Ready to test!** 🚀

Remember: This is an MVP. Focus on the happy path and core functionality.
