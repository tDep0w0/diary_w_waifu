import './ChatPage.css'

import startLogo from '../assets/start-logo.png';

export default function ChatPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      textAlign: 'center',
      paddingTop: '20vh'
    }}>
      <img src={startLogo} alt="Start Logo" style={{ width: '150px'}} />
      <p>Hey! I'm Fura, <br/> How has your day been so far!?</p>

      {/* Chat Bar*/}
      <div className="chat-bar">
        <input
          type="text"
          placeholder="Talk to Fuze..."
          className="chat-input"

        />
        <button className="chat-send">Send</button>
      </div>
    </div>
  );
}
