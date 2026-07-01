# 🔗 Mapa de Dependencias — Gestión Empresarial

> **REGLA:** Antes de modificar cualquier archivo, consulta este mapa para saber qué otros archivos se verán afectados.
> Última actualización: 2026-06-29

---

## Flujo de Datos Principal

```
Colaborador                    Administradora TI
     │                                │
     ▼                                ▼
portal_avanzado.html           index.html (Dashboard)
     │                                │
     │ [escribe nuevo ticket]         │ [lee tickets, edita estado]
     │ [formato REQ-XXX]             │ [formato TKT-XXX]
     ▼                                ▼
 ┌──────────────────────────────────────┐
 │          localStorage                │
 │  ┌─────────────────────────────┐     │
 │  │ db_actividades (tickets)    │     │
 │  │ db_solicitantes (nombres)   │     │
 │  │ db_responsables (personal)  │     │
 │  │ db_estado_personal (estado) │     │
 │  │ db_sistemas (alertas)       │     │
 │  │ db_mi_seleccion (sesión)    │     │
 │  └─────────────────────────────┘     │
 └──────────────────────────────────────┘
                    ▲
                    │
            database.html
            (CRUD directo)
```

---

## Archivos y sus Conexiones

### 📄 portal_avanzado.html (PORTAL PÚBLICO — para colaboradores)
- **Propósito:** Formulario donde los colaboradores envían solicitudes de trámites
- **CSS:** ✅ Externo — `css/main.css` + `css/themes/portal-theme.css` (Glassmorphism claro). `portal-theme.css` sobreescribe el `reset.css` del dashboard para habilitar scroll.
- **JS:** ✅ **100% Modularizado** (0 líneas inline). Carga 5 módulos:
  - `js/db-service.js` (compartido con dashboard)
  - `js/tramites-data.js` (compartido con dashboard)
  - `js/portal/form-ui.js` → UI reactiva del formulario
  - `js/portal/submit.js` → Lógica de envío (usa `DbService` con promesas)
  - `js/portal/stats.js` → Arranque, historial, estadísticas, sincronización
- **Escribe en localStorage:**
  - `db_actividades` → Agrega nuevos tickets con prefijo **REQ-XXX** (vía `DbService`)
- **Lee de localStorage (vía `DbService`):**
  - `db_solicitantes` → Dropdown "Identifíquese"
  - `db_actividades` → Historial personal del colaborador (panel izquierdo)
  - `db_estado_personal` → Tarjetas de estado del personal TI (panel derecho)
  - `db_sistemas` → Indicadores de estado de sistemas (servidor, contable, red)
- **✅ DEC-003 resuelta:** Ya no tiene arrays duplicados. Usa `window.tramitesArea1/2` de `tramites-data.js`.

---

### 📄 DASHBOARD ADMINISTRATIVO (multi-página — para gestoras TI)

> **DEC-008 (Junio 2026):** El dashboard dejó de ser una SPA de un solo `index.html` con secciones ocultas. Ahora son **3 páginas HTML independientes** que comparten el chrome (sidebar + topbar) inyectado por `js/layout.js`. La navegación es por enlaces `<a href>` reales. El ítem de menú activo se determina por `<body data-page="...">`.

#### 📄 index.html → Panel Principal
- **Propósito:** Formulario de "Registrar Actividad", widgets y registro rápido.
- **`<body data-page="dashboard">`**
- **Contiene:** Formulario de registro, widgets (Mi Estado, Control Estado Sistemas), modal Registro Rápido.
- **Scripts:** `utils`, `db-service`, `tramites-data`, `data-manager`, `dashboard`, `sparklines`, `tickets`, `widgets`, `notifications`, `layout`, `notif-center`, `app`.
- **IDs críticos:** estadísticas (`statTotalOpen`, `statInProgress`, `statAvgResolve`), formulario (`solicitante`, `responsable`, `solicitud`, `estado`, `prioridad`, `grupo`, `clasificacion`), canvas (`sparkline1`–`sparkline4`), modal rápido (`modalRapidoOverlay`).

#### 📄 actividades.html → Actividades
- **Propósito:** Tabla de actividades con filtros y estadísticas rápidas.
- **`<body data-page="actividades">`**
- **Scripts:** `utils`, `db-service`, `tramites-data`, `data-manager`, `activity-table`, `notifications`, `layout`, `notif-center`, `init-actividades`.
- **IDs críticos:** `activityTable`, filtros (`filtroEstadoAct`, `filtroPrioridadAct`, `filtroResponsableAct`, `filtroGrupoAct`, `filtroPeriodoAct`), quick-stats (`qsTotal`, `qsPendientes`, `qsProgreso`, `qsResueltos`, `qsUrgentes`).

#### 📄 gestion.html → Gestión
- **Propósito:** Gestión de tickets con vista Tabla/Kanban y modal de edición.
- **`<body data-page="gestion">`**
- **Scripts:** `utils`, `db-service`, `tramites-data`, `data-manager`, `tickets`, `notifications`, `layout`, `notif-center`, `init-gestion`.
- **IDs críticos:** `gestionTabla`, `solicitudesTable`, `gestionKanban`, `kanbanBoard`, toggle `[data-view="tabla|kanban"]`, modal (`modalOverlay`, `m_estado`, `m_responsable`, `m_prioridad`, `m_grupo`, `m_clasificacion`).
- **Común a las 3:** sin eventos inline (`onclick`, etc). El sidebar y la topbar NO están en el HTML: los inyecta `layout.js` en los placeholders `#appSidebar` y `#appTopbar`.

---

### 📄 Módulos JS (`entorno_local/js/*.js`)
- **Propósito:** Toda la lógica de negocio del dashboard dividida por responsabilidades.
- **Comunicación:** Arquitectura orientada a **Eventos (`CustomEvent`)**. Los módulos se comunican disparando y escuchando eventos (ej: `actividadGuardada`, `sectionChanged`) para evitar dependencias directas.
- **Controlan:** `index.html` (vínculo mediante IDs y Event Listeners).
- **NO controlan:** `portal_avanzado.html` (tiene su propio JS).
- **Lee/Escribe en localStorage:**
  - `db_actividades` → CRUD completo de tickets
  - `db_solicitantes` → Carga dropdown
  - `db_responsables` → Carga dropdown, widget Mi Estado
  - `db_estado_personal` → Publicar estado personal
  - `db_sistemas` → Publicar alertas de sistemas
  - `db_mi_seleccion` → Persistir selección del widget
- **Módulos:**
  - `app.js`: Estado global e inicialización del Panel Principal (`DOMContentLoaded`). **Solo lo carga `index.html`.**
  - `layout.js`: **(NUEVO, DEC-008)** Inyecta el chrome compartido (sidebar + topbar + centro de notificaciones) en las 3 páginas. Marca el menú activo según `<body data-page>`. **Cargado por las 3 páginas.**
  - `init-actividades.js`: **(NUEVO)** Init mínimo de `actividades.html` (arranca tabla + notificaciones).
  - `init-gestion.js`: **(NUEVO)** Init mínimo de `gestion.html`. Replica el toggle Tabla/Kanban, `window.loadGestion`, filtro y refresh (lógica que antes vivía en `navigation.js`).
  - `notif-center.js`: Centro de notificaciones (badge + panel desplegable). Escucha `actividadGuardada` y `nuevoTicketExterno`. **Cargado por las 3 páginas.**
  - `db-service.js`: Servicio de Base de Datos temporal (envuelve localStorage).
  - `utils.js`: Funciones auxiliares (`escapeHtml`, Toast, Búsqueda global).
  - `data-manager.js`: Carga de catálogos y guardado de formulario.
  - `dashboard.js`: Stats, animaciones de números y tickets recientes. (Solo `index.html`.)
  - `activity-table.js`: Tabla principal de Actividades con sistema de filtros. (Solo `actividades.html`.)
  - `sparklines.js`: Gráficos interactivos de Chart.js conectados a DbService. (Solo `index.html`.)
  - `tickets.js`: Solicitudes activas, Kanban, Edición de tickets y Registro Rápido. (`gestion.html` + el registro rápido de `index.html`.)
  - `widgets.js`: Mi Estado y alertas de sistema. (Solo `index.html`.)
  - `notifications.js`: API de notificaciones y audios, comunicación inter-pestañas (`storage`).
  - ~~`navigation.js`~~: **ELIMINADO (DEC-008)** — era el motor de la SPA. Su lógica de toggle/`loadGestion` vive ahora en `init-gestion.js`.
- **Módulos exclusivos del portal** (`js/portal/`):
  - `form-ui.js`: `setPriority`, `actualizarTramites`, `verificarPresencialidad`, `verInfoSistema`.
  - `submit.js`: `enviarTicket` con `DbService` + manejo de error.
  - `stats.js`: Init del portal, `cargarNombres`, `buscarMisTickets`, `calcularEstadisticas`, `sincronizarEstadoPersonal/Sistemas`.
- **Módulo compartido:** `js/tramites-data.js` expone `window.tramitesArea1/2` — usado por `data-manager.js` (dashboard) y `js/portal/form-ui.js` (portal). **DEC-003 resuelta.**

---

### 📄 CSS Modular (`css/`)
- **Archivo de entrada:** `css/main.css` (importa todos los demás via `@import`)
- **Usado por:** `index.html` (dashboard) Y `portal_avanzado.html` (portal)
- **Estructura:**
  - `css/base/variables.css` → Tokens de color, tipografía, espaciado
  - `css/base/reset.css` → Reset global. **⚠️ Aplica `overflow:hidden` al `body`** (necesario para el dashboard con scroll interno). `portal-theme.css` lo sobreescribe para el portal.
  - `css/layout/` → Sidebar, topbar, grids del dashboard
  - `css/components/` → Cards, forms, buttons, widgets (badges del dashboard)
  - `css/themes/portal-theme.css` → Estilos Glassmorphism del portal. Sobreescribe `reset.css` con `overflow-y:auto` y redefine `.portal .badge` para los estados del historial.
- **Diseño dashboard:** Dark mode, Glassmorphism oscuro, DM Sans + Space Grotesk
- **Diseño portal:** Glassmorphism claro, degradado rosa/azul, DM Sans
- **Dependencias externas:** Google Fonts, Font Awesome 6.4.0

---

### 📄 database.html (ADMINISTRADOR DE DATOS — herramienta interna)
- **Propósito:** Interfaz para ver y editar directamente los datos en localStorage
- **CSS:** ✅ Inline (independiente)
- **JS:** ✅ Inline (independiente)
- **100% independiente:** No depende de ningún otro archivo del proyecto
- **Lee/Escribe en localStorage:**
  - `db_actividades` → Vista tipo hoja de cálculo (16 columnas: A-P)
  - `db_solicitantes` → CRUD (agregar/eliminar nombres)
  - `db_responsables` → CRUD (agregar con nombre, cargo, foto)

---

### 📄 portal.html (PORTAL SIMPLE — en desuso)
- **Propósito:** Versión anterior del portal de solicitudes
- **Estado:** Posiblemente en desuso desde la creación de portal_avanzado.html
- **Verificar:** Si ya no se usa, considerar eliminarlo

---

### 📄 server.js (SERVIDOR LOCAL)
- **Propósito:** Servidor estático para desarrollo local
- **Sirve:** Carpeta `entorno_local/`
- **Puerto:** 3000
- **Dependencias:** `http-server` (NO Express) — ver `package.json`. Comando: `npm run dev`.

---

## ⚠️ Puntos Críticos de Sincronización

| Dato | Ubicación | Riesgo |
|---|---|---|
| `tramitesArea1` / `tramitesArea2` | ✅ **Resuelto** — fuente única en `js/tramites-data.js` | **ELIMINADO** — solo hay que editar un archivo |
| Formato de ID de tickets | Dashboard → `TKT-XXX` (db-service.js) / Portal → `REQ-XXX` (submit.js) | **MEDIO** — Intencional (DEC-005). No unificar. |
| Lógica de estados | Dashboard: completa (todos los estados) / Portal: simplificada (solo "Pendiente" al crear) | **BAJO** — El portal solo crea tickets nuevos |
| Estilos de `.badge` | Dashboard: circular de notificación (widgets.css) / Portal: etiqueta de estado (portal-theme.css) | **BAJO** — Resuelto con `.portal .badge` selector más específico |
