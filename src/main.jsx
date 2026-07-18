import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/main.css'
import App from './App.jsx'
import { GEProvider } from './areas/gestion-empresarial/context/GEContext'
import { NotificationProvider } from './shared/contexts/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GEProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </GEProvider>
  </StrictMode>,
)
