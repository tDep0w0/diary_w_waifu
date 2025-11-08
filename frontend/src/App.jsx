import './App.css'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import DiaryPage from './pages/DiaryPage'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <Router>
      <div className="app">
        {/* Các nút chuyển trang */}
        <NavBar />

        {/* Hiển thị trang tương ứng */}
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/diary" element={<DiaryPage />} />
        </Routes>
      </div>
    </Router>
  )
}
