import React, { useState } from 'react';
import { useTickets } from '../../contexts/TicketContext';
import { tramitesArea1, tramitesArea2 } from '../../data/tramitesData';

export const TicketForm = () => {
  const { addTicket } = useTickets();
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    area: '',
    tramite: '',
    requiereFirma: false,
    firma1: '',
    firma2: '',
    firma3: '',
    firma4: '',
    asunto: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAreaChange = (e) => {
    setFormData(prev => ({
      ...prev,
      area: e.target.value,
      tramite: '' // reset tramite
    }));
  };

  const currentTramites = formData.area === 'area1' ? tramitesArea1 
                        : formData.area === 'area2' ? tramitesArea2 
                        : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // Mapping fields to match dashboard structure
    const ticketData = {
      solicitante: formData.nombre,
      solicitud: formData.tramite || formData.asunto,
      grupo: formData.area === 'area1' ? 'Área 1' : 'Área 2',
      estado: 'Pendiente',
      prioridad: 'Media', // Default for portal
      responsable: '',
      detalles: formData.asunto,
      empresa: formData.empresa,
      requiereFirma: formData.requiereFirma,
      firmas: formData.requiereFirma ? [formData.firma1, formData.firma2, formData.firma3, formData.firma4].filter(Boolean) : []
    };

    const res = await addTicket(ticketData);
    
    // Disparar evento para notificación nativa
    window.dispatchEvent(new CustomEvent('nuevoTicketExterno', { detail: ticketData }));

    setLoading(false);
    if (res.success) {
      setSuccess('Tu solicitud ha sido radicada correctamente.');
      setFormData({
        nombre: '', empresa: '', area: '', tramite: '', requiereFirma: false,
        firma1: '', firma2: '', firma3: '', firma4: '', asunto: ''
      });
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

        <div className="form-group checkbox-group" style={{ marginTop: '24px' }}>
          <label className="checkbox-container">
            <input type="checkbox" name="requiereFirma" checked={formData.requiereFirma} onChange={handleChange} />
            <span className="checkmark"></span>
            ¿Este trámite requiere firmas digitales o físicas?
          </label>
        </div>

        {formData.requiereFirma && (
          <div className="signatures-section fade-in" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--primary-color)' }}>Firmantes requeridos</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Firma 1</label>
                <input type="text" name="firma1" className="glass-input" value={formData.firma1} onChange={handleChange} placeholder="Nombre del firmante" />
              </div>
              <div className="form-group">
                <label>Firma 2</label>
                <input type="text" name="firma2" className="glass-input" value={formData.firma2} onChange={handleChange} placeholder="Nombre del firmante" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Firma 3</label>
                <input type="text" name="firma3" className="glass-input" value={formData.firma3} onChange={handleChange} placeholder="Nombre del firmante" />
              </div>
              <div className="form-group">
                <label>Firma 4</label>
                <input type="text" name="firma4" className="glass-input" value={formData.firma4} onChange={handleChange} placeholder="Nombre del firmante" />
              </div>
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label>Asunto / Descripción Detallada *</label>
          <textarea name="asunto" className="glass-input" rows="4" required 
                    value={formData.asunto} onChange={handleChange}
                    placeholder="Describa brevemente el requerimiento, enlaces o notas adicionales..."></textarea>
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
