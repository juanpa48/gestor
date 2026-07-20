import React, { useState } from 'react';
import { useAreaTickets as useTickets } from '../../../areas/gestion-empresarial/context/GEContext';
import { GE_CONFIG } from '../../../areas/gestion-empresarial/config';
import { UploadService } from '../../../shared/services/UploadService';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const FormGE = () => {
  const { currentUser } = useAuth();
  const nombre = currentUser?.nombreReal || currentUser?.username || '';
  const { addTicket } = useTickets();
  const [areaGestion, setAreaGestion] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [archivos, setArchivos] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const showToast = (message, type = 'success', icon = 'check') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.className = `toast show ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
      toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> &nbsp;${message}`;
      setTimeout(() => { toast.className = 'toast hidden'; }, 4000);
    }
  };

  const renderTramites = () => {
    let list = [];
    if (areaGestion.includes('Área 1') || areaGestion.includes('Estructural')) list = GE_CONFIG.grupos[0]?.tramites || [];
    else if (areaGestion.includes('Área 2') || areaGestion.includes('Operativo')) list = GE_CONFIG.grupos[1]?.tramites || [];
    return list.map(t => <option key={t} value={t}>{t}</option>);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !areaGestion || !tipoTramite || !solicitud) {
      showToast('Por favor, complete todos los campos obligatorios.', 'error', 'triangle-exclamation');
      return;
    }

    setLoadingSubmit(true);

    // 1. Generar el ID del ticket primero
    const rawActs = JSON.parse(localStorage.getItem('db_actividades_ge') || '[]');
    const numReq = rawActs.filter(t => (t.id || '').startsWith('GE-')).length + 1;
    const newId = `GE-${String(numReq).padStart(3, '0')}`;

    // 2. Subir archivos pasando el ID para la carpeta
    let adjuntosUrls = [];
    try {
      if (archivos && archivos.length > 0) {
        adjuntosUrls = await UploadService.uploadFiles(archivos, newId, 'ge');
      }
    } catch (err) {
      setLoadingSubmit(false);
      showToast('Error al subir archivos: ' + err.message, 'error', 'triangle-exclamation');
      return;
    }

    // 3. Crear el ticket
    try {
      const nuevoTicket = {
        id: newId,
        fechaISO: new Date().toISOString(),
        fechaCreacion: new Date().toLocaleString(),
        nombre: nombre,
        solicitante: nombre,
        cargo: currentUser?.cargo || 'Usuario del Sistema',
        solicitud: solicitud,
        estado: 'Pendiente',
        prioridad: prioridad,
        responsable: '',
        grupo: areaGestion,
        grupoExtra: tipoTramite,
        clasificacion: '',
        detalles: '',
        adjuntos: adjuntosUrls
      };

      await addTicket(nuevoTicket);
      
      setSolicitud('');
      setAreaGestion('');
      setTipoTramite('');
      setPrioridad('Media');
      setArchivos([]);
      
      showToast(`¡Solicitud <strong>${newId}</strong> enviada exitosamente!`, 'success', 'check');
    } catch (err) {
      showToast('Error al enviar la solicitud. Intente de nuevo.', 'error', 'triangle-exclamation');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">SOLICITANTE</label>
        <div className="select-wrapper">
          <input 
            type="text" 
            className="glass-input" 
            value={`${nombre} ${currentUser?.cargo ? `(${currentUser.cargo})` : ''}`} 
            disabled 
            style={{ opacity: 0.8, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">ÁREA DE GESTIÓN (GE)</label>
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

      <div className="form-group">
        <label className="form-label">EVIDENCIAS / ARCHIVOS ADJUNTOS (Opcional)</label>
        <div className="file-upload-wrapper">
          <input 
            type="file" 
            className="glass-input" 
            multiple 
            onChange={(e) => setArchivos(e.target.files)}
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Puede seleccionar varios archivos a la vez.
          </small>
        </div>
      </div>

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
  );
};
