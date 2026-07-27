import React, { useEffect, useState } from 'react';

export const FormConvenio = ({ detalles, setDetalles, tipoTramite }) => {
  const [consentimiento, setConsentimiento] = useState(detalles.consentimientoLegal || false);

  // Inicializar campos base
  useEffect(() => {
    setDetalles(prev => ({
      ...prev,
      valorMontoTotal: prev.valorMontoTotal || '',
      cuotas: prev.cuotas || '',
      periodicidad: prev.periodicidad || 'Quincenal',
      fechaInicioCorte: prev.fechaInicioCorte || '',
      proyeccion: prev.proyeccion || [],
      fechaInicio: prev.fechaInicio || '',
      fechaFin: prev.fechaFin || '',
      consentimientoLegal: prev.consentimientoLegal || false,
      firmaCedula: prev.firmaCedula || '',
      firmaClave: prev.firmaClave || ''
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

  const handleConsentimiento = (e) => {
    setConsentimiento(e.target.checked);
    handleChange('consentimientoLegal', e.target.checked);
    if (!e.target.checked) {
      handleChange('firmaCedula', '');
      handleChange('firmaClave', '');
    }
  };

  const getNextPayPeriods = (count = 6) => {
    let dates = [];
    let d = new Date();
    while (dates.length < count) {
      let d15 = new Date(d.getFullYear(), d.getMonth(), 15);
      if (d15 > new Date()) dates.push(d15.toISOString());
      let eom = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      if (eom > new Date()) dates.push(eom.toISOString());
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return dates.slice(0, count);
  };

  const [opcionesCorte, setOpcionesCorte] = useState([]);

  useEffect(() => {
    const cortes = getNextPayPeriods(6);
    setOpcionesCorte(cortes);
    if (!detalles.fechaInicioCorte) {
      handleChange('fechaInicioCorte', cortes[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generarProyeccion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalles.valorMontoTotal, detalles.cuotas, detalles.periodicidad, detalles.fechaInicioCorte]);

  const generarProyeccion = () => {
    if (!detalles.valorMontoTotal || !detalles.cuotas || !detalles.fechaInicioCorte) {
      handleChange('proyeccion', []);
      return;
    }
    
    let total = parseInt(detalles.valorMontoTotal.toString().replace(/[^0-9]/g, ''), 10) || 0;
    let cuotasNum = parseInt(detalles.cuotas, 10) || 0;
    if (total <= 0 || cuotasNum <= 0) {
      handleChange('proyeccion', []);
      return;
    }

    let baseAmount = Math.floor(total / cuotasNum);
    let remainder = total - (baseAmount * cuotasNum);

    let fechas = [];
    let current = new Date(detalles.fechaInicioCorte);
    let isQuincenal = detalles.periodicidad === 'Quincenal';

    for (let i = 0; i < cuotasNum; i++) {
       fechas.push(new Date(current));
       if (isQuincenal) {
         if (current.getDate() === 15) {
           current = new Date(current.getFullYear(), current.getMonth() + 1, 0); // Fin de mes
         } else {
           current = new Date(current.getFullYear(), current.getMonth() + 1, 15); // Quince
         }
       } else {
         if (current.getDate() === 15) {
           current = new Date(current.getFullYear(), current.getMonth() + 1, 15);
         } else {
           current = new Date(current.getFullYear(), current.getMonth() + 2, 0);
         }
       }
    }

    let proy = fechas.map((f, i) => {
       let monto = baseAmount;
       if (i === cuotasNum - 1) monto += remainder; // Ajuste contable en la última cuota
       return {
         cuota: i + 1,
         fecha: f.toISOString(),
         valor: monto
       };
    });

    handleChange('proyeccion', proy);
    handleChange('fechaInicio', new Date(proy[0].fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }));
    handleChange('fechaFin', new Date(proy[proy.length - 1].fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }));
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '15px' }}>
        <div className="form-group">
          <label className="form-label">Primera Cuota (Corte de Nómina) *</label>
          <div style={{ position: 'relative' }}>
            <i className="fa-regular fa-calendar-check" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}></i>
            <select 
              className="glass-input" 
              style={{ paddingLeft: '35px' }}
              required 
              value={detalles.fechaInicioCorte || ''} 
              onChange={(e) => handleChange('fechaInicioCorte', e.target.value)}
            >
              {opcionesCorte.map((isoStr, idx) => {
                const d = new Date(isoStr);
                const is15 = d.getDate() === 15;
                const label = is15 ? `Quincena (15 de ${d.toLocaleString('es-CO', {month: 'long'})})` : `Fin de mes (${d.getDate()} de ${d.toLocaleString('es-CO', {month: 'long'})})`;
                return <option key={idx} value={isoStr}>{label} - {d.getFullYear()}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {detalles.proyeccion && detalles.proyeccion.length > 0 && (
        <div style={{ marginTop: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ccc', overflow: 'hidden' }}>
          <h5 style={{ background: 'var(--navy)', color: '#fff', margin: 0, padding: '10px 15px', fontSize: '13px' }}>
            <i className="fa-solid fa-table"></i> Tabla de Amortización (Proyección)
          </h5>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ccc' }}># Cuota</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Corte de Nómina</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Valor a Descontar</th>
                </tr>
              </thead>
              <tbody>
                {detalles.proyeccion.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{p.cuota}</td>
                    <td style={{ padding: '8px', textAlign: 'left' }}>{new Date(p.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--red)', borderRadius: '8px' }}>
        <h5 style={{ color: 'var(--red)', marginBottom: '10px', fontSize: '14px' }}>
          <i className="fa-solid fa-scale-balanced"></i> Autorización de Descuento (Consentimiento Legal)
        </h5>
        
        <div style={{ fontSize: '13px', color: '#111', fontWeight: 'bold', lineHeight: '1.6', marginBottom: '15px', textAlign: 'justify' }}>
          <p>
            Autorizo de manera expresa, voluntaria e irrevocable a mi Empleador, para que deduzca de mis salarios, prestaciones sociales, vacaciones, bonificaciones y liquidación final de contrato (si a ello hubiere lugar), el valor total del monto aquí detallado bajo el concepto de "Convenio {tipoTramite}".
          </p>
          <p style={{ marginTop: '8px' }}>
            Esta autorización se entiende vigente hasta la cancelación total de la obligación. Declaro que conozco y acepto las condiciones del convenio.
          </p>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '20px' }}>
          <input 
            type="checkbox" 
            required
            checked={consentimiento}
            onChange={handleConsentimiento}
            style={{ marginTop: '3px' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--navy)' }}>
            He leído, entiendo y otorgo mi consentimiento legal para la deducción de nómina descrita. *
          </span>
        </label>

        {consentimiento && (
          <div style={{ animation: 'fadeIn 0.4s', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
            <h6 style={{ color: 'var(--navy)', marginBottom: '10px' }}><i className="fa-solid fa-lock"></i> Validación de Identidad</h6>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Para procesar esta solicitud con validez legal (Firma Electrónica Simple), por favor confirme su identidad digitando sus credenciales de acceso corporativo.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--navy)' }}>Cédula de Ciudadanía *</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-regular fa-id-card" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}></i>
                  <input 
                    type="text" 
                    className="glass-input" 
                    style={{ paddingLeft: '35px' }}
                    required 
                    placeholder="Ej: 10203040"
                    value={detalles.firmaCedula || ''} 
                    onChange={(e) => handleChange('firmaCedula', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--navy)' }}>Contraseña del Portal *</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-key" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}></i>
                  <input 
                    type="password" 
                    className="glass-input" 
                    style={{ paddingLeft: '35px' }}
                    required 
                    placeholder="Contraseña"
                    value={detalles.firmaClave || ''} 
                    onChange={(e) => handleChange('firmaClave', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fa-solid fa-shield-check"></i> <span>Mecanismo de firma electrónica avalado.</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
