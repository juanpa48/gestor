// ============================================================
// CENTRO DE NOTIFICACIONES (CAMPANA DE LA TOPBAR)
// ------------------------------------------------------------
// Hace funcional el icono de notificaciones del panel superior.
// Escucha los eventos existentes de la app (arquitectura por eventos):
//   - 'actividadGuardada'   -> nuevo ticket creado en este dashboard
//   - 'nuevoTicketExterno'  -> ticket enviado desde el portal (otra pestaña)
// Mantiene un badge con el conteo de notificaciones SIN LEER y un
// panel desplegable con el detalle. El estado se persiste en localStorage.
// ============================================================
(function () {
  'use strict';

  var STORAGE_KEY = 'db_notificaciones';
  var MAX_ITEMS = 30;

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('notifBtn');
    var panel = document.getElementById('notifPanel');
    var badge = document.getElementById('notifBadge');
    var list = document.getElementById('notifList');
    var clearBtn = document.getElementById('notifClearBtn');

    if (!btn || !panel || !badge || !list) return;

    // ---- Persistencia ----
    function load() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function save(items) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    }

    // ---- Render ----
    function render() {
      var items = load();
      var unread = items.filter(function (n) { return !n.leida; }).length;

      // Badge
      if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : String(unread);
        badge.classList.remove('hidden');
      } else {
        badge.textContent = '';
        badge.classList.add('hidden');
      }

      // Lista
      var escape = window.escapeHtml || function (s) { return s; };
      if (items.length === 0) {
        list.innerHTML = '<div class="notif-empty">' +
          '<i class="fa-regular fa-bell-slash"></i>' +
          '<span>Sin notificaciones</span>' +
          '</div>';
        return;
      }

      list.innerHTML = items.map(function (n) {
        return '<div class="notif-item' + (n.leida ? '' : ' unread') + '">' +
          '<div class="notif-item-icon"><i class="fa-solid fa-ticket"></i></div>' +
          '<div class="notif-item-body">' +
            '<div class="notif-item-title">' + escape(n.titulo || 'Nuevo ticket') + '</div>' +
            '<div class="notif-item-text">' + escape(n.texto || '') + '</div>' +
            '<div class="notif-item-time">' + escape(n.fecha || '') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    // ---- Agregar notificación ----
    function add(titulo, texto) {
      var items = load();
      items.unshift({
        id: 'N-' + Date.now(),
        titulo: titulo,
        texto: texto,
        fecha: new Date().toLocaleString(),
        leida: false
      });
      save(items);
      render();
    }

    // ---- Marcar todas como leídas ----
    function markAllRead() {
      var items = load().map(function (n) {
        n.leida = true;
        return n;
      });
      save(items);
      render();
    }

    // ---- Abrir / cerrar panel ----
    function openPanel() {
      panel.classList.add('open');
      markAllRead();
    }

    function closePanel() {
      panel.classList.remove('open');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    // Cerrar al hacer clic fuera del panel
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') &&
          !panel.contains(e.target) &&
          !btn.contains(e.target)) {
        closePanel();
      }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    // Botón limpiar
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        save([]);
        render();
      });
    }

    // ---- Escuchar eventos de la app (tickets nuevos) ----
    // Ticket creado en este dashboard (modal rápido / formulario)
    document.addEventListener('actividadGuardada', function () {
      // Detectar el último ticket guardado para describir la notificación
      if (window.DbService && typeof window.DbService.getActividades === 'function') {
        window.DbService.getActividades().then(function (acts) {
          var ultimo = acts && acts.length ? acts[acts.length - 1] : null;
          if (ultimo) {
            add('Nuevo ticket: ' + (ultimo.id || ''),
                (ultimo.solicitud || ultimo.nombre || 'Solicitud registrada'));
          } else {
            add('Nuevo ticket', 'Se registró una nueva actividad.');
          }
        }).catch(function () {
          add('Nuevo ticket', 'Se registró una nueva actividad.');
        });
      } else {
        add('Nuevo ticket', 'Se registró una nueva actividad.');
      }
    });

    // Ticket enviado desde el portal (otra pestaña)
    document.addEventListener('nuevoTicketExterno', function (e) {
      var t = e.detail || {};
      add('Nueva solicitud: ' + (t.id || ''),
          (t.solicitante || 'Un colaborador') + ' envió una nueva solicitud.');
    });

    // Estado inicial
    render();
  });
})();
