// ============================================================
// IT COMMAND - JavaScript Frontend (Modularizado)
// ============================================================

// ---- Estado global ----
let currentSection = 'dashboard';

// ============================================================
// INIT AL CARGAR LA PÁGINA
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  setDefaultDates();
  cargarSolicitantes();
  cargarResponsables();
  loadDashboardData();
  loadRecentTickets();
  loadNetworkPulse();
  drawSparklines();
  
  // Inicializar sistema de notificaciones
  if (typeof NotificationHelper !== 'undefined') {
    NotificationHelper.init();
  }
});
