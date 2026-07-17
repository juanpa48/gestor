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
    // Si se crea en estado "En progreso" y no tiene fecha inicio, registrarla
    if (ticketData.estado === 'En progreso' && !ticketData.fechaInicio) {
      ticketData.fechaInicio = new Date().toLocaleString();
      ticketData.fechaInicioTimestamp = Date.now();
    }
    
    // Si se crea ya resuelto (registro retrospectivo)
    if (ticketData.estado === 'Resuelto' || ticketData.estado === 'Finalizado' || ticketData.estado === 'Cerrado') {
      if (!ticketData.fechaFin) {
        ticketData.fechaFin = new Date().toLocaleString();
        ticketData.fechaFinTimestamp = Date.now();
      }
      
      // Si el usuario proporcionó fechas manuales (string YYYY-MM-DD), generar timestamps para el cálculo
      if (!ticketData.fechaInicioTimestamp && ticketData.fechaInicio) {
        const parsedStart = new Date(ticketData.fechaInicio).getTime();
        if (!isNaN(parsedStart)) ticketData.fechaInicioTimestamp = parsedStart;
      }
      if (!ticketData.fechaFinTimestamp && ticketData.fechaFin) {
        const parsedFin = new Date(ticketData.fechaFin).getTime();
        if (!isNaN(parsedFin)) ticketData.fechaFinTimestamp = parsedFin;
      }
      
      // Calcular tiempo final
      if (ticketData.fechaInicioTimestamp && ticketData.fechaFinTimestamp) {
        const diff = ticketData.fechaFinTimestamp - ticketData.fechaInicioTimestamp;
        ticketData.tiempo = formatDuration(Math.abs(diff)); // Math.abs por si ponen fecha fin antes que inicio
      }
    }

    const response = await DbService.guardarActividad(ticketData);
    if (response.success) {
      await fetchTickets();
    }
    return response;
  };

  const formatDuration = (ms) => {
    const diffSecs = Math.floor(ms / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const totalHours = Math.floor(diffMins / 60);
    
    const secs = diffSecs % 60;
    const mins = diffMins % 60;
    
    const pad = (num) => String(num).padStart(2, '0');
    
    // Formato apto para Excel / Bases de datos: HH:mm:ss (donde HH puede ser mayor a 24)
    return `${pad(totalHours)}:${pad(mins)}:${pad(secs)}`;
  };

  const updateTicket = async (id, updatedFields) => {
    const newActs = actividades.map(a => {
      if (a.id === id) {
        const merged = { ...a, ...updatedFields };
        
        // Registrar fecha de inicio si entra a "En progreso" por primera vez
        if (merged.estado === 'En progreso' && !merged.fechaInicio) {
          merged.fechaInicio = new Date().toLocaleString();
          merged.fechaInicioTimestamp = Date.now();
        }
        
        // Registrar fecha de fin y calcular tiempo si se resuelve/cierra
        if ((merged.estado === 'Resuelto' || merged.estado === 'Finalizado' || merged.estado === 'Cerrado') && !merged.fechaFin) {
          merged.fechaFin = new Date().toLocaleString();
          merged.fechaFinTimestamp = Date.now();
          
          // Calcular el tiempo transcurrido (Columna K) si existe una fecha de inicio registrada
          if (merged.fechaInicioTimestamp) {
            const diff = merged.fechaFinTimestamp - merged.fechaInicioTimestamp;
            merged.tiempo = formatDuration(diff);
          }
        }
        
        return merged;
      }
      return a;
    });
    
    await DbService.saveActividades(newActs);
    // DbService.saveActividades triggers 'ticketActualizado' event, so fetchTickets will be called.
  };

  const addSolicitante = async (solData) => {
    // solData puede ser string (legacy) u objeto {nombre, cargo}
    const rawList = JSON.parse(localStorage.getItem('db_solicitantes')) || [];
    rawList.push(solData);
    await DbService.saveSolicitantes(rawList);

    // Update local state (normalized to strings for dropdown compatibility)
    const nombre = typeof solData === 'object' ? solData.nombre : solData;
    const newSols = [...solicitantes, nombre];
    setSolicitantes(newSols);
  };

  const removeSolicitante = async (index) => {
    const rawList = JSON.parse(localStorage.getItem('db_solicitantes')) || [];
    rawList.splice(index, 1);
    await DbService.saveSolicitantes(rawList);

    const newSols = [...solicitantes];
    newSols.splice(index, 1);
    setSolicitantes(newSols);
  };

  const getSolicitanteCargo = (nombre) => {
    const rawList = JSON.parse(localStorage.getItem('db_solicitantes')) || [];
    const found = rawList.find(s => typeof s === 'object' && s.nombre === nombre);
    return found ? found.cargo || '' : '';
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
    getSolicitanteCargo,
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
