// ============================================================
// DASHBOARD CHARTS (Chart.js)
// ============================================================
// Reemplaza a las antiguas sparklines por gráficas funcionales conectadas a DbService

let dashboardCharts = {};

window.drawSparklines = function() {
  if (!window.DbService || typeof Chart === 'undefined') return;

  window.DbService.getActividades().then(function(acts) {
    acts = acts || [];
    
    // 1. Datos: Total Abiertos (Distribución por prioridad)
    let abiertos = acts.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso');
    let pUrgente = abiertos.filter(a => a.prioridad === 'Urgente').length;
    let pAlta = abiertos.filter(a => a.prioridad === 'Alta').length;
    let pMedia = abiertos.filter(a => a.prioridad === 'Media').length;
    let pBaja = abiertos.filter(a => a.prioridad === 'Baja').length;

    // 2. Datos: En Progreso (Distribución por estado global sin Cerrado)
    let ePendiente = acts.filter(a => a.estado === 'Pendiente').length;
    let eProgreso = acts.filter(a => a.estado === 'En progreso').length;
    let eResuelto = acts.filter(a => a.estado === 'Resuelto').length;

    // 3. Datos: Prom. Resolución (Volumen por Área)
    let strArea = (grupo) => (grupo || '').toLowerCase();
    let aArea1 = acts.filter(a => strArea(a.grupo).includes('área 1') || strArea(a.grupo).includes('area 1')).length;
    let aArea2 = acts.filter(a => strArea(a.grupo).includes('área 2') || strArea(a.grupo).includes('area 2')).length;
    let aGeneral = acts.length - aArea1 - aArea2; // El resto

    // 4. Datos: Tareas Urgentes (Urgentes pendientes vs resueltas)
    let urgentes = acts.filter(a => a.prioridad === 'Urgente');
    let uResueltas = urgentes.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    let uPendientes = urgentes.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso').length;

    // Config global recomendada para el dashboard oscuro
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'DM Sans', sans-serif";

    // Chart 1: Total Abiertos (Pastel con leyenda lateral)
    crearGrafico('sparkline1', 'pie', {
      labels: ['Urgente', 'Alta', 'Media', 'Baja'],
      datasets: [{
        data: [pUrgente, pAlta, pMedia, pBaja],
        backgroundColor: ['#e8192c', '#f59e0b', '#3b82f6', '#10b981'],
        borderWidth: 0
      }]
    }, {
      layout: { padding: 0 },
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 10,
            padding: 8,
            font: { size: 10 },
            color: '#cbd5e1'
          }
        }
      }
    });

    // Chart 2: En Progreso (Barras Horizontales - Estados)
    crearGrafico('sparkline2', 'bar', {
      labels: ['Pend.', 'Progr.', 'Res.'],
      datasets: [{
        data: [ePendiente, eProgreso, eResuelto],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    }, {
      indexAxis: 'y',
      layout: { padding: 0 },
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } }
    });

    // Chart 3: Prom. Resolución (Barras Verticales - Áreas)
    crearGrafico('sparkline3', 'bar', {
      labels: ['Área 1', 'Área 2'],
      datasets: [{
        data: [aArea1, aArea2],
        backgroundColor: '#10b981',
        borderRadius: 4
      }]
    }, {
      layout: { padding: 0 },
      plugins: { legend: { display: false } },
      scales: { y: { display: false }, x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } }
    });

    // Chart 4: Urgentes (Dona - Resueltos vs Pendientes)
    crearGrafico('sparkline4', 'doughnut', {
      labels: ['Pendientes', 'Resueltos'],
      datasets: [{
        data: [uPendientes, uResueltas],
        backgroundColor: ['#e8192c', '#10b981'],
        borderWidth: 0
      }]
    }, {
      cutout: '60%',
      layout: { padding: 0 },
      plugins: { legend: { display: false } }
    });
  });
};

function crearGrafico(canvasId, type, data, options) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  if (dashboardCharts[canvasId]) {
    dashboardCharts[canvasId].destroy();
  }
  
  dashboardCharts[canvasId] = new Chart(ctx, {
    type: type,
    data: data,
    options: Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 }
    }, options)
  });
}
