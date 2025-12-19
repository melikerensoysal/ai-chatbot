import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './chat-interface.scss';

import logo from '../../assets/images/logo.png';
import sendIcon from '../../assets/images/vector.png';
import bgImage from '../../assets/images/background.png';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ChatInterface = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<any>(null);

  const suggestions = [
    { text: "Can you explain Newton's laws of motion?", isActive: false },
    { text: "What is the difference between velocity and speed?", isActive: true },
    { text: "Summarize the main themes of Hamlet.", isActive: false },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const text = inputValue;
    setInputValue('');
    setIsLoading(true);

    const userMessage = {
      role: 'user',
      parts: [{ text: text }]
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are a high school teacher. Answer only high school related questions (Math, Physics, Chemistry, Biology, History, etc.). If the user asks about games, movies or personal stuff, politely refuse. Keep answers educational and simple."
      });


      const recentHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));

      const chat = model.startChat({
        history: recentHistory,
      });

      console.log("Sending request to AI...");
      const result = await chat.sendMessage(text);
      const responseText = result.response.text();

      const aiMessage = {
        role: 'model',
        parts: [{ text: responseText }]
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("API Error:", error);
      
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again." }]
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-interface-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>

      <div className={`content-container ${messages.length > 0 ? 'chat-mode' : ''}`}>

        {messages.length === 0 ? (
          <header className="app-header">
            <img src={logo} alt="Logo" className="header-logo" />
            <h1 className="header-title">Ask our AI anything</h1>
          </header>
        ) : (
          <header className="mini-header">
            <img src={logo} alt="Logo" className="mini-logo" />
          </header>
        )}

        <section className="interaction-section">

          {messages.length > 0 && (
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble ${msg.role === 'model' ? 'assistant' : 'user'}`}>
                  <div className="message-content">{msg.parts[0].text}</div>
                </div>
              ))}

              {isLoading && (
                <div className="message-bubble assistant is-typing">
                  Thinking...
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
                    className={`suggestion-item ${item.isActive ? 'is-active' : ''}`}
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
              placeholder="Ask me anything about your lessons..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={sendMessage}>
              <img src={sendIcon} alt="Send" className="send-icon" />
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default ChatInterface;