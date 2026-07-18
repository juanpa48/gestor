import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './shared/components/layout/DashboardLayout'
import { PanelPrincipal } from './areas/gestion-empresarial/pages/PanelPrincipal'
import { Actividades } from './areas/gestion-empresarial/pages/Actividades'
import { Gestion } from './areas/gestion-empresarial/pages/Gestion'
import { Portal } from './pages/Portal'

import { Database } from './pages/Database'

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
        <Route path="/portal/:area" element={<Portal />} />
        <Route path="/database" element={<Database />} />
      </Routes>
    </Router>
  )
}

export default App
