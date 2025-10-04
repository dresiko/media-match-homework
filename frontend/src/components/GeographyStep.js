import React from 'react';

const GEOGRAPHY_OPTIONS = [
  {
    value: 'us',
    label: 'US Only',
    description: 'Focus on US-based reporters and publications',
    icon: '🇺🇸'
  },
  {
    value: 'us-eu-uk',
    label: 'US + EU/UK',
    description: 'Include European and UK publications',
    icon: '🌍'
  },
  {
    value: 'global',
    label: 'Global',
    description: 'Cast a wide net across all regions',
    icon: '🌐'
  }
];

function GeographyStep({ selected, onChange, onNext, onBack, canProceed }) {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="step">
      <div className="step-header">
        <h2>🌍 Geographic focus? <span className="required">*</span></h2>
        <p>Where should we focus our reporter search?</p>
      </div>

      <div className="step-content">
        <div className="options-grid geography-options">
          {GEOGRAPHY_OPTIONS.map(option => (
            <div
              key={option.value}
              className={`option-card geography-card ${selected.includes(option.value) ? 'selected' : ''}`}
              onClick={() => toggleOption(option.value)}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-checkbox">
                {selected.includes(option.value) ? '✓' : ''}
              </div>
              <div className="option-content">
                <h3>{option.label}</h3>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="selected-summary">
            <strong>Selected:</strong> {selected.map(s => {
              const opt = GEOGRAPHY_OPTIONS.find(o => o.value === s);
              return opt ? opt.label : s;
            }).join(', ')}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next →
        </button>
        {!canProceed && (
          <p className="help-text">Please select at least one geography option</p>
        )}
      </div>
    </div>
  );
}

export default GeographyStep;
