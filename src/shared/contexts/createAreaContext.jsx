import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DbService } from '../services/DbService';
import { calculateWorkingMilliseconds } from '../utils/businessHours';
import { apiClient } from '../services/api';

export const createAreaContext = (config) => {
  const {
    storageKey = 'db_actividades',
    responsablesKey = 'db_responsables',
    prefijo = 'TKT'
  } = config;

  const AreaContext = createContext();

  const useAreaContext = () => useContext(AreaContext);

  const AreaProvider = ({ children }) => {
    const [actividades, setActividades] = useState([]);
    const [solicitantes, setSolicitantes] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
      try {
        await DbService.autoCloseTickets(storageKey, 72); // 72 horas (3 días)
        const data = await DbService.getActividades(storageKey);
        setActividades(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    }, [storageKey]);

    const loadInitialData = useCallback(async () => {
      setLoading(true);
      try {
        await DbService.autoCloseTickets(storageKey, 72);
        const [tickets, sols, resps, festivos] = await Promise.all([
          DbService.getActividades(storageKey),
          DbService.getSolicitantes(),
          DbService.getResponsables(responsablesKey),
          DbService.getFestivos()
        ]);
        setActividades(tickets);
        setSolicitantes(sols);
        setResponsables(resps);
        window.__FESTIVOS_CACHE = festivos;
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    }, [storageKey, responsablesKey]);

    useEffect(() => {
      loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
      const handleTicketUpdate = () => {
        fetchTickets();
      };

      window.addEventListener('actividadGuardada', handleTicketUpdate);
      window.addEventListener('ticketActualizado', handleTicketUpdate);

      // Polling cada 15 segundos para sincronización entre pestañas (Short Polling)
      const intervalId = setInterval(() => {
        fetchTickets();
      }, 15000);

      return () => {
        window.removeEventListener('actividadGuardada', handleTicketUpdate);
        window.removeEventListener('ticketActualizado', handleTicketUpdate);
        clearInterval(intervalId);
      };
    }, [fetchTickets]);

    const formatDuration = (ms) => {
      const diffSecs = Math.floor(ms / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const totalHours = Math.floor(diffMins / 60);
      
      const secs = diffSecs % 60;
      const mins = diffMins % 60;
      
      const pad = (num) => String(num).padStart(2, '0');
      return `${pad(totalHours)}:${pad(mins)}:${pad(secs)}`;
    };

    const addTicket = async (ticketData) => {
      if (ticketData.estado === 'En progreso' && !ticketData.fechaInicio) {
        ticketData.fechaInicio = new Date().toLocaleString();
        ticketData.fechaInicioTimestamp = Date.now();
      }
      
      if (ticketData.estado === 'Resuelto' || ticketData.estado === 'Finalizado' || ticketData.estado === 'Cerrado') {
        if (!ticketData.fechaFin) {
          ticketData.fechaFin = new Date().toLocaleString();
          ticketData.fechaFinTimestamp = Date.now();
        }
        
        if (!ticketData.fechaInicioTimestamp && ticketData.fechaInicio) {
          const parsedStart = new Date(ticketData.fechaInicio).getTime();
          if (!isNaN(parsedStart)) ticketData.fechaInicioTimestamp = parsedStart;
        }
        if (!ticketData.fechaFinTimestamp && ticketData.fechaFin) {
          const parsedFin = new Date(ticketData.fechaFin).getTime();
          if (!isNaN(parsedFin)) ticketData.fechaFinTimestamp = parsedFin;
        }
        
        if (ticketData.fechaInicioTimestamp && ticketData.fechaFinTimestamp) {
          const diff = ticketData.fechaFinTimestamp - ticketData.fechaInicioTimestamp;
          ticketData.tiempo = formatDuration(Math.abs(diff));
        }
      }

      const response = await DbService.guardarActividad(ticketData, storageKey, prefijo);
      if (response.success) {
        await fetchTickets();
      }
      return response;
    };

    const updateTicket = async (id, updatedFields) => {
      const newActs = actividades.map(a => {
        if (a.id === id) {
          const merged = { ...a, ...updatedFields };
          
          if (merged.estado === 'En progreso' && !merged.fechaInicio) {
            merged.fechaInicio = new Date().toLocaleString();
            merged.fechaInicioTimestamp = Date.now();
          }

          // Lógica SLA: Suspender / Pausar
          if (merged.estado === 'Suspendido' && a.estado !== 'Suspendido') {
            merged.fechaPausa = Date.now();
          }
          if (a.estado === 'Suspendido' && merged.estado !== 'Suspendido' && a.fechaPausa) {
            const pausedTime = calculateWorkingMilliseconds(a.fechaPausa, Date.now());
            merged.tiempoPausadoTotal = (a.tiempoPausadoTotal || 0) + pausedTime;
            merged.fechaPausa = null;
          }
          
          if ((merged.estado === 'Resuelto' || merged.estado === 'Finalizado' || merged.estado === 'Cerrado') && !merged.fechaFin) {
            merged.fechaFin = new Date().toLocaleString();
            merged.fechaFinTimestamp = Date.now();
            
            if (merged.fechaInicioTimestamp) {
              const diff = merged.fechaFinTimestamp - merged.fechaInicioTimestamp;
              const netTime = diff - (merged.tiempoPausadoTotal || 0);
              merged.tiempo = formatDuration(netTime > 0 ? netTime : 0);
            }
          }
          
          return merged;
        }
        return a;
      });
      
      await DbService.saveActividades(newActs, storageKey);
    };

    const addSolicitante = async (solData) => {
      // Los solicitantes ahora son usuarios; se crean desde el panel de usuarios
      const nombre = typeof solData === 'object' ? solData.nombre : solData;
      const newSols = [...solicitantes, nombre];
      setSolicitantes(newSols);
    };

    const removeSolicitante = async (index) => {
      const newSols = [...solicitantes];
      newSols.splice(index, 1);
      setSolicitantes(newSols);
    };

    const getSolicitanteCargo = async (nombre) => {
      try {
        const users = await apiClient('/usuarios');
        const found = users.find(u => u.role === 'solicitante' && (u.nombreReal === nombre || u.username === nombre));
        return found ? found.cargo || '' : '';
      } catch (error) {
        console.error('Error fetching cargo:', error);
        return '';
      }
    };

    const addResponsable = async (respData) => {
      const newResps = [...responsables, respData];
      setResponsables(newResps);
    };

    const removeResponsable = async (index) => {
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
      <AreaContext.Provider value={value}>
        {children}
      </AreaContext.Provider>
    );
  };

  return { AreaProvider, useAreaContext };
};
