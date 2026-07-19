import React from 'react';
import { NavLink } from 'react-router-dom';
import { useActiveArea } from '../../contexts/ActiveAreaContext';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const { area, config } = useActiveArea();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin_ti';

  const NAV_ITEMS = [
    { path: `/dashboard/${area}`, icon: 'fa-border-all', label: 'Panel Principal', exact: true },
    { path: `/dashboard/${area}/actividades`, icon: 'fa-clipboard-list', label: 'Actividades' },
    { path: `/dashboard/${area}/gestion`, icon: 'fa-tasks', label: 'Gestión' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/img/acyt.png" alt="Logo de Empresa" />
      </div>
      <div className="sidebar-section-title" style={{ color: config.color }}>
        <i className={`fa-solid ${config.icono}`} style={{ marginRight: '8px' }}></i>
        {config.nombre}
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to={`/database/${area}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}
          >
            <i className="fa-solid fa-database"></i>
            <span>Base de Datos</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
