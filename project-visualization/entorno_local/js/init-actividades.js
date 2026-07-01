// ============================================================
// INIT — Página Actividades (actividades.html)
// ------------------------------------------------------------
// Inicializador mínimo y específico de esta página. Sustituye a
// app.js (que está acoplado al dashboard) para evitar llamar a
// funciones inexistentes aquí (loadDashboardData, sparklines, etc.).
//
// La lógica de la tabla vive en activity-table.js, que expone
// window.loadActivityTable y ya escucha los eventos de la app
// (actividadGuardada, ticketActualizado, nuevoTicketExterno,
// searchTriggered). Aquí solo disparamos la carga inicial.
// ============================================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Carga inicial de la tabla de actividades
    if (typeof window.loadActivityTable === 'function') {
      window.loadActivityTable();
    }

    // Inicializar sistema de notificaciones (audio + permiso navegador)
    if (typeof NotificationHelper !== 'undefined') {
      NotificationHelper.init();
    }
  });
})();
