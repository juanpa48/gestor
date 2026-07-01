import React from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Topbar = () => {
  const location = useLocation();
  const showSearch = location.pathname.includes('/actividades') || location.pathname.includes('/gestion');

  const handleSearch = (e) => {
    const value = e.target.value;
    // Disparamos el evento para mantener compatibilidad con cualquier listener actual/futuro
    document.dispatchEvent(new CustomEvent('searchTriggered', { detail: { query: value } }));
  };

  return (
    <header className="topbar">
      <div className="search-wrapper" style={{ display: showSearch ? 'block' : 'none' }}>
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input 
          type="text" 
          className="search-input" 
          id="searchInput" 
          placeholder="Buscar..." 
          onChange={handleSearch}
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" title="Configuración">
          <i className="fa-solid fa-gear"></i>
        </button>
        
        <NotificationCenter />
        
        <button className="icon-btn" title="Perfil">
          <i className="fa-solid fa-user"></i>
        </button>
      </div>
    </header>
  );
};
