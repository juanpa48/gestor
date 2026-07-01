import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import App from './App.jsx'
import { TicketProvider } from './contexts/TicketContext'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TicketProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </TicketProvider>
  </StrictMode>,
)
