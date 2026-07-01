// ============================================================
// SOLICITUDES ACTIVAS (todos los tickets excepto Resuelto/Cerrado)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

  const ESTADOS_INACTIVOS = ['Resuelto', 'Cerrado'];

  // Exponer funciones globalmente
  window.loadSolicitudes = loadSolicitudes;
  window.loadKanban = loadKanban;
  window.abrirModalEdicion = abrirModalEdicion;
  window.cerrarModal = cerrarModal;
  window.guardarEdicionTicket = guardarEdicionTicket;
  window.abrirModalRegistroRapido = abrirModalRegistroRapido;
  window.cerrarModalRapido = cerrarModalRapido;
  window.guardarRegistroRapido = guardarRegistroRapido;

  // El toggle de Kanban/Tabla y los Listeners de Gestion se manejan en navigation.js


  // Listeners para modal edicion
  const modalOverlay = document.getElementById('modalOverlay');
  const btnCerrarModal = document.getElementById('btnCloseModalEdicion');
  const btnCancelarModal = document.getElementById('btnCancelModalEdicion');
  const btnGuardarModal = document.getElementById('btnGuardarEdicion');
  const mGrupo = document.getElementById('m_grupo');

  if (modalOverlay) modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) cerrarModal();
  });
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);
  if (btnGuardarModal) btnGuardarModal.addEventListener('click', guardarEdicionTicket);
  if (mGrupo) mGrupo.addEventListener('change', actualizarTramitesModal);

  // Listeners para modal rapido
  const btnAbrirRapido = document.getElementById('btnModalRegistroRapido');
  const modalRapidoOverlay = document.getElementById('modalRapidoOverlay');
  const btnCerrarRapido = document.getElementById('btnCloseModalRapido');
  const btnCancelarRapido = document.getElementById('btnCancelModalRapido');
  const btnGuardarRapido = document.getElementById('btnGuardarRegistroRapido');

  if (btnAbrirRapido) btnAbrirRapido.addEventListener('click', abrirModalRegistroRapido);
  if (modalRapidoOverlay) modalRapidoOverlay.addEventListener('click', function(e) {
    if (e.target === modalRapidoOverlay) cerrarModalRapido();
  });
  if (btnCerrarRapido) btnCerrarRapido.addEventListener('click', cerrarModalRapido);
  if (btnCancelarRapido) btnCancelarRapido.addEventListener('click', cerrarModalRapido);
  if (btnGuardarRapido) btnGuardarRapido.addEventListener('click', guardarRegistroRapido);

  // Delegacion de eventos para tabla y kanban (click en filas/cards)
  const solicitudesTable = document.getElementById('solicitudesTable');
  const kanbanBoard = document.getElementById('kanbanBoard');

  if (solicitudesTable) {
    solicitudesTable.addEventListener('click', function(e) {
      const row = e.target.closest('tr[data-ticket-id]');
      if (row) {
        const id = row.getAttribute('data-ticket-id');
        abrirModalEdicion(id);
      }
    });
  }

  if (kanbanBoard) {
    kanbanBoard.addEventListener('click', function(e) {
      const card = e.target.closest('.kanban-card[data-ticket-id]');
      if (card) {
        const id = card.getAttribute('data-ticket-id');
        abrirModalEdicion(id);
      }
    });
  }

  // --- Variables ---
  let ticketEditandoId = null;
  const KANBAN_COLS = [
    { key: 'Pendiente',   label: 'Pendiente',   color: '#94a3b8' },
    { key: 'En progreso', label: 'En Progreso', color: '#3b82f6' },
  ];

  // --- Funciones ---

  function loadSolicitudes() {
    const container = document.getElementById('solicitudesTable');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>';

    const filtro = (document.getElementById('filtroEstado') || {}).value || '';
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    window.DbService.getActividades()
      .then(function(acts) {
        const activos = acts.filter(function(a) {
          const matchesEstado = !ESTADOS_INACTIVOS.includes(a.estado) && (!filtro || a.estado === filtro);
          if (!matchesEstado) return false;

          if (searchVal) {
            const matchesId = (a.id || '').toLowerCase().includes(searchVal);
            const matchesSolicitud = (a.solicitud || '').toLowerCase().includes(searchVal);
            const matchesNombre = (a.nombre || a.solicitante || '').toLowerCase().includes(searchVal);
            const matchesResponsable = (a.responsable || '').toLowerCase().includes(searchVal);
            if (!matchesId && !matchesSolicitud && !matchesNombre && !matchesResponsable) return false;
          }
          return true;
        });

        if (activos.length === 0) {
          container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Sin solicitudes activas</p><span>Todos los tickets han sido resueltos o no coinciden con la búsqueda</span></div>';
          return;
        }

        const prioColor = { Urgente: '#ef4444', Alta: '#f59e0b', Media: '#3b82f6', Baja: '#22c55e' };

        const rows = activos.reverse().map(function(t) {
          const prio = t.prioridad || 'Baja';
          const dot = prioColor[prio] || '#94a3b8';
          let estadoClase = 'pendiente';
          if ((t.estado || '').includes('progreso')) estadoClase = 'progreso';
          return (
            '<tr class="ticket-row-clickable" data-ticket-id="' + escapeHtml(t.id) + '">' +
            '<td><strong>' + escapeHtml(t.id || '') + '</strong></td>' +
            '<td style="max-width:350px; white-space:normal; overflow-wrap:anywhere; word-break:break-word; line-height:1.4;">' + escapeHtml(t.solicitud || t.nombre || '') + '</td>' +
            '<td>' + escapeHtml(t.nombre || t.solicitante || '') + '</td>' +
            '<td><span class="status-badge ' + estadoClase + '">' + escapeHtml(t.estado || '') + '</span></td>' +
            '<td><span style="display:inline-flex;align-items:center;gap:5px;"><span class="prioridad-dot" style="background:' + dot + '"></span>' + escapeHtml(prio) + '</span></td>' +
            '<td>' + escapeHtml(t.responsable || 'Sin asignar') + '</td>' +
            '<td style="color:#64748b;font-size:11px;">' + escapeHtml(t.fechaCreacion || '') + '</td>' +
            '</tr>'
          );
        }).join('');

        container.innerHTML =
          '<table class="data-table">' +
          '<thead><tr>' +
          '<th>ID</th><th>Solicitud</th><th>Solicitante</th><th>Estado</th><th>Prioridad</th><th>Responsable</th><th>Creado</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
          '</table>';
      });
  }

  function loadKanban() {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;
    board.innerHTML = '';

    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    window.DbService.getActividades()
      .then(function(acts) {
        const activos = acts.filter(function(a) {
          const matchesEstado = !ESTADOS_INACTIVOS.includes(a.estado);
          if (!matchesEstado) return false;

          if (searchVal) {
            const matchesId = (a.id || '').toLowerCase().includes(searchVal);
            const matchesSolicitud = (a.solicitud || '').toLowerCase().includes(searchVal);
            const matchesNombre = (a.nombre || a.solicitante || '').toLowerCase().includes(searchVal);
            const matchesResponsable = (a.responsable || '').toLowerCase().includes(searchVal);
            if (!matchesId && !matchesSolicitud && !matchesNombre && !matchesResponsable) return false;
          }
          return true;
        });

        const prioColor = { Urgente: '#ef4444', Alta: '#f59e0b', Media: '#3b82f6', Baja: '#22c55e' };

        KANBAN_COLS.forEach(function(col) {
          const tickets = activos.filter(function(t) { return t.estado === col.key; });

          const cardsHtml = tickets.length === 0
            ? '<div class="kanban-empty">Sin tickets en esta columna</div>'
            : tickets.reverse().map(function(t) {
                const prio = t.prioridad || 'Baja';
                const dot = prioColor[prio] || '#94a3b8';
                return (
                  '<div class="kanban-card ' + prio.toLowerCase() + '" data-ticket-id="' + escapeHtml(t.id) + '">' +
                  '<div class="kanban-card-id">' + escapeHtml(t.id || '') + '</div>' +
                  '<div class="kanban-card-title">' + escapeHtml(t.solicitud || t.nombre || '') + '</div>' +
                  '<div class="kanban-card-who" style="margin-bottom:6px; color:#475569;"><i class="fa-regular fa-user" style="font-size:10px;margin-right:4px;"></i>' + escapeHtml(t.nombre || t.solicitante || 'Desconocido') + '</div>' +
                  '<div class="kanban-card-footer">' +
                  '<span class="kanban-card-who" title="Responsable asignado"><i class="fa-solid fa-user-tie" style="font-size:10px;margin-right:4px;"></i>' + escapeHtml(t.responsable || 'Sin asignar') + '</span>' +
                  '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;"><span class="prioridad-dot" style="background:' + dot + '"></span>' + escapeHtml(prio) + '</span>' +
                  '</div>' +
                  '</div>'
                );
              }).join('');

          const colHtml = 
            '<div class="kanban-col">' +
            '<div class="kanban-col-header">' +
            '<div class="kanban-col-dot" style="background:' + col.color + '"></div>' +
            '<div class="kanban-col-title">' + col.label + '</div>' +
            '<div class="kanban-col-count">' + tickets.length + '</div>' +
            '</div>' +
            '<div class="kanban-col-body">' + cardsHtml + '</div>' +
            '</div>';

          board.insertAdjacentHTML('beforeend', colHtml);
        });
      });
  }

  function abrirModalEdicion(id) {
    window.DbService.getActividades()
      .then(function(acts) {
        const ticket = acts.find(function(a) { return a.id === id; });
        if (!ticket) return;

        ticketEditandoId = id;

        document.getElementById('modalTicketId').textContent = ticket.id;
        document.getElementById('modalSolicitudDesc').textContent = 
          (ticket.solicitud || ticket.nombre || 'Sin descripcion') +
          (ticket.solicitante ? ' - Solicitante: ' + ticket.solicitante : '');

        setSelectVal('m_estado', ticket.estado || 'Pendiente');
        setSelectVal('m_prioridad', ticket.prioridad || 'Baja');
        setSelectVal('m_grupo', ticket.grupo || 'Soporte Tecnico');
        document.getElementById('m_detalles').value = ticket.detalles || '';

        // Cargar responsables dinamicamente
        window.DbService.getResponsables()
          .then(function(responsablesRaw) {
            const respSelect = document.getElementById('m_responsable');
            const responsables = responsablesRaw.map(function(r) { return typeof r === 'object' ? r.nombre : r; });
            respSelect.innerHTML = '<option value="">Sin asignar</option>' +
              responsables.map(function(r) {
                return '<option value="' + escapeHtml(r) + '"' + (r === ticket.responsable ? ' selected' : '') + '>' + escapeHtml(r) + '</option>';
              }).join('');
          });

        // Cargar Tipo de Tramite
        if (typeof actualizarTramitesModal === 'function') {
          actualizarTramitesModal();
        }
        setSelectVal('m_clasificacion', ticket.grupoExtra || ticket.clasificacion || '');

        document.getElementById('modalOverlay').classList.add('active');
      });
  }

  function setSelectVal(id, val) {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === val) { sel.value = val; break; }
    }
  }

  function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    ticketEditandoId = null;
  }

  function guardarEdicionTicket() {
    if (!ticketEditandoId) return;

    const btn = document.getElementById('modalBtnText');
    const loader = document.getElementById('modalBtnLoader');
    if (btn) btn.classList.add('hidden');
    if (loader) loader.classList.remove('hidden');

    window.DbService.getActividades()
      .then(function(acts) {
        const idx = acts.findIndex(function(a) { return a.id === ticketEditandoId; });

        if (idx !== -1) {
          acts[idx].estado = document.getElementById('m_estado').value;
          acts[idx].responsable = document.getElementById('m_responsable').value;
          acts[idx].prioridad = document.getElementById('m_prioridad').value;
          acts[idx].grupo = document.getElementById('m_grupo').value;
          acts[idx].grupoExtra = document.getElementById('m_clasificacion').value;
          acts[idx].clasificacion = document.getElementById('m_clasificacion').value;
          acts[idx].accion = '';
          acts[idx].detalles = document.getElementById('m_detalles').value.trim();
          
          return window.DbService.saveActividades(acts);
        }
      })
      .then(function() {
        if (btn) btn.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
        cerrarModal();

        showToast('Ticket actualizado correctamente', 'success');

        // Emitir evento para refrescar otras vistas (Kanban, Tabla, Dashboard)
        document.dispatchEvent(new CustomEvent('ticketActualizado'));
      });
  }

  function abrirModalRegistroRapido() {
    // Cargar responsables
    window.DbService.getResponsables()
      .then(function(responsablesRaw) {
        const respSelect = document.getElementById('qr_responsable');
        const responsables = responsablesRaw.map(function(r) { return typeof r === 'object' ? r.nombre : r; });
        respSelect.innerHTML = '<option value="">Sin asignar / Opcional</option>' + 
          responsables.map(function(r) { return '<option value="' + escapeHtml(r) + '">' + escapeHtml(r) + '</option>'; }).join('');
      });

    // Cargar solicitantes
    window.DbService.getSolicitantes()
      .then(function(solicitantes) {
        const solSelect = document.getElementById('qr_solicitante');
        solSelect.innerHTML = '<option value="" disabled selected>Seleccione solicitante...</option>' + 
          solicitantes.map(function(s) { return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>'; }).join('');
      });

    document.getElementById('qr_solicitud').value = '';
    document.getElementById('qr_estado').value = 'Pendiente';
    document.getElementById('qr_prioridad').value = '';

    document.getElementById('modalRapidoOverlay').classList.add('active');
  }

  function cerrarModalRapido() {
    document.getElementById('modalRapidoOverlay').classList.remove('active');
  }

  function guardarRegistroRapido() {
    const solicitante = document.getElementById('qr_solicitante').value;
    const solicitud = document.getElementById('qr_solicitud').value.trim();
    
    if (!solicitante || !solicitud) {
      showToast('Por favor completa Solicitante y Solicitud', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const datosRapidos = {
      solicitante: solicitante,
      responsable: document.getElementById('qr_responsable').value,
      solicitud: solicitud,
      estado: document.getElementById('qr_estado').value,
      prioridad: document.getElementById('qr_prioridad').value,
      grupo: '',
      clasificacion: '',
      fechaInicio: today,
      fechaFin: today,
      fechaProgramada: today,
      accion: '',
      detalles: ''
    };

    const btn = document.getElementById('btnModalRapidoText');
    const loader = document.getElementById('btnModalRapidoLoader');
    if (btn) btn.classList.add('hidden');
    if (loader) loader.classList.remove('hidden');

    window.DbService.guardarActividad(datosRapidos)
      .then(function(response) {
        if (btn) btn.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
        cerrarModalRapido();

        showToast('Ticket rapido creado', 'success');

        // Emitir evento para notificar a toda la aplicacion
        document.dispatchEvent(new CustomEvent('actividadGuardada'));
      })
      .catch(function(err) {
        if (btn) btn.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
        showToast('Error: ' + err.message, 'error');
      });
  }



  // Escuchar eventos para recargar la vista de Gestión
  document.addEventListener('actividadGuardada', function() {
    if (typeof window.loadGestion === 'function') window.loadGestion();
  });

  document.addEventListener('ticketActualizado', function() {
    if (typeof window.loadGestion === 'function') window.loadGestion();
  });

  // Escuchar tickets nuevos desde otras pestañas (portal_avanzado.html)
  document.addEventListener('nuevoTicketExterno', function() {
    if (typeof window.loadGestion === 'function') window.loadGestion();
  });

  // Funcion para actualizar tramites en el modal segun el grupo seleccionado
  function actualizarTramitesModal() {
    const grupo = document.getElementById('m_grupo').value;
    const selectTramite = document.getElementById('m_clasificacion');
    if (!selectTramite) return;

    let lista = [];
    if (grupo.includes('Área 1') || grupo.includes('Estructural')) lista = window.tramitesArea1 || [];
    else if (grupo.includes('Área 2') || grupo.includes('Operativo')) lista = window.tramitesArea2 || [];

    selectTramite.innerHTML = '<option value="">Seleccione tipo de trámite...</option>' +
      lista.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  }

  // Escuchar evento de búsqueda en tiempo real
  document.addEventListener('searchTriggered', function() {
    if (typeof window.loadGestion === 'function') window.loadGestion();
  });

  // Escuchar cuando se selecciona un ticket desde la búsqueda autocomplete.
  // tickets.js solo se carga en gestion.html, así que ya estamos en la página
  // correcta: basta con abrir el modal de edición del ticket seleccionado.
  document.addEventListener('ticketSeleccionado', function(e) {
    if (e.detail && e.detail.id) {
      abrirModalEdicion(e.detail.id);
    }
  });

});
