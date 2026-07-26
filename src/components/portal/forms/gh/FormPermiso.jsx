import React, { useEffect } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const FormPermiso = ({ detalles, setDetalles, tipoTramite }) => {
  const { currentUser } = useAuth();

  // Inyectar datos del perfil del usuario al montar el componente
  useEffect(() => {
    // Obtener datos frescos de la BD para evitar datos de sesión antiguos
    const db = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
    const freshUser = db.find(u => u.username === currentUser?.username) || currentUser;

    setDetalles(prev => ({
      ...prev,
      cedula: freshUser?.cedula || 'No registrada',
      celular: freshUser?.celular || 'No registrado',
      jefeInmediato: freshUser?.jefeInmediato || 'No registrado',
      fechaPermiso: prev.fechaPermiso || '',
      horaInicio: prev.horaInicio || '',
      horaFin: prev.horaFin || '',
      tiempoAproximado: prev.tiempoAproximado || '',
      comoCompensa: prev.comoCompensa || ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular horas dinámicamente
  useEffect(() => {
    if (detalles.horaInicio && detalles.horaFin) {
      const [h1, m1] = detalles.horaInicio.split(':').map(Number);
      const [h2, m2] = detalles.horaFin.split(':').map(Number);
      
      let totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      
      if (totalMinutos > 0) {
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        const calculo = `${horas} hora(s) ${minutos > 0 ? `y ${minutos} minuto(s)` : ''}`;
        if (detalles.tiempoAproximado !== calculo) {
          setDetalles(prev => ({ ...prev, tiempoAproximado: calculo }));
        }
      } else {
        if (detalles.tiempoAproximado !== 'Hora fin debe ser mayor a inicio') {
          setDetalles(prev => ({ ...prev, tiempoAproximado: 'Hora fin debe ser mayor a inicio' }));
        }
      }
    }
  }, [detalles.horaInicio, detalles.horaFin, setDetalles]);

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
          <label className="form-label" style={{ color: 'var(--navy)' }}>Tiempo Total Ausente</label>
          <input 
            type="text" 
            className="glass-input" 
            disabled 
            style={{ opacity: 0.8, cursor: 'not-allowed', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--navy)', fontWeight: 'bold' }}
            value={detalles.tiempoAproximado || 'Seleccione inicio y fin'} 
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block', fontStyle: 'italic' }}>
            <i className="fa-solid fa-circle-info"></i> Nota: El tiempo aproximado se calcula automáticamente.
          </small>
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

      {tipoTramite === 'Personal' && (
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
