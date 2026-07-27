import React, { useEffect } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const FormVacaciones = ({ detalles, setDetalles, tipoTramite }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    setDetalles(prev => ({
      ...prev,
      cedula: prev.cedula || currentUser?.cedula || '',
      cargo: prev.cargo || currentUser?.cargo || '',
      celular: prev.celular || currentUser?.celular || '',
      jefeInmediato: prev.jefeInmediato || currentUser?.jefeInmediato || '',
      fechaInicio: prev.fechaInicio || '',
      fechaFin: prev.fechaFin || '',
      fechaPresentacion: prev.fechaPresentacion || ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (campo, valor) => {
    setDetalles(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="sub-form-container" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
      <h4 style={{ color: 'var(--navy)', marginBottom: '15px', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '8px' }}>
        <i className="fa-solid fa-umbrella-beach"></i> Detalles de Vacaciones
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label">Cédula</label>
          <input 
            type="text" 
            className="glass-input" 
            readOnly
            style={{ opacity: 0.9, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
            value={detalles.cedula || ''} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cargo</label>
          <input 
            type="text" 
            className="glass-input" 
            readOnly
            style={{ opacity: 0.9, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
            value={detalles.cargo || ''} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label">Celular</label>
          <input 
            type="tel" 
            className="glass-input" 
            readOnly
            style={{ opacity: 0.9, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
            value={detalles.celular || ''} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Jefe Inmediato</label>
          <input 
            type="text" 
            className="glass-input" 
            readOnly
            style={{ opacity: 0.9, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
            value={detalles.jefeInmediato || ''} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Fecha Inicio *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            value={detalles.fechaInicio || ''} 
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Fin *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            value={detalles.fechaFin || ''} 
            onChange={(e) => handleChange('fechaFin', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha a Laborar *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            title="Fecha en la que debe presentarse nuevamente a trabajar"
            value={detalles.fechaPresentacion || ''} 
            onChange={(e) => handleChange('fechaPresentacion', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
