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

  const addSolicitante = async (nombre) => {
    const newSols = [...solicitantes, nombre];
    setSolicitantes(newSols);
    await DbService.saveSolicitantes(newSols);
  };

  const removeSolicitante = async (index) => {
    const newSols = [...solicitantes];
    newSols.splice(index, 1);
    setSolicitantes(newSols);
    await DbService.saveSolicitantes(newSols);
  };

  const addResponsable = async (respData) => {
    // DbService getResponsables can return an array of strings, but originally it stored objects too.
    // If it's a string array, we just push the name. To support objects, we push the object.
    // Let's assume we store the object for full fidelity: {nombre, cargo, foto}
    
    // Actually, getting from localStorage directly returns whatever is there.
    // We should get raw list from localStorage, update it, and then update our state.
    const rawList = JSON.parse(localStorage.getItem('db_responsables')) || [];
    rawList.push(respData);
    await DbService.saveResponsables(rawList);
    
    // Update local state (which expects strings according to DbService.getResponsables mapping)
    const newResps = [...responsables, respData.nombre];
    setResponsables(newResps);
  };

  const removeResponsable = async (index) => {
    const rawList = JSON.parse(localStorage.getItem('db_responsables')) || [];
    rawList.splice(index, 1);
    await DbService.saveResponsables(rawList);
    
    const newResps = [...responsables];
    newResps.splice(index, 1);
    setResponsables(newResps);
  };

  const value = {
    actividades,
    solicitantes,
    responsables,
    loading,
    addTicket,
    updateTicket,
    addSolicitante,
    removeSolicitante,
    addResponsable,
    removeResponsable,
    refreshTickets: fetchTickets
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
