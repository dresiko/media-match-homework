const axios = require('axios');
const config = require('../config');

class NewsAPIService {
  constructor() {
    this.apiKey = config.newsApiKey;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  /**
   * Fetch articles from NewsAPI
   * @param {Object} options - Query options
   * @param {string} options.query - Search query
   * @param {Array<string>} options.sources - News sources
   * @param {Array<string>} options.domains - Domains to search
   * @param {number} options.pageSize - Number of results per page
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @returns {Promise<Array>} Array of articles
   */
  async fetchArticles(options = {}) {
    if (!this.apiKey) {
      console.warn('NEWS_API_KEY not configured, using mock data');
      return this.getMockArticles();
    }

    try {
      const {
        query = 'technology OR startup OR business',
        sources = config.ingestion.sources.join(','),
        domains = config.ingestion.domains.join(','),
        pageSize = 100,
        from = this.getDateDaysAgo(config.ingestion.defaultDaysBack),
        to = this.getDateDaysAgo(0)
      } = options;

      const params = {
        apiKey: this.apiKey,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize,
        from,
        to
      };

      // Use either sources or domains, not both
      if (sources && !options.domains) {
        params.sources = sources;
      } else if (domains) {
        params.domains = domains;
      }

      if (query) {
        params.q = query;
      }

      console.log('Fetching articles from NewsAPI...');
      const response = await axios.get(`${this.baseUrl}/everything`, { params });

      if (response.data.status === 'ok') {
        console.log(`Fetched ${response.data.articles.length} articles`);
        return this.normalizeArticles(response.data.articles);
      } else {
        throw new Error(`NewsAPI error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error.message);
      if (error.response?.status === 401) {
        console.warn('Invalid API key, using mock data');
        return this.getMockArticles();
      }
      throw error;
    }
  }

  /**
   * Normalize articles to a consistent format
   */
  normalizeArticles(articles) {
    return articles
      .filter(article => article.author && article.title && article.description)
      .map(article => ({
        title: article.title,
        description: article.description,
        content: article.content || article.description,
        url: article.url,
        author: this.normalizeAuthor(article.author),
        source: this.normalizeSource(article.source?.name),
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage
      }));
  }

  /**
   * Normalize author names
   */
  normalizeAuthor(author) {
    if (!author) return 'Unknown';
    
    // Remove common suffixes and clean up
    return author
      .replace(/\s*,?\s*(https?:\/\/[^\s]+)/gi, '') // Remove URLs
      .replace(/\s+/g, ' ')
      .trim()
      .split(',')[0] // Take first author if multiple
      .trim();
  }

  /**
   * Normalize source names
   */
  normalizeSource(source) {
    if (!source) return 'Unknown';
    
    const sourceMap = {
      'TechCrunch': 'TechCrunch',
      'The Wall Street Journal': 'Wall Street Journal',
      'The Verge': 'The Verge',
      'Wired': 'WIRED',
      'Business Insider': 'Business Insider',
      'Fortune': 'Fortune',
      'Forbes': 'Forbes',
      'Bloomberg': 'Bloomberg',
      'CNBC': 'CNBC',
      'Reuters': 'Reuters'
    };

    return sourceMap[source] || source;
  }

  /**
   * Get date N days ago in ISO format
   */
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get mock articles for testing
   */
  getMockArticles() {
    return [
      {
        title: 'Battery Startup Revolutionizes EV Supply Chain with Silicon Innovation',
        description: 'A new battery technology startup is using domestically-sourced metallurgical silicon to create breakthrough materials for electric vehicles.',
        content: 'A pioneering battery technology company has announced a major breakthrough in electric vehicle battery production using domestically-sourced metallurgical silicon. The innovation promises to reduce costs and strengthen the US supply chain for critical EV components.',
        url: 'https://example.com/battery-silicon-breakthrough',
        author: 'Sarah Chen',
        source: 'TechCrunch',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null
      },
      {
        title: 'Restaurant Robotics Sees $12M Investment as Labor Crisis Continues',
        description: 'Automation technology for quick-serve restaurants raises significant seed funding as industry faces ongoing labor challenges.',
        content: 'The restaurant industry is turning to robotics and automation as a solution to persistent labor shortages. One startup has raised $12M in seed funding to deploy its platform across quick-serve operations nationwide.',
        url: 'https://example.com/restaurant-robotics-funding',
        author: 'Michael Rodriguez',
        source: 'Business Insider',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null
      },
      {
        title: 'Fintech Platform Partners with AWS to Transform Mortgage Processing',
        description: 'Major cloud partnership promises to reduce costs and improve compliance in mortgage lending technology.',
        content: 'A leading mortgage technology platform has announced a strategic partnership with Amazon Web Services to modernize its infrastructure. The move is expected to significantly reduce latency and costs while improving compliance capabilities.',
        url: 'https://example.com/fintech-aws-partnership',
        author: 'Jennifer Park',
        source: 'Forbes',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null
      },
      {
        title: 'Climate Tech Investment Surges as US Manufacturing Returns',
        description: 'Domestic supply chain initiatives drive new wave of climate technology investments.',
        content: 'Investment in climate technology companies focused on US manufacturing has reached new highs. The trend is driven by renewed emphasis on domestic supply chains and materials innovation.',
        url: 'https://example.com/climate-tech-surge',
        author: 'David Kim',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null
      },
      {
        title: 'Robotics Automation Tackles Quick-Service Restaurant Operations',
        description: 'New technology platform brings industrial automation to fast food industry.',
        content: 'The fast food industry is embracing robotics automation to streamline operations and address labor challenges. New platforms are making industrial automation accessible to quick-service restaurants.',
        url: 'https://example.com/robotics-qsr-automation',
        author: 'Alex Thompson',
        source: 'The Verge',
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null
      }
    ];
  }
}

module.exports = new NewsAPIService();

