import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './shared/components/layout/DashboardLayout'
import { PanelPrincipal } from './pages/dashboard/PanelPrincipal'
import { Actividades } from './pages/dashboard/Actividades'
import { Gestion } from './pages/dashboard/Gestion'
import { SettingsLayout } from './pages/dashboard/settings/SettingsLayout'
import { SettingsFestivos } from './pages/dashboard/settings/views/SettingsFestivos'
import { SettingsTramites } from './pages/dashboard/settings/views/SettingsTramites'
import { SettingsSLA } from './pages/dashboard/settings/views/SettingsSLA'
import { SettingsUsuarios } from './pages/dashboard/settings/views/SettingsUsuarios'
import { SettingsClientes } from './pages/dashboard/settings/views/SettingsClientes'
import { ReportesGH } from './pages/dashboard/ReportesGH'
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
          <Route path="reportes" element={<ReportesGH />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="tramites" replace />} />
            <Route path="usuarios" element={<SettingsUsuarios />} />
            <Route path="tramites" element={<SettingsTramites />} />
            <Route path="sla" element={<SettingsSLA />} />
            <Route path="festivos" element={<SettingsFestivos />} />
            <Route path="clientes" element={<SettingsClientes />} />
          </Route>
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
