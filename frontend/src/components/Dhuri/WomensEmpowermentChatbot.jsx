import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Shield, Scale, MessageCircle, Sparkles, Users, BookOpen } from 'lucide-react';

const WomensEmpowermentChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to support and empower you. I can help with legal rights, emotional support, workplace issues, domestic violence resources, and much more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const GEMINI_API_KEY = 'AIzaSyBqVOV8quNcRTp03PgY7IjOmVsjHhDpEd8';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompt = `You are a compassionate AI assistant specifically designed to support and empower women. Your role is to:

1. Provide emotional support and encouragement
2. Explain women's legal rights in various contexts (workplace, domestic, reproductive, etc.)
3. Offer guidance on workplace discrimination and harassment
4. Provide resources for domestic violence and abuse situations
5. Share information about women's health and reproductive rights
6. Discuss financial empowerment and career advancement
7. Offer mental health support and coping strategies
8. Provide information about educational opportunities and scholarships
9. Share resources for single mothers and family support

IMPORTANT GUIDELINES:
- Always be supportive, non-judgmental, and empowering
- Provide accurate legal information but clarify you're not a lawyer
- In crisis situations, recommend professional help and emergency services such as registering your complint on this website itself
- Be culturally sensitive and inclusive
- Encourage self-advocacy and empowerment
- Provide practical, actionable advice
- Be encouraging about women's strength and capabilities
- Include relevant resources and organizations when appropriate
- Keep your responses short and crisp

Respond with warmth, understanding, and practical guidance. Always remind users that they are strong, capable, and deserving of respect and support.`;

  const generateResponse = async (userMessage) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser message: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I'm having trouble responding right now. Please try again.";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm experiencing some technical difficulties. Please try again in a moment. If you're in immediate danger, please contact emergency services.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const botResponse = await generateResponse(inputMessage);

    const botMessage = {
      id: Date.now() + 1,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Legal Rights", icon: Scale },
    { text: "Workplace Issues", icon: Users },
    { text: "Emotional Support", icon: Heart },
    { text: "Resources", icon: BookOpen }
  ];

  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
    inputRef.current?.focus();
  };

  return (
    <>
      <style jsx>{`
        /* Base Styles */
        * {
          box-sizing: border-box;
        }

        .empowerment-chatbot {
          min-height: 100vh;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #f3e8ff 100%);
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        .main-container {
          max-width: 64rem;
          margin: 0 auto;
        }

        /* Header Styles */
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .header-icon {
          width: 3rem;
          height: 3rem;
          color: #e11d48;
          margin-right: 0.75rem;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #e11d48, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .subtitle {
          color: #374151;
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0;
        }

        .empowerment-message {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #e11d48;
          flex-wrap: wrap;
        }

        .sparkle-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Chat Container */
        .chat-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #fecaca;
          overflow: hidden;
          height: 70vh;
          display: flex;
          flex-direction: column;
        }

        /* Messages Area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-container {
          display: flex;
        }

        .message-container.user {
          justify-content: flex-end;
        }

        .message-container.bot {
          justify-content: flex-start;
        }

        .message {
          max-width: 80%;
          padding: 1rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .message.user {
          background: linear-gradient(135deg, #e11d48, #ec4899);
          color: white;
        }

        .message.bot {
          background: linear-gradient(135deg, #f3e8ff, #fae8ff);
          color: #7c3aed;
          border: 1px solid #e9d5ff;
        }

        .message-text {
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.5;
        }

        .message-timestamp {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        /* Loading Message */
        .loading-message {
          display: flex;
          justify-content: flex-start;
        }

        .loading-content {
          padding: 1rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #f3e8ff, #fae8ff);
          border: 1px solid #e9d5ff;
          color: #7c3aed;
        }

        .loading-dots {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loading-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: #7c3aed;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.3s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Quick Actions */
        .quick-actions-section {
          padding: 1rem 1.5rem 0;
          border-top: 1px solid #fecaca;
        }

        .quick-actions-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
        }

        .quick-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          border: 1px solid #f9a8d4;
          border-radius: 1.5rem;
          color: #be185d;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-action-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .quick-action-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Input Area */
        .input-section {
          padding: 1.5rem;
          border-top: 1px solid #fecaca;
          background: rgba(255, 255, 255, 0.5);
        }

        .input-container {
          display: flex;
          gap: 1rem;
          align-items: end;
        }

        .message-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid #fecaca;
          border-radius: 0.75rem;
          resize: none;
          min-height: 3rem;
          max-height: 6rem;
          font-family: inherit;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          background: white;
        }

        .message-input:focus {
          outline: none;
          border-color: #f472b6;
          box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.1);
        }

        .message-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-button {
          background: linear-gradient(135deg, #e11d48, #ec4899, #9333ea);
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .footer p {
          margin: 0;
        }

        .footer-highlight {
          color: #e11d48;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .empowerment-chatbot {
            padding: 1rem 0.5rem;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .header-title {
            flex-direction: column;
            text-align: center;
          }
          
          .header-icon {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }

          .chat-container {
            height: 75vh;
          }

          .messages-area {
            padding: 1rem;
          }

          .input-section {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 1.75rem;
            text-align: center;
          }
          
          .empowerment-message {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .message {
            max-width: 95%;
          }

          .quick-actions {
            justify-content: center;
          }

          .input-container {
            flex-direction: column;
            gap: 0.5rem;
          }

          .send-button {
            align-self: flex-end;
            padding: 0.75rem 1.5rem;
          }
        }
      `}</style>

      <div className="empowerment-chatbot">
        <div className="main-container">
          {/* Header */}
          <div className="header">
            <div className="header-title">
              <Shield className="header-icon" />
              <h1 className="main-title">Empowerment Assistant</h1>
            </div>
            <p className="subtitle">
              Your supportive companion for legal guidance, emotional support, and empowerment
            </p>
            <div className="empowerment-message">
              <Sparkles className="sparkle-icon" />
              <span>You are strong, capable, and deserving of respect</span>
              <Sparkles className="sparkle-icon" />
            </div>
          </div>

          {/* Chat Container */}
          <div className="chat-container">
            {/* Messages Area */}
            <div className="messages-area">
              {messages.map((message) => (
                <div key={message.id} className={`message-container ${message.sender}`}>
                  <div className={`message ${message.sender}`}>
                    <div className="message-text">
                    {message.sender === 'bot' ? 
                      message.text.split(/(\*\*.*?\*\*)/).map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={index}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      }) : 
                      message.text
                    }
                  </div>
                    <div className="message-timestamp">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="loading-message">
                  <div className="loading-content">
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <p className="quick-actions-label">Quick topics:</p>
              <div className="quick-actions">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    className="quick-action-btn"
                  >
                    <action.icon className="quick-action-icon" />
                    {action.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="input-section">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your rights, legal issues, emotional support, or empowerment..."
                  disabled={isLoading}
                  className="message-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="send-button"
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p>
              Remember: You deserve respect, support, and empowerment. 
              <span className="footer-highlight"> You are not alone.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WomensEmpowermentChatbot;