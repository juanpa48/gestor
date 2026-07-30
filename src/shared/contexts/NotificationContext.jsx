import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const STORAGE_KEY = 'db_notificaciones';
  const MAX_ITEMS = 30;

  const [notificaciones, setNotificaciones] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiClient('/notificaciones');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }, []);

  const save = useCallback(async (items) => {
    const sliced = items.slice(0, MAX_ITEMS);
    try {
      await apiClient('/notificaciones', {
        method: 'PUT',
        body: JSON.stringify({ notificaciones: sliced })
      });
      setNotificaciones(sliced);
    } catch (e) {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    const data = await load();
    setNotificaciones(data);
  }, [load]);

  useEffect(() => {
    fetchNotifs();
    
    // Sincronizar estado usando Short Polling (cada 30s) en lugar de 'storage' event
    const intervalId = setInterval(() => {
      fetchNotifs();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifs]);

  const addNotification = useCallback(async (titulo, texto) => {
    const items = await load();
    const newNotif = {
      id: 'N-' + Date.now(),
      titulo,
      texto,
      fecha: new Date().toLocaleString(),
      leida: false
    };
    items.unshift(newNotif);
    await save(items);
  }, [load, save]);

  const markAllRead = useCallback(async () => {
    const items = await load();
    const updated = items.map(n => ({ ...n, leida: true }));
    await save(updated);
  }, [load, save]);

  const clearNotifications = useCallback(async () => {
    await save([]);
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
    const handleNuevoTicket = (e) => {
      const ticket = e.detail?.ticket;
      
      // Small delay to allow visual updates first if needed
      setTimeout(() => {
        if (ticket) {
          addNotification(`Nuevo ticket: ${ticket.id || ''}`, `${ticket.solicitante || ticket.nombre || 'Un colaborador'} registró una solicitud.`);
        } else {
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
