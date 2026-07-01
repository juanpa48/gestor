// ============================================================
// PORTAL — CARGA DE DATOS, HISTORIAL Y ESTADÍSTICAS
// ============================================================
// Responsabilidad: Arranque del portal, sincronización de datos
// de lectura desde localStorage (personal TI, sistemas, historial,
// estadísticas de cabecera) y carga del dropdown de solicitantes.
//
// Depende de: db-service.js (window.DbService)
// Llamado por: DOMContentLoaded (init automático)
// Expone en window: buscarMisTickets, calcularEstadisticas
//   — necesarios por submit.js para actualizar UI post-envío
// ============================================================

// ─── Arranque ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  cargarNombres();
  calcularEstadisticas();
  sincronizarEstadoSistemas();
  sincronizarEstadoPersonal();
  setInterval(sincronizarEstadoSistemas, 10000);
  setInterval(sincronizarEstadoPersonal, 10000);

  // Listener: al cambiar de solicitante, cargar su historial
  const selectNombre = document.getElementById('nombre');
  if (selectNombre) {
    selectNombre.addEventListener('change', function() {
      buscarMisTickets(this.value);
    });
  }
});

// ─── Dropdown de solicitantes ─────────────────────────────────

/**
 * Carga el listado de solicitantes desde db_solicitantes en
 * el select #nombre del formulario del portal.
 */
function cargarNombres() {
  const select = document.getElementById('nombre');
  if (!select) return;

  window.DbService.getSolicitantes()
    .then(list => {
      select.innerHTML = '<option value="" disabled selected>Identifíquese...</option>';
      list.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        select.appendChild(option);
      });
    })
    .catch(() => {
      // Fallback por si DbService falla
      select.innerHTML = '<option value="" disabled selected>Error cargando nombres</option>';
    });
}

// ─── Historial del colaborador ────────────────────────────────

/**
 * Muestra los últimos 5 tickets del solicitante en el panel
 * izquierdo (#historialLista). Llamado al seleccionar nombre
 * y después de cada envío exitoso (desde submit.js).
 * @param {string} nombreSolicitante
 */
function buscarMisTickets(nombreSolicitante) {
  if (!nombreSolicitante) return;

  window.DbService.getActividades()
    .then(acts => {
      const misTickets = acts
        .filter(a => a.nombre === nombreSolicitante || a.solicitante === nombreSolicitante)
        .reverse()
        .slice(0, 5);

      const contenedor = document.getElementById('historialLista');
      if (!contenedor) return;

      if (misTickets.length > 0) {
        contenedor.innerHTML = '<div class="history-list">' + misTickets.map(t => {
          let estadoTxt = t.estado || 'Pendiente';
          if (estadoTxt === 'En progreso') estadoTxt = 'Iniciado'; // Visual para el empleado

          let bqClass = 'pendiente';
          if (estadoTxt === 'Iniciado') bqClass = 'progreso';
          else if (estadoTxt.includes('esuelto') || estadoTxt.includes('errado')) bqClass = 'resuelto';

          const truncar = t.solicitud
            ? (t.solicitud.length > 40 ? t.solicitud.substring(0, 40) + '...' : t.solicitud)
            : 'Sin detalles';

          const asigHTML = t.responsable
            ? `<div style="font-size: 10px; color: #475569; margin-bottom: 6px;"><i class="fa-solid fa-user-check" style="color: #3b82f6;"></i> Asignado a: <strong>${t.responsable}</strong></div>`
            : '';

          return `
            <div class="history-ticket">
              <div class="ht-title">${truncar}</div>
              ${asigHTML}
              <div class="ht-meta">
                <span class="badge ${bqClass}">${estadoTxt}</span>
                <span class="ht-date">${t.id || '--'}</span>
              </div>
            </div>
          `;
        }).join('') + '</div>';
      } else {
        contenedor.innerHTML = '<div class="empty-history">No tiene tickets recientes registrados.</div>';
      }
    });
}

// ─── Estadísticas de cabecera ─────────────────────────────────

/**
 * Actualiza los contadores del header del portal:
 * #statHoy (total), #statUrgentes, #statResueltos.
 * Se llama en el arranque y tras cada envío exitoso.
 */
function calcularEstadisticas() {
  window.DbService.getActividades()
    .then(acts => {
      const urgentes  = acts.filter(a => a.prioridad === 'Urgente' && a.estado !== 'Cerrado' && a.estado !== 'Resuelto').length;
      const resueltos = acts.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;

      const elHoy      = document.getElementById('statHoy');
      const elUrgentes = document.getElementById('statUrgentes');
      const elResueltos = document.getElementById('statResueltos');

      if (elHoy)      elHoy.textContent      = acts.length;
      if (elUrgentes) elUrgentes.textContent  = urgentes;
      if (elResueltos) elResueltos.textContent = resueltos;
    });
}

// ─── Sincronización de personal TI ───────────────────────────

/**
 * Lee db_responsables y db_estado_personal y renderiza las
 * tarjetas de personal en #itStaffContainer.
 * Se ejecuta al cargar y cada 10 segundos.
 */
function sincronizarEstadoPersonal() {
  const container = document.getElementById('itStaffContainer');
  if (!container || !window.DbService) return;

  Promise.all([
    window.DbService.getEstadoPersonal(),
    window.DbService.getResponsables()
  ]).then(([db, responsables]) => {

    if (!Array.isArray(responsables) || responsables.length === 0) {
      responsables = [
        { nombre: 'Alex Henderson', cargo: 'Admin Sistema / Nivel 1',       foto: 'https://i.pravatar.cc/150?u=ti1' },
        { nombre: 'Marcus Vance',   cargo: 'Especialista Infraestructura',   foto: 'https://i.pravatar.cc/150?img=11' }
      ];
    }

    const estadoMap = {
      disponible:    { dot: 'dot-green',       txt: 'text-green',       label: 'Disponible (Oficina)'    },
      en_desarrollo: { dot: 'dot-blue',        txt: 'text-blue',        label: 'Disponible (Home Office)' },
      reunion:       { dot: 'dot-purple',      txt: 'text-purple',      label: 'En Reunión'    },
      atendiendo:    { dot: 'dot-red',         txt: 'text-red',         label: 'Ocupada (Trámite)'    },
      urgente:       { dot: 'dot-red-intense', txt: 'text-red-intense', label: 'Urgencia'       }
    };

    container.innerHTML = responsables.map((resp, i) => {
      const nombre = typeof resp === 'object' ? resp.nombre : resp;
      const cargo  = typeof resp === 'object' ? resp.cargo  : 'Personal TI';
      const foto   = (typeof resp === 'object' && resp.foto) ? resp.foto : 'https://i.pravatar.cc/150?u=' + i;

      const info = db[nombre];
      const st   = estadoMap[info ? info.estado : 'disponible'] || estadoMap.disponible;

      return '<div class="profile-card">' +
               '<div class="status-dot ' + st.dot + '"></div>' +
               '<img src="' + foto + '" alt="' + nombre + '" class="profile-avatar">' +
               '<div class="profile-info">' +
                 '<div class="profile-name">'     + nombre   + '</div>' +
                 '<div class="profile-role">'     + cargo    + '</div>' +
                 '<div class="profile-activity ' + st.txt + '">' + st.label + '</div>' +
               '</div>' +
             '</div>';
    }).join('');
  }).catch(() => { /* Silencioso: no romper el portal si hay error de datos */ });
}

// ─── Sincronización de estado de sistemas ─────────────────────

/**
 * Lee db_sistemas y actualiza los dots de color de los iconos
 * de servidor, contable y red en el header del portal.
 * Se ejecuta al cargar y cada 10 segundos.
 */
function sincronizarEstadoSistemas() {
  if (!window.DbService) return;

  window.DbService.getSistemas().then(infoSys => {
    ['servidor', 'contable', 'red'].forEach(sys => {
    const dot     = document.getElementById('sys_dot_'  + sys);
    const iconDiv = document.getElementById('sys_icon_' + sys);
    const st      = infoSys[sys];

    if (!dot || !iconDiv) return;

    if (st.estado === 'ok') {
      dot.className         = 'sys-dot dot-green';
      iconDiv.style.color   = '#475569';
      iconDiv.style.background = 'rgba(255, 255, 255, 0.6)';
    } else if (st.estado === 'warning') {
      dot.className         = 'sys-dot dot-yellow';
      iconDiv.style.color   = '#f59e0b';
      iconDiv.style.background = 'rgba(245, 158, 11, 0.1)';
    } else if (st.estado === 'error') {
      dot.className         = 'sys-dot dot-red-intense';
      iconDiv.style.color   = '#ef4444';
      iconDiv.style.background = 'rgba(239, 68, 68, 0.1)';
    }
  });
  }).catch(() => {});
}
