// ============================================================
// CARGAR DATOS DEL DASHBOARD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  window.loadDashboardData = function() {
    if (!window.DbService) return;
    window.DbService.getDashboardStats()
      .then(data => {
        if (data.success) {
          animateValue('statTotalOpen', 0, data.totalOpen, 800);
          animateValue('statInProgress', 0, data.inProgress, 800);
          animateValue('statUrgentTasks', 0, data.urgentTasks, 800);
          const avgResolveEl = document.getElementById('statAvgResolve');
          if (avgResolveEl) avgResolveEl.textContent = data.avgResolve || '0h';
          
          // Actualizar badge de notificaciones
          const badge = document.getElementById('notifBadge');
          if (badge) badge.textContent = data.urgentTasks || 0;
        } else {
          setDefaultStats();
        }
      })
      .catch(err => {
        console.error('Error cargando stats:', err);
        setDefaultStats();
      });
  };

  function setDefaultStats() {
    const ids = ['statTotalOpen', 'statInProgress', 'statUrgentTasks'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    const avgEl = document.getElementById('statAvgResolve');
    if (avgEl) avgEl.textContent = '0h';
  }

  // ============================================================
  // ANIMACIÓN DE NÚMEROS
  // ============================================================
  function animateValue(elementId, start, end, duration) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * eased);
      el.textContent = String(current).padStart(2, '0');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // ============================================================
  // CARGAR TICKETS RECIENTES
  // ============================================================
  window.loadRecentTickets = function() {
    const container = document.getElementById('ticketsList');
    if (!container || !window.DbService) return;

    window.DbService.getRecentTickets()
      .then(data => {
        if (data.success && data.tickets.length > 0) {
          renderTickets(data.tickets);
        } else {
          container.innerHTML = '<div class="loading-state">No hay tickets recientes</div>';
        }
      })
      .catch(err => {
        console.error('Error tickets:', err);
        renderTickets([
          { titulo: 'Ticket Reciente 1', timeAgo: 'hace 73 minutos', isUrgent: true },
          { titulo: 'Ticket Reciente 2', timeAgo: 'hace 10 minutos', isUrgent: false },
          { titulo: 'Ticket Reciente 3', timeAgo: 'hace 12 minutos', isUrgent: true }
        ]);
      });
  };

  function renderTickets(tickets) {
    const container = document.getElementById('ticketsList');
    if (!container) return;
    container.innerHTML = tickets.map(t => {
      const isUrgent = t.isUrgent;
      const escape = window.escapeHtml || (s => s);
      return `
        <div class="ticket-item">
          <div class="ticket-dot ${isUrgent ? 'urgent' : 'normal'}">
            <i class="fa-solid fa-${isUrgent ? 'circle-exclamation' : 'clock'}"></i>
          </div>
          <div class="ticket-info">
            <div class="ticket-title">${escape(t.titulo)}</div>
            <div class="ticket-time">${escape(t.timeAgo)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================
  // CARGAR NETWORK PULSE
  // ============================================================
  window.loadNetworkPulse = function() {
    const container = document.getElementById('networkMetrics');
    if (!container || !window.DbService) return;

    window.DbService.getNetworkPulse()
      .then(data => {
        if (data.metrics && data.metrics.length > 0) {
          renderNetworkMetrics(data.metrics);
        } else {
          renderNetworkMetrics([
            { nombre: 'Carga CPU', porcentaje: 50, tipo: 'cpu' },
            { nombre: 'Uso de Red', porcentaje: 40, tipo: 'network' }
          ]);
        }
      })
      .catch(() => {
        renderNetworkMetrics([
          { nombre: 'Carga CPU', porcentaje: 50, tipo: 'cpu' },
          { nombre: 'Uso de Red', porcentaje: 40, tipo: 'network' }
        ]);
      });
  };

  function renderNetworkMetrics(metrics) {
    const container = document.getElementById('networkMetrics');
    if (!container) return;
    const escape = window.escapeHtml || (s => s);
    
    container.innerHTML = metrics.map(m => {
      const isWifi = m.tipo === 'network' || m.tipo === 'wifi';
      const isSafe = m.porcentaje < 50;
      return `
        <div class="metric-item">
          <div class="metric-icon ${isWifi ? 'wifi' : ''}">
            <i class="fa-solid fa-${isWifi ? 'wifi' : 'heart-pulse'}"></i>
          </div>
          <div class="metric-body">
            <div class="metric-header">
              <span class="metric-name">${escape(m.nombre)}</span>
              <span class="metric-percent ${isSafe ? 'safe' : ''}">${m.porcentaje}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill ${isSafe ? 'safe' : ''}" style="width:0%" data-target="${m.porcentaje}"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => {
      document.querySelectorAll('.metric-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-target') + '%';
      });
    }, 100);
  }

  // ============================================================
  // EVENTOS (Desacoplamiento)
  // ============================================================
  document.addEventListener('actividadGuardada', () => {
    window.loadDashboardData();
    window.loadRecentTickets();
  });

  document.addEventListener('ticketActualizado', () => {
    window.loadDashboardData();
    window.loadRecentTickets();
  });

  // Escuchar tickets nuevos desde otras pestañas (portal_avanzado.html)
  document.addEventListener('nuevoTicketExterno', () => {
    window.loadDashboardData();
    window.loadRecentTickets();
  });
});
