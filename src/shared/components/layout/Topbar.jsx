import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveArea } from '../../contexts/ActiveAreaContext';

export const Topbar = () => {
  const { logout, currentUser } = useAuth();
  const { area } = useActiveArea();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = location.pathname.includes('/actividades') || location.pathname.includes('/gestion');

  const handleSearch = (e) => {
    const value = e.target.value;
    // Disparamos el evento para mantener compatibilidad con cualquier listener actual/futuro
    document.dispatchEvent(new CustomEvent('searchTriggered', { detail: { query: value } }));
  };

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <button className="icon-btn" title="Configuración" onClick={() => navigate(`/dashboard/${area}/settings`)}>
          <i className="fa-solid fa-gear"></i>
        </button>
        
        <NotificationCenter />
        
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button 
            className={`icon-btn ${isProfileOpen ? 'active' : ''}`} 
            title="Perfil" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <i className="fa-solid fa-user"></i>
          </button>
          
          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <span className="profile-name">{currentUser?.username || 'Usuario'}</span>
                <span className="profile-role">{currentUser?.role === 'admin_ti' ? 'Admin TI' : 'Gestora'}</span>
              </div>
              <div className="profile-dropdown-divider"></div>
              <button className="profile-dropdown-item text-danger" onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
