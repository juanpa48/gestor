import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

export const NotificationCenter = () => {
  const { 
    notificaciones, 
    unreadCount, 
    panelOpen, 
    togglePanel, 
    closePanel, 
    clearNotifications 
  } = useNotifications();

  const panelRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        closePanel();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') closePanel();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [panelOpen, closePanel]);

  return (
    <div className="notif-wrap">
      <button 
        ref={btnRef}
        className="icon-btn notif" 
        title="Notificaciones" 
        onClick={togglePanel}
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div 
        ref={panelRef}
        className={`notif-panel ${panelOpen ? 'open' : ''}`} 
        role="region" 
        aria-label="Notificaciones"
      >
        <div className="notif-header">
          <span className="notif-header-title">Notificaciones</span>
          <button className="notif-clear" type="button" onClick={clearNotifications}>
            Limpiar
          </button>
        </div>
        
        <div className="notif-list">
          {notificaciones.length === 0 ? (
            <div className="notif-empty">
              <i className="fa-regular fa-bell-slash"></i>
              <span>Sin notificaciones</span>
            </div>
          ) : (
            notificaciones.map(n => (
              <div key={n.id} className={`notif-item ${n.leida ? '' : 'unread'}`}>
                <div className="notif-item-icon">
                  <i className="fa-solid fa-ticket"></i>
                </div>
                <div className="notif-item-body">
                  <div className="notif-item-title">{n.titulo || 'Nuevo ticket'}</div>
                  <div className="notif-item-text">{n.texto || ''}</div>
                  <div className="notif-item-time">{n.fecha || ''}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
