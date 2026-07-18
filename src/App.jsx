import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './shared/components/layout/DashboardLayout'
import { PanelPrincipal } from './pages/dashboard/PanelPrincipal'
import { Actividades } from './pages/dashboard/Actividades'
import { Gestion } from './pages/dashboard/Gestion'
import { Portal } from './pages/Portal'

import { ActiveAreaProvider } from './shared/contexts/ActiveAreaContext'
import { AreaDatabase } from './pages/database/AreaDatabase'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        
        <Route path="/dashboard/:area" element={
          <ActiveAreaProvider>
            <DashboardLayout />
          </ActiveAreaProvider>
        }>
          <Route index element={<PanelPrincipal />} />
          <Route path="actividades" element={<Actividades />} />
          <Route path="gestion" element={<Gestion />} />
        </Route>
        
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/:area" element={<Portal />} />
        
        <Route path="/database" element={<Navigate to="/database/ge" replace />} />
        <Route path="/database/:area" element={
          <ActiveAreaProvider>
            <AreaDatabase />
          </ActiveAreaProvider>
        } />
      </Routes>
    </Router>
  )
}

export default App
