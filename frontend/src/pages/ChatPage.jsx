import './ChatPage.css'
import LoadingBubble from '../components/LoadingBubble';


import startLogo from '../assets/start-logo.png';
import chatSendButton from '../assets/chat-sent-button.svg';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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


  const handleSend = async () => {
    if (message.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user'
    };


    setMessage('');
    setMessages(prev => [...prev, userMessage, {
      id: Date.now(),
      text: "Loading...",
      sender: 'bot',
    }]);
    setHasStarted(true); 
    setIsLoading(true);





// DELETE AFTER OPEN AI WORKS
    setTimeout(() => {
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.findLastIndex(msg => msg.sender === 'bot' && msg.text === "Loading...");
        if (lastIndex !== -1) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            text: "Thật tuyệt khi nghe vậy"
          };
        }
        return updatedMessages;
      });
      setIsLoading(false);
    }, 1000);
// DELETE AFTER OPEN AI WORKS





    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chat/
        ${encodeURIComponent(message)}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let streamedContent = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        console.log(chunk);
        

        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            id: updatedMessages[updatedMessages.length - 1].id,
            text: streamedContent,
            sender: 'bot',
          };
          return updatedMessages;
        })
      }

      setIsLoading(false)
      
    } catch (error) {
      console.error(error);
    }
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
            msg.sender === 'bot' ? (
              <div key={msg.id} className="chat-message-row bot">
                <img src={startLogo} alt="Bot Avatar" className="chat-avatar" />
                <div className="chat-message bot">
                  {isLoading && msg.text === "Loading..." ? <LoadingBubble /> : msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="chat-message-row user">
                <div className="chat-message user">
                  {msg.text}
                </div>
              </div>
            )
          ))}
        </div>
      )}


      {/* Chat Bar */}
      <div className={`chat-bar ${hasStarted ? 'at-bottom' : 'at-center'}`}>
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
