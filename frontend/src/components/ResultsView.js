import React, { useState } from 'react';
import ReporterCard from './ReporterCard';

function ResultsView({ results, onReset }) {
  const [copiedEmails, setCopiedEmails] = useState(false);

  const exportToCSV = () => {
    const headers = [
      'Rank',
      'Name',
      'Outlet',
      'Match Score',
      'Email',
      'LinkedIn',
      'Twitter',
      'Justification',
      'Recent Articles'
    ];

    const rows = results.reporters.map(reporter => [
      reporter.rank,
      reporter.name,
      reporter.outlet,
      reporter.matchScore,
      reporter.email || '',
      reporter.linkedin || '',
      reporter.twitter || '',
      reporter.justification || '',
      reporter.recentArticles.map(a => a.url).join(' | ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        `"${String(cell).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `media-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyEmails = () => {
    const emailsWithNames = results.reporters
      .filter(r => r.email)
      .map(r => `${r.name} <${r.email}>`)
      .join('; ');

    navigator.clipboard.writeText(emailsWithNames).then(() => {
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 2000);
    });
  };

  const emailCount = results.reporters.filter(r => r.email).length;

  return (
    <div className="results-view">
      <div className="results-header">
        <div className="results-title">
          <h2>🎯 Top {results.reporters.length} Matches</h2>
          <p>Analyzed {results.totalArticlesAnalyzed} articles to find the best reporters for your story</p>
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={onReset}>
            ← New Search
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            📥 Export CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={copyEmails}
            disabled={emailCount === 0}
          >
            {copiedEmails ? '✓ Copied!' : `📋 Copy Emails (${emailCount})`}
          </button>
        </div>
      </div>

      <div className="query-summary">
        <h3>Your Query:</h3>
        <p className="story-brief">{results.query.storyBrief}</p>
        <div className="query-meta">
          {results.query.outletTypes && results.query.outletTypes.length > 0 && (
            <span className="tag">Outlets: {results.query.outletTypes.join(', ')}</span>
          )}
          {results.query.geography && results.query.geography.length > 0 && (
            <span className="tag">Geography: {results.query.geography.join(', ')}</span>
          )}
          {results.query.keyTopics && results.query.keyTopics.length > 0 && (
            <span className="tag">Key Topics: {results.query.keyTopics.join(', ')}</span>
          )}
        </div>
      </div>

      <div className="reporters-list">
        {results.reporters.map(reporter => (
          <ReporterCard key={`${reporter.name}-${reporter.outlet}`} reporter={reporter} />
        ))}
      </div>

      {emailCount === 0 && (
        <div className="info-box warning">
          <p><strong>ℹ️ Note:</strong> No email addresses found in our database. Consider using RocketReach or Hunter.io for contact enrichment.</p>
        </div>
      )}
    </div>
  );
}

export default ResultsView;
