import React, { useState } from 'react';
import { useGHContext as useTickets } from '../../../areas/gestion-humana/context/GHContext';
import { tramitesGH } from '../../../areas/gestion-humana/config';

export const FormGH = ({ nombre, setNombre }) => {
  const { solicitantes, getSolicitanteCargo, addTicket } = useTickets();
  const [tipoTramite, setTipoTramite] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const showToast = (message, type = 'success', icon = 'check') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.className = `toast show ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
      toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> &nbsp;${message}`;
      setTimeout(() => { toast.className = 'toast hidden'; }, 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !tipoTramite || !solicitud) {
      showToast('Por favor, complete todos los campos obligatorios.', 'error', 'triangle-exclamation');
      return;
    }

    setLoadingSubmit(true);
    try {
      const rawActs = JSON.parse(localStorage.getItem('db_actividades_gh') || '[]');
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
        grupo: 'Trámites de Personal',
        grupoExtra: tipoTramite,
        clasificacion: '',
        detalles: ''
      };

      await addTicket(nuevoTicket);
      
      setSolicitud('');
      setTipoTramite('');
      setPrioridad('Media');
      
      showToast(`¡Solicitud <strong>${newId}</strong> enviada a Gestión Humana!`, 'success', 'check');
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
        <label className="form-label">TIPO DE TRÁMITE (GH)</label>
        <div className="select-wrapper">
          <select className="glass-input" required value={tipoTramite} onChange={(e) => setTipoTramite(e.target.value)}>
            <option value="" disabled>Seleccione el Trámite...</option>
            {tramitesGH.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">DESCRIPCIÓN DE LA SOLICITUD</label>
        <textarea 
          className="glass-input" 
          placeholder="Describa el requerimiento para Gestión Humana..." 
          required 
          value={solicitud} 
          onChange={(e) => setSolicitud(e.target.value)}
        ></textarea>
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
          <><span>Enviar Solicitud a GH</span><i className="fa-solid fa-paper-plane"></i></>
        )}
      </button>
    </form>
  );
};
