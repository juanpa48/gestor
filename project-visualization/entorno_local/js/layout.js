/* ============================================================ */
/* LAYOUT.JS — Chrome compartido (sidebar + topbar)             */
/* ------------------------------------------------------------ */
/* Inyecta la barra lateral y la barra superior en todas las    */
/* páginas del dashboard, evitando duplicar HTML en cada .html.  */
/*                                                              */
/* Uso en cada página:                                          */
/*   <body data-page="dashboard|recents|solicitudes">           */
/*     <div id="appSidebar"></div>                              */
/*     <main class="main-content">                              */
/*       <div id="appTopbar"></div>                             */
/*       ... contenido propio de la página ...                  */
/*     </main>                                                  */
/*                                                              */
/* Debe cargarse ANTES de notif-center.js y app.js, ya que esos */
/* scripts buscan elementos del topbar (#notifBtn, #searchInput)*/
/* en DOMContentLoaded. layout.js se ejecuta de forma síncrona  */
/* al final del body y rellena los placeholders de inmediato.    */
/* ============================================================ */

(function () {
  'use strict';

  // Definición única del menú de navegación (multi-página)
  const NAV_ITEMS = [
    { page: 'dashboard',   href: 'index.html',       icon: 'fa-border-all',     label: 'Panel Principal' },
    { page: 'recents',     href: 'actividades.html', icon: 'fa-clipboard-list', label: 'Actividades' },
    { page: 'solicitudes', href: 'gestion.html',     icon: 'fa-tasks',          label: 'Gestión' },
  ];

  // Página activa declarada por el <body data-page="...">
  const currentPage = document.body.dataset.page || 'dashboard';

  function buildSidebar() {
    const navLinks = NAV_ITEMS.map((item) => {
      const activeClass = item.page === currentPage ? ' active' : '';
      return (
        '<a class="nav-item' + activeClass + '" href="' + item.href + '" data-section="' + item.page + '">' +
          '<i class="fa-solid ' + item.icon + '"></i>' +
          '<span>' + item.label + '</span>' +
        '</a>'
      );
    }).join('');

    return (
      '<aside class="sidebar">' +
        '<div class="sidebar-logo">' +
          '<img src="img/Logo.png" alt="Logo de Empresa">' +
        '</div>' +
        '<div class="sidebar-section-title">Estado del Sistema</div>' +
        '<nav class="sidebar-nav">' + navLinks + '</nav>' +
      '</aside>'
    );
  }

  function buildTopbar() {
    return (
      '<header class="topbar">' +
        '<div class="search-wrapper">' +
          '<i class="fa-solid fa-magnifying-glass search-icon"></i>' +
          '<input type="text" class="search-input" id="searchInput" placeholder="Buscar..." />' +
        '</div>' +
        '<div class="topbar-actions">' +
          '<button class="icon-btn" title="Configuración"><i class="fa-solid fa-gear"></i></button>' +
          '<div class="notif-wrap">' +
            '<button class="icon-btn notif" title="Notificaciones" id="notifBtn">' +
              '<i class="fa-solid fa-bell"></i>' +
              '<span class="badge hidden" id="notifBadge"></span>' +
            '</button>' +
            '<div class="notif-panel" id="notifPanel" role="region" aria-label="Notificaciones">' +
              '<div class="notif-header">' +
                '<span class="notif-header-title">Notificaciones</span>' +
                '<button class="notif-clear" id="notifClearBtn" type="button">Limpiar</button>' +
              '</div>' +
              '<div class="notif-list" id="notifList"></div>' +
            '</div>' +
          '</div>' +
          '<button class="icon-btn" title="Perfil"><i class="fa-solid fa-user"></i></button>' +
        '</div>' +
      '</header>'
    );
  }

  // Inyectar chrome en los placeholders (si existen en la página)
  const sidebarMount = document.getElementById('appSidebar');
  if (sidebarMount) sidebarMount.outerHTML = buildSidebar();

  const topbarMount = document.getElementById('appTopbar');
  if (topbarMount) topbarMount.outerHTML = buildTopbar();

  // Exponer contexto de página para CSS (buscador) y otros módulos.
  // Mapea la página actual a la "sección" lógica usada por topbar.css.
  document.body.dataset.section = currentPage;
  window.currentSection = currentPage;
})();
