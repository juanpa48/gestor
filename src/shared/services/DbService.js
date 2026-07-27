// ===================================
// SERVICIO DE BASE DE DATOS (Local/Mock)
// ===================================
// Adaptado a React (ES Modules) manteniendo localStorage y Promesas

export const DbService = {
  getSolicitantes: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const rawList = JSON.parse(localStorage.getItem('db_usuarios')) || [];
        const parsedList = rawList
          .filter(u => u.role === 'solicitante')
          .map(u => u.nombreReal || u.username);
        resolve(parsedList);
      }, 300);
    });
  },

  saveSolicitantes: async (sols) => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('db_solicitantes', JSON.stringify(sols));
        resolve({ success: true });
      }, 300);
    });
  },

  
  getResponsables: async (areaOrKey = 'db_responsables') => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Extraemos el ID del área ('ge', 'gh', 'ti') a partir de la key o el string directo.
        const areaId = areaOrKey.replace('db_responsables_', '');
        const rawList = JSON.parse(localStorage.getItem('db_usuarios')) || [];
        
        // Filtramos usuarios que pertenezcan a esa área y cuyo rol no sea 'solicitante'
        const responsables = rawList
          .filter(u => u.area === areaId && u.role !== 'solicitante')
          .map(u => ({ nombre: u.nombreReal, cargo: u.cargo || 'Gestor' }));
          
        resolve(responsables);
      }, 300);
    });
  },

  saveResponsables: async (resps, key = 'db_responsables') => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(resps));
        resolve({ success: true });
      }, 300);
    });
  },

  getFestivos: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const festivos = JSON.parse(localStorage.getItem('db_festivos')) || [];
        resolve(festivos);
      }, 100);
    });
  },

  saveFestivos: async (festivos) => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('db_festivos', JSON.stringify(festivos));
        resolve({ success: true });
      }, 100);
    });
  },
  
  getDashboardStats: async (key = 'db_actividades') => {
    return new Promise(resolve => {
      setTimeout(() => {
        const acts = JSON.parse(localStorage.getItem(key)) || [];
        const open = acts.filter(a => a.estado === 'Pendiente').length;
        const inProg = acts.filter(a => a.estado === 'En progreso').length;
        const urgent = acts.filter(a => a.prioridad === 'Urgente').length;
        const resolved = acts.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
        resolve({success: true, totalOpen: open, inProgress: inProg, urgentTasks: urgent, resolvedTickets: resolved});
      }, 300);
    });
  },
  
  getRecentTickets: async (key = 'db_actividades') => {
    return new Promise(resolve => {
      setTimeout(() => {
        const acts = JSON.parse(localStorage.getItem(key)) || [];
        const tickets = acts.slice(-5).reverse().map(a => ({
          titulo: a.solicitud || a.nombre,
          timeAgo: a.fechaCreacion,
          isUrgent: a.prioridad === 'Urgente' || a.prioridad === 'Alta'
        }));
        resolve({success: true, tickets: tickets});
      }, 300);
    });
  },
  
  getNetworkPulse: async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve({metrics: [{nombre: 'Uso de CPU', porcentaje: 45, tipo: 'cpu'}, {nombre: 'Uso de RAM', porcentaje: 65, tipo: 'cpu'}]}), 300);
    });
  },
  
  guardarActividad: async (formObj, key = 'db_actividades', prefix = 'TKT') => {
    return new Promise(resolve => {
      setTimeout(() => {
        const acts = JSON.parse(localStorage.getItem(key)) || [];
        const newId = `${prefix}-` + String(acts.length + 1).padStart(3, '0');
        formObj.id = newId;
        formObj.fechaISO = new Date().toISOString();
        formObj.fechaCreacion = new Date().toLocaleString();
        formObj.nombre = formObj.solicitante;
        formObj.area = formObj.tipoSolicitud || formObj.clasificacion || 'General';
        acts.push(formObj);
        localStorage.setItem(key, JSON.stringify(acts));
        
        // Emite un evento global para sincronización local
        window.dispatchEvent(new CustomEvent('actividadGuardada', { 
          detail: { ticket: formObj, key: key } 
        }));
        
        resolve({success: true, message: `Actividad ${newId} guardada.`});
      }, 800);
    });
  },
  
  buscarActividades: async (q, key = 'db_actividades') => {
    return new Promise(resolve => {
      setTimeout(() => {
        const acts = JSON.parse(localStorage.getItem(key)) || [];
        const term = (q || '').toLowerCase();
        const results = acts.filter(a => !term || (a.id || '').toLowerCase().includes(term) || (a.solicitud || '').toLowerCase().includes(term));
        resolve({success: true, resultados: results.reverse()});
      }, 300);
    });
  },
  
  getActividades: async (key = 'db_actividades') => {
    return new Promise(resolve => {
      setTimeout(() => {
        let acts = JSON.parse(localStorage.getItem(key)) || [];
        
        // MIGRACIÓN AUTOMÁTICA: Limpieza de Tipo y Prioridad para GH
        if (key === 'db_actividades_gh') {
          let dirty = false;
          acts = acts.map(a => {
            if (a.tipo !== undefined || a.prioridad !== undefined) {
              delete a.tipo;
              delete a.prioridad;
              dirty = true;
            }
            return a;
          });
          if (dirty) {
            localStorage.setItem(key, JSON.stringify(acts));
          }
        }

        resolve(acts);
      }, 300);
    });
  },
  
  saveActividades: async (acts, key = 'db_actividades') => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(acts));
        window.dispatchEvent(new Event('ticketActualizado'));
        resolve({ success: true });
      }, 300);
    });
  },
  
  getSistemas: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const sys = JSON.parse(localStorage.getItem('db_sistemas')) || {
          servidor: { estado: 'ok', mensaje: '' },
          contable: { estado: 'ok', mensaje: '' },
          red: { estado: 'ok', mensaje: '' }
        };
        resolve(sys);
      }, 300);
    });
  },
  
  saveSistemas: async (sysObj) => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('db_sistemas', JSON.stringify(sysObj));
        resolve({ success: true });
      }, 300);
    });
  },
  
  getEstadoPersonal: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem('db_estado_personal')) || {};
        resolve(db);
      }, 300);
    });
  },
  
  saveEstadoPersonal: async (estObj) => {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.setItem('db_estado_personal', JSON.stringify(estObj));
        resolve({ success: true });
      }, 300);
    });
  },

  autoCloseTickets: async (key = 'db_actividades', gracePeriodHours = 72) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let acts = JSON.parse(localStorage.getItem(key)) || [];
        let modified = false;
        const now = Date.now();
        
        acts = acts.map(a => {
          if (a.estado === 'Resuelto' && a.fechaFinTimestamp) {
            const hoursElapsed = (now - a.fechaFinTimestamp) / (1000 * 60 * 60);
            if (hoursElapsed >= gracePeriodHours) {
              a.estado = 'Cerrado';
              a.fechaCierreTimestamp = now;
              a.accion = (a.accion ? a.accion + '\n' : '') + `[SISTEMA]: Ticket cerrado automáticamente tras expirar periodo de gracia de ${gracePeriodHours}h.`;
              modified = true;
            }
          }
          return a;
        });

        if (modified) {
          localStorage.setItem(key, JSON.stringify(acts));
          window.dispatchEvent(new Event('ticketActualizado'));
        }
        resolve({ success: true, updated: modified });
      }, 0); // Resolución inmediata para no bloquear la carga inicial
    });
  },

  updateTicketsAgentPauseState: async (agentName, isPaused) => {
    return new Promise(async (resolve) => {
      // Usamos import dinamico para la funcion ya que no esta exportada globalmente y evitamos problemas de bundler aqui
      const { calculateWorkingMilliseconds } = await import('../utils/businessHours.js');
      
      const areas = ['db_actividades_ge', 'db_actividades_gh', 'db_actividades_ti'];
      
      for (const key of areas) {
        let activities = JSON.parse(localStorage.getItem(key)) || [];
        let updated = false;

        activities = activities.map(ticket => {
          if (ticket.responsable === agentName && ['Pendiente', 'En progreso', 'Suspendido'].includes(ticket.estado)) {
            if (isPaused) {
              if (!ticket.agentPauseStart) {
                ticket.agentPauseStart = Date.now();
                updated = true;
              }
            } else {
              if (ticket.agentPauseStart) {
                const pausedTimeMs = calculateWorkingMilliseconds(ticket.agentPauseStart, Date.now());
                ticket.tiempoPausadoTotal = (ticket.tiempoPausadoTotal || 0) + pausedTimeMs;
                ticket.agentPauseStart = null;
                updated = true;
              }
            }
          }
          return ticket;
        });

        if (updated) {
          localStorage.setItem(key, JSON.stringify(activities));
        }
      }
      
      window.dispatchEvent(new Event('ticketActualizado'));
      window.dispatchEvent(new Event('storage'));
      resolve({ success: true });
    });
  }
};
