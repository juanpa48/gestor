import React, { useState, useMemo, useEffect } from 'react';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { getAreaSettings } from '../../shared/services/SettingsManager';
import { calculateSlaBadge } from '../../shared/utils/timeHelpers';
import { ActaDeduccion } from './modals/ActaDeduccion';
import { ActaAuxilioPdf } from './modals/ActaAuxilioPdf';
import { UploadService } from '../../shared/services/UploadService';

export const Gestion = () => {
  const { ctx, config, area } = useActiveArea();
  const { actividades, responsables, updateTicket, refreshTickets } = ctx;
  const settings = getAreaSettings(area);
  const slas = settings.slas || { Urgente: 2, Alta: 8, Media: 24, Baja: 48 };
  
  const [view, setView] = useState('tabla'); // 'tabla' o 'kanban'
  const [activeTab, setActiveTab] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); // For detail view
  
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketEdit, setTicketEdit] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [certificadoFile, setCertificadoFile] = useState(null);
  const [archivosVistos, setArchivosVistos] = useState(new Set());
  const [mensajeResolutor, setMensajeResolutor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tick, setTick] = useState(0);

  // Modal State
    detalles: '',
    novedadNomina: false,
    adjuntos: []
  });
  const [archivosVistos, setArchivosVistos] = useState(new Set());
  const [showActa, setShowActa] = useState(false);
  const [certificadoFile, setCertificadoFile] = useState(null);

  // Escuchar el evento de busqueda global del Topbar
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail?.query?.toLowerCase() || '');
    };
    document.addEventListener('searchTriggered', handleSearch);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) setSearchQuery(searchInput.value.toLowerCase());

    
    // Timer para actualizar los SLAs en tiempo real (cada 60 segundos)
    const intervalId = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);

    return () => {
      document.removeEventListener('searchTriggered', handleSearch);
      clearInterval(intervalId);
    };
  }, []);

  const activos = useMemo(() => {
    return actividades.filter(a => {
      // Si hay filtro explícito, respetar. Si no, ocultar Cerrado por defecto.
      if (filtroEstado) {
        if (a.estado !== filtroEstado) return false;
      } else {
        if (a.estado === 'Cerrado') return false;
      }

      if (searchQuery) {
        const solString = typeof a.solicitante === 'string' ? a.solicitante : (a.solicitante?.nombreReal || '');
        const respString = typeof a.responsable === 'string' ? a.responsable : (a.responsable?.nombre || '');
        
        const matchesId = (String(a.id) || '').toLowerCase().includes(searchQuery);
        const matchesSol = (String(a.solicitud) || '').toLowerCase().includes(searchQuery);
        const matchesNom = (String(a.nombre || solString) || '').toLowerCase().includes(searchQuery);
        const matchesResp = (String(respString) || '').toLowerCase().includes(searchQuery);
        if (!matchesId && !matchesSol && !matchesNom && !matchesResp) return false;
      }
      return true;
    }).reverse();
  }, [actividades, filtroEstado, searchQuery]);

  const kanbanCols = [
    { key: 'Pendiente', label: 'Pendiente', color: '#94a3b8' },
    { key: 'Revisado', label: 'Revisado', color: '#8b5cf6' },
    { key: 'En progreso', label: 'En Progreso', color: '#3b82f6' },
    { key: 'Suspendido', label: 'Suspendido', color: '#f59e0b' },
    { key: 'Resuelto', label: 'Resuelto', color: '#10b981' }
  ];
  
  const prioColor = { Urgente: '#ef4444', Alta: '#f59e0b', Media: '#3b82f6', Baja: '#22c55e' };

  const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
      setTimeout(() => {
        toast.className = 'toast hidden';
      }, 3000);
    }
  };

  const openModal = (id) => {
    const t = actividades.find(a => a.id === id);
    if (!t) return;
    setTicketEdit({
      id: t.id,
      solicitud: t.solicitud || t.nombre,
      solicitante: t.solicitante || t.nombre,
      estado: t.estado || 'Pendiente',
      responsable: t.responsable || '',
      prioridad: t.prioridad || 'Baja',
      tipoSolicitud: t.tipoSolicitud || 'Soporte Tecnico',
      clasificacion: t.grupoExtra || t.clasificacion || '',
      detalles: t.detalles || '',
      fechaProgramada: t.fechaProgramada || '',
      accion: t.accion || '',
      novedadNomina: !!t.novedadNomina,
      adjuntos: t.adjuntos || []
    });
    
    let parsedDetalles = t.detalles;
    if (typeof parsedDetalles === 'string') {
      try { parsedDetalles = JSON.parse(parsedDetalles); } catch(e) { parsedDetalles = {}; }
    }
    setMensajeResolutor(parsedDetalles?.mensajeResolutor || '');
    
    setArchivosVistos(new Set()); // Resetear vistos al abrir nuevo ticket
    setCertificadoFile(null);
    setModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { id, value, type, checked } = e.target;
    const field = id.replace('m_', ''); // e.g. m_estado -> estado
    const val = type === 'checkbox' ? checked : value;
    setTicketEdit(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'tipoSolicitud') {
        next.clasificacion = ''; // Reset when group changes
      }
      return next;
    });
  };

  const renderTramites = () => {
    const grupoEncontrado = config.tiposSolicitud?.find(g => ticketEdit.tipoSolicitud.includes(g.nombre) || g.nombre.includes(ticketEdit.tipoSolicitud)) || config.grupos?.find(g => ticketEdit.tipoSolicitud.includes(g.nombre) || g.nombre.includes(ticketEdit.tipoSolicitud));
    if (grupoEncontrado) {
      return grupoEncontrado.tramites.map(t => <option key={t} value={t}>{t}</option>);
    }
    return [];
  };

  const saveEdits = async () => {
    setModalLoading(true);
    try {
      let finalDetalles = ticketEdit.detalles;
      let parsedDetalles = typeof finalDetalles === 'string' ? JSON.parse(finalDetalles || '{}') : finalDetalles || {};
      
      if (certificadoFile) {
        const urls = await UploadService.uploadFiles([certificadoFile], ticketEdit.id, area);
        if (urls && urls.length > 0) {
          parsedDetalles.certificadoResolutor = urls[0];
        }
      }
      
      if (mensajeResolutor) {
        parsedDetalles.mensajeResolutor = mensajeResolutor;
      }
      finalDetalles = parsedDetalles;

      await updateTicket(ticketEdit.id, {
        estado: ticketEdit.estado,
        responsable: ticketEdit.responsable,
        prioridad: ticketEdit.prioridad,
        tipoSolicitud: ticketEdit.tipoSolicitud,
        grupoExtra: ticketEdit.clasificacion,
        clasificacion: ticketEdit.clasificacion,
        novedadNomina: ticketEdit.novedadNomina,
        detalles: finalDetalles,
        fechaProgramada: ticketEdit.fechaProgramada,
        accion: ticketEdit.accion
      });
      showToast('Ticket actualizado correctamente', 'success');
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const getOriginalFileName = (url) => {
    try {
      const parts = url.split('/');
      const fullName = parts[parts.length - 1] || '';
      const nameParts = fullName.split('-');
      if (nameParts.length >= 3) {
        return nameParts.slice(2).join('-').replace(/_/g, ' ');
      }
      return fullName;
    } catch(e) {
      return "Archivo Adjunto";
    }
  };

  const isPreviewable = (url) => {
    try {
      const ext = url.split('.').pop().toLowerCase();
      const viewableExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt', 'mp4'];
      return viewableExts.includes(ext);
    } catch(e) {
      return false;
    }
  };

  const handleDownload = async (e, url, nombreArchivo) => {
    e.preventDefault();
    e.stopPropagation();
    
    setArchivosVistos(prev => new Set(prev).add(url));

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al forzar descarga", error);
      window.open(url, '_blank');
    }
  };

  return (
    <section id="section-solicitudes" className="section active">
      <div className="section-header">
        <h2 className="section-title">Gestión de Tickets</h2>
        <div className="header-actions">
          <select id="filtroEstado" className="form-select header-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Revisado">Revisado (Visto)</option>
            <option value="En progreso">En progreso</option>
            <option value="Suspendido">Suspendido (Pausado)</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'tabla' ? 'active' : ''}`} onClick={() => setView('tabla')}>
              <i className="fa-solid fa-table-list"></i> Tabla
            </button>
            <button className={`toggle-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>
              <i className="fa-solid fa-columns"></i> Kanban
            </button>
          </div>
          <button className="btn-refresh" id="btnRefreshGestion" onClick={() => { if (refreshTickets) refreshTickets(); }}>
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      {/* Vista Tabla */}
      <div id="gestionTabla" className="table-card" style={{ display: view === 'tabla' ? 'block' : 'none' }}>
        <div id="solicitudesTable">
          {activos.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>Sin solicitudes activas</p>
              <span>Todos los tickets han sido resueltos o no coinciden con la búsqueda</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {area !== 'gh' && <th>Tipo</th>}
                  <th>Solicitud</th>
                  <th>Solicitante</th>
                  <th>Estado</th>
                  {area !== 'gh' && <th>Prioridad</th>}
                  {area === 'gh' && <th>Nómina</th>}
                  <th>SLA (Restante)</th>
                  <th>Responsable</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {activos.map(t => {
                  const prio = t.prioridad || 'Baja';
                  const dot = prioColor[prio] || '#94a3b8';
                  const rawEstado = t.estado || 'Pendiente';
                  const estadoClase = String(rawEstado).toLowerCase().replace(' ', '-');
                  return (
                    <tr key={t.id} className="ticket-row-clickable" data-ticket-id={t.id} onClick={() => openModal(t.id)}>
                      <td><strong>{t.id || ''}</strong></td>
                      {area !== 'gh' && (
                        <td>
                          {t.tipo ? (
                            <span className={`tipo-badge ${String(t.tipo).toLowerCase()}`}>
                              <i className={t.tipo === 'Incidente' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-file-lines'} style={{ marginRight: '4px' }}></i>
                              {t.tipo}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>N/A</span>}
                        </td>
                      )}
                      <td style={{ maxWidth: '350px', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: '1.4' }}>
                        {t.solicitud || t.nombre || ''}
                      </td>
                      <td>{t.nombre || (typeof t.solicitante === 'string' ? t.solicitante : t.solicitante?.nombreReal) || ''}</td>
                      <td><span className={`status-badge ${estadoClase}`}>{t.estado || ''}</span></td>
                      {area !== 'gh' && (
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                          </span>
                        </td>
                      )}
                      {area === 'gh' && (
                        <td style={{textAlign: 'center'}}>{t.novedadNomina ? <i className="fa-solid fa-check" style={{color: 'var(--success)'}}></i> : <i className="fa-solid fa-xmark" style={{color: 'var(--text-muted)'}}></i>}</td>
                      )}
                      <td>{calculateSlaBadge(t, slas)}</td>
                      <td>{typeof t.responsable === 'string' ? t.responsable : (t.responsable?.nombre || 'Sin asignar')}</td>
                      <td style={{ color: '#64748b', fontSize: '11px' }}>{t.fechaCreacion || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Vista Kanban */}
      <div id="gestionKanban" style={{ display: view === 'kanban' ? 'block' : 'none' }}>
        <div id="kanbanBoard" className="kanban-board">
          {kanbanCols.map(col => {
            const ticketsCol = activos.filter(t => t.estado === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header">
                  <div className="kanban-col-dot" style={{ background: col.color }}></div>
                  <div className="kanban-col-title">{col.label}</div>
                  <div className="kanban-col-count">{ticketsCol.length}</div>
                </div>
                <div className="kanban-col-body">
                  {ticketsCol.length === 0 ? (
                    <div className="kanban-empty">Sin tickets en esta columna</div>
                  ) : (
                    ticketsCol.map(t => {
                      const prio = t.prioridad || 'Baja';
                      const dot = prioColor[prio] || '#94a3b8';
                      return (
                        <div key={t.id} className={`kanban-card ${String(prio).toLowerCase()}`} data-ticket-id={t.id} onClick={() => openModal(t.id)}>
                          <div className="kanban-card-id">
                            {t.id || ''}
                            {t.tipo && (
                              <span className={`tipo-badge ${String(t.tipo).toLowerCase()}`} style={{ float: 'right', fontSize: '9px', padding: '2px 6px', marginTop: '-2px' }}>
                                {t.tipo}
                              </span>
                            )}
                          </div>
                          <div className="kanban-card-title">{t.solicitud || t.nombre || ''}</div>
                          <div className="kanban-card-who" style={{ marginBottom: '6px', color: '#475569' }}>
                            <i className="fa-regular fa-user" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                            {t.nombre || (typeof t.solicitante === 'string' ? t.solicitante : t.solicitante?.nombreReal) || 'Desconocido'}
                          </div>
                          <div className="kanban-card-footer">
                            <span className="kanban-card-who" title="Responsable asignado">
                              <i className="fa-solid fa-user-tie" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                              {typeof t.responsable === 'string' ? t.responsable : (t.responsable?.nombre || 'Sin asignar')}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                              <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px' }}>
                            {calculateSlaBadge(t, slas)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div id="toast" className="toast hidden"></div>

      {/* MODAL EDICIÓN TICKET */}
      {modalOpen && (
        <div id="modalOverlay" className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="kanban-label-small">GESTIONANDO TICKET</div>
                <div id="modalTicketId" className="kanban-title-large">{ticketEdit.id}</div>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div id="modalSolicitudDesc" className="kanban-desc-box">
              {ticketEdit.solicitud} {ticketEdit.solicitante ? `- Solicitante: ${ticketEdit.solicitante}` : ''}
            </div>

            {/* RENDERIZADOR DINÁMICO DE DETALLES (GH JSON) */}
            {ticketEdit.detalles && typeof ticketEdit.detalles === 'object' && Object.keys(ticketEdit.detalles).length > 0 && (
              <div className="kanban-desc-box" style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--navy)' }}><i className="fa-solid fa-list-check"></i> Detalles Específicos del Trámite</strong>
                  
                  {((ticketEdit.tipoSolicitud && (ticketEdit.tipoSolicitud.includes('Convenio') || ticketEdit.tipoSolicitud.includes('Auxilio Educativo'))) || (ticketEdit.solicitud && (ticketEdit.solicitud.includes('Convenio') || ticketEdit.solicitud.includes('Auxilio Educativo')))) && (
                    <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--red)' }} onClick={() => setShowActa(true)}>
                      <i className="fa-solid fa-file-pdf"></i> Generar Acta PDF
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  {Object.entries(ticketEdit.detalles).map(([key, value]) => {
                    if (key === 'consentimientoLegal') return null;
                    if (key === 'firmaClave') return null;
                    if (key === 'firmaLegal') return null;
                    if (key === 'proyeccion') return null; // Renderizado especial
                    if (key === 'fechaInicioCorte') return null; // Ignorar el campo base
                    if (key === 'firmaISO') return null; // Metadata de auditoría oculta
                    if (key === 'firmaTimestamp') return null; // Metadata de auditoría oculta

                    // Fallback para tickets viejos: Si el campo está vacío, intentar buscarlo en la BD de usuarios actual
                    let finalValue = value;
                    if (!finalValue) {
                      // Fallback: intentar buscar en datos de usuario cacheados (si aplica)
                      // En futuras versiones, esto debería usar un contexto con datos precargados
                      finalValue = null;
                    }

                    const displayValue = finalValue || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No registrado</span>;

                    if (key === 'firmaCedula') {
                      return (
                        <div key={key} style={{ gridColumn: '1 / -1', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '4px', border: '1px dashed var(--green)' }}>
                          <strong style={{ color: 'var(--green)', display: 'block', marginBottom: '4px' }}><i className="fa-solid fa-shield-check"></i> Firma Electrónica Validada</strong> 
                          <span style={{ color: 'var(--text-color)', fontSize: '12px' }}>
                            Mecanismo: Credenciales del Sistema + Cédula (<strong>{value}</strong>)
                          </span>
                        </div>
                      );
                    }

                    // Capitalizar CamelCase de forma bonita
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    let finalDisplayElement = displayValue;
                    if (finalValue && !isNaN(finalValue) && (String(key).toLowerCase().includes('valor') || String(key).toLowerCase().includes('monto') || String(key).toLowerCase().includes('cuota') || String(key).toLowerCase().includes('precio'))) {
                      finalDisplayElement = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(finalValue);
                    }

                    return (
                      <div key={key}>
                        <strong style={{ color: 'var(--text-muted)' }}>{formattedKey}:</strong> 
                        <span style={{ color: 'var(--text-color)', display: 'block', marginTop: '2px' }}>{finalDisplayElement}</span>
                      </div>
                    );
                  })}
                </div>
                
                {ticketEdit.detalles.proyeccion && ticketEdit.detalles.proyeccion.length > 0 && (
                  <div style={{ marginTop: '20px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                    <h5 style={{ background: 'var(--navy)', color: '#fff', margin: 0, padding: '10px 15px', fontSize: '13px' }}>
                      <i className="fa-solid fa-table"></i> Tabla de Amortización Autorizada
                    </h5>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: 'var(--text-color)' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.05)', position: 'sticky', top: 0 }}>
                          <tr>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}># Cuota</th>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>Corte de Nómina</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--card-border)' }}>Valor a Descontar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketEdit.detalles.proyeccion.map((p, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{p.cuota}</td>
                              <td style={{ padding: '8px', textAlign: 'left' }}>{new Date(p.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--red)' }}>
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.valor)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}


            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <div className="select-wrapper">
                  <i className="fa-regular fa-clock select-icon-left red"></i>
                  <select id="m_estado" className="form-select padded-left" value={ticketEdit.estado} onChange={handleModalChange}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Revisado">Revisado (Visto)</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Suspendido">Suspendido (Pausado)</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Responsable</label>
                <div className="select-wrapper">
                  <i className="fa-solid fa-user-tie select-icon-left"></i>
                  <select id="m_responsable" className="form-select padded-left" value={ticketEdit.responsable} onChange={handleModalChange}>
                    <option value="">Sin asignar</option>
                    {responsables.map(r => (
                      <option key={r.nombre || r} value={r.nombre || r}>{r.nombre || r}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
              </div>

              {area !== 'gh' && (
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <div className="select-wrapper">
                    <i className="fa-solid fa-arrow-down select-icon-left"></i>
                    <select id="m_prioridad" className="form-select padded-left" value={ticketEdit.prioridad} onChange={handleModalChange}>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tipo de Solicitud</label>
                <div className="select-wrapper">
                  <i className="fa-solid fa-users-gear select-icon-left"></i>
                  <select id="m_tipoSolicitud" className="form-select padded-left" value={ticketEdit.tipoSolicitud} onChange={handleModalChange}>
                    <option value="" disabled>Seleccione el Tipo...</option>
                    {(config.tiposSolicitud || config.grupos || []).map((g, idx) => (
                      <option key={idx} value={g.nombre}>{g.nombre}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
              </div>

              {ticketEdit.tipoSolicitud !== 'Sistema de Gestión' && (
                <div className="form-group form-group-full">
                  <label className="form-label">Tipo de Trámite</label>
                  <div className="select-wrapper">
                    <i className="fa-solid fa-layer-group select-icon-left"></i>
                    <select id="m_clasificacion" className="form-select padded-left" value={ticketEdit.clasificacion} onChange={handleModalChange}>
                      <option value="" disabled>Seleccione un Trámite...</option>
                      {renderTramites()}
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>
              )}

              {ticketEdit.tipoSolicitud === 'Sistema de Gestión' && (
                <div className="form-group form-group-full" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <label className="form-label" style={{ marginBottom: '10px', color: 'var(--navy)' }}><i className="fa-solid fa-tags"></i> Clasificación para el Sistema de Gestión (Análisis GH)</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="sgc_clasificacion" 
                        value="Calidad" 
                        checked={ticketEdit.clasificacion === 'Calidad'}
                        onChange={(e) => setTicketEdit({...ticketEdit, clasificacion: e.target.value})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      Calidad
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="sgc_clasificacion" 
                        value="SST" 
                        checked={ticketEdit.clasificacion === 'SST'}
                        onChange={(e) => setTicketEdit({...ticketEdit, clasificacion: e.target.value})}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      SST
                    </label>
                  </div>
                </div>
              )}

              {area === 'gh' && (
                <div className="form-group form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="m_novedadNomina" 
                    checked={ticketEdit.novedadNomina} 
                    onChange={handleModalChange} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="m_novedadNomina" style={{ cursor: 'pointer', margin: 0, fontWeight: '600' }}>
                    <i className="fa-solid fa-money-check-dollar" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                    Novedad de Nómina
                  </label>
                </div>
              )}

              {ticketEdit.tipoSolicitud === 'Certificado Laboral' && (
                <div className="form-group form-group-full" style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', marginTop: '10px' }}>
                  <label className="form-label" style={{ marginBottom: '10px', color: 'var(--green)' }}><i className="fa-solid fa-file-pdf"></i> Adjuntar Certificado Laboral (Generado)</label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="glass-input" 
                    onChange={(e) => setCertificadoFile(e.target.files[0])}
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
                    * Al subir este documento, el solicitante podrá descargarlo desde su portal de tickets recientes.
                  </small>
                </div>
              )}

              <div className="form-group form-group-full">
                <label className="form-label">Fecha Programada</label>
                <input type="date" id="m_fechaProgramada" className="form-input form-input-full" value={ticketEdit.fechaProgramada} onChange={handleModalChange} />
              </div>

              <div className="form-group form-group-full">
                <label className="form-label" style={{ color: 'var(--primary)' }}><i className="fa-solid fa-message"></i> Respuesta de GH (Visible en el portal del empleado)</label>
                <textarea className="form-input form-input-full" rows="2" placeholder="Ej: Aprobado / Denegado. Recuerda traer el soporte original mañana..." value={mensajeResolutor} onChange={(e) => setMensajeResolutor(e.target.value)}></textarea>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Este mensaje le aparecerá directamente al colaborador en su historial de tickets recientes.</small>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Acción Técnica / Notas Internas</label>
                <textarea id="m_accion" className="form-input form-input-full" rows="2" placeholder="Describe lo que hiciste para resolverlo..." value={ticketEdit.accion} onChange={handleModalChange}></textarea>
              </div>

              {ticketEdit.adjuntos && ticketEdit.adjuntos.length > 0 && (
                <div className="form-group form-group-full" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <label className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-paperclip"></i> Archivos Adjuntos ({ticketEdit.adjuntos.length})
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {ticketEdit.adjuntos.map((url, idx) => {
                      const isVisto = archivosVistos.has(url);
                      const nombreLimpio = getOriginalFileName(url);
                      const sePuedeVer = isPreviewable(url);
                      return (
                        <div 
                          key={idx}
                          style={{
                            display: 'inline-flex', alignItems: 'stretch',
                            background: isVisto ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.7)', 
                            border: `1.5px solid ${isVisto ? 'rgba(34, 197, 94, 0.4)' : 'rgba(200, 215, 235, 0.6)'}`,
                            borderRadius: '10px', transition: 'all 0.22s',
                            overflow: 'hidden', maxWidth: '100%'
                          }}
                        >
                          <a 
                            href={url} 
                            target={sePuedeVer ? "_blank" : "_self"} 
                            rel="noopener noreferrer"
                            download={!sePuedeVer ? nombreLimpio : undefined}
                            title={nombreLimpio}
                            onClick={() => setArchivosVistos(prev => new Set(prev).add(url))}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '7px',
                              padding: '9px 12px', color: isVisto ? '#16a34a' : 'var(--text-muted)', 
                              fontSize: '13px', fontWeight: '500', textDecoration: 'none'
                            }}
                          >
                            <i className={`fa-solid ${isVisto ? 'fa-check-double' : (sePuedeVer ? 'fa-image' : 'fa-download')}`} style={{ flexShrink: 0 }}></i> 
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                              {nombreLimpio}
                            </span>
                          </a>
                          {sePuedeVer && (
                            <button
                              type="button"
                              title={`Descargar ${nombreLimpio}`}
                              onClick={(e) => handleDownload(e, url, nombreLimpio)}
                              style={{
                                border: 'none', background: 'rgba(0,0,0,0.03)', padding: '0 12px',
                                borderLeft: `1px solid ${isVisto ? 'rgba(34, 197, 94, 0.2)' : 'rgba(200, 215, 235, 0.6)'}`,
                                cursor: 'pointer', color: isVisto ? '#16a34a' : 'var(--text-muted)',
                                transition: 'background 0.2s', display: 'flex', alignItems: 'center'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                            >
                              <i className="fa-solid fa-cloud-arrow-down"></i>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-actions">
              <div className="modal-footer-left">
                <button 
                  type="button" 
                  className={`btn-quick-action revisado ${ticketEdit.estado === 'Revisado' ? 'active' : ''}`}
                  title="Marcar como Visto/Revisado"
                  onClick={() => setTicketEdit(prev => ({...prev, estado: 'Revisado'}))}
                >
                  <i className="fa-solid fa-eye"></i> <span className="hide-mobile">Revisado</span>
                </button>
                <button 
                  type="button" 
                  className={`btn-quick-action suspendido ${ticketEdit.estado === 'Suspendido' ? 'active' : ''}`}
                  title="Suspender ticket (Pausar SLA)"
                  onClick={() => setTicketEdit(prev => ({...prev, estado: 'Suspendido'}))}
                >
                  <i className="fa-solid fa-pause"></i> <span className="hide-mobile">Suspender</span>
                </button>
              </div>
              <div className="modal-footer-right">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="button" className="btn-save" onClick={saveEdits}>
                  <span className={modalLoading ? 'hidden' : ''}>Guardar Cambios</span>
                  <span className={`btn-loader ${modalLoading ? '' : 'hidden'}`}><i className="fa-solid fa-spinner fa-spin"></i></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER ACTA DE DEDUCCIÓN / BONO EDUCATIVO (PRINTABLE) */}
      {showActa && ticketEdit && ((ticketEdit.tipoSolicitud && ticketEdit.tipoSolicitud.includes('Convenio')) || (ticketEdit.solicitud && ticketEdit.solicitud.includes('Convenio'))) && (
        <ActaDeduccion ticket={ticketEdit} onClose={() => setShowActa(false)} />
      )}
      {showActa && ticketEdit && ((ticketEdit.tipoSolicitud && ticketEdit.tipoSolicitud.includes('Auxilio Educativo')) || (ticketEdit.solicitud && ticketEdit.solicitud.includes('Auxilio Educativo'))) && (
        <ActaAuxilioPdf ticket={ticketEdit} onClose={() => setShowActa(false)} />
      )}

    </section>
  );
};
