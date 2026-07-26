import React from 'react';

export const ActaDeduccion = ({ ticket, onClose }) => {
  const d = ticket.detalles || {};
  const fechaGeneracion = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Buscar datos del solicitante en la BD local
  const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
  const solicitanteStr = typeof ticket.solicitante === 'string' ? ticket.solicitante : (ticket.solicitante?.nombreReal || 'Usuario');
  const userObj = usuarios.find(u => u.nombreReal === solicitanteStr) || {};
  
  const cedula = d.cedula || userObj.cedula || ticket.solicitante?.cedula || 'N/A';
  const cargo = userObj.cargo || ticket.solicitante?.cargo || 'N/A';

  let fechaSolicitudStr = ticket.fechaCreacion || 'Fecha no disponible';
  let fechaFirmaStr = ticket.fechaCreacion || 'Fecha no disponible';
  let traceTime = Date.now();

  try {
    const rawDateStr = ticket.fechaISO || ticket.fechaCreacion;
    if (rawDateStr) {
      // Intentar limpiar la cadena si viene de toLocaleString
      const cleanDateStr = rawDateStr.replace(/, /g, ' ').replace(/\./g, '');
      const dateObj = new Date(ticket.fechaISO || cleanDateStr);
      
      if (!isNaN(dateObj.getTime())) {
        fechaSolicitudStr = dateObj.toLocaleDateString('es-CO');
        fechaFirmaStr = dateObj.toLocaleString('es-CO', { 
          year: 'numeric', month: 'long', day: 'numeric', 
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
        });
        traceTime = dateObj.getTime();
      }
    }
  } catch (e) {
    console.error("Error parseando fecha", e);
  }

  return (
    <div className="acta-overlay">
      <div className="acta-controls no-print">
        <button className="btn-secondary" onClick={onClose}>
          <i className="fa-solid fa-arrow-left"></i> Volver
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          <i className="fa-solid fa-print"></i> Imprimir / Guardar PDF
        </button>
      </div>

      <div className="acta-printable" style={{ background: '#fff', color: '#000', padding: '40px', width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'serif', lineHeight: '1.6' }}>
        
        {/* Encabezado del Acta */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Acta de Autorización de Descuento</h1>
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'normal' }}>Convenio: {ticket.clasificacion}</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>Ticket ID: {ticket.id} | Fecha de Solicitud: {fechaSolicitudStr}</p>
        </div>

        {/* Datos del Empleado */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>1. Datos del Solicitante</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', width: '30%' }}><strong>Nombre Completo:</strong></td>
                <td>{solicitanteStr}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Cédula:</strong></td>
                <td>{cedula}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Cargo:</strong></td>
                <td>{cargo}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Trámite:</strong></td>
                <td>{ticket.clasificacion}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Fecha y Hora de Autorización:</strong></td>
                <td>{fechaFirmaStr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detalles Financieros */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>2. Detalles del Convenio</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', width: '30%' }}><strong>Tipo de Convenio:</strong></td>
                <td>{ticket.clasificacion}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Valor Monto Total:</strong></td>
                <td style={{ fontSize: '16px', fontWeight: 'bold' }}>{d.valorMontoTotal}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Número de Cuotas:</strong></td>
                <td>{d.cuotas}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Periodicidad de Pago:</strong></td>
                <td>{d.periodicidad}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Fecha Inicio Deducción:</strong></td>
                <td>{new Date(d.fechaInicio).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Fecha Fin Deducción:</strong></td>
                <td>{new Date(d.fechaFin).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {d.proyeccion && d.proyeccion.length > 0 && (
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h3 style={{ fontSize: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>2.1. Tabla de Amortización Autorizada</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>Cuota #</th>
                  <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>Fecha de Corte Nómina</th>
                  <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>Valor a Descontar</th>
                </tr>
              </thead>
              <tbody>
                {d.proyeccion.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.cuota}</td>
                    <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>{new Date(p.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Texto Legal */}
        <div style={{ marginBottom: '40px', fontSize: '14px', textAlign: 'justify' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>3. Consentimiento y Autorización</h3>
          <p style={{ marginBottom: '10px' }}>
            Yo, <strong>{solicitanteStr}</strong>, identificado(a) con la cédula de ciudadanía número <strong>{cedula !== 'N/A' ? cedula : '______________'}</strong>, autorizo de manera expresa, voluntaria e irrevocable a mi Empleador, para que deduzca de mis salarios, prestaciones sociales, vacaciones, bonificaciones y liquidación final de contrato (si a ello hubiere lugar), el valor total del monto aquí detallado bajo el concepto de "Convenio {ticket.clasificacion}".
          </p>
          <p>
            Esta autorización se entiende vigente a partir de la <strong>Fecha Inicio Deducción</strong> y hasta la cancelación total de la obligación descrita en este documento. Declaro que conozco y acepto las condiciones comerciales y financieras aplicables a este convenio, y certifico que la firma adjunta en este documento constituye mi consentimiento legal formal.
          </p>
        </div>

        {/* Firmas */}
        <div style={{ marginTop: '50px' }}>
          {d.firmaCedula ? (
            <div style={{ marginBottom: '10px', padding: '15px', border: '2px solid #ccc', borderRadius: '4px', background: '#f9f9f9', width: '380px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#333' }}><strong>DOCUMENTO FIRMADO ELECTRÓNICAMENTE</strong></p>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555' }}>Mecanismo: Validación por Credenciales y Cédula</p>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555' }}>Timestamp: {fechaFirmaStr}</p>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555' }}>ID Trazabilidad: {ticket.id}-{traceTime}</p>
            </div>
          ) : (
            <div style={{ height: '80px', borderBottom: '1px solid #000', width: '250px', marginBottom: '10px' }}></div>
          )}
          
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Firma del Empleado</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#555' }}>C.C. {cedula !== 'N/A' ? cedula : '______________'}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#555' }}>Firmado digitalmente el: {fechaFirmaStr}</p>
        </div>

        <div style={{ marginTop: '40px', fontSize: '10px', color: '#777', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          Documento generado electrónicamente por el Sistema de Gestión Interna. Fecha de impresión: {fechaGeneracion}.
        </div>

      </div>
    </div>
  );
};
