import React, { useState, useEffect, useMemo } from 'react';

export const PortalLayout = ({ areaConfig, areaContext, onBack, children, nombre, setNombre }) => {
  const { actividades, solicitantes, responsables } = areaContext();
  const [sistemas, setSistemas] = useState({});
  const [personalTI, setPersonalTI] = useState({});
  const [rawResponsables, setRawResponsables] = useState([]);

  // Sync systems & IT staff from localStorage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const sys = JSON.parse(localStorage.getItem('db_sistemas') || '{}');
        setSistemas(sys);
        const stf = JSON.parse(localStorage.getItem('db_estado_personal') || '{}');
        setPersonalTI(stf);
        const rawResp = JSON.parse(localStorage.getItem(areaConfig.responsablesKey) || '[]');
        setRawResponsables(rawResp.length > 0 ? rawResp : [
          { nombre: 'Personal por defecto 1', cargo: 'Admin Nivel 1', foto: 'https://i.pravatar.cc/150?u=1' },
          { nombre: 'Personal por defecto 2', cargo: 'Especialista', foto: 'https://i.pravatar.cc/150?u=2' }
        ]);
      } catch (e) { }
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [responsables, areaConfig.responsablesKey]);

  const misTickets = useMemo(() => {
    if (!nombre) return [];
    return actividades.filter(a => a.nombre === nombre || a.solicitante === nombre).reverse();
  }, [actividades, nombre]);

  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let ticketsHoy = 0, urgenciasActivas = 0, resueltosHoy = 0;

    actividades.forEach(a => {
      let f = new Date(a.fechaISO || a.fechaCreacion);
      if (isNaN(f.getTime())) return;
      const fDate = new Date(f.getTime());
      fDate.setHours(0,0,0,0);
      const isHoy = fDate.getTime() === hoy.getTime();
      
      if (isHoy) ticketsHoy++;
      if (!['Resuelto', 'Cerrado'].includes(a.estado) && a.prioridad === 'Urgente') urgenciasActivas++;
      if (['Resuelto', 'Cerrado'].includes(a.estado) && isHoy) resueltosHoy++;
    });
    return { ticketsHoy, urgenciasActivas, resueltosHoy };
  }, [actividades]);

  const showToast = (message, type = 'success', icon = 'check') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.className = `toast show ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
      toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> &nbsp;${message}`;
      setTimeout(() => { toast.className = 'toast hidden'; }, 4000);
    }
  };

  const verInfoSistema = (sysKey, sysName) => {
    const st = sistemas[sysKey];
    if (!st || st.estado === 'ok' || !st.mensaje) {
      showToast(`<strong>${sysName}:</strong> Operando con normalidad.`, 'success', 'check');
    } else if (st.estado === 'error') {
      showToast(`<strong>ALERTA ${sysName}:</strong> ${st.mensaje}`, 'error', 'triangle-exclamation');
    } else {
      showToast(`<strong>AVISO ${sysName}:</strong> ${st.mensaje}`, 'warning', 'circle-exclamation');
    }
  };

  const getSystemDot = (sysKey) => {
    const st = sistemas[sysKey]?.estado;
    if (st === 'error') return 'dot-red';
    if (st === 'warning') return 'dot-yellow';
    return 'dot-green';
  };

  const getEstadoDetails = (estado) => {
    const estadoMap = {
      disponible:    { dot: 'dot-green',       txt: 'text-green',       label: 'Disponible (Oficina)'    },
      en_desarrollo: { dot: 'dot-blue',        txt: 'text-blue',        label: 'Disponible (Home Office)' },
      reunion:       { dot: 'dot-purple',      txt: 'text-purple',      label: 'En Reunión'    },
      atendiendo:    { dot: 'dot-red',         txt: 'text-red',         label: 'Ocupada (Trámite)'    },
      urgente:       { dot: 'dot-red-intense', txt: 'text-red-intense', label: 'Urgencia'       }
    };
    return estadoMap[estado] || estadoMap.disponible;
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="logo-placeholder" onClick={onBack} style={{cursor: 'pointer'}} title="Volver al inicio">
          <img src="/img/acyt.png" alt="Logo" />
        </div>
        <div className="header-title">
          Portal - {areaConfig.nombre}
        </div>
        <button className="btn-volver-area" onClick={onBack} title="Volver a seleccionar área">
          <i className="fa-solid fa-arrow-left"></i> Cambiar Área
        </button>
      </header>

      <div className="top-stats">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-ticket-simple"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats.ticketsHoy}</div>
            <div className="stat-label">Tickets Hoy</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats.urgenciasActivas}</div>
            <div className="stat-label">Urgencias Activas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><i className="fa-solid fa-check-double"></i></div>
          <div className="stat-info">
            <div className="stat-value">{stats.resueltosHoy}</div>
            <div className="stat-label">Resueltos Hoy</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-sistemas">
          <div className="stat-label">ESTADO DE SISTEMAS</div>
          <div className="sistemas-row">
            <div className="sys-container" onClick={() => verInfoSistema('servidor', 'SERVIDOR PRINCIPAL')}>
              <div className="sys-icon">
                <i className="fa-solid fa-server"></i>
                <div className={`sys-dot ${getSystemDot('servidor')}`}></div>
              </div>
              <div className="sys-label">SERVER</div>
            </div>
            <div className="sys-container" onClick={() => verInfoSistema('contable', 'PROGRAMA CONTABLE')}>
              <div className="sys-icon">
                <i className="fa-solid fa-calculator"></i>
                <div className={`sys-dot ${getSystemDot('contable')}`}></div>
              </div>
              <div className="sys-label">CONTABLE</div>
            </div>
            <div className="sys-container" onClick={() => verInfoSistema('red', 'RED E INTERNET')}>
              <div className="sys-icon">
                <i className="fa-solid fa-network-wired"></i>
                <div className={`sys-dot ${getSystemDot('red')}`}></div>
              </div>
              <div className="sys-label">RED APP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <aside className="glass-panel aside-panel">
          <div className="panel-title">
            <i className="fa-solid fa-clock-rotate-left"></i> Sus Tickets Recientes
          </div>
          
          <div id="historialLista">
            {!nombre ? (
              <div className="empty-history">
                Seleccione su nombre en el formulario para ver su historial.
              </div>
            ) : misTickets.length === 0 ? (
              <div className="empty-history" style={{ opacity: 0.8 }}>
                <i className="fa-regular fa-folder-open" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                No tiene tickets recientes registrados.
              </div>
            ) : (
              <div className="history-list">
                {misTickets.slice(0, 5).map(t => {
                  let estadoTxt = t.estado || 'Pendiente';
                  if (estadoTxt === 'En progreso') estadoTxt = 'Iniciado';
                  let bqClass = 'pendiente';
                  if (estadoTxt === 'Iniciado') bqClass = 'progreso';
                  else if (estadoTxt.includes('esuelto') || estadoTxt.includes('errado')) bqClass = 'resuelto';

                  const truncar = t.solicitud ? (t.solicitud.length > 40 ? t.solicitud.substring(0, 40) + '...' : t.solicitud) : 'Sin detalles';

                  return (
                    <div key={t.id} className="history-ticket">
                      <div className="ht-title">{truncar}</div>
                      {t.responsable && (
                        <div style={{ fontSize: '10px', color: '#475569', marginBottom: '6px' }}>
                          <i className="fa-solid fa-user-check" style={{ color: '#3b82f6' }}></i> Asignado a: <strong>{t.responsable}</strong>
                        </div>
                      )}
                      <div className="ht-meta">
                        <span className={`badge ${bqClass}`}>{estadoTxt}</span>
                        <span className="ht-date">{t.id || '--'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="glass-panel">
          <div className="panel-title panel-title-form">CREAR NUEVA SOLICITUD</div>
          {children}
        </main>

        <aside className="glass-panel aside-panel">
          <div className="panel-title">
            <i className="fa-solid fa-users-gear"></i> Personal Asignado ({areaConfig.nombreCorto})
          </div>

          <div id="itStaffContainer">
            {rawResponsables.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                Sin datos de personal
              </div>
            ) : (
              rawResponsables.map((resp, idx) => {
                const n = typeof resp === 'object' ? resp.nombre : resp;
                const cargo = typeof resp === 'object' ? resp.cargo : 'Personal TI';
                const foto = (typeof resp === 'object' && resp.foto) ? resp.foto : `https://i.pravatar.cc/150?u=${n.replace(' ','')}`;
                
                const info = personalTI[n];
                const st = getEstadoDetails(info ? info.estado : 'disponible');

                return (
                  <div key={idx} className="profile-card">
                    <div className={`status-dot ${st.dot}`}></div>
                    <img src={foto} alt={n} className="profile-avatar" />
                    <div className="profile-info">
                      <div className="profile-name">{n}</div>
                      <div className="profile-role">{cargo}</div>
                      <div className={`profile-activity ${st.txt}`}>{st.label}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
      <div id="toast" className="toast hidden"></div>
    </div>
  );
};
