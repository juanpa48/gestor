import React from 'react';
import { NavLink } from 'react-router-dom';
import { useActiveArea } from '../../contexts/ActiveAreaContext';

export const Sidebar = () => {
  const { area, config } = useActiveArea();

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
      </nav>
    </aside>
  );
};
