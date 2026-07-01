import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DbService } from '../services/DbService';

const TicketContext = createContext();

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const [actividades, setActividades] = useState([]);
  const [solicitantes, setSolicitantes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await DbService.getActividades();
      setActividades(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [tickets, sols, resps] = await Promise.all([
        DbService.getActividades(),
        DbService.getSolicitantes(),
        DbService.getResponsables()
      ]);
      setActividades(tickets);
      setSolicitantes(sols);
      setResponsables(resps);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Hook into our custom events for sync
  useEffect(() => {
    const handleTicketUpdate = () => {
      fetchTickets();
    };

    window.addEventListener('actividadGuardada', handleTicketUpdate);
    window.addEventListener('ticketActualizado', handleTicketUpdate);

    return () => {
      window.removeEventListener('actividadGuardada', handleTicketUpdate);
      window.removeEventListener('ticketActualizado', handleTicketUpdate);
    };
  }, [fetchTickets]);

  const addTicket = async (ticketData) => {
    const response = await DbService.guardarActividad(ticketData);
    if (response.success) {
      await fetchTickets();
    }
    return response;
  };

  const updateTicket = async (id, updatedFields) => {
    const newActs = actividades.map(a => 
      a.id === id ? { ...a, ...updatedFields } : a
    );
    await DbService.saveActividades(newActs);
    // DbService.saveActividades triggers 'ticketActualizado' event, so fetchTickets will be called.
  };

  const value = {
    actividades,
    solicitantes,
    responsables,
    loading,
    addTicket,
    updateTicket,
    refreshTickets: fetchTickets
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
