// ============================================================
// TABLA DE ACTIVIDADES (sección Recents)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  
  // Exponer funciones globalmente para compatibilidad
  window.loadActivityTable = loadActivityTable;
  window.filtrarActividades = filtrarActividades;
  window.limpiarFiltrosActividades = limpiarFiltrosActividades;

  // Listeners para filtros
  const filtroEstado = document.getElementById('filtroEstadoAct');
  const filtroPrioridad = document.getElementById('filtroPrioridadAct');
  const filtroResponsable = document.getElementById('filtroResponsableAct');
  // GRUPO: comentado — no aplica a este proyecto, descomentar para reutilizar
  // const filtroGrupo = document.getElementById('filtroGrupoAct');
  const filtroPeriodo = document.getElementById('filtroPeriodoAct');
  const btnLimpiar = document.getElementById('btnLimpiarFiltros');
  const btnActualizar = document.getElementById('btnRefreshActivityTable');

  if (filtroEstado) filtroEstado.addEventListener('change', filtrarActividades);
  if (filtroPrioridad) filtroPrioridad.addEventListener('change', filtrarActividades);
  if (filtroResponsable) filtroResponsable.addEventListener('change', filtrarActividades);
  // if (filtroGrupo) filtroGrupo.addEventListener('change', filtrarActividades); // GRUPO comentado
  if (filtroPeriodo) filtroPeriodo.addEventListener('change', filtrarActividades);
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltrosActividades);
  if (btnActualizar) btnActualizar.addEventListener('click', loadActivityTable);

  // Escuchar eventos para refrescar la tabla
  document.addEventListener('actividadGuardada', function() {
    loadActivityTable();
  });

  document.addEventListener('ticketActualizado', function() {
    loadActivityTable();
  });

  // Escuchar tickets nuevos desde otras pestañas (portal_avanzado.html)
  document.addEventListener('nuevoTicketExterno', function() {
    loadActivityTable();
  });

  // Escuchar evento de búsqueda en tiempo real
  document.addEventListener('searchTriggered', function() {
    filtrarActividades();
  });

  // --- Funciones ---

  /**
   * Parsea la fecha de un ticket de forma robusta.
   * Prioriza fechaISO (tickets nuevos), luego intenta new Date(),
   * y como fallback parsea el formato locale DD/MM/YYYY, HH:mm:ss.
   * @param {Object} ticket — objeto de actividad
   * @returns {Date|null} — Date válido o null si no se pudo parsear
   */
  function parseFechaCreacion(ticket) {
    // 1. Campo ISO (tickets nuevos)
    if (ticket.fechaISO) {
      var d = new Date(ticket.fechaISO);
      if (!isNaN(d.getTime())) return d;
    }

    var raw = ticket.fechaCreacion || '';
    if (!raw) return null;

    // 2. Intento directo (funciona con formatos que JS entiende)
    var d2 = new Date(raw);
    if (!isNaN(d2.getTime())) return d2;

    // 3. Fallback: parsear formato locale español DD/MM/YYYY, HH:mm:ss
    var match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      var day = parseInt(match[1], 10);
      var month = parseInt(match[2], 10) - 1; // 0-indexed
      var year = parseInt(match[3], 10);

      // Extraer hora si existe
      var timeMatch = raw.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
      var hours = 0, minutes = 0, seconds = 0;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

        // Detectar AM/PM si existe
        if (/p\.?\s*m\.?/i.test(raw) && hours < 12) hours += 12;
        if (/a\.?\s*m\.?/i.test(raw) && hours === 12) hours = 0;
      }

      var d3 = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d3.getTime())) return d3;
    }

    return null;
  }


  function loadActivityTable() {
    const container = document.getElementById('activityTable');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>';

    // Cargar responsables en el filtro dinámicamente
    cargarFiltroResponsables();

    // Cargar y filtrar actividades respetando los filtros y búsqueda
    filtrarActividades();
  }

  function cargarFiltroResponsables() {
    const select = document.getElementById('filtroResponsableAct');
    if (!select) return;

    window.DbService.getResponsables()
      .then(function(responsables) {
        const options = responsables.map(function(r) {
          const nombre = typeof r === 'object' ? r.nombre : r;
          return '<option value="' + escapeHtml(nombre) + '">' + escapeHtml(nombre) + '</option>';
        }).join('');
        select.innerHTML = '<option value="">Todos</option>' + options;
      });
  }

  function filtrarActividades() {
    const container = document.getElementById('activityTable');
    if (!container) return;

    // Obtener valores de los filtros
    const filtroEstadoVal = (document.getElementById('filtroEstadoAct') || {}).value || '';
    const filtroPrioridadVal = (document.getElementById('filtroPrioridadAct') || {}).value || '';
    const filtroResponsableVal = (document.getElementById('filtroResponsableAct') || {}).value || '';
    // const filtroGrupoVal = (document.getElementById('filtroGrupoAct') || {}).value || ''; // GRUPO comentado
    const filtroPeriodoVal = (document.getElementById('filtroPeriodoAct') || {}).value || '';

    // Obtener valor de la barra de búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    window.DbService.getActividades()
      .then(function(acts) {
        if (acts.length === 0) {
          container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Sin actividades registradas</p></div>';
          actualizarEstadisticasRapidas([]);
          return;
        }

        // Filtrar
        let filtrados = acts.filter(function(a) {
          if (filtroEstadoVal && a.estado !== filtroEstadoVal) return false;
          if (filtroPrioridadVal && a.prioridad !== filtroPrioridadVal) return false;
          if (filtroResponsableVal && a.responsable !== filtroResponsableVal) return false;
          // if (filtroGrupoVal && a.grupo !== filtroGrupoVal) return false; // GRUPO comentado

          // Filtro de período
          if (filtroPeriodoVal) {
            var fecha = parseFechaCreacion(a);
            if (!fecha) return false; // fecha inválida: excluir
            var hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (filtroPeriodoVal === 'hoy') {
              var fechaAct = new Date(fecha.getTime());
              fechaAct.setHours(0, 0, 0, 0);
              if (fechaAct.getTime() !== hoy.getTime()) return false;
            } else if (filtroPeriodoVal === 'semana') {
              var semanaAtras = new Date(hoy);
              semanaAtras.setDate(semanaAtras.getDate() - 7);
              if (fecha < semanaAtras) return false;
            } else if (filtroPeriodoVal === 'mes') {
              var mesAtras = new Date(hoy);
              mesAtras.setMonth(mesAtras.getMonth() - 1);
              if (fecha < mesAtras) return false;
            }
          }

          // Filtro de búsqueda (ID, solicitud, solicitante/nombre, responsable)
          if (searchVal) {
            const matchesId = (a.id || '').toLowerCase().includes(searchVal);
            const matchesSolicitud = (a.solicitud || '').toLowerCase().includes(searchVal);
            const matchesNombre = (a.nombre || a.solicitante || '').toLowerCase().includes(searchVal);
            const matchesResponsable = (a.responsable || '').toLowerCase().includes(searchVal);
            if (!matchesId && !matchesSolicitud && !matchesNombre && !matchesResponsable) return false;
          }

          return true;
        });

        // Renderizar
        if (filtrados.length > 0) {
          renderActivityTable(filtrados);
        } else {
          container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-filter"></i><p>Sin resultados para los filtros aplicados o búsqueda</p></div>';
        }

        actualizarEstadisticasRapidas(filtrados);
      });
  }

  function limpiarFiltrosActividades() {
    const filtroEstadoEl = document.getElementById('filtroEstadoAct');
    const filtroPrioridadEl = document.getElementById('filtroPrioridadAct');
    const filtroResponsableEl = document.getElementById('filtroResponsableAct');
    // const filtroGrupoEl = document.getElementById('filtroGrupoAct'); // GRUPO comentado
    const filtroPeriodoEl = document.getElementById('filtroPeriodoAct');

    if (filtroEstadoEl) filtroEstadoEl.value = '';
    if (filtroPrioridadEl) filtroPrioridadEl.value = '';
    if (filtroResponsableEl) filtroResponsableEl.value = '';
    // if (filtroGrupoEl) filtroGrupoEl.value = ''; // GRUPO comentado
    if (filtroPeriodoEl) filtroPeriodoEl.value = '';

    loadActivityTable();
  }

  function actualizarEstadisticasRapidas(datos) {
    const total = datos.length;
    const pendientes = datos.filter(function(d) { return d.estado === 'Pendiente'; }).length;
    const enProgreso = datos.filter(function(d) { return (d.estado || '').includes('progreso'); }).length;
    const resueltos = datos.filter(function(d) { return d.estado === 'Resuelto' || d.estado === 'Cerrado'; }).length;
    const urgentes = datos.filter(function(d) { return d.prioridad === 'Urgente'; }).length;

    const qsTotal = document.getElementById('qsTotal');
    const qsPendientes = document.getElementById('qsPendientes');
    const qsProgreso = document.getElementById('qsProgreso');
    const qsResueltos = document.getElementById('qsResueltos');
    const qsUrgentes = document.getElementById('qsUrgentes');

    if (qsTotal) qsTotal.textContent = total;
    if (qsPendientes) qsPendientes.textContent = pendientes;
    if (qsProgreso) qsProgreso.textContent = enProgreso;
    if (qsResueltos) qsResueltos.textContent = resueltos;
    if (qsUrgentes) qsUrgentes.textContent = urgentes;
  }

  function renderActivityTable(datos) {
    const container = document.getElementById('activityTable');
    if (!container) return;

    const rows = datos.map(function(r) {
      const estado = (r.estado || '').toLowerCase();
      let estadoClass = 'pendiente';
      if (estado.includes('progreso')) estadoClass = 'progreso';
      else if (estado.includes('resuelto') || estado.includes('cerrado')) estadoClass = 'resuelto';

      const prio = (r.prioridad || '').toLowerCase();
      let prioClass = 'baja';
      if (prio === 'alta' || prio === 'urgente') prioClass = 'alta';
      else if (prio === 'media') prioClass = 'media';

      return (
        '<tr>' +
        '<td class="col-id">' + escapeHtml(r.id || '') + '</td>' +
        '<td class="col-solicitud" title="' + escapeHtml(r.solicitud || r.nombre || '') + '">' + escapeHtml(r.solicitud || r.nombre || '') + '</td>' +
        '<td>' + escapeHtml(r.nombre || r.solicitante || '') + '</td>' +
        '<td><span class="status-badge ' + estadoClass + '">' + escapeHtml(r.estado || '') + '</span></td>' +
        '<td><span class="prioridad-badge ' + prioClass + '">' + escapeHtml(r.prioridad || '') + '</span></td>' +
        '<td>' + escapeHtml(r.grupo || '') + '</td>' +
        '<td>' + escapeHtml(r.responsable || 'Sin asignar') + '</td>' +
        '<td class="col-fecha">' + escapeHtml(r.fechaCreacion || '') + '</td>' +
        '</tr>'
      );
    }).join('');

    container.innerHTML =
      '<table class="data-table">' +
      '<thead><tr>' +
      '<th>ID</th><th>Solicitud</th><th>Solicitante</th><th>Estado</th><th>Prioridad</th><th>Grupo</th><th>Responsable</th><th>Fecha</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>';
  }

});
