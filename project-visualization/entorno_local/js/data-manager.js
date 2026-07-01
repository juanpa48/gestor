// ============================================================
// GESTOR DE DATOS Y FORMULARIO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Catálogo de trámites: fuente única en js/tramites-data.js
  // Accedidos via window.tramitesArea1 y window.tramitesArea2

  function cargarSolicitantes() {
    const select = document.getElementById("solicitante");
    if (!select || !window.DbService) return;
    window.DbService.getSolicitantes()
      .then(solicitantes => {
        select.innerHTML = '<option value="" disabled selected>Seleccione solicitante...</option>';
        solicitantes.forEach(nombre => {
          const option = document.createElement("option");
          option.value = nombre;
          option.textContent = nombre;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error cargando solicitantes:", error);
        select.innerHTML = '<option value="" disabled selected>Error cargando</option>';
      });
  }

  function cargarResponsables() {
    const select = document.getElementById("responsable");
    if (!select || !window.DbService) return;
    window.DbService.getResponsables()
      .then(responsables => {
        select.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
        responsables.forEach(nombre => {
          const option = document.createElement("option");
          option.value = nombre;
          option.textContent = nombre;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error cargando responsables:", error);
        select.innerHTML = '<option value="" disabled selected>Error cargando</option>';
      });
  }

  function actualizarTramites(selectAreaId, selectTramiteId) {
    const areaSelect = document.getElementById(selectAreaId);
    const tramiteSelect = document.getElementById(selectTramiteId);
    if (!areaSelect || !tramiteSelect) return;

    const area = areaSelect.value;
    tramiteSelect.innerHTML = '<option value="" disabled selected>Seleccione el Trámite...</option>';
    
    let lista = [];
    if (area === "Área 1 (Estructurales)") lista = window.tramitesArea1 || [];
    else if (area === "Área 2 (Operativos)") lista = window.tramitesArea2 || [];

    lista.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      tramiteSelect.appendChild(opt);
    });
  }

  // ============================================================
  // GUARDAR ACTIVIDAD
  // ============================================================
  function guardarMiActividad() {
    const solicitante = document.getElementById('solicitante').value;
    if (!solicitante) {
      if (typeof window.showToast === 'function') window.showToast('Por favor selecciona un solicitante', 'error');
      return;
    }
    const solicitudDesc = document.getElementById('solicitud').value.trim();
    if (!solicitudDesc) {
      if (typeof window.showToast === 'function') window.showToast('Por favor escribe la solicitud del usuario', 'error');
      return;
    }

    const datosFormulario = {
      solicitante: document.getElementById('solicitante').value,
      responsable: document.getElementById('responsable').value.trim(),
      solicitud: document.getElementById('solicitud').value.trim(),
      estado: document.getElementById('estado').value,
      prioridad: document.getElementById('prioridad').value,
      grupo: document.getElementById('grupo').value,
      clasificacion: document.getElementById('clasificacion').value,
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFin: document.getElementById('fechaFin').value,
      fechaProgramada: document.getElementById('fechaProgramada').value.trim(),
      accion: '',
      detalles: document.getElementById('detalles').value.trim()
    };

    setBtnLoading(true);

    if (window.DbService) {
      window.DbService.guardarActividad(datosFormulario)
        .then(response => {
          setBtnLoading(false);
          if (response && response.success) {
            if (typeof window.showToast === 'function') window.showToast('✅ ' + response.message, 'success');
            resetForm();
            // Emitir evento para desacoplar componentes
            document.dispatchEvent(new CustomEvent('actividadGuardada'));
          }
        })
        .catch(err => {
          setBtnLoading(false);
          if (typeof window.showToast === 'function') window.showToast('❌ Error al guardar', 'error');
          console.error(err);
        });
    }
  }

  function setBtnLoading(loading) {
    const btn = document.querySelector('.btn-save');
    const text = document.getElementById('btnSaveText');
    const loader = document.getElementById('btnSaveLoader');
    if (!btn) return;
    btn.disabled = loading;
    if (text) text.classList.toggle('hidden', loading);
    if (loader) loader.classList.toggle('hidden', !loading);
  }

  function resetForm() {
    document.getElementById('solicitante').value = "";
    document.getElementById('responsable').value = "";
    document.getElementById('solicitud').value = "";
    document.getElementById('estado').value = "Pendiente";
    document.getElementById('prioridad').value = "Baja";
    document.getElementById('grupo').value = "";
    document.getElementById('clasificacion').value = "";
    document.getElementById('fechaProgramada').value = "";
    document.getElementById('detalles').value = "";
    setDefaultDates();
  }

  function setDefaultDates() {
    const fi = document.getElementById('fechaInicio');
    const ff = document.getElementById('fechaFin');
    const fp = document.getElementById('fechaProgramada');
    if (fi) fi.value = "";
    if (ff) ff.value = "";
    if (fp) fp.value = "";
  }

  function setHoy(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      const hoy = new Date();
      const dia = String(hoy.getDate()).padStart(2, '0');
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const anio = hoy.getFullYear();
      input.value = `${anio}-${mes}-${dia}`;
    }
  }

  // ============================================================
  // EVENT LISTENERS DE INTERFAZ
  // ============================================================
  
  const grupoSelect = document.getElementById('grupo');
  if (grupoSelect) {
    grupoSelect.addEventListener('change', () => actualizarTramites('grupo', 'clasificacion'));
  }

  // Los botones de "Hoy"
  const btnHoyInicio = document.getElementById('btnHoyInicio');
  if (btnHoyInicio) btnHoyInicio.addEventListener('click', () => setHoy('fechaInicio'));

  const btnHoyFin = document.getElementById('btnHoyFin');
  if (btnHoyFin) btnHoyFin.addEventListener('click', () => setHoy('fechaFin'));

  const btnHoyProgramada = document.getElementById('btnHoyProgramada');
  if (btnHoyProgramada) btnHoyProgramada.addEventListener('click', () => setHoy('fechaProgramada'));

  // Botones del formulario
  const btnReset = document.getElementById('btnResetForm');
  if (btnReset) btnReset.addEventListener('click', resetForm);

  const btnGuardar = document.getElementById('btnGuardarActividad');
  if (btnGuardar) btnGuardar.addEventListener('click', guardarMiActividad);

  // Inicialización exportada globalmente
  window.cargarSolicitantes = cargarSolicitantes;
  window.cargarResponsables = cargarResponsables;
  window.setDefaultDates = setDefaultDates;
  window.actualizarTramitesModal = () => actualizarTramites('m_grupo', 'm_clasificacion');
});
