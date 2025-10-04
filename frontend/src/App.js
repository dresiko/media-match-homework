import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import StoryBriefStep from './components/StoryBriefStep';
import OutletTypesStep from './components/OutletTypesStep';
import GeographyStep from './components/GeographyStep';
import OptionalQuestionsStep from './components/OptionalQuestionsStep';
import ResultsView from './components/ResultsView';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    storyBrief: '',
    outletTypes: [],
    geography: [],
    targetPublications: '',
    competitors: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/reporters/match`, {
        storyBrief: formData.storyBrief,
        outletTypes: formData.outletTypes,
        geography: formData.geography,
        targetPublications: formData.targetPublications || undefined,
        competitors: formData.competitors || undefined,
        limit: 15
      });

      setResults(response.data);
      setCurrentStep(5); // Move to results view
    } catch (err) {
      console.error('Error fetching reporters:', err);
      setError(err.response?.data?.error || 'Failed to fetch reporters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFormData({
      storyBrief: '',
      outletTypes: [],
      geography: [],
      targetPublications: '',
      competitors: ''
    });
    setResults(null);
    setError(null);
  };

  const canProceedFromStep1 = formData.storyBrief.trim().length > 10;
  const canProceedFromStep2 = formData.outletTypes.length > 0;
  const canProceedFromStep3 = formData.geography.length > 0;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Media Matching</h1>
        <p>Find the perfect reporters for your story</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {currentStep !== 5 && (
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                1. Story Brief
              </div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                2. Outlet Types
              </div>
              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                3. Geography
              </div>
              <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
                4. Optional
              </div>
            </div>
          </div>
        )}

        <div className="step-container">
          {currentStep === 1 && (
            <StoryBriefStep
              value={formData.storyBrief}
              onChange={(value) => updateFormData('storyBrief', value)}
              onNext={nextStep}
              canProceed={canProceedFromStep1}
            />
          )}

          {currentStep === 2 && (
            <OutletTypesStep
              selected={formData.outletTypes}
              onChange={(value) => updateFormData('outletTypes', value)}
              onNext={nextStep}
              onBack={prevStep}
              canProceed={canProceedFromStep2}
            />
          )}

          {currentStep === 3 && (
            <GeographyStep
              selected={formData.geography}
              onChange={(value) => updateFormData('geography', value)}
              onNext={nextStep}
              onBack={prevStep}
              canProceed={canProceedFromStep3}
            />
          )}

          {currentStep === 4 && (
            <OptionalQuestionsStep
              targetPublications={formData.targetPublications}
              competitors={formData.competitors}
              onChangePublications={(value) => updateFormData('targetPublications', value)}
              onChangeCompetitors={(value) => updateFormData('competitors', value)}
              onSubmit={handleSubmit}
              onBack={prevStep}
              loading={loading}
            />
          )}

          {currentStep === 5 && results && (
            <ResultsView
              results={results}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Powered by OpenAI + AWS S3 Vectors</p>
      </footer>
    </div>
  );
}

export default App;