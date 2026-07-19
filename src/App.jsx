import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './shared/components/layout/DashboardLayout'
import { PanelPrincipal } from './pages/dashboard/PanelPrincipal'
import { Actividades } from './pages/dashboard/Actividades'
import { Gestion } from './pages/dashboard/Gestion'
import { Settings } from './pages/dashboard/Settings'
import { Portal } from './pages/Portal'

import { ActiveAreaProvider } from './shared/contexts/ActiveAreaContext'
import { AreaDatabase } from './pages/database/AreaDatabase'
import { AuthProvider } from './shared/contexts/AuthContext'
import { ProtectedRoute } from './shared/components/layout/ProtectedRoute'
import { Login } from './pages/auth/Login'

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard/:area" element={
          <ProtectedRoute>
            <ActiveAreaProvider>
              <DashboardLayout />
            </ActiveAreaProvider>
          </ProtectedRoute>
        }>
          <Route index element={<PanelPrincipal />} />
          <Route path="actividades" element={<Actividades />} />
          <Route path="gestion" element={<Gestion />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/:area" element={<Portal />} />
        
        <Route path="/database" element={<Navigate to="/database/ge" replace />} />
        <Route path="/database/:area" element={
          <ProtectedRoute>
            <ActiveAreaProvider>
              <AreaDatabase />
            </ActiveAreaProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
