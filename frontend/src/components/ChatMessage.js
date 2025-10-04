import React from 'react';

function ChatMessage({ type, content, timestamp }) {
  const isBot = type === 'bot';
  
  return (
    <div className={`chat-message ${isBot ? 'bot-message' : 'user-message'}`}>
      {isBot && (
        <div className="message-avatar bot-avatar">
          🤖
        </div>
      )}
      <div className="message-content">
        {content}
      </div>
      {!isBot && (
        <div className="message-avatar user-avatar">
          👤
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
