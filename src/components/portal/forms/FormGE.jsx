import React, { useState } from 'react';
import { useAreaTickets as useTickets } from '../../../areas/gestion-empresarial/context/GEContext';
import { tramitesArea1, tramitesArea2 } from '../../../data/tramitesData';

export const FormGE = ({ nombre, setNombre }) => {
  const { solicitantes, getSolicitanteCargo, addTicket } = useTickets();
  const [areaGestion, setAreaGestion] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [rutaT, setRutaT] = useState('');
  const [checkPdf, setCheckPdf] = useState(false);
  const [prioridad, setPrioridad] = useState('Media');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const isFirmas = tipoTramite === 'Firmas de documentos';

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
    if (areaGestion.includes('Área 1') || areaGestion.includes('Estructural')) list = tramitesArea1;
    else if (areaGestion.includes('Área 2') || areaGestion.includes('Operativo')) list = tramitesArea2;
    return list.map(t => <option key={t} value={t}>{t}</option>);
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
      // Fake getting the number to generate REQ-XXX (in real app, backend assigns ID)
      const rawActs = JSON.parse(localStorage.getItem('db_actividades_ge') || '[]');
      const numReq = rawActs.filter(t => (t.id || '').startsWith('REQ-')).length + 1;
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

  return (
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
  );
};
