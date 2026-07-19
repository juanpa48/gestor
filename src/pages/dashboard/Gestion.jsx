import React, { useState, useMemo, useEffect } from 'react';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';

export const Gestion = () => {
  const { ctx, config } = useActiveArea();
  const { actividades, responsables, updateTicket } = ctx;
  const [view, setView] = useState('tabla'); // 'tabla' o 'kanban'
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [ticketEdit, setTicketEdit] = useState({
    id: '',
    solicitud: '',
    solicitante: '',
    estado: 'Pendiente',
    responsable: '',
    prioridad: 'Baja',
    grupo: '',
    clasificacion: '',
    detalles: '',
    adjuntos: []
  });
  const [archivosVistos, setArchivosVistos] = useState(new Set());

  // Escuchar el evento de busqueda global del Topbar
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail?.query?.toLowerCase() || '');
    };
    document.addEventListener('searchTriggered', handleSearch);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) setSearchQuery(searchInput.value.toLowerCase());

    return () => document.removeEventListener('searchTriggered', handleSearch);
  }, []);

  const activos = useMemo(() => {
    return actividades.filter(a => {
      const isActive = !['Resuelto', 'Cerrado'].includes(a.estado);
      if (!isActive) return false;
      if (filtroEstado && a.estado !== filtroEstado) return false;

      if (searchQuery) {
        const matchesId = (a.id || '').toLowerCase().includes(searchQuery);
        const matchesSol = (a.solicitud || '').toLowerCase().includes(searchQuery);
        const matchesNom = (a.nombre || a.solicitante || '').toLowerCase().includes(searchQuery);
        const matchesResp = (a.responsable || '').toLowerCase().includes(searchQuery);
        if (!matchesId && !matchesSol && !matchesNom && !matchesResp) return false;
      }
      return true;
    }).reverse();
  }, [actividades, filtroEstado, searchQuery]);

  const kanbanCols = [
    { key: 'Pendiente', label: 'Pendiente', color: '#94a3b8' },
    { key: 'En progreso', label: 'En Progreso', color: '#3b82f6' }
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
      grupo: t.grupo || 'Soporte Tecnico',
      clasificacion: t.grupoExtra || t.clasificacion || '',
      detalles: t.detalles || '',
      fechaProgramada: t.fechaProgramada || '',
      accion: t.accion || '',
      adjuntos: t.adjuntos || []
    });
    setArchivosVistos(new Set()); // Resetear vistos al abrir nuevo ticket
    setModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('m_', ''); // e.g. m_estado -> estado
    setTicketEdit(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'grupo') {
        next.clasificacion = ''; // Reset when group changes
      }
      return next;
    });
  };

  const renderTramites = () => {
    const grupoEncontrado = config.grupos.find(g => ticketEdit.grupo.includes(g.nombre) || g.nombre.includes(ticketEdit.grupo));
    if (grupoEncontrado) {
      return grupoEncontrado.tramites.map(t => <option key={t} value={t}>{t}</option>);
    }
    return [];
  };

  const saveEdits = async () => {
    setModalLoading(true);
    try {
      await updateTicket(ticketEdit.id, {
        estado: ticketEdit.estado,
        responsable: ticketEdit.responsable,
        prioridad: ticketEdit.prioridad,
        grupo: ticketEdit.grupo,
        grupoExtra: ticketEdit.clasificacion,
        clasificacion: ticketEdit.clasificacion,
        detalles: ticketEdit.detalles,
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

  return (
    <section id="section-solicitudes" className="section active">
      <div className="section-header">
        <h2 className="section-title">Gestión de Tickets</h2>
        <div className="header-actions">
          <select id="filtroEstado" className="form-select header-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
          </select>
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'tabla' ? 'active' : ''}`} onClick={() => setView('tabla')}>
              <i className="fa-solid fa-table-list"></i> Tabla
            </button>
            <button className={`toggle-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>
              <i className="fa-solid fa-columns"></i> Kanban
            </button>
          </div>
          <button className="btn-refresh" id="btnRefreshGestion" onClick={() => window.location.reload()}>
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
                  <th>Solicitud</th>
                  <th>Solicitante</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Responsable</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {activos.map(t => {
                  const prio = t.prioridad || 'Baja';
                  const dot = prioColor[prio] || '#94a3b8';
                  const estadoClase = (t.estado || '').toLowerCase().includes('progreso') ? 'progreso' : 'pendiente';
                  return (
                    <tr key={t.id} className="ticket-row-clickable" data-ticket-id={t.id} onClick={() => openModal(t.id)}>
                      <td><strong>{t.id || ''}</strong></td>
                      <td style={{ maxWidth: '350px', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: '1.4' }}>
                        {t.solicitud || t.nombre || ''}
                      </td>
                      <td>{t.nombre || t.solicitante || ''}</td>
                      <td><span className={`status-badge ${estadoClase}`}>{t.estado || ''}</span></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                        </span>
                      </td>
                      <td>{t.responsable || 'Sin asignar'}</td>
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
                        <div key={t.id} className={`kanban-card ${prio.toLowerCase()}`} data-ticket-id={t.id} onClick={() => openModal(t.id)}>
                          <div className="kanban-card-id">{t.id || ''}</div>
                          <div className="kanban-card-title">{t.solicitud || t.nombre || ''}</div>
                          <div className="kanban-card-who" style={{ marginBottom: '6px', color: '#475569' }}>
                            <i className="fa-regular fa-user" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                            {t.nombre || t.solicitante || 'Desconocido'}
                          </div>
                          <div className="kanban-card-footer">
                            <span className="kanban-card-who" title="Responsable asignado">
                              <i className="fa-solid fa-user-tie" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                              {t.responsable || 'Sin asignar'}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                              <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                            </span>
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

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <div className="select-wrapper">
                  <i className="fa-regular fa-clock select-icon-left red"></i>
                  <select id="m_estado" className="form-select padded-left" value={ticketEdit.estado} onChange={handleModalChange}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
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

              <div className="form-group">
                <label className="form-label">Área de Gestión</label>
                <div className="select-wrapper">
                  <i className="fa-solid fa-users-gear select-icon-left"></i>
                  <select id="m_grupo" className="form-select padded-left" value={ticketEdit.grupo} onChange={handleModalChange}>
                    <option value="" disabled>Seleccione el Área...</option>
                    {config.grupos.map((g, idx) => (
                      <option key={idx} value={g.nombre}>{g.nombre}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down select-arrow"></i>
                </div>
              </div>

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

              <div className="form-group">
                <label className="form-label">Fecha Programada</label>
                <input type="date" id="m_fechaProgramada" className="form-input form-input-full" value={ticketEdit.fechaProgramada} onChange={handleModalChange} />
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Acción Técnica / Notas</label>
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
                        <a 
                          key={idx} 
                          href={url} 
                          target={sePuedeVer ? "_blank" : "_self"} 
                          rel="noopener noreferrer"
                          download={!sePuedeVer ? nombreLimpio : undefined}
                          title={nombreLimpio}
                          onClick={() => setArchivosVistos(prev => new Set(prev).add(url))}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '9px 18px', 
                            background: isVisto ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.7)', 
                            color: isVisto ? '#16a34a' : 'var(--text-muted)', 
                            border: `1.5px solid ${isVisto ? 'rgba(34, 197, 94, 0.4)' : 'rgba(200, 215, 235, 0.6)'}`,
                            borderRadius: '10px', fontSize: '13px', fontWeight: '500', textDecoration: 'none',
                            transition: 'all 0.22s', maxWidth: '100%'
                          }}
                        >
                          <i className={`fa-solid ${isVisto ? 'fa-check-double' : 'fa-download'}`} style={{ flexShrink: 0 }}></i> 
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {nombreLimpio}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions form-actions-mt">
              <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="button" className="btn-save" onClick={saveEdits}>
                <span className={modalLoading ? 'hidden' : ''}>Guardar Cambios</span>
                <span className={`btn-loader ${modalLoading ? '' : 'hidden'}`}><i className="fa-solid fa-spinner fa-spin"></i></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
