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
import { PortalProtectedRoute } from './shared/components/layout/PortalProtectedRoute'
import { Login } from './pages/auth/Login'
import { PortalLogin } from './pages/auth/PortalLogin'

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
        
        <Route path="/portal/login" element={<PortalLogin />} />
        
        <Route path="/portal" element={
          <PortalProtectedRoute>
            <Portal />
          </PortalProtectedRoute>
        } />
        
        <Route path="/portal/:area" element={
          <PortalProtectedRoute>
            <Portal />
          </PortalProtectedRoute>
        } />
        
        <Route path="/database" element={<Navigate to="/database/ge" replace />} />
        <Route path="/database/:area" element={
          <ProtectedRoute adminOnly={true}>
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
