import { useEffect } from 'react';
import { useTickets } from '../contexts/TicketContext';
import { NotificationHelper } from '../services/NotificationHelper';

export const useStorageSync = () => {
  const { refreshTickets, actividades } = useTickets();

  useEffect(() => {
    // Pedimos permiso para notificaciones nativas al montar
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Si el cambio viene de db_actividades y no fuimos nosotros en la misma pestaña
      if (e.key === 'db_actividades') {
        const newValue = JSON.parse(e.newValue || '[]');
        const oldValue = JSON.parse(e.oldValue || '[]');

        // Detectar si es una INSERCIÓN nueva (ticket creado en el portal)
        if (newValue.length > oldValue.length) {
          const newTicket = newValue[newValue.length - 1];
          
          // 1. Refrescar el estado global de tickets (Contexto)
          refreshTickets();
          
          // 2. Notificación nativa y sonido si estamos en el dashboard
          // (Si el cambio vino de OTRA pestaña de portal, e.key es detectado)
          if (window.location.pathname.includes('/dashboard')) {
             NotificationHelper.notify(
               `Nuevo Ticket: ${newTicket.id}`,
               `${newTicket.nombre || 'Colaborador'} ha registrado una solicitud.`
             );
          }
        } else {
          // Fue una actualización (ej. cambio de estado), solo refrescamos la data
          refreshTickets();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshTickets, actividades.length]);
};
