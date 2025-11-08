import { Link, useLocation } from 'react-router-dom'
import './NavBar.css'

import chatButton from '../assets/chat-button.svg'
import clickedChatButton from '../assets/clicked-chat-button.svg'
import diaryButton from '../assets/diary-button.svg'
import clickedDiaryButton from '../assets/clicked-diary-button.svg'

export default function NavBar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <Link to="/chat">
        <img
          src={location.pathname === '/chat' ? clickedChatButton : chatButton}
          alt="Chat Button"
        />
      </Link>
      <Link to="/diary">
        <img
          src={location.pathname === '/diary' ? clickedDiaryButton : diaryButton}
          alt="Diary Button"
        />
      </Link>
    </nav>
  )
}
