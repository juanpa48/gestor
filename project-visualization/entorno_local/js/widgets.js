// ============================================================
// GESTIÓN DE WIDGETS (ESTADO DE SISTEMAS Y PERSONAL)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de etiquetas de estado
  const ESTADO_LABELS = {
    disponible:    '🟢 Disponible (En Oficina)',
    en_desarrollo: '🔵 Disponible (Home Office)',
    reunion:       '🟣 En Reunión',
    atendiendo:    '🔴 Ocupada (Trámite)',
    urgente:       '🔴 Urgencia'
  };

  // ============================================================
  // CONTROL DE ESTADO DE SISTEMAS
  // ============================================================
  function toggleMensajeControl() {
    const estadoSelect = document.getElementById('ctrl_estado');
    const msgGroup = document.getElementById('grupo_mensaje');
    const mensajeInput = document.getElementById('ctrl_mensaje');
    
    if (!estadoSelect || !msgGroup) return;

    if (estadoSelect.value !== 'ok') {
      msgGroup.style.display = 'block';
    } else {
      msgGroup.style.display = 'none';
      if (mensajeInput) mensajeInput.value = '';
    }
  }

  function publicarEstadoSistema() {
    const sis = document.getElementById('ctrl_sistema').value;
    const est = document.getElementById('ctrl_estado').value;
    const msj = document.getElementById('ctrl_mensaje').value.trim();

    if (est !== 'ok' && !msj) {
      if (window.showToast) window.showToast('Por favor escribe un mensaje descriptivo para la alerta.', 'error');
      return;
    }

    if (!window.DbService) return;

    window.DbService.getSistemas().then(sysStatus => {
      sysStatus[sis] = { estado: est, mensaje: msj };
      window.DbService.saveSistemas(sysStatus).then(() => {
        if (window.showToast) window.showToast('Estado publicado al portal de Colaboradores', 'success');
      });
    });
  }

  // ============================================================
  // MI ESTADO (PERSONAL)
  // ============================================================
  function cargarNombresEnWidget() {
    const sel = document.getElementById('mi_nombre');
    if (!sel || !window.DbService) return;

    window.DbService.getResponsables()
      .then(responsables => {
        sel.innerHTML = '<option value="">Selecciona tu nombre...</option>' +
          responsables.map(nombre => {
            const escape = window.escapeHtml || (s => s);
            return `<option value="${escape(nombre)}">${escape(nombre)}</option>`;
          }).join('');

        // Restaurar selección guardada
        const guardado = localStorage.getItem('db_mi_seleccion');
        if (guardado) {
          try {
            const obj = JSON.parse(guardado);
            sel.value = obj.nombre || '';
            const estSel = document.getElementById('mi_estado');
            if (estSel && obj.estado) estSel.value = obj.estado;
            actualizarPreviewPanel(obj.nombre, obj.estado);
          } catch(e) {}
        }
      })
      .catch(console.error);
  }

  function setEstadoRapido(estado) {
    const select = document.getElementById('mi_estado');
    if(select) {
      select.value = estado;
      select.style.transform = 'scale(1.05)';
      setTimeout(() => { select.style.transform = 'scale(1)'; }, 150);
    }
  }

  function actualizarPreviewPanel(nombre, estado) {
    const panel = document.getElementById('estadoPreviewPanel');
    const pNombre = document.getElementById('previewNombre');
    const pEstado = document.getElementById('previewEstado');

    if (!panel || !pNombre || !pEstado) return;

    if (nombre && estado) {
      panel.style.display = 'block';
      pNombre.textContent = nombre;
      pEstado.textContent = 'Estado actual: ' + (ESTADO_LABELS[estado] || estado);
    } else {
      panel.style.display = 'none';
    }
  }

  function publicarMiEstado() {
    const nombre = document.getElementById('mi_nombre').value;
    const estado = document.getElementById('mi_estado').value;

    if (!nombre) {
      if (window.showToast) window.showToast('Selecciona tu nombre primero', 'error');
      return;
    }

    localStorage.setItem('db_mi_seleccion', JSON.stringify({ nombre, estado }));

    if (!window.DbService) return;

    window.DbService.getEstadoPersonal().then(db => {
      db[nombre] = { estado, label: ESTADO_LABELS[estado] || estado };
      window.DbService.saveEstadoPersonal(db).then(() => {
        actualizarPreviewPanel(nombre, estado);
        if (window.showToast) window.showToast(`Estado de ${nombre} publicado en el portal`, 'success');
      });
    });
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  
  // Estado de sistemas
  const ctrlEstado = document.getElementById('ctrl_estado');
  if (ctrlEstado) ctrlEstado.addEventListener('change', toggleMensajeControl);

  const btnPubSist = document.getElementById('btnPublicarEstadoSistema');
  if (btnPubSist) btnPubSist.addEventListener('click', publicarEstadoSistema);

  // Mi estado (Botones rápidos)
  document.querySelectorAll('[data-estado-rapido]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const est = e.currentTarget.dataset.estadoRapido;
      if (est) setEstadoRapido(est);
    });
  });

  const btnPubMiEstado = document.getElementById('btnPublicarMiEstado');
  if (btnPubMiEstado) btnPubMiEstado.addEventListener('click', publicarMiEstado);

  // Inicialización
  setTimeout(cargarNombresEnWidget, 400);
});
