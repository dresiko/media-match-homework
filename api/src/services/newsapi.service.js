const axios = require('axios');
const config = require('../config');

class GuardianAPIService {
  constructor() {
    this.apiKey = config.guardianApiKey;
    this.baseUrl = 'https://content.guardianapis.com';
  }

  /**
   * Fetch articles from The Guardian API
   * @param {Object} options - Query options
   * @param {string} options.query - Search query
   * @param {number} options.pageSize - Number of results per page (max 200)
   * @param {number} options.pages - Number of pages to fetch
   * @param {string} options.section - Section filter (e.g., 'technology', 'business')
   * @param {string} options.fromDate - Start date (YYYY-MM-DD format)
   * @param {string} options.toDate - End date (YYYY-MM-DD format)
   * @returns {Promise<Array>} Array of articles
   */
  async fetchArticles(options = {}) {
    if (!this.apiKey) {
      console.warn('GUARDIAN_API_KEY not configured, using mock data');
      return this.getMockArticles();
    }

    try {
      const {
        query = 'technology OR startup OR business OR innovation',
        pageSize = 200, // Guardian max is 200
        pages = 1, // Number of pages to fetch
        section = '', // e.g., 'technology', 'business'
        fromDate = this.getDateDaysAgo(config.ingestion.defaultDaysBack),
        toDate = this.getDateDaysAgo(0),
        fromPage = 1,
      } = options;

      let allArticles = [];

      // Fetch multiple pages if requested
      for (let page = fromPage; page <= pages; page++) {
        const params = {
          'api-key': this.apiKey,
          'page-size': pageSize,
          'page': page,
          'show-fields': 'body,byline',
          'show-tags': 'contributor',
          'order-by': 'newest',
          'from-date': fromDate,
          'to-date': toDate
        };

        if (query) {
          params['q'] = query;
        }

        if (section) {
          params['section'] = section;
        }

        console.log(`Fetching articles from The Guardian API (page ${page}/${pages})...`);
        const response = await axios.get(`${this.baseUrl}/search`, { params });

        if (response.data.response.status === 'ok') {
          const articles = this.normalizeArticles(response.data.response.results);
          allArticles = allArticles.concat(articles);
          console.log(`✓ Fetched ${articles.length} articles from page ${page}`);
        } else {
          throw new Error(`Guardian API error: ${response.data.response.message}`);
        }

        // Small delay between pages to respect rate limits
        if (page < pages) {
          await this.sleep(100);
        }
      }

      console.log(`✓ Total fetched: ${allArticles.length} articles`);
      return allArticles;
    } catch (error) {
      console.log(error)
      console.error('Error fetching from Guardian API:', error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
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
      .filter(article => {
        // Must have contributor tags and body content
        const hasContributor = article.tags && article.tags.some(tag => tag.type === 'contributor');
        const hasBody = article.fields && article.fields.body;
        return hasContributor && hasBody && article.webTitle;
      })
      .map(article => {
        // Extract author from contributor tags
        const contributor = article.tags.find(tag => tag.type === 'contributor');
        const author = contributor ? this.extractAuthorName(contributor) : 'Unknown';

        // Extract description from body (first paragraph)
        const description = this.extractDescription(article.fields.body);

        return {
          title: article.webTitle,
          description: description,
          content: this.stripHtml(article.fields.body),
          url: article.webUrl,
          author: author,
          source: {
            id: article.sectionId,
            name: this.normalizeSection(article.sectionName)
          },
          publishedAt: article.webPublicationDate,
          // Additional Guardian-specific data
          contributorBio: contributor?.bio ? this.stripHtml(contributor.bio) : null,
          contributorTwitter: contributor?.twitterHandle || null
        };
      });
  }

  /**
   * Extract author name from contributor tag
   */
  extractAuthorName(contributor) {
    // Use webTitle as it's the display name
    return contributor.webTitle || contributor.firstName + ' ' + contributor.lastName || 'Unknown';
  }

  /**
   * Extract description from HTML body (first paragraph)
   */
  extractDescription(htmlBody) {
    // Remove HTML tags and get first ~200 characters
    const text = this.stripHtml(htmlBody);
    const firstParagraph = text.split('\n').find(p => p.trim().length > 50) || text;
    return firstParagraph.substring(0, 250).trim() + (firstParagraph.length > 250 ? '...' : '');
  }

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
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
   * Normalize Guardian section names
   */
  normalizeSection(section) {
    if (!section) return 'The Guardian';
    
    const sectionMap = {
      'Technology': 'The Guardian - Technology',
      'Business': 'The Guardian - Business',
      'US news': 'The Guardian - US News',
      'World news': 'The Guardian - World News',
      'Money': 'The Guardian - Money',
      'Science': 'The Guardian - Science',
      'Media': 'The Guardian - Media',
      'Environment': 'The Guardian - Environment',
      'Opinion': 'The Guardian - Opinion'
    };

    return sectionMap[section] || `The Guardian - ${section}`;
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        source: { id: 'technology', name: 'The Guardian - Technology' },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        contributorBio: null,
        contributorTwitter: null
      },
      {
        title: 'Restaurant Robotics Sees $12M Investment as Labor Crisis Continues',
        description: 'Automation technology for quick-serve restaurants raises significant seed funding as industry faces ongoing labor challenges.',
        content: 'The restaurant industry is turning to robotics and automation as a solution to persistent labor shortages. One startup has raised $12M in seed funding to deploy its platform across quick-serve operations nationwide.',
        url: 'https://example.com/restaurant-robotics-funding',
        author: 'Michael Rodriguez',
        source: { id: 'business', name: 'The Guardian - Business' },
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        contributorBio: null,
        contributorTwitter: null
      },
      {
        title: 'Fintech Platform Partners with AWS to Transform Mortgage Processing',
        description: 'Major cloud partnership promises to reduce costs and improve compliance in mortgage lending technology.',
        content: 'A leading mortgage technology platform has announced a strategic partnership with Amazon Web Services to modernize its infrastructure. The move is expected to significantly reduce latency and costs while improving compliance capabilities.',
        url: 'https://example.com/fintech-aws-partnership',
        author: 'Jennifer Park',
        source: { id: 'money', name: 'The Guardian - Money' },
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        contributorBio: null,
        contributorTwitter: null
      },
      {
        title: 'Climate Tech Investment Surges as US Manufacturing Returns',
        description: 'Domestic supply chain initiatives drive new wave of climate technology investments.',
        content: 'Investment in climate technology companies focused on US manufacturing has reached new highs. The trend is driven by renewed emphasis on domestic supply chains and materials innovation.',
        url: 'https://example.com/climate-tech-surge',
        author: 'David Kim',
        source: { id: 'environment', name: 'The Guardian - Environment' },
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        contributorBio: null,
        contributorTwitter: null
      },
      {
        title: 'Robotics Automation Tackles Quick-Service Restaurant Operations',
        description: 'New technology platform brings industrial automation to fast food industry.',
        content: 'The fast food industry is embracing robotics automation to streamline operations and address labor challenges. New platforms are making industrial automation accessible to quick-service restaurants.',
        url: 'https://example.com/robotics-qsr-automation',
        author: 'Alex Thompson',
        source: { id: 'technology', name: 'The Guardian - Technology' },
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        contributorBio: null,
        contributorTwitter: null
      }
    ];
  }
}

module.exports = new GuardianAPIService();

