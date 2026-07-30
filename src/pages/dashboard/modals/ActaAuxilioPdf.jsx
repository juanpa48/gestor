import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/services/api';

export const ActaAuxilioPdf = ({ ticket, onClose }) => {
  const d = ticket.detalles || {};
  const fechaGeneracion = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Buscar datos del solicitante desde la API
  const [userObj, setUserObj] = useState({});
  const solicitanteStr = typeof ticket.solicitante === 'string' ? ticket.solicitante : (ticket.solicitante?.nombreReal || 'Usuario');
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const usuarios = await apiClient('/usuarios');
        setUserObj(usuarios.find(u => u.nombreReal === solicitanteStr) || {});
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [solicitanteStr]);
  
  const cedula = d.cedula || userObj.cedula || ticket.solicitante?.cedula || 'N/A';
  const cargo = userObj.cargo || ticket.solicitante?.cargo || 'N/A';

  const rawIso = d.firmaISO || ticket.fechaISO;
  const rawTimestamp = d.firmaTimestamp || (ticket.fechaInicioTimestamp); 
  
  let fechaFirmaDate = null;

  if (rawIso) {
    fechaFirmaDate = new Date(rawIso);
  } else if (rawTimestamp) {
    fechaFirmaDate = new Date(rawTimestamp);
  } else if (ticket.fechaCreacion) {
    const parts = ticket.fechaCreacion.split(',')[0].split('/');
    if (parts.length === 3) {
      fechaFirmaDate = new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }

  if (!fechaFirmaDate || isNaN(fechaFirmaDate.getTime())) {
    fechaFirmaDate = new Date();
  }

  const fechaSolicitudStr = fechaFirmaDate.toLocaleDateString('es-CO');
  const fechaFirmaStr = fechaFirmaDate.toLocaleString('es-CO', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  const valorFormat = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(d.valorTotal || 0);

  const bonoFormat = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(d.valorBono || 0);

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
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Consentimiento Informado - Bono Educativo</h1>
          <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 'normal' }}>AC&T FERRARO MOLINA S.A.S</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>Ticket ID: {ticket.id} | Fecha de Solicitud: {fechaSolicitudStr}</p>
        </div>

        {/* Datos del Empleado */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>1. Datos del Solicitante y Programa</h3>
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
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Tipo de Programa:</strong></td>
                <td>{ticket.clasificacion}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Nombre del Programa:</strong></td>
                <td>{d.nombrePrograma}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Fechas:</strong></td>
                <td>Desde {d.fechaInicio} hasta {d.fechaFin}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Valor Total:</strong></td>
                <td>{valorFormat}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', width: '200px' }}><strong>Bono Educativo a Otorgar:</strong></td>
                <td style={{ fontWeight: 'bold' }}>{bonoFormat} (Sujeto a verificación)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Fecha y Hora de Autorización:</strong></td>
                <td>{fechaFirmaStr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Texto Legal */}
        <div style={{ marginBottom: '40px', fontSize: '14px', textAlign: 'justify' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '15px' }}>2. Términos y Condiciones</h3>
          <p>
            Yo, en mi calidad de beneficiario del Bono Educativo otorgado por AC&T FERRARO MOLINA S.A.S, en adelante, reconozco y acepto los términos y condiciones establecidos en este consentimiento informado.
          </p>
          <p><strong>Aceptación del Bono Educativo:</strong><br/>
            Entiendo y reconozco que he recibido el Bono Educativo de AC&T FERRARO MOLINA S.A.S para financiar el 20% (no superior a $500.000) del total del programa al que aplico, de acuerdo con los requisitos y criterios establecidos por la firma.
          </p>
          <p>
            Este beneficio cuenta con un tope máximo de $500.000 anualmente por colaborador y por programa (única vez por cada programa). En caso de que durante el año haya recibido un auxilio parcial (por ejemplo, de $150.000), podrá acceder nuevamente al beneficio únicamente hasta completar el tope establecido (en este caso, por un valor máximo adicional de $350.000).
          </p>
          <p>
            Nota: La asignación del Bono Educativo no se realizará de manera inmediata tras la solicitud. Las solicitudes serán atendidas por orden de llegada y estarán sujetas a la disponibilidad financiera de la empresa al momento de la solicitud.
          </p>
          <p><strong>Compromiso de Permanencia:</strong><br/>
            Estoy consciente de que, al aceptar el Bono Educativo, me comprometo a cumplir con un período mínimo de permanencia en la firma. Este período de permanencia es de un (1) año a partir de la fecha de entrega del Bono Educativo.
          </p>
          <p><strong>Reembolso en Caso de Incumplimiento:</strong><br/>
            Acepto que, en caso de no cumplir con el período mínimo de permanencia de un (1) año en la firma, me comprometo a reembolsar a la Empresa la totalidad de los fondos otorgados en virtud del Bono Educativo.
          </p>
          <p><strong>Monto del Reembolso:</strong><br/>
            Entiendo que el monto total a reembolsar será equivalente a la suma total de los fondos proporcionados por la firma.
          </p>
          <p><strong>Forma de Reembolso:</strong><br/>
            Acepto que el reembolso se realizará de acuerdo con los términos y condiciones establecidos por AC&T FERRARO MOLINA S.A.S en el momento del incumplimiento. Esto puede incluir pagos únicos o pagos fraccionados a lo largo de un período determinado, deducción de nómina, liquidación de prestaciones sociales u otros, según lo acordado entre ambas partes.
          </p>
          <p><strong>Consentimiento y Firma:</strong><br/>
            Al aceptar este consentimiento informado, reconozco que he leído y comprendido todos los términos y condiciones relacionados con el Bono Educativo y el reembolso en caso de incumplimiento. Afirmo que estoy de acuerdo con dichos términos y me comprometo a cumplir con mis obligaciones de permanencia en AC&T FERRARO MOLINA S.A.S o a efectuar el reembolso correspondiente en caso de incumplimiento.
          </p>
        </div>

        {/* Firma Electrónica Info */}
        <div style={{ marginTop: '50px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '100%', paddingRight: '20px', verticalAlign: 'bottom' }}>
                  <div style={{ borderBottom: '1px solid #000', marginBottom: '10px' }}>
                    <p style={{ margin: 0, paddingBottom: '2px', fontFamily: 'monospace', fontSize: '12px' }}>
                      FIRMA DIGITAL: {d.firmaTimestamp || new Date().getTime()}-{ticket.id}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Firma del Colaborador</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Nombre: {solicitanteStr}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>C.C: {cedula}</p>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '30px', fontSize: '11px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <p style={{ margin: 0 }}>
              * Este documento ha sido firmado electrónicamente. Tiene la misma validez legal que un documento firmado de puño y letra, en cumplimiento de la Ley 527 de 1999 (Colombia) sobre mensajes de datos y firmas electrónicas.
            </p>
            <p style={{ margin: '5px 0 0 0' }}>
              Autenticado vía Login en el Sistema Integrado AC&T. Dirección IP y datos de sesión registrados en la auditoría del sistema.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
