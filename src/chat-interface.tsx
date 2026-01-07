import { useState, useEffect, useRef } from 'react';
import type { Content } from "@google/generative-ai";
import './chat-interface.scss';

import { getGeminiResponse } from './services/chat-service';

import logo from './assets/images/logo.svg';
import sendIcon from './assets/images/vector.svg';
import bgImage from './assets/images/background.png';
import thinkingIcon from './assets/images/thinking.svg'; 

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  isError?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { text: "What can I ask you to do?" },
    { text: "Which one of my projects is performing the best?" },
    { text: "What projects should I be concerned about right now?" },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const generateHistoryForAI = (currentMessages: ChatMessage[]): Content[] => {
    const recentMessages = currentMessages.slice(-10);
    const cleanMessages = recentMessages.filter(msg => !msg.isError);

    return cleanMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts[0].text }]
    }));
  };

  const sendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: userText }]
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const historyPayload = generateHistoryForAI(messages);
      const responseText = await getGeminiResponse(userText, historyPayload);

      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: responseText }]
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: "Connection error. Please try asking again." }],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-interface-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="content-container">

        <header className="app-header">
          <img src={logo} alt="Logo" className="header-logo" />
          <h1 className="header-title">Ask our AI anything</h1>
        </header>

        <section className="interaction-section">
          
          {messages.length > 0 && (
            <div className="chat-history">
              {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  
                  <span className="message-label">
                    {msg.role === 'user' ? 'ME' : 'OUR AI'}
                  </span>
                  
                  <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message-wrapper ai">
                  <span className="message-label">OUR AI</span>
                  <div className="message-bubble is-typing">
                    <img src={thinkingIcon} alt="Thinking..." className="thinking-icon" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {messages.length === 0 && (
            <div className="suggestions-group">
              <span className="suggestions-label">Suggestions on what to ask Our AI</span>
              <div className="suggestions-list">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => setInputValue(item.text)}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="input-wrapper">
            <input
              className="chat-input"
              type="text"
              placeholder="Ask me anything about your projects"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={sendMessage} disabled={isLoading}>
              <img src={sendIcon} alt="Send" className="send-icon" />
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default ChatInterface;