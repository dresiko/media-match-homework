import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Media Matching</h1>
        <p>Find the perfect reporters for your story</p>
      </header>
      <main className="App-main">
        <div className="chat-container">
          <div className="welcome-message">
            <h2>Welcome!</h2>
            <p>Tell me about your story and I'll help you find the best reporters to reach out to.</p>
          </div>
          <div className="chat-input-container">
            <input 
              type="text" 
              placeholder="Describe your story or announcement..."
              className="chat-input"
            />
            <button className="send-button">Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

