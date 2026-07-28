import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useActiveArea } from '../../../shared/contexts/ActiveAreaContext';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const SettingsLayout = () => {
  const { area } = useActiveArea();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin_ti'; // Only admins can see users
  const navigate = useNavigate();

  return (
    <div className="page-content fade-in" style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
      <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="settings-title-group" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="settings-icon-box">
            <i className="fa-solid fa-gears"></i>
          </div>
          <div>
            <h1>Configuración del Sistema</h1>
            <p>Administra los parámetros de tu área de gestión</p>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard/ti/settings')} className={`btn-secondary ${area === 'ti' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', border: area === 'ti' ? '1.5px solid var(--navy)' : '1px solid rgba(0,0,0,0.1)' }}>
              Soporte TI
            </button>
            <button onClick={() => navigate('/dashboard/ge/settings')} className={`btn-secondary ${area === 'ge' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', border: area === 'ge' ? '1.5px solid var(--navy)' : '1px solid rgba(0,0,0,0.1)' }}>
              Gestión Empresarial
            </button>
            <button onClick={() => navigate('/dashboard/gh/settings')} className={`btn-secondary ${area === 'gh' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', border: area === 'gh' ? '1.5px solid var(--navy)' : '1px solid rgba(0,0,0,0.1)' }}>
              Gestión Humana
            </button>
          </div>
        )}
      </div>

      <div className="settings-container" style={{ display: 'flex', gap: '20px', marginTop: '20px', alignItems: 'flex-start' }}>
        {/* SIDEBAR NAVEGACIÓN */}
        <div className="settings-sidebar glass-panel" style={{ width: '250px', flexShrink: 0, padding: '15px' }}>
          <nav className="settings-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isAdmin && area === 'ti' && (
              <NavLink 
                to={`/dashboard/${area}/settings/usuarios`} 
                className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
                style={{ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
              >
                <i className="fa-solid fa-users-gear" style={{ width: '20px', textAlign: 'center' }}></i>
                <span style={{ fontWeight: '500' }}>Gestión de Usuarios</span>
              </NavLink>
            )}
            
            <NavLink 
              to={`/dashboard/${area}/settings/tramites`} 
              className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
              style={{ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
            >
              <i className="fa-solid fa-folder-tree" style={{ width: '20px', textAlign: 'center' }}></i>
              <span style={{ fontWeight: '500' }}>Grupos y Trámites</span>
            </NavLink>

            {area === 'ti' && (
              <NavLink 
                to={`/dashboard/${area}/settings/clientes`} 
                className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
                style={{ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
              >
                <i className="fa-solid fa-users" style={{ width: '20px', textAlign: 'center' }}></i>
                <span style={{ fontWeight: '500' }}>Directorio Clientes</span>
              </NavLink>
            )}

            {area !== 'gh' && (
              <NavLink 
                to={`/dashboard/${area}/settings/sla`} 
                className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
                style={{ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
              >
                <i className="fa-solid fa-stopwatch" style={{ width: '20px', textAlign: 'center' }}></i>
                <span style={{ fontWeight: '500' }}>Acuerdos SLA</span>
              </NavLink>
            )}

            <NavLink 
              to={`/dashboard/${area}/settings/festivos`} 
              className={({ isActive }) => `settings-nav-item ${isActive ? 'active' : ''}`}
              style={{ padding: '10px 15px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
            >
              <i className="fa-solid fa-calendar-day" style={{ width: '20px', textAlign: 'center' }}></i>
              <span style={{ fontWeight: '500' }}>Días Festivos</span>
            </NavLink>
          </nav>
        </div>

        {/* CONTENIDO PRINCIPAL DINÁMICO */}
        <div className="settings-content" style={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
