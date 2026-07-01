// ============================================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  let currentView = 'tabla'; // 'tabla' o 'kanban'

  window.showSection = function(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Mostrar sección seleccionada
    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');

    const navItem = document.querySelector('[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');

    window.currentSection = section; // Update global state

    // Emitir evento personalizado para desacoplar componentes
    document.dispatchEvent(new CustomEvent('sectionChanged', { detail: { section } }));
  };

  // Vincular eventos a los enlaces de navegación lateral
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const section = e.currentTarget.dataset.section;
      if (section) window.showSection(section);
    });
  });

  // ============================================================
  // TOGGLE VISTA (TABLA / KANBAN)
  // ============================================================
  window.switchView = function(view) {
    currentView = view;

    // Actualizar botones
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Mostrar/ocultar vistas
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

  // Vincular eventos a los botones de toggle de vista
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      if (view) window.switchView(view);
    });
  });

  // ============================================================
  // GESTIÓN UNIFICADA (TABLA + KANBAN)
  // ============================================================
  window.loadGestion = function() {
    if (currentView === 'tabla') {
      if (typeof window.loadSolicitudes === 'function') window.loadSolicitudes();
    } else {
      if (typeof window.loadKanban === 'function') window.loadKanban();
    }
  };

  // Vincular eventos a los controles de la sección Gestión
  const filtroEstado = document.getElementById('filtroEstado');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', window.loadGestion);
  }

  const btnRefreshGestion = document.getElementById('btnRefreshGestion');
  if (btnRefreshGestion) {
    btnRefreshGestion.addEventListener('click', window.loadGestion);
  }
});
