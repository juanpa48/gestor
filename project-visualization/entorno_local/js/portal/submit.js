// ============================================================
// PORTAL — LÓGICA DE ENVÍO DE SOLICITUD (SUBMIT)
// ============================================================
// Responsabilidad: Validar y guardar un nuevo ticket desde el
// portal, usando window.DbService como capa de datos.
//
// Depende de: db-service.js (window.DbService)
//             form-ui.js    (setPriority, verificarPresencialidad)
//             stats.js      (buscarMisTickets, calcularEstadisticas)
//             — Fases 2 y 4 respectivamente
//
// ID de tickets del portal: REQ-XXX (diferente al TKT-XXX del dashboard)
// Ver DEC-005 en docs/DECISIONS.md
// ============================================================

/**
 * Recoge los datos del formulario, valida, guarda el ticket con
 * window.DbService y actualiza la UI del portal.
 * Llamado por addEventListener en DOMContentLoaded (abajo).
 */
function enviarTicket() {
  // ── 1. Recoger valores del formulario ──────────────────────
  const nombre      = document.getElementById('nombre').value;
  const areaGestion = document.getElementById('areaGestion').value;
  const tipoTramite = document.getElementById('tipoTramite').value;
  const solicitud   = document.getElementById('solicitud').value.trim();
  const rutaT       = document.getElementById('rutaT').value.trim();
  const checkPdf    = document.getElementById('checkPdf').checked;
  const prioridad   = document.getElementById('prioridad').value;

  // ── 2. Validación de campos obligatorios ───────────────────
  if (!nombre || !areaGestion || !tipoTramite || !solicitud) {
    alert('Por favor, complete todos los campos obligatorios del formulario.');
    return;
  }

  if (tipoTramite === 'Firmas de documentos' && !rutaT) {
    alert('Para Firmas de documentos es obligatorio proporcionar la Ruta T.');
    return;
  }

  if (tipoTramite === 'Firmas de documentos' && !checkPdf) {
    alert('Debe confirmar que los documentos están en formato PDF.');
    return;
  }

  // ── 3. Mostrar estado de carga en el botón ─────────────────
  const btn = document.getElementById('btnSubmit');
  const originText = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.innerHTML = '<span>Enviando...</span><i class="fa-solid fa-spinner fa-spin"></i>';

  // ── 4. Guardar via DbService (promesa) ─────────────────────
  window.DbService.getActividades()
    .then(acts => {
      const newId = 'REQ-' + String(acts.length + 1).padStart(3, '0');

      const nuevoTicket = {
        id:              newId,
        fechaCreacion:   new Date().toLocaleString(),
        nombre:          nombre,
        solicitante:     nombre,
        solicitud:       solicitud,
        estado:          'Pendiente',
        prioridad:       prioridad,
        responsable:     '',
        grupo:           areaGestion,
        grupoExtra:      tipoTramite,
        clasificacion:   '',
        fechaInicio:     '',
        fechaFin:        '',
        fechaProgramada: '',
        accion:          '', // Observaciones de la gestora (uso futuro)
        detalles:        rutaT
      };

      acts.push(nuevoTicket);
      return window.DbService.saveActividades(acts).then(() => newId);
    })
    .then(newId => {
      // ── 5. Restaurar botón ──────────────────────────────────
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = originText;

      // ── 6. Resetear el formulario ───────────────────────────
      document.getElementById('solicitud').value   = '';
      document.getElementById('rutaT').value       = '';
      document.getElementById('checkPdf').checked  = false;
      document.getElementById('areaGestion').value = '';
      document.getElementById('tipoTramite').innerHTML =
        '<option value="" disabled selected>Primero seleccione un Área...</option>';
      document.getElementById('alertaPresencial').style.display  = 'none';
      document.getElementById('grupoRutaT').style.display        = 'none';
      document.getElementById('grupoCheckPdf').style.display     = 'none';

      // Restaurar prioridad "Media" por defecto (usa form-ui.js)
      const btnMedia = document.querySelector('.priority-btn[data-val="Media"]');
      if (btnMedia && typeof setPriority === 'function') setPriority(btnMedia);

      // ── 7. Actualizar visuales del portal (usa stats.js) ────
      if (typeof buscarMisTickets === 'function')    buscarMisTickets(nombre);
      if (typeof calcularEstadisticas === 'function') calcularEstadisticas();

      // ── 8. Mostrar toast de éxito ───────────────────────────
      const toast = document.getElementById('toast');
      toast.className = 'toast show';
      toast.innerHTML = `¡Solicitud <strong>${newId}</strong> enviada exitosamente!`;
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    })
    .catch(err => {
      // ── 9. Manejo de error ──────────────────────────────────
      console.error('Error al guardar ticket:', err);
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = originText;

      const toast = document.getElementById('toast');
      toast.className = 'toast error show';
      toast.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error al enviar la solicitud. Intente de nuevo.';
      setTimeout(() => { toast.classList.remove('show', 'error'); }, 4000);
    });
}

// ─── Registro de Event Listener ──────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) btnSubmit.addEventListener('click', enviarTicket);
});

