import React from 'react';

const OUTLET_OPTIONS = [
  {
    value: 'national-tech-business',
    label: 'National Tech/Business',
    description: 'WSJ, NYT, Bloomberg, TechCrunch, The Information'
  },
  {
    value: 'trade-specialist',
    label: 'Trade/Specialist',
    description: 'Industry-specific publications and vertical media'
  },
  {
    value: 'regional',
    label: 'Regional',
    description: 'Local newspapers and regional business journals'
  },
  {
    value: 'newsletters',
    label: 'Newsletters',
    description: 'Substack, independent newsletters, curated digests'
  },
  {
    value: 'podcasts',
    label: 'Podcasts',
    description: 'Audio shows and interview programs'
  }
];

function OutletTypesStep({ selected, onChange, onNext, onBack, canProceed }) {
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
        <h2>📰 What types of outlets? <span className="required">*</span></h2>
        <p>Select all outlet types you'd like to target (you can select multiple)</p>
      </div>

      <div className="step-content">
        <div className="options-grid">
          {OUTLET_OPTIONS.map(option => (
            <div
              key={option.value}
              className={`option-card ${selected.includes(option.value) ? 'selected' : ''}`}
              onClick={() => toggleOption(option.value)}
            >
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
            <strong>Selected:</strong> {selected.length} outlet type{selected.length !== 1 ? 's' : ''}
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
          <p className="help-text">Please select at least one outlet type</p>
        )}
      </div>
    </div>
  );
}

export default OutletTypesStep;
