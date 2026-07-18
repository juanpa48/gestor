import React, { useState, useEffect, useMemo } from 'react';
import { useAreaTickets as useTickets } from '../areas/gestion-empresarial/context/GEContext';
import { tramitesArea1, tramitesArea2 } from '../data/tramitesData';
import { DbService } from '../shared/services/DbService';
import Logo from '../assets/img/Logo.png';

export const Portal = () => {
  const { actividades, solicitantes, addTicket, responsables, getSolicitanteCargo } = useTickets();
  const [sistemas, setSistemas] = useState({});
  const [personalTI, setPersonalTI] = useState({});
  const [rawResponsables, setRawResponsables] = useState([]);

  // Form State
  const [nombre, setNombre] = useState('');
  const [areaGestion, setAreaGestion] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [rutaT, setRutaT] = useState('');
  const [checkPdf, setCheckPdf] = useState(false);
  const [prioridad, setPrioridad] = useState('Media');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    document.body.className = 'portal';
    return () => { document.body.className = ''; };
  }, []);

  // Sync systems & IT staff from localStorage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const sys = JSON.parse(localStorage.getItem('db_sistemas') || '{}');
        setSistemas(sys);
        const stf = JSON.parse(localStorage.getItem('db_estado_personal') || '{}');
        setPersonalTI(stf);
        const rawResp = JSON.parse(localStorage.getItem('db_responsables') || '[]');
        setRawResponsables(rawResp.length > 0 ? rawResp : [
          { nombre: 'Alex Henderson', cargo: 'Admin Sistema / Nivel 1', foto: 'https://i.pravatar.cc/150?u=ti1' },
          { nombre: 'Marcus Vance', cargo: 'Especialista Infraestructura', foto: 'https://i.pravatar.cc/150?img=11' }
        ]);
      } catch (e) { }
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [responsables]);

  // Mis Tickets
  const misTickets = useMemo(() => {
    if (!nombre) return [];
    return actividades.filter(a => a.nombre === nombre || a.solicitante === nombre).reverse();
  }, [actividades, nombre]);

  // Top Stats
  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ticketsHoy = 0;
    let urgenciasActivas = 0;
    let resueltosHoy = 0;

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

  // Dynamic Tramites
  const renderTramites = () => {
    let list = [];
    if (areaGestion.includes('Área 1') || areaGestion.includes('Estructural')) list = tramitesArea1;
    else if (areaGestion.includes('Área 2') || areaGestion.includes('Operativo')) list = tramitesArea2;
    return list.map(t => <option key={t} value={t}>{t}</option>);
  };

  const isFirmas = tipoTramite === 'Firmas de documentos';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !areaGestion || !tipoTramite || !solicitud) {
      showToast('Por favor, complete todos los campos obligatorios.', 'error', 'triangle-exclamation');
      return;
    }
    if (isFirmas && !rutaT) {
      showToast('Para Firmas de documentos es obligatorio proporcionar la Ruta T.', 'error', 'triangle-exclamation');
      return;
    }
    if (isFirmas && !checkPdf) {
      showToast('Debe confirmar que los documentos están en formato PDF.', 'error', 'triangle-exclamation');
      return;
    }

    setLoadingSubmit(true);
    try {
      const tickets = await DbService.getActividades();
      const numReq = tickets.filter(t => (t.id || '').startsWith('REQ-')).length + 1;
      const newId = `REQ-${String(numReq).padStart(3, '0')}`;

      const nuevoTicket = {
        id: newId,
        fechaISO: new Date().toISOString(),
        fechaCreacion: new Date().toLocaleString(),
        nombre: nombre,
        solicitante: nombre,
        cargo: getSolicitanteCargo(nombre),
        solicitud: solicitud,
        estado: 'Pendiente',
        prioridad: prioridad,
        responsable: '',
        grupo: areaGestion,
        grupoExtra: tipoTramite,
        clasificacion: '',
        detalles: rutaT
      };

      await addTicket(nuevoTicket);
      
      // Reset form
      setSolicitud('');
      setRutaT('');
      setCheckPdf(false);
      setAreaGestion('');
      setTipoTramite('');
      setPrioridad('Media');
      
      showToast(`¡Solicitud <strong>${newId}</strong> enviada exitosamente!`, 'success', 'check');
    } catch (err) {
      showToast('Error al enviar la solicitud. Intente de nuevo.', 'error', 'triangle-exclamation');
    } finally {
      setLoadingSubmit(false);
    }
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
        <div className="logo-placeholder">
          <img src={Logo} alt="Logo de Empresa" />
        </div>
        <div className="header-title">
          Portal de Autogestión TI
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
            <div className="sys-container" title="Servidor Principal" onClick={() => verInfoSistema('servidor', 'SERVIDOR PRINCIPAL')}>
              <div className="sys-icon">
                <i className="fa-solid fa-server"></i>
                <div className={`sys-dot ${getSystemDot('servidor')}`}></div>
              </div>
              <div className="sys-label">SERVER</div>
            </div>
            
            <div className="sys-container" title="Programa Contable" onClick={() => verInfoSistema('contable', 'PROGRAMA CONTABLE')}>
              <div className="sys-icon">
                <i className="fa-solid fa-calculator"></i>
                <div className={`sys-dot ${getSystemDot('contable')}`}></div>
              </div>
              <div className="sys-label">CONTABLE</div>
            </div>
            
            <div className="sys-container" title="Internet / Red" onClick={() => verInfoSistema('red', 'RED E INTERNET')}>
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
        {/* COLUMNA IZQUIERDA: Historial */}
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

                  const truncar = t.solicitud
                    ? (t.solicitud.length > 40 ? t.solicitud.substring(0, 40) + '...' : t.solicitud)
                    : 'Sin detalles';

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

        {/* COLUMNA CENTRAL: Formulario */}
        <main className="glass-panel">
          <div className="panel-title panel-title-form">CREAR NUEVA SOLICITUD</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">SOLICITANTE</label>
              <div className="select-wrapper">
                <select className="glass-input" required value={nombre} onChange={(e) => setNombre(e.target.value)}>
                  <option value="" disabled>Identifíquese...</option>
                  {solicitantes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ÁREA DE GESTIÓN</label>
              <div className="select-wrapper">
                <select className="glass-input" required value={areaGestion} onChange={(e) => {
                  setAreaGestion(e.target.value);
                  setTipoTramite('');
                }}>
                  <option value="" disabled>Seleccione el Área...</option>
                  <option value="Área 1 (Estructurales)">Área 1 (Estructurales / Legales)</option>
                  <option value="Área 2 (Operativos)">Área 2 (Operativos / Documentales)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">TIPO DE TRÁMITE</label>
              <div className="select-wrapper">
                <select className="glass-input" required value={tipoTramite} onChange={(e) => setTipoTramite(e.target.value)}>
                  {!areaGestion ? (
                    <option value="" disabled>Primero seleccione un Área...</option>
                  ) : (
                    <>
                      <option value="" disabled>Seleccione el Trámite...</option>
                      {renderTramites()}
                    </>
                  )}
                </select>
              </div>
              {isFirmas && (
                <div className="alerta-presencial" style={{ display: 'block' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> Nota: Este trámite requiere presencialidad. Será atendido por la gestora que se encuentre en oficina hoy.
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPCIÓN DE LA SOLICITUD</label>
              <textarea 
                className="glass-input" 
                placeholder="💡 Tip: Sea lo más específico posible sobre el requerimiento..." 
                required 
                value={solicitud} 
                onChange={(e) => setSolicitud(e.target.value)}
              ></textarea>
            </div>

            {isFirmas && (
              <>
                <div className="form-group" style={{ display: 'block' }}>
                  <label className="form-label">RUTA T / ANEXOS <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    className="glass-input ruta-input" 
                    placeholder="Ej: T:\\Contabilidad\\Firmas\\2024\\..." 
                    required={isFirmas}
                    value={rutaT} 
                    onChange={(e) => setRutaT(e.target.value)}
                  />
                </div>

                <div className="form-group check-pdf-group" style={{ display: 'flex' }}>
                  <input 
                    type="checkbox" 
                    id="checkPdf" 
                    checked={checkPdf} 
                    onChange={(e) => setCheckPdf(e.target.checked)} 
                  />
                  <label htmlFor="checkPdf">
                    Confirmo que los documentos adjuntos o en la ruta especificada están en <span className="pdf-highlight">formato PDF</span>.
                  </label>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">PRIORIDAD</label>
              <div className="priority-group">
                {['Baja', 'Media', 'Alta', 'Urgente'].map(p => (
                  <div 
                    key={p} 
                    className={`priority-btn ${prioridad === p ? 'active' : ''}`}
                    onClick={() => setPrioridad(p)}
                  >
                    {p.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className={`btn-submit ${loadingSubmit ? 'loading' : ''}`} disabled={loadingSubmit}>
              {loadingSubmit ? (
                <><span>Enviando...</span><i className="fa-solid fa-spinner fa-spin"></i></>
              ) : (
                <><span>Enviar Solicitud</span><i className="fa-solid fa-paper-plane"></i></>
              )}
            </button>
          </form>
        </main>

        {/* COLUMNA DERECHA: Personal TI */}
        <aside className="glass-panel aside-panel">
          <div className="panel-title">
            <i className="fa-solid fa-users-gear"></i> Personal Asignado
          </div>

          <div id="itStaffContainer">
            {rawResponsables.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                Sin datos de personal
              </div>
            ) : (
              rawResponsables.map((resp, idx) => {
                const nombre = typeof resp === 'object' ? resp.nombre : resp;
                const cargo  = typeof resp === 'object' ? resp.cargo  : 'Personal TI';
                const foto   = (typeof resp === 'object' && resp.foto) ? resp.foto : `https://i.pravatar.cc/150?u=${idx}`;
                
                const info = personalTI[nombre];
                const st = getEstadoDetails(info ? info.estado : 'disponible');

                return (
                  <div key={idx} className="profile-card">
                    <div className={`status-dot ${st.dot}`}></div>
                    <img src={foto} alt={nombre} className="profile-avatar" />
                    <div className="profile-info">
                      <div className="profile-name">{nombre}</div>
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
