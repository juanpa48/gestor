import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { PanelPrincipal } from './pages/dashboard/PanelPrincipal'
import { Actividades } from './pages/dashboard/Actividades'
import { Gestion } from './pages/dashboard/Gestion'
import { Portal } from './pages/Portal'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<PanelPrincipal />} />
          <Route path="actividades" element={<Actividades />} />
          <Route path="gestion" element={<Gestion />} />
        </Route>
        
        <Route path="/portal" element={<Portal />} />
      </Routes>
    </Router>
  )
}

export default App
