import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'fa-border-all', label: 'Panel Principal', exact: true },
  { path: '/dashboard/actividades', icon: 'fa-clipboard-list', label: 'Actividades' },
  { path: '/dashboard/gestion', icon: 'fa-tasks', label: 'Gestión' },
];

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/img/Logo.png" alt="Logo de Empresa" />
      </div>
      <div className="sidebar-section-title">Estado del Sistema</div>
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
      </nav>
    </aside>
  );
};
