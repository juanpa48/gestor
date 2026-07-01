# 📋 Changelog — Gestión Empresarial

> Este archivo registra los cambios importantes del proyecto.
> Regla: Cada mes se comprime el historial antiguo en un resumen.
> Detalle completo de meses anteriores en: `CHANGELOG_archive.md` (cuando aplique).

---

## Resumen Histórico (Marzo — Abril 2026)

> **Origen:** El proyecto nació como una plantilla de tickets para IT ("IT Command").
> **Migración:** Se adaptó la plantilla para el departamento de Gestión Empresarial.
> **Concepto original:** Plantilla acoplada a Google Apps Script + Google Sheets.
> **Evolución:** Transición a una Web App Frontend tradicional, usando `localStorage` (vía `db-service.js`) para desarrollo independiente sin depender de Google.
> **Archivos creados:** index.html, portal_avanzado.html, script.js, styles.css, database.html, portal.html.

---

## Mayo 2026

### [2026-05-23] — Nueva Documentación Técnica Profesional ✅

- **Archivos:** `docs/ARCHITECTURE.md`, `docs/TECHNICAL_SPECS.md`, `CONTEXT.md`
- **Cambio:**
  - **Arquitectura Detallada:** Generación de `ARCHITECTURE.md` con diagramas Mermaid de flujo de datos, secuencia y mapas de módulos validados contra el código fuente real.
  - **Especificaciones Técnicas:** Creación de `TECHNICAL_SPECS.md` detallando patrones (PubSub, Service Layer), modelo de datos de 16 campos y una auditoría de **8 Riesgos Técnicos** críticos (IDs frágiles, fechas locale-dependientres, etc.).
  - **Auditoría de Código Muerto:** Identificación y documentación de nodos DOM inexistentes en `dashboard.js`.
- **Razón:** Proveer un manual de ingeniería estricto, neutral y granular que facilite el onboarding de humanos e IAs, eliminando el tono corporativo innecesario y enfocándose en la realidad operativa del sistema.

### [2026-05-23] — Limpieza y Refactorización del Dashboard (0 Estilos Inline) ✅

- **Archivos:** `entorno_local/index.html`, `entorno_local/css/components/forms.css`, `entorno_local/css/components/cards.css`, `entorno_local/css/components/widgets.css`, `entorno_local/css/layout/grids.css`
- **Cambio:**
  - **Remoción de Estilos Inline:** Se eliminaron los 11 estilos inline (`style="..."`) de `index.html`.
  - **CSS Centralizado:** Se crearon y asignaron clases en los archivos CSS correspondientes:
    - `forms.css`: Agregada regla `position: relative;` a `.form-card`, estilo del icono en `.btn-rapido i` y en `.kanban-title-large i`, y la nueva clase de dropdown `.header-select`.
    - `cards.css`: Agregada regla `.panel-card .form-select` para homogeneizar la tipografía (13px) en dropdowns laterales.
    - `widgets.css`: Configurado el selector `#grupo_mensaje` para estar oculto (`display: none;`) por defecto.
    - `grids.css`: Creada la clase utilitaria `.header-actions` (flexbox con gap de 8px) y configurado `#gestionKanban` para estar oculto por defecto.
- **Razón:** Completar el desacoplamiento del CSS en el Dashboard administrativo, logrando una consistencia absoluta de desarrollo profesional y de alta calidad en todo el proyecto.

### [2026-05-23] — Limpieza y Refactorización Final del Portal (0 Eventos y 0 Estilos Inline) ✅

- **Archivos:** `entorno_local/portal_avanzado.html`, `entorno_local/js/portal/form-ui.js`, `entorno_local/js/portal/stats.js`, `entorno_local/js/portal/submit.js`, `entorno_local/css/themes/portal-theme.css`
- **Cambio:**
  - **Fase 1 (Eventos JS):** Se removieron los 11 eventos inline (`onclick`, `onchange`) de `portal_avanzado.html`. Se implementó el registro de escuchadores de eventos mediante `addEventListener` en bloques `DOMContentLoaded` en los módulos `form-ui.js` (para selects del formulario, botones de prioridad y cards de estado de sistemas), `stats.js` (para el selector del Solicitante), y `submit.js` (para el botón de envío).
  - **Fase 2 (Estilos CSS):** Se removieron los 16 estilos inline (`style="..."`) de `portal_avanzado.html`. Se crearon clases de CSS específicas en `portal-theme.css` (como `.stat-icon.danger`/`.success`, `.stat-card-sistemas`, `.sistemas-row`, `.glass-panel.aside-panel`, `.panel-title-form`, `.alerta-presencial`, `.required-star`, `.ruta-input`, `.check-pdf-group`, y `.pdf-highlight`).
  - **Estado Inicial:** El estado inicial de ocultamiento de campos condicionales se configuró mediante reglas `display: none` en `portal-theme.css`, permitiendo que JS los manipule de forma nativa sin generar conflictos.
- **Razón:** Consolidar una arquitectura frontend profesional 100% libre de lógica y estilos embebidos en el HTML, mejorando la mantenibilidad, escalabilidad y legibilidad de cara a futuros desarrollos.

### [2026-05-15] — Migración Final a Arquitectura de Eventos JS ✅

- **Archivos:** `entorno_local/js/tickets.js`, `entorno_local/js/activity-table.js`, `entorno_local/js/dashboard.js`
- **Cambio:** Se eliminó el "Hard Coupling" (acoplamiento fuerte) entre módulos. Antes, `tickets.js` llamaba directamente a `window.loadGestion()` o `window.loadActivityTable()`.
- **Nuevo Comportamiento:** `tickets.js` ahora solo emite `CustomEvent` (`ticketActualizado` y `actividadGuardada`). `activity-table.js` y `dashboard.js` tienen listeners independientes para escuchar estos eventos y recargarse automáticamente.
- **Bugfix:** Se eliminó por segunda vez la duplicidad manual de los arrays `tramitesArea1/2` que habían reaparecido dentro de `tickets.js`. Ahora lee estrictamente de `window.tramitesArea1` (centralizado en `tramites-data.js`).

### [2026-05-15] — Bugfix: scroll y badges del portal (DEC-007)

- **Archivos:** `entorno_local/css/themes/portal-theme.css`
- **Problema 1 — Sin scroll:** `reset.css` (del dashboard) aplica `overflow:hidden` y `display:flex` al `body` global. Al compartir `css/main.css`, el portal heredaba estos estilos y perdía el scroll de página.
- **Solución 1:** Añadidos `display:block`, `overflow-y:auto`, `overflow-x:hidden` al selector `body.portal` en `portal-theme.css`. Al cargarse después de `main.css` y ser más específico, tiene precedencia sin afectar el dashboard.
- **Problema 2 — Badges del historial malformados:** `.badge` en `widgets.css` es un indicador circular de notificación (16×16px, `position:absolute`). El portal lo usaba como etiqueta de texto de estado.
- **Solución 2:** Añadido `.portal .badge` con `position:static`, `width/height:auto` y colores de estado (rojo/azul/verde). El selector más específico sobreescribe el circular del dashboard.
- **Documentado en:** `docs/DECISIONS.md` como DEC-007.

### [2026-05-15] — Fase 4: Purga total del JS inline del portal ✅

- **Archivos:** `entorno_local/js/portal/stats.js` (NUEVO), `entorno_local/portal_avanzado.html`
- **Cambio:**
  - Creado `js/portal/stats.js` con: `cargarNombres` (ahora usa `DbService.getSolicitantes()`), `buscarMisTickets` (usa `DbService.getActividades()`), `calcularEstadisticas` (usa `DbService.getActividades()`), `sincronizarEstadoPersonal`, `sincronizarEstadoSistemas` y el `DOMContentLoaded` de arranque.
  - **Eliminado completamente el bloque `<script>` inline de `portal_avanzado.html`.**
  - El portal ahora carga 5 módulos JS externos: `db-service.js`, `tramites-data.js`, `js/portal/form-ui.js`, `js/portal/submit.js`, `js/portal/stats.js`.
- **Razón:** Completar la Fase 4 y resolver la deuda técnica DEC-002. El portal pasa de ~360 líneas inline a 0 líneas inline.

### [2026-05-15] — Fase 3: Módulo de envío de solicitudes (submit.js)

- **Archivos:** `entorno_local/js/portal/submit.js` (NUEVO), `entorno_local/portal_avanzado.html`
- **Cambio:**
  - Creado `js/portal/submit.js` con la función `enviarTicket()` completamente refactorizada.
  - La función ahora usa `window.DbService.getActividades()` y `window.DbService.saveActividades()` (promesas) en lugar de acceso directo a `localStorage`.
  - Añadido manejo de error (`catch`) que antes no existía: muestra toast de error y restaura el botón si falla el guardado.
  - `portal_avanzado.html` ahora carga `js/portal/submit.js` como script externo.
- **Razón:** Desacoplar la lógica de persistencia del HTML inline y adoptar el estándar de promesas de `DbService`, preparando el camino para la migración a un backend real.

### [2026-05-15] — Fase 2: Módulo de UI reactiva del portal (form-ui.js)

- **Archivos:** `entorno_local/js/portal/form-ui.js` (NUEVO), `entorno_local/portal_avanzado.html`
- **Cambio:**
  - Creado `js/portal/form-ui.js` con las 4 funciones de interacción visual del formulario: `setPriority`, `actualizarTramites`, `verificarPresencialidad`, `verInfoSistema`.
  - Eliminadas esas 4 funciones del bloque `<script>` inline de `portal_avanzado.html`.
  - `portal_avanzado.html` ahora carga `js/portal/form-ui.js` como script externo.
- **Razón:** Separar la capa de UI pura del resto de la lógica. Los handlers inline (`onclick`, `onchange`) siguen funcionando porque las funciones son globales de `window`.

### [2026-05-15] — Fase 1: Fuente única de verdad para catálogo de trámites

- **Archivos:** `entorno_local/js/tramites-data.js` (NUEVO), `entorno_local/js/data-manager.js`, `entorno_local/portal_avanzado.html`, `entorno_local/index.html`
- **Cambio:**
  - Creado `js/tramites-data.js` como único repositorio de los arrays `tramitesArea1` (17 items) y `tramitesArea2` (7 items), exponiéndolos como `window.tramitesArea1` y `window.tramitesArea2`.
  - Eliminados los arrays duplicados de `data-manager.js` y `portal_avanzado.html`.
  - `portal_avanzado.html` ahora carga `js/db-service.js` y `js/tramites-data.js` como scripts externos.
  - `index.html` ahora incluye `js/tramites-data.js` en el orden de carga correcto (después de `db-service.js`, antes de `data-manager.js`).
- **Razón:** Eliminar la deuda técnica DEC-003 (arrays duplicados). Si se agrega/modifica un trámite, ahora solo hay que editar `tramites-data.js`.


- **Archivos:** `index.html`, `portal_avanzado.html`, `styles.css` (eliminado), `css/` (nueva estructura), `agent.md`, `CONTEXT.md`
- **Cambio:** 
  - Se eliminó el monolito `styles.css` (1582 líneas) y el CSS inline de `portal_avanzado.html` (~430 líneas).
  - Se adoptó una arquitectura por componentes (`base`, `layout`, `components`, `themes`) consolidados en `css/main.css`.
  - Se incorporó la regla de arquitectura "AI-Friendly" en `agent.md` instruyendo el uso de trackers descartables y pasos al 70% de límite para prevenir caídas de token.
- **Razón:** Pagar deuda técnica de escalabilidad UI y optimizar radicalmente la manera en que la IA asiste al proyecto, garantizando micro-commits exitosos.

### [2026-05-04] — Análisis y documentación del proyecto

- **Archivos:** `agent.md`, `resumen.txt`
- **Cambio:** Se definieron los 4 roles de agente (Arquitecto, Backend, Frontend, QA) y se documentó el resumen del proyecto con las dos áreas de trámites.
- **Razón:** Dar contexto a los asistentes de IA para mantener continuidad entre sesiones.

### [2026-05-05] — Sistema de notificaciones en tiempo real

- **Archivos:** `entorno_local/script.js` (líneas 1220-1326)
- **Cambio:** Se implementó `NotificationHelper` con:
  - Notificaciones nativas del navegador (`Notification API` con `requireInteraction: true`)
  - Audio de alerta con `AudioContext` (3 tonos: Do, Mi, Sol)
  - Escucha de eventos `storage` entre pestañas (portal → dashboard)
- **Razón:** El equipo administrativo necesitaba alertas inmediatas cuando un colaborador enviaba una nueva solicitud desde el portal.

### [2026-05-05] — Eliminación del campo "Observaciones"

- **Archivos:** `entorno_local/index.html`
- **Cambio:** Se removió el campo de texto "Observaciones" del formulario de registro de actividades.
- **Razón:** Campo innecesario que complicaba la interfaz. Los detalles ya se capturan en "Solicitud del usuario".

### [2026-05-06] — Reorganización de estructura del proyecto

- **Archivos:** Todos (movidos de subcarpeta a raíz)
- **Cambio:** Los archivos principales (`package.json`, `server.js`, `agent.md`, `resumen.txt`) se movieron a la raíz del repositorio. La carpeta `entorno_local/` se mantuvo para los archivos del frontend.
- **Razón:** Simplificar la estructura para que el servidor Node.js y los archivos de configuración estén accesibles directamente.

### [2026-05-06] — Servidor local con Express

- **Archivos:** `server.js`, `package.json`
- **Cambio:** Se creó un servidor Express básico para servir los archivos estáticos del entorno local.
- **Razón:** Permitir previsualización local sin depender de extensiones del editor.

### [2026-05-07] — Sincronización con GitHub

- **Archivos:** Todos
- **Cambio:** Push forzado a rama `v0/juanpabloalvarezporras99-4182-5b76be91` para sincronizar con el estado actual del proyecto local.
- **Razón:** La rama remota tenía una estructura diferente (carpeta "Gestion empresarial 1.2") que no correspondía al proyecto actual.

### [2026-05-07] — Mejoras profesionales al proyecto

- **Archivos:** `CHANGELOG.md`, `docs/DEPENDENCIES.md`, `docs/DECISIONS.md`, `agent.md`
- **Cambio:** Se creó documentación profesional para mantener continuidad entre sesiones de IA y entre diferentes modelos/editores.
- **Razón:** Establecer mejores prácticas de desarrollo con IA (Context as Code).

### [2026-05-11] — Modularización completa de script.js

- **Archivos:** `entorno_local/script.js` (eliminado), `entorno_local/js/*.js` (creados), `entorno_local/index.html`
- **Cambio:** Se descompuso el monolítico `script.js` (1326 líneas) en módulos especializados (`db-service.js`, `utils.js`, `data-manager.js`, `navigation.js`, `dashboard.js`, `activity-table.js`, `sparklines.js`, `tickets.js`, `widgets.js`, `notifications.js`, `app.js`).
- **Razón:** Reducir la deuda técnica, facilitar la mantenibilidad y optimizar el contexto para futuras sesiones de IA al aislar responsabilidades.

### [2026-05-12] — Refactorización Profesional de la Web App

- **Archivos:** `index.html`, `js/db-service.js`, `js/*.js`
- **Cambio:**
  - Se eliminó toda la lógica inline (`onclick`, `onchange`, etc.) de `index.html`.
  - `mock-backend.js` pasó a ser `db-service.js`, eliminando el patrón de Apps Script en favor de Promesas nativas.
  - Se implementó una arquitectura orientada a eventos (`CustomEvents`) para desacoplar módulos.
- **Razón:** Eliminar la dependencia conceptual de Google Apps Script y adoptar estándares modernos de desarrollo web que faciliten el trabajo colaborativo con IA.

### [2026-05-12] — Finalización Fase 3: activity-table.js y tickets.js

- **Archivos:** `js/activity-table.js`, `js/tickets.js`
- **Cambio:**
  - `activity-table.js`: Envuelto en `DOMContentLoaded`, reemplazado `google.script.run` por `window.DbService`, agregados listeners a filtros y botones.
  - `tickets.js`: Envuelto en `DOMContentLoaded`, reemplazado `google.script.run` por `window.DbService`, eliminados `onclick` inline usando delegacion de eventos con `data-ticket-id`.
  - Ambos modulos ahora emiten y escuchan `CustomEvents` (`actividadGuardada`, `ticketActualizado`).
- **Razón:** Completar la Fase 3 de la refactorizacion, eliminando toda dependencia de Google Apps Script y eventos inline.

### [2026-05-13] — Fase 4: Verificacion y Walkthrough

- **Archivos:** `REFACTOR_PROGRESS.md`
- **Cambio:**
  - Verificado que `index.html` tiene 0 eventos inline (`onclick`, `onchange`, `oninput`).
  - Verificado que ningun modulo en `js/` usa `google.script.run`.
  - Verificado que 8 de 11 modulos usan `DOMContentLoaded` (los otros 3 son utilitarios puros).
  - Verificado que `drawSparklines` y `NotificationHelper` se llaman correctamente desde `app.js`.
- **Razón:** Validar que la refactorizacion esta completa y el codigo sigue los estandares modernos.

### [2026-05-13] — Correccion sincronizacion entre pestanas

- **Archivos:** `js/notifications.js`, `js/dashboard.js`, `js/activity-table.js`, `js/tickets.js`
- **Cambio:**
  - Corregido el listener de `storage` en `notifications.js` para emitir evento `nuevoTicketExterno` en vez de llamar funciones directamente.
  - Agregado listener `nuevoTicketExterno` en `dashboard.js`, `activity-table.js` y `tickets.js` para refrescar datos cuando llegan tickets desde `portal_avanzado.html`.
  - Agregada funcion `actualizarTramitesModal()` faltante en `tickets.js`.
- **Razón:** La sincronizacion entre pestanas (portal → dashboard) no funcionaba porque las funciones se llamaban sin `window.` y `currentSection` no estaba definida en el scope.

### [2026-05-13] — Eliminacion de portal.html obsoleto

- **Archivos:** `entorno_local/portal.html` (eliminado)
- **Cambio:** Se elimino el archivo `portal.html` que era una version simplificada y obsoleta del portal de solicitudes.
- **Razón:** El `portal_avanzado.html` ya contiene toda la funcionalidad necesaria (historial, estadisticas, estado de personal, areas de tramite). Mantener dos portales causaba confusion y duplicacion de codigo.

### [2026-05-13] — Corrección métodos faltantes en db-service.js

- **Archivos:** `entorno_local/js/db-service.js`
- **Cambio:** Se agregaron los métodos `getActividades()` y `saveActividades(acts)` que faltaban en el servicio de base de datos.
- **Razón:** Durante la refactorización, `activity-table.js` (3 llamadas) y `tickets.js` (5 + 1 save) fueron migrados para usar `window.DbService.getActividades()` y `window.DbService.saveActividades()`, pero estos métodos nunca se crearon en `db-service.js`. Esto causaba que las secciones de Actividades y Gestión de Tickets se quedaran en estado "Cargando..." indefinidamente.

### [2026-05-13] — Corrección switchView/loadGestion usando IDs de wrapper correctos

- **Archivos:** `entorno_local/js/tickets.js`
- **Cambio:** `switchView` y `loadGestion` ahora alternan visibilidad de los wrappers (`gestionTabla`/`gestionKanban`) en vez de los elementos internos (`solicitudesTable`/`kanbanBoard`).
- **Razón:** El HTML tiene estructura `gestionTabla > solicitudesTable` y `gestionKanban > kanbanBoard`. Al ocultar el elemento interno, el wrapper padre seguía en `display:none` y el contenido nunca se mostraba.

### [2026-05-13] — Reparación de Kanban y limpieza de selectores

- **Archivos:** `entorno_local/index.html`, `entorno_local/js/tickets.js`
- **Cambio:** Se restauró la etiqueta select de `filtroEstado` y se limpiaron atributos malformados en `index.html`. En `tickets.js`, se eliminaron funciones duplicadas (`switchView`, `loadGestion`) y listeners de control redundantes.
- **Razón:** Tras la última refactorización exhaustiva, la vista de Kanban dejó de funcionar debido a una etiqueta olvidada en el DOM y colisión de responsabilidades con `navigation.js`. Se devolvió el control de navegación 100% a donde pertenece.
