import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { DbService } from '../../../../shared/services/DbService';

export const FormPermiso = ({ detalles, setDetalles, tipoTramite }) => {
  const { currentUser } = useAuth();
  const [festivos, setFestivos] = useState([]);

  useEffect(() => {
    const fetchFestivos = async () => {
      const data = await DbService.getFestivos();
      setFestivos(data || []);
    };
    fetchFestivos();
  }, []);

  // Inyectar datos del perfil del usuario al montar el componente (removidos datos innecesarios para Permisos)
  useEffect(() => {
    setDetalles(prev => {
      const base = {
        tiempoAproximado: prev.tiempoAproximado || '',
      };

      if (tipoTramite && tipoTramite.includes('Licencia no remunerada')) {
        base.fechaInicio = prev.fechaInicio || '';
        base.fechaFin = prev.fechaFin || '';
      } else {
        base.fechaPermiso = prev.fechaPermiso || '';
        base.horaInicio = prev.horaInicio || '';
        base.horaFin = prev.horaFin || '';
      }

      if (tipoTramite === 'Personal') {
        base.comoCompensa = prev.comoCompensa || '';
      }

      return base;
    });
  }, [tipoTramite, setDetalles]);

  // Calcular dinámicamente
  useEffect(() => {
    if (tipoTramite && tipoTramite.includes('Licencia no remunerada')) {
      if (detalles.fechaInicio && detalles.fechaFin) {
        const [y1, m1, d1_val] = detalles.fechaInicio.split('-');
        const [y2, m2, d2_val] = detalles.fechaFin.split('-');
        const startD = new Date(y1, m1 - 1, d1_val, 12, 0, 0);
        const endD = new Date(y2, m2 - 1, d2_val, 12, 0, 0);

        if (endD >= startD) {
          let count = 0;
          let current = new Date(startD);
          
          while (current <= endD) {
            const dayOfWeek = current.getDay();
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            // Si no es domingo(0) ni sábado(6) y no está en festivos
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !festivos.some(f => f.fecha === dateStr)) {
              count++;
            }
            current.setDate(current.getDate() + 1);
          }
          
          const calculo = `${count} día(s) hábil(es)`;
          if (detalles.tiempoAproximado !== calculo) {
            setDetalles(prev => ({ ...prev, tiempoAproximado: calculo }));
          }
        } else {
          if (detalles.tiempoAproximado !== 'Fecha fin debe ser mayor o igual a inicio') {
            setDetalles(prev => ({ ...prev, tiempoAproximado: 'Fecha fin debe ser mayor o igual a inicio' }));
          }
        }
      }
    } else {
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
    }
  }, [detalles.horaInicio, detalles.horaFin, detalles.fechaInicio, detalles.fechaFin, tipoTramite, setDetalles]);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {tipoTramite && tipoTramite.includes('Licencia no remunerada') ? (
          <>
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
          </>
        ) : (
          <>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
          </>
        )}
      </div>

      <div className="form-group" style={{ marginTop: '15px', marginBottom: '15px' }}>
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
