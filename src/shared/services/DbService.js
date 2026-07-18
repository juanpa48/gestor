// ===================================
// SERVICIO DE BASE DE DATOS (Local/Mock)
// ===================================
// Adaptado a React (ES Modules) manteniendo localStorage y Promesas

export const DbService = {
  getSolicitantes: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const rawList = JSON.parse(localStorage.getItem('db_solicitantes'));
        const defaultList = ['Juan Perez (Local)', 'Maria Lopez (Local)'];
        if (!rawList) {
          localStorage.setItem('db_solicitantes', JSON.stringify(defaultList));
          resolve(defaultList);
        } else {
          const parsedList = rawList.map(s => typeof s === 'object' ? s.nombre : s);
          resolve(parsedList);
        }
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

  
  getResponsables: async (key = 'db_responsables') => {
    return new Promise(resolve => {
      setTimeout(() => {
        const rawList = JSON.parse(localStorage.getItem(key));
        const defaultList = ['Admin TI 1', 'Admin TI 2'];
        if (!rawList) {
          localStorage.setItem(key, JSON.stringify(defaultList));
          resolve(defaultList);
        } else {
          const parsedList = rawList.map(r => typeof r === 'object' ? r.nombre : r);
          resolve(parsedList);
        }
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
        formObj.area = formObj.grupo || formObj.clasificacion || 'General';
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
        const acts = JSON.parse(localStorage.getItem(key)) || [];
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
  }
};
