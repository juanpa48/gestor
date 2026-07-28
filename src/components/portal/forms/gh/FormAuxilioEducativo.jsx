import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContext';

export const FormAuxilioEducativo = ({ detalles, setDetalles, tipoTramite }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    setDetalles(prev => ({
      ...prev,
      cedula: prev.cedula || currentUser?.cedula || '',
      cargo: prev.cargo || currentUser?.cargo || '',
      celular: prev.celular || currentUser?.celular || '',
      jefeInmediato: prev.jefeInmediato || currentUser?.jefeInmediato || '',
      nombrePrograma: prev.nombrePrograma || '',
      fechaInicio: prev.fechaInicio || '',
      fechaFin: prev.fechaFin || '',
      valorTotal: prev.valorTotal || '',
      valorBono: prev.valorBono || 0,
      consentimientoLegal: prev.consentimientoLegal || false,
      firmaCedula: prev.firmaCedula || '',
      firmaClave: prev.firmaClave || ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTramite]);

  const handleChange = (campo, valor) => {
    setDetalles(prev => {
      const updated = { ...prev, [campo]: valor };
      if (campo === 'valorTotal') {
        updated.valorBono = Math.min((Number(valor) || 0) * 0.20, 500000);
      }
      return updated;
    });
  };

  const handleFileChange = (campo, file) => {
    setDetalles(prev => ({
      ...prev,
      [`${campo}File`]: file,
      [campo]: file ? file.name : ''
    }));
  };

  const legalText = `Yo, en mi calidad de beneficiario del Bono Educativo otorgado por AC&T FERRARO MOLINA S.A.S, en adelante, reconozco y acepto los términos y condiciones establecidos en este consentimiento informado.

Aceptación del Bono Educativo:
Entiendo y reconozco que he recibido el Bono Educativo de AC&T FERRARO MOLINA S.A.S para financiar el 20% (no superior a $500.000) del total del programa al que aplico, de acuerdo con los requisitos y criterios establecidos por la firma.

Este beneficio cuenta con un tope máximo de $500.000 anualmente por colaborador y por programa (única vez por cada programa). En caso de que durante el año haya recibido un auxilio parcial (por ejemplo, de $150.000), podrá acceder nuevamente al beneficio únicamente hasta completar el tope establecido (en este caso, por un valor máximo adicional de $350.000).

Nota: La asignación del Bono Educativo no se realizará de manera inmediata tras la solicitud. Las solicitudes serán atendidas por orden de llegada y estarán sujetas a la disponibilidad financiera de la empresa al momento de la solicitud.

Compromiso de Permanencia:
Estoy consciente de que, al aceptar el Bono Educativo, me comprometo a cumplir con un período mínimo de permanencia en la firma. Este período de permanencia es de un (1) año a partir de la fecha de entrega del Bono Educativo.

Reembolso en Caso de Incumplimiento:
Acepto que, en caso de no cumplir con el período mínimo de permanencia de un (1) año en la firma, me comprometo a reembolsar a la Empresa la totalidad de los fondos otorgados en virtud del Bono Educativo.

Monto del Reembolso:
Entiendo que el monto total a reembolsar será equivalente a la suma total de los fondos proporcionados por la firma.

Forma de Reembolso:
Acepto que el reembolso se realizará de acuerdo con los términos y condiciones establecidos por AC&T FERRARO MOLINA S.A.S en el momento del incumplimiento. Esto puede incluir pagos únicos o pagos fraccionados a lo largo de un período determinado, deducción de nómina, liquidación de prestaciones sociales u otros, según lo acordado entre ambas partes.

Consentimiento y Firma:
Al aceptar este consentimiento informado, reconozco que he leído y comprendido todos los términos y condiciones relacionados con el Bono Educativo y el reembolso en caso de incumplimiento. Afirmo que estoy de acuerdo con dichos términos y me comprometo a cumplir con mis obligaciones de permanencia en AC&T FERRARO MOLINA S.A.S o a efectuar el reembolso correspondiente en caso de incumplimiento.`;

  return (
    <div className="sub-form-container" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
      <h4 style={{ color: 'var(--navy)', marginBottom: '15px', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '8px' }}>
        <i className="fa-solid fa-user-graduate"></i> Solicitud de Auxilio Educativo
      </h4>

      {tipoTramite === 'Posgrado' && (
        <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '6px', borderLeft: '4px solid #eab308', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color)' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#eab308', marginRight: '5px' }}></i> 
            <strong>Importante:</strong> El auxilio para posgrado se otorgará una única vez por programa.
          </p>
        </div>
      )}

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

      {/* Datos del Programa */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Nombre del {tipoTramite || 'Programa'} *</label>
          <input 
            type="text" 
            className="glass-input" 
            required 
            placeholder={`Escriba el nombre del ${tipoTramite?.toLowerCase() || 'programa'}`}
            value={detalles.nombrePrograma || ''} 
            onChange={(e) => handleChange('nombrePrograma', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Inicio *</label>
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
          <label className="form-label">Valor Total del {tipoTramite || 'Programa'} *</label>
          <input 
            type="number" 
            className="glass-input" 
            required 
            min="0"
            placeholder="Ej: 1500000"
            value={detalles.valorTotal || ''} 
            onChange={(e) => handleChange('valorTotal', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Adjunto: Factura de Pago *</label>
          <input 
            type="file" 
            className="glass-input" 
            required 
            style={{ padding: '8px' }}
            onChange={(e) => handleFileChange('factura', e.target.files[0])}
          />
        </div>
        
        {/* Visualización del Bono Calculado */}
        {detalles.valorTotal && Number(detalles.valorTotal) > 0 && (
          <div className="form-group" style={{ gridColumn: '1 / -1', background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--green)', marginTop: '5px' }}>
            <label className="form-label" style={{ color: 'var(--green)', fontSize: '13px' }}>
              <i className="fa-solid fa-money-bill-wave"></i> Proyección del Bono Educativo a Recibir (20% max $500.000)
            </label>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-color)', marginTop: '5px' }}>
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(detalles.valorBono || 0)}
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
              * Este valor es una proyección inicial sujeta a revisión por Gestión Humana.
            </small>
          </div>
        )}
      </div>

      {/* Consentimiento Legal */}
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)' }}>
        <h5 style={{ color: 'var(--navy)', marginBottom: '10px' }}>
          <i className="fa-solid fa-file-signature"></i> Consentimiento Informado - Bono Educativo
        </h5>
        
        <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', border: '1px solid var(--card-border)', marginBottom: '15px', color: 'var(--text-color)' }}>
          {legalText}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={detalles.consentimientoLegal || false}
              onChange={(e) => {
                handleChange('consentimientoLegal', e.target.checked);
                if (!e.target.checked) {
                  handleChange('firmaCedula', '');
                  handleChange('firmaClave', '');
                }
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>He leído y acepto los términos y condiciones del Bono Educativo</span>
          </label>
        </div>

        {detalles.consentimientoLegal && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', animation: 'fadeIn 0.3s' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--error)' }}><i className="fa-solid fa-id-card"></i> Firma: Cédula *</label>
              <input 
                type="text" 
                className="glass-input" 
                required 
                placeholder="Ingrese su número de cédula"
                value={detalles.firmaCedula || ''} 
                onChange={(e) => handleChange('firmaCedula', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--error)' }}><i className="fa-solid fa-key"></i> Firma: Contraseña del Gestor *</label>
              <input 
                type="password" 
                className="glass-input" 
                required 
                placeholder="Su contraseña de acceso al sistema"
                value={detalles.firmaClave || ''} 
                onChange={(e) => handleChange('firmaClave', e.target.value)}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '-5px' }}>
               <small style={{ color: 'var(--text-muted)' }}>
                 * Al digitar su cédula y contraseña, usted está firmando electrónicamente este documento. Se registrará su IP y estampa de tiempo legal.
               </small>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
