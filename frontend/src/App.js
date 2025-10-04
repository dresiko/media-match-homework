import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import ChatMessage from './components/ChatMessage';
import ResultsView from './components/ResultsView';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const OUTLET_OPTIONS = [
  { value: 'national-tech-business', label: 'National Tech/Business' },
  { value: 'trade-specialist', label: 'Trade/Specialist' },
  { value: 'regional', label: 'Regional' },
  { value: 'newsletters', label: 'Newsletters' },
  { value: 'podcasts', label: 'Podcasts' }
];

const GEOGRAPHY_OPTIONS = [
  { value: 'us', label: '🇺🇸 US Only', icon: '🇺🇸' },
  { value: 'us-eu-uk', label: '🌍 US + EU/UK', icon: '🌍' },
  { value: 'global', label: '🌐 Global', icon: '🌐' }
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm your media matching assistant. I'll help you find the perfect reporters for your story. What are you looking to pitch or announce?",
      timestamp: new Date()
    }
  ]);
  
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
  const [inputValue, setInputValue] = useState('');
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStep]);

  // Focus input when step changes
  useEffect(() => {
    if (currentStep === 1 || currentStep === 4) {
      inputRef.current?.focus();
    }
  }, [currentStep]);

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const handleStorySubmit = () => {
    if (inputValue.trim().length < 10) return;
    
    // Add user message
    addMessage('user', inputValue);
    
    // Update form data
    formData.storyBrief = inputValue;
    setInputValue('');
    
    // Move to next step
    setTimeout(() => {
      addMessage('bot', 'Perfect! Now, what types of outlets should we target? Select all that apply:');
      setCurrentStep(2);
    }, 500);
  };

  const handleOutletToggle = (value) => {
    const newOutlets = formData.outletTypes.includes(value)
      ? formData.outletTypes.filter(v => v !== value)
      : [...formData.outletTypes, value];
    
    setFormData(prev => ({ ...prev, outletTypes: newOutlets }));
  };

  const handleOutletSubmit = () => {
    if (formData.outletTypes.length === 0) return;
    
    // Add user message with selections
    const selectedLabels = OUTLET_OPTIONS
      .filter(opt => formData.outletTypes.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');
    addMessage('user', `Selected: ${selectedLabels}`);
    
    // Move to next step
    setTimeout(() => {
      addMessage('bot', 'Great choices! What geographic focus should we have?');
      setCurrentStep(3);
    }, 500);
  };

  const handleGeographyToggle = (value) => {
    const newGeo = formData.geography.includes(value)
      ? formData.geography.filter(v => v !== value)
      : [...formData.geography, value];
    
    setFormData(prev => ({ ...prev, geography: newGeo }));
  };

  const handleGeographySubmit = () => {
    if (formData.geography.length === 0) return;
    
    // Add user message with selections
    const selectedLabels = GEOGRAPHY_OPTIONS
      .filter(opt => formData.geography.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');
    addMessage('user', `Selected: ${selectedLabels}`);
    
    // Move to next step
    setTimeout(() => {
      addMessage('bot', 'Got it! Would you like to add any optional details? (You can skip this)');
      setCurrentStep(4);
    }, 500);
  };

  const handleOptionalSubmit = (skip = false) => {
    if (skip) {
      addMessage('user', 'Skip optional details');
    } else {
      const details = [];
      if (formData.targetPublications) details.push(`Publications: ${formData.targetPublications}`);
      if (formData.competitors) details.push(`Competitors: ${formData.competitors}`);
      addMessage('user', details.join(', ') || 'No additional details');
    }
    
    // Start search
    setTimeout(() => {
      addMessage('bot', '🔍 Searching for the best reporters... This will take a few seconds.');
      handleSearch();
    }, 500);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep(5);

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
      setTimeout(() => {
        addMessage('bot', `✅ Found ${response.data.reporters.length} perfect matches for you!`);
        setCurrentStep(6); // Results view
      }, 1000);
    } catch (err) {
      console.error('Error fetching reporters:', err);
      setError(err.response?.data?.error || 'Failed to fetch reporters. Please try again.');
      addMessage('bot', '⚠️ Sorry, there was an error. Please try again.');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setMessages([
      {
        type: 'bot',
        content: "Hi! I'm your media matching assistant. I'll help you find the perfect reporters for your story. What are you looking to pitch or announce?",
        timestamp: new Date()
      }
    ]);
    setFormData({
      storyBrief: '',
      outletTypes: [],
      geography: [],
      targetPublications: '',
      competitors: ''
    });
    setResults(null);
    setError(null);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === 1) {
        handleStorySubmit();
      }
    }
  };

  return (
    <div className="App chat-app">
      <header className="chat-header">
        <div className="header-content">
          <div className="header-title">
            <div className="bot-avatar-large">🤖</div>
            <div>
              <h1>Media Matching Assistant</h1>
              <p>Find the perfect reporters for your story</p>
            </div>
          </div>
        </div>
      </header>

      <main className="chat-main">
        {currentStep !== 6 ? (
          <div className="chat-container">
            <div className="messages-container">
              {messages.map((message, idx) => (
                <ChatMessage key={idx} {...message} />
              ))}

              {/* Step 2: Outlet Types Selection */}
              {currentStep === 2 && (
                <div className="chat-message bot-message">
                  <div className="message-avatar bot-avatar">🤖</div>
                  <div className="message-content interactive">
                    <div className="chat-buttons">
                      {OUTLET_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={`chat-pill-button ${formData.outletTypes.includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleOutletToggle(option.value)}
                        >
                          {formData.outletTypes.includes(option.value) && '✓ '}
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {formData.outletTypes.length > 0 && (
                      <div className="selection-info">
                        {formData.outletTypes.length} selected
                      </div>
                    )}
                    <div className="chat-actions">
                      <button
                        className="btn-chat-submit"
                        onClick={handleOutletSubmit}
                        disabled={formData.outletTypes.length === 0}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Geography Selection */}
              {currentStep === 3 && (
                <div className="chat-message bot-message">
                  <div className="message-avatar bot-avatar">🤖</div>
                  <div className="message-content interactive">
                    <div className="chat-buttons">
                      {GEOGRAPHY_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={`chat-pill-button ${formData.geography.includes(option.value) ? 'selected' : ''}`}
                          onClick={() => handleGeographyToggle(option.value)}
                        >
                          {formData.geography.includes(option.value) && '✓ '}
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {formData.geography.length > 0 && (
                      <div className="selection-info">
                        {formData.geography.length} selected
                      </div>
                    )}
                    <div className="chat-actions">
                      <button
                        className="btn-chat-submit"
                        onClick={handleGeographySubmit}
                        disabled={formData.geography.length === 0}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Optional Details */}
              {currentStep === 4 && (
                <div className="chat-message bot-message">
                  <div className="message-avatar bot-avatar">🤖</div>
                  <div className="message-content interactive">
                    <div className="optional-fields">
                      <input
                        type="text"
                        className="chat-input-field"
                        placeholder="Target publications (e.g., TechCrunch, WSJ)"
                        value={formData.targetPublications}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetPublications: e.target.value }))}
                      />
                      <textarea
                        className="chat-input-field"
                        placeholder="Competitors or related context (optional)"
                        value={formData.competitors}
                        onChange={(e) => setFormData(prev => ({ ...prev, competitors: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="chat-actions">
                      <button
                        className="btn-chat-secondary"
                        onClick={() => handleOptionalSubmit(true)}
                      >
                        Skip
                      </button>
                      <button
                        className="btn-chat-submit"
                        onClick={() => handleOptionalSubmit(false)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {currentStep === 5 && loading && (
                <div className="chat-message bot-message">
                  <div className="message-avatar bot-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area - Only show for step 1 */}
            {currentStep === 1 && (
              <div className="chat-input-container">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder="Tell me about your story or announcement..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={3}
                />
                <button
                  className="chat-send-button"
                  onClick={handleStorySubmit}
                  disabled={inputValue.trim().length < 10}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        ) : (
          <ResultsView results={results} onReset={handleReset} />
        )}
      </main>

      <footer className="chat-footer">
        <p>Powered by OpenAI + AWS S3 Vectors</p>
      </footer>
    </div>
  );
}

export default App;