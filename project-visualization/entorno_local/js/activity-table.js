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
  const filtroGrupo = document.getElementById('filtroGrupoAct');
  const filtroPeriodo = document.getElementById('filtroPeriodoAct');
  const btnLimpiar = document.getElementById('btnLimpiarFiltros');
  const btnActualizar = document.getElementById('btnRefreshActivityTable');

  if (filtroEstado) filtroEstado.addEventListener('change', filtrarActividades);
  if (filtroPrioridad) filtroPrioridad.addEventListener('change', filtrarActividades);
  if (filtroResponsable) filtroResponsable.addEventListener('change', filtrarActividades);
  if (filtroGrupo) filtroGrupo.addEventListener('change', filtrarActividades);
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

  // Cargar tabla cuando se navega a la seccion Actividades
  document.addEventListener('sectionChanged', function(e) {
    console.log("[v0] sectionChanged recibido:", e.detail);
    if (e.detail && e.detail.section === 'recents') {
      console.log("[v0] Seccion es recents, llamando loadActivityTable");
      loadActivityTable();
    }
  });

  // --- Funciones ---

  function loadActivityTable() {
    console.log("[v0] loadActivityTable llamada");
    const container = document.getElementById('activityTable');
    if (!container) {
      console.log("[v0] activityTable container NO encontrado");
      return;
    }
    console.log("[v0] activityTable container encontrado");
    container.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>';

    // Cargar responsables en el filtro dinámicamente
    cargarFiltroResponsables();

    console.log("[v0] Llamando DbService.getActividades()");
    window.DbService.getActividades()
      .then(function(data) {
        console.log("[v0] DbService.getActividades() respondio:", data);
        if (data && data.length > 0) {
          renderActivityTable(data);
          actualizarEstadisticasRapidas(data);
        } else {
          container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Sin actividades registradas</p></div>';
          actualizarEstadisticasRapidas([]);
        }
      })
      .catch(function(err) {
        console.log("[v0] DbService.getActividades() ERROR:", err);
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Error al cargar datos</p></div>';
      });
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
    const filtroGrupoVal = (document.getElementById('filtroGrupoAct') || {}).value || '';
    const filtroPeriodoVal = (document.getElementById('filtroPeriodoAct') || {}).value || '';

    window.DbService.getActividades()
      .then(function(acts) {
        // Filtrar
        let filtrados = acts.filter(function(a) {
          if (filtroEstadoVal && a.estado !== filtroEstadoVal) return false;
          if (filtroPrioridadVal && a.prioridad !== filtroPrioridadVal) return false;
          if (filtroResponsableVal && a.responsable !== filtroResponsableVal) return false;
          if (filtroGrupoVal && a.grupo !== filtroGrupoVal) return false;

          // Filtro de período
          if (filtroPeriodoVal) {
            const fecha = new Date(a.fechaCreacion || '');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (filtroPeriodoVal === 'hoy') {
              const fechaAct = new Date(fecha);
              fechaAct.setHours(0, 0, 0, 0);
              if (fechaAct.getTime() !== hoy.getTime()) return false;
            } else if (filtroPeriodoVal === 'semana') {
              const semanaAtras = new Date(hoy);
              semanaAtras.setDate(semanaAtras.getDate() - 7);
              if (fecha < semanaAtras) return false;
            } else if (filtroPeriodoVal === 'mes') {
              const mesAtras = new Date(hoy);
              mesAtras.setMonth(mesAtras.getMonth() - 1);
              if (fecha < mesAtras) return false;
            }
          }

          return true;
        });

        // Renderizar
        if (filtrados.length > 0) {
          renderActivityTable(filtrados);
        } else {
          container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-filter"></i><p>Sin resultados para los filtros aplicados</p></div>';
        }

        actualizarEstadisticasRapidas(filtrados);
      });
  }

  function limpiarFiltrosActividades() {
    const filtroEstadoEl = document.getElementById('filtroEstadoAct');
    const filtroPrioridadEl = document.getElementById('filtroPrioridadAct');
    const filtroResponsableEl = document.getElementById('filtroResponsableAct');
    const filtroGrupoEl = document.getElementById('filtroGrupoAct');
    const filtroPeriodoEl = document.getElementById('filtroPeriodoAct');

    if (filtroEstadoEl) filtroEstadoEl.value = '';
    if (filtroPrioridadEl) filtroPrioridadEl.value = '';
    if (filtroResponsableEl) filtroResponsableEl.value = '';
    if (filtroGrupoEl) filtroGrupoEl.value = '';
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
