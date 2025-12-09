import { useState } from 'react';
import './chat-interface.scss';

import logo from '../../assets/images/logo.png';
import sendIcon from '../../assets/images/vector.png';
import bgImage from '../../assets/images/background.png';

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('');

  const suggestions = [
    { text: "What can I ask you to do?", isActive: false },
    { text: "Which one of my projects is performing the best?", isActive: true }, 
    { text: "What projects should I be concerned about right now?", isActive: false },
  ];

  return (
    <div className="chat-interface-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      
      <div className="content-container">
        
        <header className="app-header">
          <img src={logo} alt="Logo" className="header-logo" />
          <h1 className="header-title">Ask our AI anything</h1>
        </header>

        <section className="interaction-section">
          
          <div className="suggestions-group">
            <span className="suggestions-label">Suggestions on what to ask Our AI</span>
            <div className="suggestions-list">
              {suggestions.map((item, index) => (
                <button 
                  key={index} 
                  className={`suggestion-item ${item.isActive ? 'is-active' : ''}`}
                  onClick={() => setInputValue(item.text)}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <div className="input-wrapper">
            <input 
              className="chat-input"
              type="text" 
              placeholder="Ask me anything about your projects"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="send-button">
              <img src={sendIcon} alt="Send" className="send-icon" />
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default ChatInterface;