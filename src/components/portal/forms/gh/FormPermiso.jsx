import React, { useEffect } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const FormPermiso = ({ detalles, setDetalles }) => {
  const { currentUser } = useAuth();

  // Inyectar datos del perfil del usuario al montar el componente
  useEffect(() => {
    setDetalles(prev => ({
      ...prev,
      cedula: currentUser?.cedula || 'No registrada',
      celular: currentUser?.celular || 'No registrado',
      jefeInmediato: currentUser?.jefeInmediato || 'No registrado',
      subTipo: prev.subTipo || '',
      fechaPermiso: prev.fechaPermiso || '',
      horaInicio: prev.horaInicio || '',
      horaFin: prev.horaFin || '',
      tiempoAproximado: prev.tiempoAproximado || '',
      comoCompensa: prev.comoCompensa || ''
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
        <i className="fa-solid fa-clock"></i> Detalles del Permiso
      </h4>

      {/* Datos precargados del perfil */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '13px', background: 'rgba(30,58,95,0.05)', padding: '10px', borderRadius: '6px' }}>
        <div><strong>Cédula:</strong> {detalles.cedula}</div>
        <div><strong>Celular:</strong> {detalles.celular}</div>
        <div><strong>Jefe Inmediato:</strong> {detalles.jefeInmediato}</div>
      </div>

      <div className="form-group">
        <label className="form-label">Subtipo de Permiso *</label>
        <select 
          className="glass-input" 
          required 
          value={detalles.subTipo || ''} 
          onChange={(e) => handleChange('subTipo', e.target.value)}
        >
          <option value="" disabled>Seleccione una opción...</option>
          <option value="Personal">Personal</option>
          <option value="Salud">Salud</option>
          <option value="Educativa">Educativa</option>
          <option value="ELNR">ELNR (Enfermedad Laboral No Reconocida)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Fecha del Permiso *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            value={detalles.fechaPermiso || ''} 
            onChange={(e) => handleChange('fechaPermiso', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tiempo Aproximado *</label>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Ej: 4 horas, 2 días..." 
            required 
            value={detalles.tiempoAproximado || ''} 
            onChange={(e) => handleChange('tiempoAproximado', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Hora Inicio *</label>
          <input 
            type="time" 
            className="glass-input" 
            required 
            value={detalles.horaInicio || ''} 
            onChange={(e) => handleChange('horaInicio', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Hora Fin *</label>
          <input 
            type="time" 
            className="glass-input" 
            required 
            value={detalles.horaFin || ''} 
            onChange={(e) => handleChange('horaFin', e.target.value)}
          />
        </div>
      </div>

      {detalles.subTipo === 'Personal' && (
        <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
          <label className="form-label" style={{ color: '#f59e0b' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> ¿Cómo va a compensar el tiempo? *
          </label>
          <textarea 
            className="glass-input" 
            placeholder="Especifique cómo y cuándo compensará las horas de este permiso personal..." 
            required 
            value={detalles.comoCompensa || ''} 
            onChange={(e) => handleChange('comoCompensa', e.target.value)}
          ></textarea>
        </div>
      )}
    </div>
  );
};
