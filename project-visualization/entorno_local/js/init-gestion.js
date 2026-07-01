// ============================================================
// INIT — Página Gestión (gestion.html)
// ------------------------------------------------------------
// Inicializador mínimo y específico de esta página. Sustituye a
// app.js + navigation.js (acoplados al dashboard SPA) para evitar
// llamar a funciones inexistentes aquí.
//
// La lógica de tabla/kanban/modales vive en tickets.js, que expone
// window.loadSolicitudes, window.loadKanban, abrirModalEdicion, etc.
// y ya engancha sus listeners (modales, delegación de filas/cards) y
// escucha los eventos de la app (actividadGuardada, ticketActualizado,
// nuevoTicketExterno, searchTriggered, ticketSeleccionado).
//
// Aquí solo replicamos lo que vivía en navigation.js para Gestión:
// el toggle Tabla/Kanban, window.loadGestion, el filtro y el refresh.
// ============================================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    let currentView = 'tabla'; // 'tabla' o 'kanban'

    // Carga la vista activa (tabla o kanban) usando las funciones de tickets.js
    window.loadGestion = function () {
      if (currentView === 'tabla') {
        if (typeof window.loadSolicitudes === 'function') window.loadSolicitudes();
      } else {
        if (typeof window.loadKanban === 'function') window.loadKanban();
      }
    };

    // Toggle de vista Tabla / Kanban
    window.switchView = function (view) {
      currentView = view;

      document.querySelectorAll('.toggle-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.view === view);
      });

      const tablaEl = document.getElementById('gestionTabla');
      const kanbanEl = document.getElementById('gestionKanban');

      if (view === 'tabla') {
        if (tablaEl) tablaEl.style.display = 'block';
        if (kanbanEl) kanbanEl.style.display = 'none';
      } else {
        if (tablaEl) tablaEl.style.display = 'none';
        if (kanbanEl) kanbanEl.style.display = 'block';
      }

      window.loadGestion();
    };

    // Vincular botones de toggle de vista
    document.querySelectorAll('.toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const view = e.currentTarget.dataset.view;
        if (view) window.switchView(view);
      });
    });

    // Vincular filtro de estado y botón de refresco
    const filtroEstado = document.getElementById('filtroEstado');
    if (filtroEstado) filtroEstado.addEventListener('change', window.loadGestion);

    const btnRefreshGestion = document.getElementById('btnRefreshGestion');
    if (btnRefreshGestion) btnRefreshGestion.addEventListener('click', window.loadGestion);

    // Carga inicial (vista tabla por defecto)
    window.loadGestion();

    // Inicializar sistema de notificaciones (audio + permiso navegador)
    if (typeof NotificationHelper !== 'undefined') {
      NotificationHelper.init();
    }
  });
})();
