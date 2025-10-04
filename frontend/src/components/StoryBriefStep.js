import React from 'react';

function StoryBriefStep({ value, onChange, onNext, canProceed }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey && canProceed) {
      onNext();
    }
  };

  return (
    <div className="step">
      <div className="step-header">
        <h2>📝 Tell us about your story</h2>
        <p>What are you looking to pitch or announce? Be specific about the key points.</p>
      </div>

      <div className="step-content">
        <textarea
          className="story-textarea"
          placeholder="Example: Our battery startup is using domestically-sourced metallurgical silicon to create breakthrough materials for EVs, supporting US supply chain independence..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={8}
          autoFocus
        />
        
        <div className="character-count">
          {value.length} characters {value.length < 10 && '(minimum 10 characters)'}
        </div>

        <div className="examples">
          <details>
            <summary>💡 See example story briefs</summary>
            <div className="example-list">
              <div className="example-item">
                <strong>Battery Startup:</strong>
                <p>Our battery startup is using domestically-sourced metallurgical silicon for breakthrough EV materials and US supply chain.</p>
              </div>
              <div className="example-item">
                <strong>Restaurant Robotics:</strong>
                <p>Restaurant robotics platform raising $12M Seed for automation in quick-serve operations and labor optimization.</p>
              </div>
              <div className="example-item">
                <strong>Fintech Partnership:</strong>
                <p>Mortgage/fintech platform partners with AWS for infrastructure improvements, cost reduction, and compliance wins.</p>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="step-actions">
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next →
        </button>
        {!canProceed && (
          <p className="help-text">Please enter at least 10 characters to continue</p>
        )}
      </div>
    </div>
  );
}

export default StoryBriefStep;
