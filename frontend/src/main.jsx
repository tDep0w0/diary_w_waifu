import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AIResProvider } from './context/AIResContext.jsx'
import { DateProvider } from './context/DateContext.jsx'
import { LogProvider } from './context/LogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AIResProvider>
      <DateProvider>
        <LogProvider>
          <App />
        </LogProvider>
      </DateProvider>
    </AIResProvider>
  </StrictMode>,
)
