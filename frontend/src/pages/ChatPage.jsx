import './ChatPage.css'

import startLogo from '../assets/start-logo.png';
import chatSendButton from '../assets/chat-sent-button.svg';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const messageListRef = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (hasStarted && introRef.current) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setShowMessages(true); // Hiển thị tin nhắn sau khi intro biến mất
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [hasStarted]);


  const handleSend = () => {
    if (message.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user'
    };

    const botReply = {
      id: Date.now() + 1, 
      text: 'Thật tuyệt khi nghe vậy!',
      sender: 'bot'
    };

    setMessages(prev => [...prev, userMessage, botReply]);
    setMessage('');
    setHasStarted(true); 
  };


  return (
    <div className={`chat-container ${hasStarted ? 'started' : ''}`}>
      {isVisible && (
        <div
          ref={introRef}
          className={`intro-section ${hasStarted ? 'fade-out' : ''}`} 
        >
          <img src={startLogo} alt="Start Logo" className="intro-logo" />
          <p>Hey! I'm Fura, <br /> How has your day been so far!?</p>
        </div>
      )}

      {/* Message-list */}
      {showMessages && (
        <div
          className={`chat-message-list ${showMessages ? 'visible' : ''}`}
          ref={messageListRef}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
      )}


      {/* Chat Bar */}
      <div className="chat-bar fixed-bottom">
        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder="Talk to Fuze..."
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <button
            className="chat-send-button"
            onClick={handleSend}
          >
            <img
              src={chatSendButton}
              alt="Send"
              className="chat-send-icon"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
