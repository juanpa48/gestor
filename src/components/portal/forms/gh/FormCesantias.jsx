import React, { useEffect } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const FormCesantias = ({ detalles, setDetalles, tipoTramite }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Pre-cargar datos del usuario activo como base estándar de GH
    setDetalles(prev => ({
      ...prev,
      cedula: prev.cedula || currentUser?.cedula || '',
      cargo: prev.cargo || currentUser?.cargo || '',
      celular: prev.celular || currentUser?.celular || '',
      jefeInmediato: prev.jefeInmediato || currentUser?.jefeInmediato || ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTramite]);

  const handleChange = (campo, valor) => {
    setDetalles(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleFileChange = (campo, file) => {
    setDetalles(prev => ({
      ...prev,
      [`${campo}File`]: file, // Guardamos el objeto File temporalmente para que la Fase 2 lo procese
      [campo]: file ? file.name : '' // Guardamos el nombre para mostrarlo visualmente
    }));
  };

  return (
    <div className="sub-form-container" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
      <h4 style={{ color: 'var(--navy)', marginBottom: '15px', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '8px' }}>
        <i className="fa-solid fa-piggy-bank"></i> Detalles de Cesantías
      </h4>

      {/* Datos Estándar GH */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
        <div className="form-group">
          <label className="form-label">Celular *</label>
          <input 
            type="tel" 
            className="glass-input" 
            required 
            placeholder="Ej: 3001234567"
            value={detalles.celular || ''} 
            onChange={(e) => handleChange('celular', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Jefe Inmediato *</label>
          <input 
            type="text" 
            className="glass-input" 
            required 
            placeholder="Nombre de tu líder directo"
            value={detalles.jefeInmediato || ''} 
            onChange={(e) => handleChange('jefeInmediato', e.target.value)}
          />
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL SEGÚN TRÁMITE */}
      
      {/* 1. COMPRA DE VIVIENDA */}
      {tipoTramite === 'Compra de vivienda' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Adjunto: Carta *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('cartaVivienda', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Adjunto: Promesa de compraventa *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('compraventa', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Adjunto: Vinculación fiducia o formato de la entidad *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('formatoEntidad', e.target.files[0])}
            />
          </div>
        </div>
      )}

      {/* 2. MODIFICACIÓN DE VIVIENDA */}
      {tipoTramite === 'Modificación de vivienda' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Adjunto: Carta *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('cartaModificacion', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Adjunto: Cotización *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('cotizacion', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Adjunto: Certificado *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('certificado', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Adjunto: Foto del lugar a modificar *</label>
            <input 
              type="file" 
              className="glass-input" 
              required 
              accept="image/*"
              style={{ padding: '8px' }}
              onChange={(e) => handleFileChange('fotoLugar', e.target.files[0])}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha fin de los arreglos *</label>
            <input 
              type="date" 
              className="glass-input" 
              required 
              value={detalles.fechaFinArreglos || ''} 
              onChange={(e) => handleChange('fechaFinArreglos', e.target.value)}
            />
          </div>
          
          <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '6px', marginTop: '10px' }}>
            <strong style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> Importante
            </strong>
            <p style={{ fontSize: '13px', margin: '5px 0 0 0', color: 'var(--text-color)' }}>
              Revisar que después de finalizar el arreglo debe enviar una foto que deje evidencia del arreglo realizado.
            </p>
          </div>
        </div>
      )}

      {/* 3. ESTUDIO */}
      {tipoTramite === 'Estudio' && (
        <div style={{ textAlign: 'center', padding: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}></i>
            Por favor confirme sus datos personales. Si requiere adjuntar documentos de la institución, utilice el botón general de adjuntos al final del formulario principal.
          </p>
        </div>
      )}
    </div>
  );
};
