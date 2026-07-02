import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const STORAGE_KEY = 'db_notificaciones';
  const MAX_ITEMS = 30;

  const [notificaciones, setNotificaciones] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }, []);

  const save = useCallback((items) => {
    const sliced = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sliced));
    setNotificaciones(sliced);
  }, []);

  useEffect(() => {
    setNotificaciones(load());
    
    // Sincronizar estado entre múltiples pestañas (Portal vs Dashboard)
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setNotificaciones(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [load]);

  const addNotification = useCallback((titulo, texto) => {
    const items = load();
    const newNotif = {
      id: 'N-' + Date.now(),
      titulo,
      texto,
      fecha: new Date().toLocaleString(),
      leida: false
    };
    items.unshift(newNotif);
    save(items);
  }, [load, save]);

  const markAllRead = useCallback(() => {
    const items = load().map(n => ({ ...n, leida: true }));
    save(items);
  }, [load, save]);

  const clearNotifications = useCallback(() => {
    save([]);
  }, [save]);

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => {
      const willOpen = !prev;
      if (willOpen) {
        markAllRead();
      }
      return willOpen;
    });
  }, [markAllRead]);
  
  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  // Listeners for global events to add notifications
  useEffect(() => {
    const handleNuevoTicket = () => {
      // Small delay to allow DbService to finish saving before we read
      setTimeout(() => {
        try {
          const acts = JSON.parse(localStorage.getItem('db_actividades')) || [];
          const ultimo = acts.length ? acts[acts.length - 1] : null;
          if (ultimo) {
            addNotification(`Nuevo ticket: ${ultimo.id || ''}`, `${ultimo.solicitante || ultimo.nombre || 'Un colaborador'} registró una solicitud.`);
          } else {
            addNotification('Nuevo ticket', 'Se registró una nueva actividad.');
          }
        } catch (e) {
          addNotification('Nuevo ticket', 'Se registró una nueva actividad.');
        }
      }, 100);
    };

    window.addEventListener('actividadGuardada', handleNuevoTicket);

    return () => {
      window.removeEventListener('actividadGuardada', handleNuevoTicket);
    };
  }, [addNotification]);

  const value = {
    notificaciones,
    unreadCount,
    panelOpen,
    togglePanel,
    closePanel,
    addNotification,
    clearNotifications,
    markAllRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
