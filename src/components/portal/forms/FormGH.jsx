import React, { useState } from 'react';
import { useGHContext as useTickets } from '../../../areas/gestion-humana/context/GHContext';
import { getAreaSettings } from '../../../shared/services/SettingsManager';
import { UploadService } from '../../../shared/services/UploadService';
import { useAuth, hashPassword } from '../../../shared/contexts/AuthContext';
import { FormPermiso } from './gh/FormPermiso';
import { FormConvenio } from './gh/FormConvenio';
import { FormVacaciones } from './gh/FormVacaciones';
import { FormCesantias } from './gh/FormCesantias';
import { FormAuxilioEducativo } from './gh/FormAuxilioEducativo';

export const FormGH = () => {
  const { currentUser } = useAuth();
  const nombre = currentUser?.nombreReal || currentUser?.username || '';
  const { addTicket } = useTickets();
  const [tipoSolicitud, setTipoSolicitud] = useState('');
  const [tipoTramite, setTipoTramite] = useState('');
  const settings = getAreaSettings('gh');
  const tiposSolicitud = settings.tiposSolicitud || [];
  const [solicitud, setSolicitud] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [detalles, setDetalles] = useState({}); // Estado dinámico inyectado por sub-componentes
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const showToast = (message, type = 'success', icon = 'check') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.className = `toast show ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;
      toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> &nbsp;${message}`;
      setTimeout(() => { toast.className = 'toast hidden'; }, 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !tipoTramite || (!solicitud && tipoSolicitud !== 'Convenios' && tipoSolicitud !== 'Vacaciones' && tipoSolicitud !== 'Cesantías' && tipoSolicitud !== 'Cesantias' && tipoSolicitud !== 'Auxilio Educativo' && tipoSolicitud !== 'Reporte de Asistencia')) {
      showToast('Por favor, complete todos los campos obligatorios.', 'error', 'triangle-exclamation');
      return;
    }

    if ((tipoSolicitud === 'Convenios' || tipoSolicitud === 'Auxilio Educativo') && detalles.consentimientoLegal) {
      const users = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
      const targetUser = users.find(u => u.username === currentUser?.username);
      if (targetUser) {
        const inputHash = await hashPassword(detalles.firmaClave || '');
        if (inputHash !== targetUser.passwordHash) {
          showToast('Firma Inválida: La contraseña ingresada es incorrecta.', 'error', 'lock');
          return;
        }

        if (!targetUser.cedula) {
          showToast('Error: Su perfil de usuario no tiene una cédula registrada. Contacte a Soporte TI.', 'error', 'id-card');
          return;
        }
        
        if (detalles.firmaCedula.trim() !== targetUser.cedula.trim()) {
          showToast('Firma Inválida: La cédula ingresada no coincide con sus registros.', 'error', 'id-card');
          return;
        }
      }
    }

    setLoadingSubmit(true);

    // 1. Generar el ID del ticket primero
    const rawActs = JSON.parse(localStorage.getItem('db_actividades_gh') || '[]');
    const numReq = rawActs.filter(t => (t.id || '').startsWith('GH-')).length + 1;
    const newId = `GH-${String(numReq).padStart(3, '0')}`;

    // 1.5. Limpiar datos y extraer archivos especiales (ej. Cesantías)
    const sanitizedDetalles = { ...detalles };
    const archivosEspeciales = [];
    
    Object.keys(sanitizedDetalles).forEach(key => {
      if (key.endsWith('File')) {
        if (sanitizedDetalles[key] instanceof File) {
          archivosEspeciales.push(sanitizedDetalles[key]);
        }
        delete sanitizedDetalles[key];
      }
    });
    
    const allFiles = [...archivos, ...archivosEspeciales];

    // 2. Subir archivos pasando el ID para la carpeta
    let adjuntosUrls = [];
    try {
      if (allFiles.length > 0) {
        adjuntosUrls = await UploadService.uploadFiles(allFiles, newId, 'gh');
      }
    } catch (err) {
      setLoadingSubmit(false);
      showToast('Error al subir archivos: ' + err.message, 'error', 'triangle-exclamation');
      return;
    }

    // 3. Crear el ticket
    try {
      delete sanitizedDetalles.firmaClave;

      if ((tipoSolicitud === 'Convenios' || tipoSolicitud === 'Auxilio Educativo') && sanitizedDetalles.consentimientoLegal) {
        sanitizedDetalles.firmaISO = new Date().toISOString();
        sanitizedDetalles.firmaTimestamp = Date.now();
      }

      const nuevoTicket = {
        id: newId,
        fechaISO: new Date().toISOString(),
        fechaCreacion: new Date().toLocaleString(),
        nombre: nombre,
        solicitante: nombre,
        cargo: currentUser?.cargo || 'Usuario del Sistema',
        solicitud: solicitud || (
          tipoSolicitud === 'Convenios' ? `Solicitud de Convenio de Nómina: ${tipoTramite}` : 
          tipoSolicitud === 'Vacaciones' ? `Solicitud de Vacaciones: ${tipoTramite}` : 
          (tipoSolicitud === 'Cesantías' || tipoSolicitud === 'Cesantias') ? `Solicitud de Cesantías: ${tipoTramite}` : 
          tipoSolicitud === 'Auxilio Educativo' ? `Solicitud de Auxilio Educativo: ${tipoTramite}` : 
          tipoSolicitud === 'Reporte de Asistencia' ? `Reporte de Asistencia en: ${tipoTramite}` : ''
        ),
        estado: 'Pendiente',
        responsable: '',
        tipoSolicitud: tipoSolicitud || 'Trámites de Personal',
        grupoExtra: tipoTramite,
        clasificacion: tipoTramite,
        novedadNomina: false,
        detalles: sanitizedDetalles,
        adjuntos: adjuntosUrls
      };

      await addTicket(nuevoTicket);
      
      setSolicitud('');
      setTipoSolicitud('');
      setTipoTramite('');
      setDetalles({});
      setArchivos([]);
      
      showToast(`¡Solicitud <strong>${newId}</strong> enviada a Gestión Humana!`, 'success', 'check');
    } catch (err) {
      showToast('Error al enviar la solicitud. Intente de nuevo.', 'error', 'triangle-exclamation');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">SOLICITANTE</label>
        <div className="select-wrapper">
          <input 
            type="text" 
            className="glass-input" 
            value={`${nombre} ${currentUser?.cargo ? `(${currentUser.cargo})` : ''}`} 
            disabled 
            style={{ opacity: 0.8, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div className="form-group form-group-full">
        <label className="form-label">TIPO DE SOLICITUD</label>
        <div className="select-wrapper">
          <select className="glass-input" required value={tipoSolicitud} onChange={(e) => { 
            const val = e.target.value;
            setTipoSolicitud(val); 
            const trs = tiposSolicitud.find(g => g.nombre === val)?.tramites || [];
            setTipoTramite(trs.length === 1 ? trs[0] : ''); 
            setDetalles({}); 
          }}>
            <option value="" disabled>Seleccione el Tipo de Solicitud...</option>
            {tiposSolicitud.map(g => <option key={g.nombre} value={g.nombre}>{g.nombre}</option>)}
          </select>
        </div>
      </div>

      {tipoSolicitud && (tiposSolicitud.find(g => g.nombre === tipoSolicitud)?.tramites || []).length > 1 && (
        <div className="form-group form-group-full">
          <label className="form-label">TRÁMITE ESPECÍFICO (GH)</label>
          <div className="select-wrapper">
            <select className="glass-input" required value={tipoTramite} onChange={(e) => setTipoTramite(e.target.value)} disabled={!tipoSolicitud}>
              <option value="" disabled>Seleccione el Trámite...</option>
              {tipoSolicitud && (tiposSolicitud.find(g => g.nombre === tipoSolicitud)?.tramites || []).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {tipoSolicitud !== 'Convenios' && tipoSolicitud !== 'Vacaciones' && tipoSolicitud !== 'Cesantías' && tipoSolicitud !== 'Cesantias' && tipoSolicitud !== 'Auxilio Educativo' && tipoSolicitud !== 'Reporte de Asistencia' && (
        <div className="form-group">
          <label className="form-label">
            {tipoSolicitud === 'Certificado Laboral' ? 'DATOS QUE REQUIERE EN EL CERTIFICADO LABORAL *' : 
             tipoSolicitud === 'Sistema de Gestión' ? 'DETALLE DE LO SOLICITADO *' : 'DESCRIPCIÓN DE LA SOLICITUD'}
          </label>
          <textarea 
            className="glass-input" 
            placeholder={
              tipoSolicitud === 'Certificado Laboral' ? 'Ej: Dirigido a EPS Sura, especificando salario y fecha de ingreso...' : 
              tipoSolicitud === 'Sistema de Gestión' ? 'Describa detalladamente su solicitud para el Sistema de Gestión...' : 
              'Describa el requerimiento para Gestión Humana...'
            } 
            required 
            value={solicitud} 
            onChange={(e) => setSolicitud(e.target.value)}
          ></textarea>
        </div>
      )}

      {/* RENDERIZADO DINÁMICO (CONTROLADOR) */}
      <div className="dynamic-form-area" style={{ padding: '15px 0', borderTop: '1px dashed var(--card-border)', borderBottom: '1px dashed var(--card-border)', margin: '15px 0' }}>
        {tipoSolicitud === 'Permisos' && (
           <FormPermiso detalles={detalles} setDetalles={setDetalles} tipoTramite={tipoTramite} />
        )}
        {tipoSolicitud === 'Convenios' && (
           <FormConvenio detalles={detalles} setDetalles={setDetalles} tipoTramite={tipoTramite} />
        )}
        {tipoSolicitud === 'Vacaciones' && (
           <FormVacaciones detalles={detalles} setDetalles={setDetalles} tipoTramite={tipoTramite} />
        )}
        {(tipoSolicitud === 'Cesantías' || tipoSolicitud === 'Cesantias') && (
           <FormCesantias detalles={detalles} setDetalles={setDetalles} tipoTramite={tipoTramite} />
        )}
        {tipoSolicitud === 'Auxilio Educativo' && (
           <FormAuxilioEducativo detalles={detalles} setDetalles={setDetalles} tipoTramite={tipoTramite} />
        )}
        {tipoSolicitud !== 'Permisos' && tipoSolicitud !== 'Convenios' && tipoSolicitud !== 'Vacaciones' && tipoSolicitud !== 'Cesantías' && tipoSolicitud !== 'Cesantias' && tipoSolicitud !== 'Auxilio Educativo' && tipoSolicitud !== 'Reporte de Asistencia' && tipoTramite !== '' && (
           <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '10px' }}>
             <i className="fa-solid fa-circle-info text-blue"></i> Este trámite utilizará el formulario genérico.
           </div>
        )}
      </div>



      {tipoSolicitud !== 'Reporte de Asistencia' && (
        <div className="form-group">
          <label className="form-label">EVIDENCIAS / ARCHIVOS ADJUNTOS (Opcional)</label>
          <div className="file-upload-wrapper">
            <input 
              type="file" 
              className="glass-input" 
              multiple 
              onChange={(e) => setArchivos(e.target.files)}
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Puede seleccionar varios archivos a la vez.
            </small>
          </div>
        </div>
      )}

      {tipoSolicitud === 'Reporte de Asistencia' ? (
        <button type="submit" className={`btn-submit ${loadingSubmit ? 'loading' : ''}`} style={{ background: 'var(--green)', boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }} disabled={loadingSubmit}>
          {loadingSubmit ? (
            <><span>Registrando Inicio...</span><i className="fa-solid fa-spinner fa-spin"></i></>
          ) : (
            <><span>Registrar Inicio de Jornada</span><i className="fa-solid fa-clock"></i></>
          )}
        </button>
      ) : (
        <button type="submit" className={`btn-submit ${loadingSubmit ? 'loading' : ''}`} disabled={loadingSubmit}>
          {loadingSubmit ? (
            <><span>Enviando...</span><i className="fa-solid fa-spinner fa-spin"></i></>
          ) : (
            <><span>Enviar Solicitud a GH</span><i className="fa-solid fa-paper-plane"></i></>
          )}
        </button>
      )}
    </form>
  );
};
