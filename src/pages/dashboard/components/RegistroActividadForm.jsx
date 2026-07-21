import React, { useState, useEffect } from 'react';
import { useActiveArea } from '../../../shared/contexts/ActiveAreaContext';
import { DbService } from '../../../shared/services/DbService';
import { UploadService } from '../../../shared/services/UploadService';

export const RegistroActividadForm = () => {
  const { ctx, config } = useActiveArea();
  const { addTicket, getSolicitanteCargo, responsables } = ctx;
  const [solicitantes, setSolicitantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [archivos, setArchivos] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    solicitante: '',
    responsable: '',
    solicitud: '',
    estado: 'Pendiente',
    prioridad: '',
    grupo: '',
    clasificacion: '',
    tipo: 'Incidente',
    fechaInicio: '',
    fechaFin: '',
    fechaProgramada: '',
    detalles: ''
  });

  // Modal rápido state
  const [quickFormData, setQuickFormData] = useState({
    qr_solicitante: '',
    qr_responsable: '',
    qr_solicitud: '',
    qr_estado: 'Pendiente',
    qr_tipo: 'Incidente',
    qr_prioridad: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const sols = await DbService.getSolicitantes();
        setSolicitantes(sols || []);
      } catch (err) {
        console.error("Error loading solicitantes", err);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'grupo') {
        newData.clasificacion = ''; // Reset clasificacion when group changes
      }
      return newData;
    });
  };

  const handleQuickInputChange = (e) => {
    const { id, value } = e.target;
    setQuickFormData(prev => ({ ...prev, [id]: value }));
  };

  const setHoy = (field) => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, [field]: today }));
  };

  const showToast = (message) => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.remove('hidden');
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Generar ID
    let newId = '';
    try {
      const tickets = await DbService.getActividades();
      newId = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
    } catch (e) {
      console.error(e);
      newId = `TKT-${Date.now()}`;
    }

    // 2. Subir archivos
    let adjuntosUrls = [];
    try {
      if (archivos && archivos.length > 0) {
        adjuntosUrls = await UploadService.uploadFiles(archivos, newId, 'actividades');
      }
    } catch (err) {
      setLoading(false);
      showToast('Error al subir archivos: ' + err.message);
      return;
    }

    try {
      const newTicket = {
        id: newId,
        fechaCreacion: new Date().toLocaleString(),
        nombre: formData.solicitante,
        solicitante: formData.solicitante,
        cargo: getSolicitanteCargo(formData.solicitante),
        solicitud: formData.solicitud,
        estado: formData.estado,
        prioridad: formData.prioridad,
        responsable: formData.responsable,
        grupo: formData.grupo,
        grupoExtra: formData.clasificacion,
        clasificacion: formData.clasificacion,
        tipo: formData.tipo,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        fechaProgramada: formData.fechaProgramada,
        accion: '',
        detalles: formData.detalles,
        adjuntos: adjuntosUrls
      };

      await addTicket(newTicket);
      showToast('¡Actividad registrada con éxito!');
      
      // Reset form
      setFormData({
        solicitante: '', responsable: '', solicitud: '', estado: 'Pendiente', 
        prioridad: '', grupo: '', clasificacion: '', tipo: 'Incidente', fechaInicio: '', 
        fechaFin: '', fechaProgramada: '', detalles: ''
      });
      setArchivos([]);
    } catch (err) {
      console.error(err);
      showToast('Error al registrar actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const btnLoader = document.getElementById('btnModalRapidoLoader');
    const btnText = document.getElementById('btnModalRapidoText');
    
    if (!quickFormData.qr_solicitante || !quickFormData.qr_solicitud || !quickFormData.qr_estado) {
      alert("Por favor completa los campos obligatorios (*)");
      return;
    }
    
    if (btnLoader) btnLoader.classList.remove('hidden');
    if (btnText) btnText.classList.add('hidden'); // instead of style

    try {
      const tickets = await DbService.getActividades();
      const newId = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
      
      const newTicket = {
        id: newId,
        fechaCreacion: new Date().toLocaleString(),
        nombre: quickFormData.qr_solicitante,
        solicitante: quickFormData.qr_solicitante,
        cargo: getSolicitanteCargo(quickFormData.qr_solicitante),
        solicitud: quickFormData.qr_solicitud,
        estado: quickFormData.qr_estado,
        tipo: quickFormData.qr_tipo,
        prioridad: quickFormData.qr_prioridad || 'Baja',
        responsable: quickFormData.qr_responsable || '',
        grupo: '',
        grupoExtra: '',
        clasificacion: '',
        fechaInicio: '',
        fechaFin: '',
        fechaProgramada: '',
        accion: '',
        detalles: ''
      };

      await addTicket(newTicket);
      showToast('¡Ticket rápido creado!');
      setModalOpen(false);
      setQuickFormData({ qr_solicitante: '', qr_responsable: '', qr_solicitud: '', qr_estado: 'Pendiente', qr_tipo: 'Incidente', qr_prioridad: '' });
    } catch (err) {
      console.error(err);
      showToast('Error al crear ticket rápido');
    } finally {
      if (btnLoader) btnLoader.classList.add('hidden');
      if (btnText) btnText.classList.remove('hidden');
    }
  };

  const renderTramites = () => {
    const grupoEncontrado = config.grupos.find(g => formData.grupo === g.nombre);
    if (grupoEncontrado) {
      return grupoEncontrado.tramites.map(t => <option key={t} value={t}>{t}</option>);
    }
    return <option value="" disabled>Primero seleccione un Área...</option>;
  };

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="flex-between mb-2px">
          <h2 className="form-title">Registrar Actividad</h2>
          <button type="button" className="btn-cancel btn-rapido" onClick={() => setModalOpen(true)}>
            <i className="fa-solid fa-bolt"></i> Rápido
          </button>
        </div>

        <div className="form-grid">
          {/* Fila 1 */}
          <div className="form-group">
            <label className="form-label" htmlFor="solicitante">Solicitante</label>
            <div className="select-wrapper">
              <i className="fa-regular fa-user select-icon-left"></i>
              <select id="solicitante" name="solicitante" className="form-select padded-left" required value={formData.solicitante} onChange={handleInputChange}>
                <option value="">Seleccione solicitante...</option>
                {solicitantes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="responsable">Responsable</label>
            <div className="select-wrapper">
              <i className="fa-solid fa-user-tie select-icon-left"></i>
              <select id="responsable" name="responsable" className="form-select padded-left" required value={formData.responsable} onChange={handleInputChange}>
                <option value="">Seleccione responsable...</option>
                {responsables.map(r => (
                  <option key={r.nombre || r} value={r.nombre || r}>{r.nombre || r}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* Fila 2 - Descripción full width */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="solicitud">Solicitud del usuario</label>
            <textarea id="solicitud" name="solicitud" className="form-textarea" placeholder="Descripción detallada de la solicitud..." rows="4" required value={formData.solicitud} onChange={handleInputChange}></textarea>
          </div>

          {/* Fila 3 */}
          <div className="form-group">
            <label className="form-label" htmlFor="estado">Estado</label>
            <div className="select-wrapper">
              <i className="fa-regular fa-clock select-icon-left red"></i>
              <select id="estado" name="estado" className="form-select padded-left" required value={formData.estado} onChange={handleInputChange}>
                <option value="Pendiente">Pendiente</option>
                <option value="Revisado">Revisado</option>
                <option value="En progreso">En progreso</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="prioridad">Prioridad</label>
            <div className="select-wrapper">
              <i className="fa-solid fa-arrow-down select-icon-left"></i>
              <select id="prioridad" name="prioridad" className="form-select padded-left" required value={formData.prioridad} onChange={handleInputChange}>
                <option value="" disabled>Prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* Fila 4 */}
          <div className="form-group full-width">
            <label className="form-label">Tipo de Ticket</label>
            <div className="type-selector-container">
              <div 
                className={`type-selector-card ${formData.tipo === 'Incidente' ? 'active incidente' : ''}`}
                onClick={() => setFormData({...formData, tipo: 'Incidente', prioridad: 'Alta'})}
                style={{ padding: '12px' }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Incidente / Problema</span>
              </div>
              <div 
                className={`type-selector-card ${formData.tipo === 'Requerimiento' ? 'active requerimiento' : ''}`}
                onClick={() => setFormData({...formData, tipo: 'Requerimiento', prioridad: 'Media'})}
                style={{ padding: '12px' }}
              >
                <i className="fa-solid fa-file-lines"></i>
                <span>Requerimiento / Solicitud</span>
              </div>
            </div>
          </div>

          {/* Fila 5 */}
          <div className="form-group">
            <label className="form-label" htmlFor="grupo">Área de Gestión</label>
            <div className="select-wrapper">
              <i className="fa-solid fa-users-gear select-icon-left"></i>
              <select id="grupo" name="grupo" className="form-select padded-left" required value={formData.grupo} onChange={handleInputChange}>
                <option value="" disabled>Seleccione el Área...</option>
                {config.grupos.map((g, idx) => (
                  <option key={idx} value={g.nombre}>{g.nombre}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="clasificacion">Tipo de Trámite</label>
            <div className="select-wrapper">
              <i className="fa-solid fa-layer-group select-icon-left"></i>
              <select id="clasificacion" name="clasificacion" className="form-select padded-left" required value={formData.clasificacion} onChange={handleInputChange}>
                {formData.grupo === '' && <option value="" disabled>Primero seleccione un Área...</option>}
                {formData.grupo !== '' && <option value="" disabled>Seleccione un Trámite...</option>}
                {renderTramites()}
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* Fila 5 - Fechas */}
          <div className="form-group">
            <label className="form-label flex-between" htmlFor="fechaInicio">
              Fecha de Inicio
              <button type="button" className="btn-text-link" onClick={() => setHoy('fechaInicio')}>
                <i className="fa-solid fa-calendar-day"></i> Hoy
              </button>
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-calendar input-icon"></i>
              <input type="date" id="fechaInicio" name="fechaInicio" className="form-input" title="Fecha de Inicio" value={formData.fechaInicio} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label flex-between" htmlFor="fechaFin">
              Fecha de Finalización
              <button type="button" className="btn-text-link" onClick={() => setHoy('fechaFin')}>
                <i className="fa-solid fa-calendar-day"></i> Hoy
              </button>
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-calendar input-icon"></i>
              <input type="date" id="fechaFin" name="fechaFin" className="form-input" title="Fecha de Finalización" value={formData.fechaFin} onChange={handleInputChange} />
            </div>
          </div>

          {/* Fila 6 */}
          <div className="form-group">
            <label className="form-label flex-between" htmlFor="fechaProgramada">
              Fecha progamada
              <button type="button" className="btn-text-link" onClick={() => setHoy('fechaProgramada')}>
                <i className="fa-solid fa-calendar-day"></i> Hoy
              </button>
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-calendar-check input-icon"></i>
              <input type="date" id="fechaProgramada" name="fechaProgramada" className="form-input" title="Fecha Programada" value={formData.fechaProgramada} onChange={handleInputChange} />
            </div>
          </div>
          
          {/* Fila 7 - Archivos adjuntos */}
          <div className="form-group full-width">
            <label className="form-label">Archivos Adjuntos (Opcional)</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                className="form-input" 
                multiple 
                onChange={(e) => setArchivos(e.target.files)}
                style={{ padding: '8px' }}
              />
              <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Puede seleccionar varios archivos a la vez.
              </small>
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => setFormData({solicitante: '', responsable: '', solicitud: '', estado: 'Pendiente', prioridad: '', grupo: '', clasificacion: '', fechaInicio: '', fechaFin: '', fechaProgramada: '', detalles: ''})}>Cancelar</button>
          <button type="submit" className="btn-save">
            <span className={loading ? 'hidden' : ''}>Guardar Actividad</span>
            <span className={`btn-loader ${loading ? '' : 'hidden'}`}><i className="fa-solid fa-spinner fa-spin"></i></span>
          </button>
        </div>

        <div id="toast" className="toast hidden"></div>
      </form>

      {/* MODAL REGISTRO RÁPIDO */}
      {modalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="kanban-label-small">NUEVO TICKET</div>
                <div className="kanban-title-large"><i className="fa-solid fa-bolt"></i>Registro Rápido</div>
              </div>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <form onSubmit={handleQuickSubmit}>
              <div className="form-grid form-grid-1">
                <div className="form-group">
                  <label className="form-label">Solicitante *</label>
                  <div className="select-wrapper">
                    <i className="fa-regular fa-user select-icon-left"></i>
                    <select id="qr_solicitante" className="form-select padded-left" value={quickFormData.qr_solicitante} onChange={handleQuickInputChange} required>
                      <option value="" disabled>Seleccione solicitante...</option>
                      {solicitantes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Responsable (Opcional)</label>
                  <div className="select-wrapper">
                    <i className="fa-solid fa-user-tie select-icon-left"></i>
                    <select id="qr_responsable" className="form-select padded-left" value={quickFormData.qr_responsable} onChange={handleQuickInputChange}>
                      <option value="">Sin asignar / Opcional</option>
                      {responsables.map(r => (
                        <option key={r.nombre || r} value={r.nombre || r}>{r.nombre || r}</option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Solicitud *</label>
                  <textarea id="qr_solicitud" className="form-textarea" placeholder="¿Qué se necesita urgente?..." rows="3" required value={quickFormData.qr_solicitud} onChange={handleQuickInputChange}></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Ticket</label>
                  <div className="type-selector-container">
                    <div 
                      className={`type-selector-card ${quickFormData.qr_tipo === 'Incidente' ? 'active incidente' : ''}`}
                      onClick={() => setQuickFormData({...quickFormData, qr_tipo: 'Incidente', qr_prioridad: 'Alta'})}
                      style={{ padding: '10px' }}
                    >
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <span style={{ fontSize: '11px' }}>Incidente</span>
                    </div>
                    <div 
                      className={`type-selector-card ${quickFormData.qr_tipo === 'Requerimiento' ? 'active requerimiento' : ''}`}
                      onClick={() => setQuickFormData({...quickFormData, qr_tipo: 'Requerimiento', qr_prioridad: 'Media'})}
                      style={{ padding: '10px' }}
                    >
                      <i className="fa-solid fa-file-lines"></i>
                      <span style={{ fontSize: '11px' }}>Requerimiento</span>
                    </div>
                  </div>
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Estado *</label>
                    <div className="select-wrapper">
                      <i className="fa-regular fa-clock select-icon-left red"></i>
                      <select id="qr_estado" className="form-select padded-left" required value={quickFormData.qr_estado} onChange={handleQuickInputChange}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Revisado">Revisado</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                      <i className="fa-solid fa-chevron-down select-arrow"></i>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prioridad (Opcional)</label>
                    <div className="select-wrapper">
                      <i className="fa-solid fa-arrow-down select-icon-left"></i>
                      <select id="qr_prioridad" className="form-select padded-left" value={quickFormData.qr_prioridad} onChange={handleQuickInputChange}>
                        <option value="">En blanco / Ninguna</option>
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                      <i className="fa-solid fa-chevron-down select-arrow"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions form-actions-mt">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">
                  <span id="btnModalRapidoText">Crear Ticket Rápido</span>
                  <span id="btnModalRapidoLoader" className="btn-loader hidden"><i className="fa-solid fa-spinner fa-spin"></i></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
