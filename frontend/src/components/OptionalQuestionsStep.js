import React from 'react';

function OptionalQuestionsStep({
  targetPublications,
  competitors,
  onChangePublications,
  onChangeCompetitors,
  onSubmit,
  onBack,
  loading
}) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>🎯 Refine your search (Optional)</h2>
        <p>Help us narrow down the best matches with additional context</p>
      </div>

      <div className="step-content">
        <div className="optional-fields">
          <div className="form-group">
            <label htmlFor="targetPublications">
              Specific Publications
              <span className="optional-badge">Optional</span>
            </label>
            <input
              id="targetPublications"
              type="text"
              className="form-input"
              placeholder="e.g., TechCrunch, The Information, WSJ"
              value={targetPublications}
              onChange={(e) => onChangePublications(e.target.value)}
            />
            <small className="help-text">
              Focus on finding reporters at specific publications
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="competitors">
              Competitors or Related Announcements
              <span className="optional-badge">Optional</span>
            </label>
            <textarea
              id="competitors"
              className="form-textarea"
              placeholder="e.g., Similar to Stripe's recent partnership announcement..."
              value={competitors}
              onChange={(e) => onChangeCompetitors(e.target.value)}
              rows={3}
            />
            <small className="help-text">
              Mention relevant competitors or similar stories for better context
            </small>
          </div>
        </div>

        <div className="info-box">
          <p><strong>💡 Pro tip:</strong> You can skip these fields and still get great results! Our AI will match based on your story brief and preferences.</p>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button
          className="btn btn-primary btn-search"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              🔍 Find Reporters
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default OptionalQuestionsStep;
