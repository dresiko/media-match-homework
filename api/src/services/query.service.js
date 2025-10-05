const openaiService = require('./openai.service');

class QueryService {
  /**
   * Prepare a search query from user inputs
   * Combines story brief with context about preferences and geography
   * 
   * @param {Object} userInput - User's story details
   * @param {string} userInput.storyBrief - Main story description (what you want to pitch)
   * @param {Array<string>} userInput.outletTypes - Types of outlets
   * @param {Array<string>} userInput.geography - Geographic preferences
   * @param {string} userInput.targetPublications - Specific publications (optional)
   * @param {string} userInput.competitors - Competitor context (optional)
   * @returns {string} Enhanced query text
   */
  prepareQueryText(userInput) {
    const {
      storyBrief,
      outletTypes = [],
      geography = [],
      targetPublications,
      competitors
    } = userInput;

    const parts = [];

    // Main story brief (most important - repeat for emphasis)
    if (storyBrief) {
      parts.push(storyBrief);
      parts.push(storyBrief); // Repeat to increase weight
    }

    // Outlet types help focus the search
    if (outletTypes.length > 0) {
      const outletContext = this.getOutletTypeContext(outletTypes);
      if (outletContext) {
        parts.push(outletContext);
      }
    }

    // Geographic context
    if (geography.length > 0) {
      parts.push(`Geographic focus: ${geography.join(', ')}`);
    }

    // Target publications
    if (targetPublications) {
      parts.push(`Specific publications to focus on: ${targetPublications}`);
    }

    // Competitor/related announcements context
    if (competitors) {
      parts.push(`Competitors or other announcements: ${competitors}`);
    }

    return parts.join(', ');
  }

  /**
   * Get contextual keywords for outlet types
   * Helps the semantic search understand what kind of coverage we're looking for
   */
  getOutletTypeContext(outletTypes) {
    const contexts = [];

    if (outletTypes.includes('national-business-tech')) {
      contexts.push('technology business innovation enterprise startups venture capital');
    }
    if (outletTypes.includes('trade-specialist')) {
      contexts.push('industry trade specialist vertical sector analysis');
    }
    if (outletTypes.includes('regional')) {
      contexts.push('regional local community metro area');
    }
    if (outletTypes.includes('newsletters')) {
      contexts.push('newsletter subscriber publication analysis');
    }
    if (outletTypes.includes('podcasts')) {
      contexts.push('podcast audio interview discussion');
    }

    return contexts.join(' ');
  }

  /**
   * Generate embedding for a user query
   * 
   * @param {Object} userInput - User's story details
   * @returns {Promise<Array<number>>} Query embedding vector
   */
  async generateQueryEmbedding(userInput) {
    // Prepare enhanced query text
    const queryText = this.prepareQueryText(userInput);
    
    console.log('📝 Query text:', queryText);

    // Generate embedding using OpenAI
    const embeddings = await openaiService.generateEmbeddings(queryText);
    
    return embeddings[0];
  }

  /**
   * Extract key topics from story brief for display
   * This helps users understand what we're searching for
   */
  extractKeyTopics(storyBrief) {
    // Simple keyword extraction (in production, use NLP)
    const keywords = [
      'battery', 'silicon', 'EV', 'electric vehicle', 'supply chain', 'climate',
      'robotics', 'automation', 'restaurant', 'labor', 'AI', 'machine learning',
      'fintech', 'mortgage', 'AWS', 'cloud', 'infrastructure', 'compliance',
      'funding', 'seed', 'series', 'venture', 'investment',
      'startup', 'technology', 'innovation', 'breakthrough'
    ];

    const found = keywords.filter(keyword => 
      storyBrief.toLowerCase().includes(keyword.toLowerCase())
    );

    return found.slice(0, 5); // Top 5 topics
  }

  /**
   * Note: We don't use hard filters - semantic similarity handles relevance.
   * User preferences (outlet types, geography) are baked into the query embedding,
   * which naturally influences similarity scores without excluding potentially great matches.
   */
}

module.exports = new QueryService();
