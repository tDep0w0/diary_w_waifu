import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AIResProvider } from './context/AIResContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AIResProvider>
      <App />
    </AIResProvider>
  </StrictMode>,
)
