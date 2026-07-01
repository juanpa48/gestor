// ============================================================
// PORTAL — INTERFAZ REACTIVA DEL FORMULARIO
// ============================================================
// Responsabilidad: Toda la interactividad visual del formulario
// de solicitud: selección de prioridad, actualización de trámites
// según área, control de campos condicionales (Firmas/PDF),
// y toasts de estado de sistemas.
//
// Depende de: tramites-data.js (window.tramitesArea1/2)
// Usado por: portal_avanzado.html (conectado via addEventListener)
// ============================================================

// ─── Prioridad ───────────────────────────────────────────────

/**
 * Activa el botón de prioridad seleccionado y actualiza el
 * campo oculto #prioridad con su valor.
 * @param {HTMLElement} element - Botón .priority-btn clickeado
 */
function setPriority(element) {
  const btns = document.querySelectorAll('.priority-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  document.getElementById('prioridad').value = element.getAttribute('data-val');
}

// ─── Trámites dinámicos ──────────────────────────────────────

/**
 * Actualiza el select de Tipo de Trámite según el Área de Gestión
 * seleccionada. Consume window.tramitesArea1/2 de tramites-data.js.
 * Llama a verificarPresencialidad() al terminar.
 */
function actualizarTramites() {
  const area = document.getElementById('areaGestion').value;
  const selectTramite = document.getElementById('tipoTramite');

  selectTramite.innerHTML = '<option value="" disabled selected>Seleccione el Trámite...</option>';

  let lista = [];
  if (area === "Área 1 (Estructurales)") lista = window.tramitesArea1 || [];
  else if (area === "Área 2 (Operativos)")  lista = window.tramitesArea2 || [];

  lista.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    selectTramite.appendChild(opt);
  });

  verificarPresencialidad();
}

// ─── Campos condicionales (Firmas de documentos) ─────────────

/**
 * Muestra u oculta los campos de Ruta T y checkbox PDF
 * dependiendo de si el trámite seleccionado es "Firmas de documentos".
 */
function verificarPresencialidad() {
  const tramite      = document.getElementById('tipoTramite').value;
  const alerta       = document.getElementById('alertaPresencial');
  const grupoRutaT   = document.getElementById('grupoRutaT');
  const inputRutaT   = document.getElementById('rutaT');
  const grupoCheckPdf = document.getElementById('grupoCheckPdf');

  if (tramite === "Firmas de documentos") {
    alerta.style.display       = "block";
    grupoRutaT.style.display   = "block";
    grupoCheckPdf.style.display = "flex";
    inputRutaT.setAttribute("required", "true");
  } else {
    alerta.style.display       = "none";
    grupoRutaT.style.display   = "none";
    grupoCheckPdf.style.display = "none";
    inputRutaT.removeAttribute("required");
    inputRutaT.value = "";
    document.getElementById('checkPdf').checked = false;
  }
}

// ─── Toast de estado de sistemas ─────────────────────────────

/**
 * Muestra un toast con el estado del sistema clickeado
 * (servidor, contable o red), leyendo desde db_sistemas.
 * @param {string} sys - Clave del sistema: 'servidor' | 'contable' | 'red'
 */
function verInfoSistema(sys) {
  if (!window.DbService) return;
  window.DbService.getSistemas().then(infoSys => {
    const st      = infoSys[sys];
    const toast   = document.getElementById('toast');
    const nombres = {
      servidor: 'SERVIDOR PRINCIPAL',
      contable: 'PROGRAMA CONTABLE',
      red:      'RED E INTERNET'
    };

    if (!st || st.estado === 'ok' || !st.mensaje) {
      toast.className = 'toast show';
      toast.innerHTML = `<i class="fa-solid fa-check"></i> &nbsp;<strong>${nombres[sys]}:</strong> Operando con normalidad.`;
    } else if (st.estado === 'error') {
      toast.className = 'toast error show';
      toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> &nbsp;<strong>ALERTA ${nombres[sys]}:</strong> ${st.mensaje}`;
    } else {
      toast.className = 'toast warning show';
      toast.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> &nbsp;<strong>AVISO ${nombres[sys]}:</strong> ${st.mensaje}`;
    }

    setTimeout(() => { toast.classList.remove('show', 'error', 'warning'); }, 7000);
  });
}

// ─── Registro de Event Listeners ─────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Formulario: selects de área y trámite
  const areaGestion = document.getElementById('areaGestion');
  const tipoTramite = document.getElementById('tipoTramite');

  if (areaGestion) areaGestion.addEventListener('change', actualizarTramites);
  if (tipoTramite) tipoTramite.addEventListener('change', verificarPresencialidad);

  // Prioridad: delegación de eventos en el contenedor
  const priorityGroup = document.querySelector('.priority-group');
  if (priorityGroup) {
    priorityGroup.addEventListener('click', function(e) {
      const btn = e.target.closest('.priority-btn');
      if (btn) setPriority(btn);
    });
  }

  // Sistemas: delegación via atributo data-sys
  document.querySelectorAll('.sys-container[data-sys]').forEach(el => {
    el.addEventListener('click', () => verInfoSistema(el.dataset.sys));
  });
});
