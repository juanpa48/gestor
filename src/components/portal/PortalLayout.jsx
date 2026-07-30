import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { ActaDeduccion } from '../../pages/dashboard/modals/ActaDeduccion';
import { ActaAuxilioPdf } from '../../pages/dashboard/modals/ActaAuxilioPdf';
import { DbService } from '../../shared/services/DbService';
import { apiClient } from '../../shared/services/api';

export const PortalLayout = ({ areaConfig, areaContext, onBack, children, nombre, setNombre }) => {
  const { actividades, solicitantes, responsables, updateTicket } = areaContext();
  const { logout } = useAuth();
  const [sistemas, setSistemas] = useState({});
  const [personalTI, setPersonalTI] = useState({});
  const [actaTicket, setActaTicket] = useState(null);
  const [activeAsistencia, setActiveAsistencia] = useState(null);
  // Sync systems & IT staff using Polling (every 15s)
  useEffect(() => {
    const fetchSysAndStaff = async () => {
      try {
        const sysData = await apiClient('/sistemas');
        if (sysData) setSistemas(sysData);
        
        const stfData = await apiClient('/estado-personal');
        if (stfData) setPersonalTI(stfData);
      } catch (e) { }
    };
    fetchSysAndStaff();
    const intervalId = setInterval(fetchSysAndStaff, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!nombre) {
      setActiveAsistencia(null);
      return;
    }
    const fetchAsistencia = async () => {
      const { DbService } = await import('../../shared/services/DbService.js');
      const db = await DbService.getAsistenciaDiaria();
      const miAsistencia = db[nombre];
      
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(0, 0, 0, 0);
      if (now.getTime() < cutoff.getTime()) {
        cutoff.setDate(cutoff.getDate() - 1);
      }

      if (miAsistencia && miAsistencia.timestamp >= cutoff.getTime()) {
        setActiveAsistencia(miAsistencia);
      } else {
        setActiveAsistencia(null);
      }
    };
    fetchAsistencia();
    const intervalId = setInterval(fetchAsistencia, 15000);
    return () => clearInterval(intervalId);
  }, [nombre]);

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
      toast.className = `toast show ${type}`;
      toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> &nbsp;${message}`;
      
      if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
      }
      window.toastTimeout = setTimeout(() => { toast.className = 'toast'; }, 10000);
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
      en_desarrollo: { dot: 'dot-blue',        txt: 'text-blue',        label: 'Disponible (Trabajo en casa)' },
      reunion:       { dot: 'dot-purple',      txt: 'text-purple',      label: 'En Reunión'    },
      almuerzo:      { dot: 'dot-yellow',      txt: 'text-yellow',      label: 'Hora de Almuerzo' },
      atendiendo:    { dot: 'dot-red',         txt: 'text-red',         label: 'Ocupado'    },
      ausente:       { dot: 'dot-slate',       txt: 'text-slate',       label: 'Ausente (No laborando)' }
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-volver-area" onClick={onBack} title="Volver a seleccionar área">
            <i className="fa-solid fa-arrow-left"></i> Cambiar Área
          </button>
          <button className="btn-volver-area" onClick={logout} style={{ background: 'var(--red)', color: '#fff', border: 'none', fontWeight: 'bold' }} title="Cerrar Sesión">
            <i className="fa-solid fa-right-from-bracket"></i> Salir
          </button>
        </div>
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
          
          {activeAsistencia && (
              <div style={{ background: activeAsistencia.estado === 'Resuelto' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: `1px solid ${activeAsistencia.estado === 'Resuelto' ? '#16a34a' : '#22c55e'}`, borderRadius: '8px', padding: '12px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold' }}>
                  <i className={`fa-solid ${activeAsistencia.estado === 'Resuelto' ? 'fa-check-circle' : 'fa-map-location-dot'}`}></i>
                  <span>{activeAsistencia.estado === 'Resuelto' ? 'Jornada finalizada: ' : 'Actualmente en turno: '} {activeAsistencia.ubicacion}</span>
                </div>
                {activeAsistencia.estado !== 'Resuelto' && activeAsistencia.ubicacion !== 'Oficina' && (
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '12px', padding: '6px 12px', margin: 0, borderRadius: '4px', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 'bold', alignSelf: 'flex-start' }}
                    title="Registrar fin de su jornada"
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      if (window.confirm('¿Está seguro de que desea marcar el FIN de su jornada?')) {
                        const { DbService } = await import('../../shared/services/DbService.js');
                        const currentDb = await DbService.getAsistenciaDiaria();
                        if (currentDb[nombre]) {
                          currentDb[nombre].estado = 'Resuelto';
                          currentDb[nombre].fechaFinTimestamp = Date.now();
                          currentDb[nombre].fechaFinISO = new Date().toISOString();
                          await DbService.saveAsistenciaDiaria(currentDb);
                          await DbService.registrarHistoricoAsistencia({
                            ...currentDb[nombre],
                            accion: 'Fin de Turno'
                          });
                          setActiveAsistencia(null);
                          showToast('Jornada finalizada exitosamente.', 'success', 'check');
                        }
                      }
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Marcar Fin
                  </button>
                )}
              </div>
            )}

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
                  const isActa = t.tipoSolicitud && (t.tipoSolicitud.includes('Convenio') || t.tipoSolicitud.includes('Auxilio Educativo')) || (t.solicitud && t.solicitud.includes('Convenio')) || (t.solicitud && t.solicitud.includes('Auxilio Educativo'));

                  return (
                    <div key={t.id} className="history-ticket">
                      <div className="ht-title">{truncar}</div>
                      {t.responsable && (
                        <div style={{ fontSize: '10px', color: '#475569', marginBottom: '6px' }}>
                          <i className="fa-solid fa-user-check" style={{ color: '#3b82f6' }}></i> Asignado a: <strong>{t.responsable}</strong>
                        </div>
                      )}
                      <div className="ht-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className={`badge ${bqClass}`}>{estadoTxt}</span>
                          <span className="ht-date" style={{ marginLeft: '6px' }}>{t.id || '--'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isActa && (
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '11px', padding: '3px 8px', margin: 0, borderRadius: '4px', cursor: 'pointer' }}
                            title="Descargar o imprimir copia del Acta PDF"
                            onClick={(e) => { e.stopPropagation(); setActaTicket(t); }}
                          >
                            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Ver Acta
                          </button>
                        )}
                        {t.tipoSolicitud === 'Certificado Laboral' && t.detalles?.certificadoResolutor && (
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '11px', padding: '3px 8px', margin: 0, borderRadius: '4px', cursor: 'pointer', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            title="Descargar Certificado Laboral"
                            onClick={(e) => { e.stopPropagation(); window.open(t.detalles.certificadoResolutor, '_blank'); }}
                          >
                            <i className="fa-solid fa-file-arrow-down"></i> Descargar
                          </button>
                        )}
                        </div>
                      </div>
                      
                      {t.detalles?.mensajeResolutor && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6', borderRadius: '0 4px 4px 0', fontSize: '11px', color: '#1e293b' }}>
                          <strong><i className="fa-solid fa-message"></i> Respuesta GH:</strong> {t.detalles.mensajeResolutor}
                        </div>
                      )}
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
            {responsables.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                Sin datos de personal
              </div>
            ) : (
              responsables.map((resp, idx) => {
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
      <div id="toast" className="toast"></div>

      {actaTicket && actaTicket.tipoSolicitud && actaTicket.tipoSolicitud.includes('Convenio') && <ActaDeduccion ticket={actaTicket} onClose={() => setActaTicket(null)} />}
      {actaTicket && actaTicket.tipoSolicitud && actaTicket.tipoSolicitud.includes('Auxilio Educativo') && <ActaAuxilioPdf ticket={actaTicket} onClose={() => setActaTicket(null)} />}
    </div>
  );
};
