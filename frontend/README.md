# Media Matching Frontend

Modern, conversational UI for finding the perfect reporters for your story.

## 🎨 Features

- **Multi-Step Wizard**: Intuitive flow guiding users through story brief, outlet selection, and geography
- **Smart Matching**: Connects to backend API for AI-powered reporter matching
- **Beautiful Reporter Cards**: Display match scores, contact info, justifications, and recent articles
- **Export Functionality**:
  - 📥 CSV export of full media list
  - 📋 One-click email copy (formatted for BCC)
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ or Yarn
- Backend API running on `http://localhost:3001`

### Installation

```bash
cd frontend
yarn install
```

### Environment Setup

Create a `.env` file:

```bash
REACT_APP_API_URL=http://localhost:3001
```

### Development

```bash
yarn start
```

Opens on [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
yarn build
```

Creates optimized production build in `build/` folder.

## 📋 User Flow

### Step 1: Story Brief
- Enter the pitch or announcement details
- Minimum 10 characters required
- Examples provided for inspiration

### Step 2: Outlet Types (Required)
Multi-select from:
- National Tech/Business
- Trade/Specialist
- Regional
- Newsletters
- Podcasts

### Step 3: Geography (Required)
Select target region(s):
- US Only
- US + EU/UK
- Global

### Step 4: Optional Refinement
- Specific publications
- Competitor context
- Skip if not needed

### Step 5: Results
View top 15 reporter matches with:
- Match score (0-100)
- AI-generated justification
- Contact information (email, LinkedIn, Twitter)
- 2-3 most relevant recent articles
- Export options

## 🎯 Example Usage

1. **Battery Startup Brief:**
   ```
   Our battery startup is using domestically-sourced metallurgical 
   silicon for breakthrough EV materials and US supply chain.
   ```
   - Select: National Tech/Business
   - Geography: US

2. **Restaurant Robotics:**
   ```
   Restaurant robotics platform raising $12M Seed for automation 
   in quick-serve operations and labor optimization.
   ```
   - Select: National Tech/Business, Trade/Specialist
   - Geography: US, Global

3. **Fintech Partnership:**
   ```
   Mortgage/fintech platform partners with AWS for infrastructure 
   improvements, cost reduction, and compliance wins.
   ```
   - Select: National Tech/Business
   - Geography: US
   - Publications: "TechCrunch, The Information"

## 🎨 Components

### Core Components

- **`App.js`** - Main application with step management and API calls
- **`StoryBriefStep.js`** - Story input with examples
- **`OutletTypesStep.js`** - Multi-select outlet cards
- **`GeographyStep.js`** - Geographic preference selection
- **`OptionalQuestionsStep.js`** - Additional refinement fields
- **`ResultsView.js`** - Results display with export functionality
- **`ReporterCard.js`** - Individual reporter display with expandable articles

### Styling

- **`App.css`** - Comprehensive styling with modern design
- Gradient background with glassmorphism effects
- Responsive grid layouts
- Smooth transitions and hover effects

## 🔧 Configuration

### API Endpoint

The frontend connects to the backend API at the URL specified in `.env`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### API Request Format

```javascript
POST /api/reporters/match
{
  "storyBrief": "Your story...",
  "outletTypes": ["national-tech-business"],
  "geography": ["us"],
  "targetPublications": "Optional",
  "competitors": "Optional",
  "limit": 15
}
```

### API Response Format

```javascript
{
  "query": {
    "storyBrief": "...",
    "outletTypes": [...],
    "geography": [...],
    "keyTopics": [...]
  },
  "reporters": [
    {
      "rank": 1,
      "name": "Reporter Name",
      "outlet": "Publication",
      "matchScore": 94,
      "justification": "AI-generated reasoning...",
      "email": "reporter@example.com",
      "linkedin": "https://linkedin.com/in/...",
      "twitter": "@handle",
      "recentArticles": [
        {
          "title": "Article title",
          "url": "https://...",
          "publishedAt": "2025-10-01",
          "distance": 0.123
        }
      ],
      "totalRelevantArticles": 5
    }
  ],
  "totalArticlesAnalyzed": 30
}
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 🎯 Key Features Explained

### CSV Export
Exports all reporter data including:
- Rank, name, outlet
- Match score
- Contact information
- Justification
- Article URLs

### Email Copy
Formats emails as: `Name <email@example.com>; Name2 <email2@example.com>`
Perfect for BCC field in email clients.

### Match Score
0-100 score based on:
- Semantic similarity to story brief
- Recent coverage relevance
- Article publication recency
- Outlet alignment

### Justification
AI-generated explanation using GPT-4o-mini considering:
- Reporter's coverage history
- Relevance of recent work
- Timeliness of coverage
- Outlet's reach

## 🛠️ Development

### File Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── StoryBriefStep.js
│   │   ├── OutletTypesStep.js
│   │   ├── GeographyStep.js
│   │   ├── OptionalQuestionsStep.js
│   │   ├── ResultsView.js
│   │   └── ReporterCard.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

### Adding New Features

1. **New Step**: Create component in `components/` and add to `App.js` step flow
2. **New Export Format**: Extend `exportToCSV()` in `ResultsView.js`
3. **Custom Styling**: Add to `App.css`

## 🐛 Troubleshooting

### "Failed to fetch reporters"
- Ensure backend is running on `http://localhost:3001`
- Check `.env` file has correct `REACT_APP_API_URL`
- Verify CORS is enabled on backend

### Blank page / Console errors
- Run `yarn install` to ensure all dependencies are installed
- Clear browser cache
- Check browser console for specific errors

### Styling issues
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Clear `node_modules` and `yarn.lock`, then reinstall

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Create React App](https://create-react-app.dev)
- [Axios](https://axios-http.com)

## 🎉 Success!

Your frontend is ready to match reporters with stories! 🚀
