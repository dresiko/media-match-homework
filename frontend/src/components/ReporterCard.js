import React, { useState } from 'react';

function ReporterCard({ reporter }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="reporter-card">
      <div className="reporter-header">
        <div className="reporter-rank">#{reporter.rank}</div>
        <div className="reporter-info">
          <h3 className="reporter-name">{reporter.name}</h3>
          <p className="reporter-outlet">{reporter.outlet}</p>
        </div>
        <div className="reporter-score">
          <div className="score-circle" style={{
            background: `conic-gradient(#4f46e5 ${reporter.matchScore * 3.6}deg, #e5e7eb ${reporter.matchScore * 3.6}deg)`
          }}>
            <span>{reporter.matchScore}</span>
          </div>
        </div>
      </div>

      <div className="reporter-justification">
        {reporter.justification === null ? (
          <div className="justification-skeleton">
            <div className="skeleton-line skeleton-line-1"></div>
            <div className="skeleton-line skeleton-line-2"></div>
            <div className="skeleton-line skeleton-line-3"></div>
          </div>
        ) : (
          <p>{reporter.justification}</p>
        )}
      </div>

      <div className="reporter-contact">
        {reporter.email ? (
          <a href={`mailto:${reporter.email}`} className="contact-link email">
            📧 {reporter.email}
          </a>
        ) : (
          <span className="contact-missing">📧 No email available</span>
        )}
        
        {reporter.linkedin && (
          <a href={reporter.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
            💼 LinkedIn
          </a>
        )}
        
        {reporter.twitter && (
          <a href={`https://twitter.com/${reporter.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="contact-link">
            🐦 {reporter.twitter}
          </a>
        )}
      </div>

      <div className="reporter-articles">
        <button 
          className="articles-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'} {reporter.totalRelevantArticles} relevant article{reporter.totalRelevantArticles !== 1 ? 's' : ''} 
          {!expanded && ' (click to view)'}
        </button>

        {expanded && (
          <div className="articles-list">
            {reporter.recentArticles.map((article, idx) => (
              <div key={idx} className="article-item">
                <div className="article-header">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-title">
                    {article.title}
                  </a>
                  <span className="article-date">{formatDate(article.publishedAt)}</span>
                </div>
                {article.distance !== undefined && (
                  <span className="article-relevance">
                    Relevance: {Math.round((1 - article.distance) * 100)}%
                  </span>
                )}
              </div>
            ))}
            {reporter.totalRelevantArticles > reporter.recentArticles.length && (
              <p className="articles-more">
                + {reporter.totalRelevantArticles - reporter.recentArticles.length} more article{reporter.totalRelevantArticles - reporter.recentArticles.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReporterCard;
