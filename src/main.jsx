import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/main.css'
import App from './App.jsx'
import { GEProvider } from './areas/gestion-empresarial/context/GEContext'
import { GHProvider } from './areas/gestion-humana/context/GHContext'
import { TIProvider } from './areas/soporte-ti/context/TIContext'
import { NotificationProvider } from './shared/contexts/NotificationContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GEProvider>
      <GHProvider>
        <TIProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </TIProvider>
      </GHProvider>
    </GEProvider>
  </StrictMode>,
)
