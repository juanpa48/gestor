import { apiClient } from './api';

export const DbService = {
  getSolicitantes: async () => {
    try {
      const users = await apiClient('/usuarios');
      return users
        .filter(u => u.role === 'solicitante')
        .map(u => u.nombreReal || u.username);
    } catch (error) {
      console.error('Error fetching solicitantes:', error);
      return [];
    }
  },

  saveSolicitantes: async (sols) => {
    return { success: true };
  },
  
  getResponsables: async (areaOrKey = 'db_responsables') => {
    try {
      const areaId = areaOrKey.replace('db_responsables_', '');
      const users = await apiClient('/usuarios');
      
      return users
        .filter(u => u.area === areaId && u.role !== 'solicitante')
        .map(u => ({ nombre: u.nombreReal, cargo: u.cargo || 'Gestor' }));
    } catch (error) {
      console.error('Error fetching responsables:', error);
      return [];
    }
  },

  saveResponsables: async (resps, key = 'db_responsables') => {
    return { success: true };
  },

  getFestivos: async () => {
    try {
      return await apiClient('/festivos');
    } catch (error) {
      console.error('Error fetching festivos:', error);
      return [];
    }
  },

  saveFestivos: async (festivos) => {
    try {
      return await apiClient('/festivos', {
        method: 'POST',
        body: JSON.stringify({ festivos })
      });
    } catch (error) {
      console.error('Error saving festivos:', error);
      return { success: false };
    }
  },
  
  getDashboardStats: async (key = 'db_actividades') => {
    try {
      return await apiClient(`/tickets/stats?area_key=${encodeURIComponent(key)}`);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, totalOpen: 0, inProgress: 0, urgentTasks: 0, resolvedTickets: 0 };
    }
  },
  
  getRecentTickets: async (key = 'db_actividades') => {
    try {
      return await apiClient(`/tickets/recent?area_key=${encodeURIComponent(key)}`);
    } catch (error) {
      console.error('Error fetching recent tickets:', error);
      return { success: false, tickets: [] };
    }
  },
  
  getNetworkPulse: async () => {
    return { metrics: [
      { nombre: 'Uso de CPU', porcentaje: 45, tipo: 'cpu' }, 
      { nombre: 'Uso de RAM', porcentaje: 65, tipo: 'cpu' }
    ]};
  },
  
  guardarActividad: async (formObj, key = 'db_actividades', prefix = 'TKT') => {
    try {
      const data = await apiClient('/tickets', {
        method: 'POST',
        body: JSON.stringify({ ...formObj, areaKey: key, prefix })
      });
      
      if (data.success) {
        window.dispatchEvent(new CustomEvent('actividadGuardada', { 
          detail: { ticket: data.ticket, key: key } 
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error guardando actividad:', error);
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  },
  
  buscarActividades: async (q, key = 'db_actividades') => {
    try {
      return await apiClient(`/tickets/search?q=${encodeURIComponent(q || '')}&area_key=${encodeURIComponent(key)}`);
    } catch (error) {
      console.error('Error buscando actividades:', error);
      return { success: false, resultados: [] };
    }
  },
  
  getActividades: async (key = 'db_actividades') => {
    try {
      return await apiClient(`/tickets?area_key=${encodeURIComponent(key)}`);
    } catch (error) {
      console.error('Error fetching actividades:', error);
      return [];
    }
  },
  
  saveActividades: async (acts, key = 'db_actividades') => {
    try {
      const data = await apiClient(`/tickets/bulk/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ tickets: acts })
      });
      
      window.dispatchEvent(new Event('ticketActualizado'));
      
      return data;
    } catch (error) {
      console.error('Error saving actividades:', error);
      return { success: false };
    }
  },
  
  getSistemas: async () => {
    try {
      const data = await apiClient('/sistemas');
      return {
        servidor: data.servidor || { estado: 'ok', mensaje: '' },
        contable: data.contable || { estado: 'ok', mensaje: '' },
        red: data.red || { estado: 'ok', mensaje: '' },
        ...data
      };
    } catch (error) {
      console.error('Error fetching sistemas:', error);
      return {
        servidor: { estado: 'ok', mensaje: '' },
        contable: { estado: 'ok', mensaje: '' },
        red: { estado: 'ok', mensaje: '' }
      };
    }
  },
  
  saveSistemas: async (sysObj) => {
    try {
      return await apiClient('/sistemas', {
        method: 'PUT',
        body: JSON.stringify(sysObj)
      });
    } catch (error) {
      console.error('Error saving sistemas:', error);
      return { success: false };
    }
  },
  
  getAsistenciaDiaria: async () => {
    try {
      return await apiClient('/asistencia');
    } catch (error) {
      console.error('Error fetching asistencia:', error);
      return {};
    }
  },

  saveAsistenciaDiaria: async (asistenciaObj) => {
    try {
      return await apiClient('/asistencia', {
        method: 'PUT',
        body: JSON.stringify(asistenciaObj)
      });
    } catch (error) {
      console.error('Error saving asistencia:', error);
      return { success: false };
    }
  },

  getHistoricoAsistencia: async () => {
    try {
      return await apiClient('/asistencia/historico');
    } catch (error) {
      console.error('Error fetching historico:', error);
      return [];
    }
  },

  registrarHistoricoAsistencia: async (registro) => {
    try {
      return await apiClient('/asistencia/historico', {
        method: 'POST',
        body: JSON.stringify(registro)
      });
    } catch (error) {
      console.error('Error saving historico:', error);
      return { success: false };
    }
  },

  getEstadoPersonal: async () => {
    try {
      return await apiClient('/estado-personal');
    } catch (error) {
      console.error('Error fetching estado personal:', error);
      return {};
    }
  },
  
  saveEstadoPersonal: async (estObj) => {
    try {
      return await apiClient('/estado-personal', {
        method: 'PUT',
        body: JSON.stringify(estObj)
      });
    } catch (error) {
      console.error('Error saving estado personal:', error);
      return { success: false };
    }
  },

  autoCloseTickets: async (key = 'db_actividades', gracePeriodHours = 72) => {
    try {
      return await apiClient('/tickets/auto-close', {
        method: 'POST',
        body: JSON.stringify({ area_key: key, gracePeriodHours })
      });
    } catch (error) {
      console.error('Error en auto-close:', error);
      return { success: false, updated: false };
    }
  },

  updateTicketsAgentPauseState: async (agentName, isPaused) => {
    try {
      const data = await apiClient('/tickets/agent-pause', {
        method: 'POST',
        body: JSON.stringify({ agentName, isPaused })
      });
      
      window.dispatchEvent(new Event('ticketActualizado'));
      
      return data;
    } catch (error) {
      console.error('Error en agent pause:', error);
      return { success: false };
    }
  }
};
