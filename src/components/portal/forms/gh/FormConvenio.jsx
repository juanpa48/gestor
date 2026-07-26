import React, { useEffect } from 'react';

export const FormConvenio = ({ detalles, setDetalles, tipoTramite }) => {

  // Inicializar campos base
  useEffect(() => {
    setDetalles(prev => ({
      ...prev,
      valorMontoTotal: prev.valorMontoTotal || '',
      cuotas: prev.cuotas || '',
      periodicidad: prev.periodicidad || 'Quincenal',
      fechaInicio: prev.fechaInicio || '',
      fechaFin: prev.fechaFin || ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (campo, valor) => {
    setDetalles(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleCurrencyChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remover todo lo que no sea dígito
    if (value) {
      const num = parseInt(value, 10);
      const formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(num);
      handleChange('valorMontoTotal', formatted);
    } else {
      handleChange('valorMontoTotal', '');
    }
  };

  return (
    <div className="sub-form-container" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
      <h4 style={{ color: 'var(--navy)', marginBottom: '15px', borderBottom: '1px solid rgba(16, 185, 129, 0.1)', paddingBottom: '8px' }}>
        <i className="fa-solid fa-handshake"></i> Convenio: {tipoTramite}
      </h4>

      <div style={{ marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label">Valor Monto Total *</label>
          <div style={{ position: 'relative' }}>
            <i className="fa-solid fa-sack-dollar" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}></i>
            <input 
              type="text" 
              className="glass-input" 
              style={{ paddingLeft: '35px', fontWeight: 'bold', color: 'var(--primary)' }}
              placeholder="$ 0" 
              required 
              value={detalles.valorMontoTotal || ''} 
              onChange={handleCurrencyChange}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Número de Cuotas *</label>
          <input 
            type="number" 
            className="glass-input" 
            placeholder="Ej: 12" 
            min="1"
            max="120"
            required 
            value={detalles.cuotas || ''} 
            onChange={(e) => handleChange('cuotas', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Periodicidad de Pago *</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="periodicidad"
                value="Quincenal"
                checked={detalles.periodicidad === 'Quincenal'}
                onChange={(e) => handleChange('periodicidad', e.target.value)}
              />
              Quincenal
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="periodicidad"
                value="Mensual"
                checked={detalles.periodicidad === 'Mensual'}
                onChange={(e) => handleChange('periodicidad', e.target.value)}
              />
              Mensual
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label className="form-label">Fecha Inicio Deducción *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            value={detalles.fechaInicio || ''} 
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Fin Deducción *</label>
          <input 
            type="date" 
            className="glass-input" 
            required 
            value={detalles.fechaFin || ''} 
            onChange={(e) => handleChange('fechaFin', e.target.value)}
          />
        </div>
      </div>

    </div>
  );
};
