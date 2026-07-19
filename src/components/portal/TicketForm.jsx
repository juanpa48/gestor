import React, { useState } from 'react';
import { useAreaTickets as useTickets } from '../../areas/gestion-empresarial/context/GEContext';
import { GE_CONFIG } from '../../areas/gestion-empresarial/config';
import { UploadService } from '../../shared/services/UploadService';

export const TicketForm = () => {
  const { addTicket } = useTickets();
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    area: '',
    tramite: '',
    asunto: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [archivos, setArchivos] = useState([]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAreaChange = (e) => {
    setFormData(prev => ({
      ...prev,
      area: e.target.value,
      tramite: '' // reset tramite
    }));
  };

  const currentTramites = formData.area === 'area1' ? (GE_CONFIG.grupos[0]?.tramites || [])
                        : formData.area === 'area2' ? (GE_CONFIG.grupos[1]?.tramites || [])
                        : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // 1. Generar ID
    const rawActs = JSON.parse(localStorage.getItem('db_actividades_ge') || '[]');
    const numReq = rawActs.filter(t => (t.id || '').startsWith('GE-')).length + 1;
    const newId = `GE-${String(numReq).padStart(3, '0')}`;

    // 2. Subir archivos
    let adjuntosUrls = [];
    try {
      if (archivos && archivos.length > 0) {
        adjuntosUrls = await UploadService.uploadFiles(archivos, newId, 'ge');
      }
    } catch (err) {
      setLoading(false);
      alert('Error al subir archivos: ' + err.message);
      return;
    }

    // Mapping fields to match dashboard structure
    const ticketData = {
      id: newId,
      solicitante: formData.nombre,
      solicitud: formData.tramite || formData.asunto,
      grupo: formData.area === 'area1' ? 'Área 1' : 'Área 2',
      estado: 'Pendiente',
      prioridad: 'Media', // Default for portal
      responsable: '',
      detalles: formData.asunto,
      empresa: formData.empresa,
      adjuntos: adjuntosUrls
    };

    const res = await addTicket(ticketData);

    setLoading(false);
    if (res.success) {
      setSuccess('Tu solicitud ha sido radicada correctamente.');
      setFormData({
        nombre: '', empresa: '', area: '', tramite: '', asunto: ''
      });
      setArchivos([]);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  return (
    <div className="glass-panel form-panel">
      <div className="form-header">
        <h2><i className="fa-solid fa-file-signature"></i> Nuevo Requerimiento</h2>
        <p>Completa el formulario para solicitar soporte o servicios al área de TI.</p>
      </div>

      {success && (
        <div style={{ backgroundColor: '#10b98120', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #10b98150' }}>
          <i className="fa-solid fa-circle-check"></i> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Solicitante *</label>
            <input type="text" name="nombre" className="glass-input" required 
                   value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" />
          </div>
          <div className="form-group">
            <label>Empresa / Departamento *</label>
            <input type="text" name="empresa" className="glass-input" required 
                   value={formData.empresa} onChange={handleChange} placeholder="Ej: Contabilidad" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Área de Atención *</label>
            <select name="area" className="glass-input" required value={formData.area} onChange={handleAreaChange}>
              <option value="" disabled>Seleccione un área</option>
              <option value="area1">Área 1: Creación de Empresas, Cambios C.C, RUP, RUB</option>
              <option value="area2">Área 2: Resoluciones, Firmas Electrónicas, Facturación</option>
            </select>
          </div>
        </div>

        {formData.area && (
          <div className="form-group fade-in">
            <label>Tipo de Trámite *</label>
            <select name="tramite" className="glass-input" required value={formData.tramite} onChange={handleChange}>
              <option value="" disabled>Seleccione el trámite</option>
              {currentTramites.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        )}

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label>Asunto / Descripción Detallada *</label>
          <textarea name="asunto" className="glass-input" rows="4" required 
                    value={formData.asunto} onChange={handleChange}
                    placeholder="Describa brevemente el requerimiento, enlaces o notas adicionales..."></textarea>
        </div>

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label>Evidencias / Archivos Adjuntos (Opcional)</label>
          <div className="file-upload-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <input 
              type="file" 
              className="glass-input" 
              multiple 
              onChange={(e) => setArchivos(e.target.files)}
              style={{ width: '100%', padding: '10px' }}
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Puede seleccionar varios archivos a la vez.
            </small>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '32px', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span><i className="fa-solid fa-spinner fa-spin"></i> Enviando...</span>
            ) : (
              <span><i className="fa-solid fa-paper-plane"></i> Radicar Solicitud</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
