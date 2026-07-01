# 📐 Decisiones de Diseño (ADR) — Gestión Empresarial

> **REGLA:** Antes de "arreglar" algo que parece raro en el código, verifica aquí si fue una decisión intencional.
> Formato: Architecture Decision Record (ADR)
> Última actualización: 2026-05-15

---

## DEC-001: localStorage como base de datos provisional (Frontend App)
- **Estado:** ✅ Vigente
- **Fecha:** Mayo 2026
- **Contexto:** El proyecto ha evolucionado para ser una Web App Frontend tradicional. Se requería una forma de almacenar datos durante el desarrollo sin necesitar un backend configurado.
- **Decisión:** Usar `localStorage` del navegador para todas las operaciones de persistencia. Se utiliza un módulo de servicio de datos (`js/db-service.js`) que encapsula la lectura y escritura.
- **Consecuencias:**
  - ✅ Desarrollo rápido y 100% offline, sin latencia de red.
  - ✅ La interfaz y componentes funcionan de forma idéntica a cómo lo harían con un backend real.
  - ❌ Los datos se pierden si el usuario limpia el navegador.
  - ❌ Los datos solo existen en el navegador local (no compartidos entre máquinas).
- **Migración futura:** Reemplazar el `db-service.js` con llamadas reales `fetch()` a una API REST (Node.js/Express + PostgreSQL). El código está diseñado para que este cambio solo requiera modificar los métodos de servicio.

---

## DEC-002: CSS y JS inline en portal_avanzado.html
- **Estado:** ✅ RESUELTA (Mayo 2026)
- **Fecha:** Marzo 2026 (original) / Mayo 2026 (resolución)
- **Contexto:** El portal de colaboradores se desarrolló como una página independiente con su propio diseño Glassmorphism (tema claro, fondos degradados rosa/azul), diferente al dashboard (tema oscuro).
- **Decisión original:** Mantener todo el CSS (~430 líneas) y JS (~340 líneas) inline dentro de portal_avanzado.html.
- **Resolución (Mayo 2026):**
  - CSS extraído a `css/main.css` + `css/themes/portal-theme.css`.
  - JS 100% modularizado en `js/portal/form-ui.js`, `js/portal/submit.js`, `js/portal/stats.js` + módulos compartidos `db-service.js` y `tramites-data.js`.
  - El portal pasa de 958 líneas a ~204 líneas (solo HTML estructural).

---

## DEC-003: Arrays de trámites duplicados
- **Estado:** ✅ RESUELTA (Mayo 2026)
- **Fecha:** Mayo 2026 (original) / Mayo 2026 (resolución)
- **Contexto:** Tanto el dashboard (`data-manager.js`) como el portal (`portal_avanzado.html`) necesitaban la lista de trámites por área para sus dropdowns.
- **Decisión original:** Duplicar los arrays en ambos archivos.
- **Resolución:** Creado `js/tramites-data.js` como **fuente única de verdad**. Expone `window.tramitesArea1` (17 items) y `window.tramitesArea2` (7 items). Ambos archivos lo cargan como script externo. Para agregar/modificar un trámite: editar **solo** `js/tramites-data.js`.

---

## DEC-007: Conflicto CSS entre reset.css (dashboard) y portal-theme.css (portal)
- **Estado:** ✅ Resuelto (Mayo 2026)
- **Fecha:** Mayo 2026
- **Contexto:** El `reset.css` del dashboard aplica `overflow: hidden` y `display: flex` al `html, body` para implementar el scroll interno de la app (la página completa no hace scroll, sino las secciones internas). Cuando el portal empezó a usar `css/main.css` (que importa `reset.css`), heredó estos estilos y perdió su scroll.
- **Decisión:** Sobreescribir en `body.portal` dentro de `portal-theme.css` los estilos conflictivos:
  - `display: block` (reemplaza el `flex` del dashboard)
  - `overflow-y: auto` (reemplaza el `hidden` del dashboard)
  - `overflow-x: hidden`
  Como `portal-theme.css` se carga después de `main.css`, el selector `body.portal` (más específico que `body`) tiene precedencia.
- **Consecuencias:**
  - ✅ El portal recupera el scroll normal de página
  - ✅ El dashboard no se ve afectado (no tiene clase `.portal`)
  - ✅ Un solo punto de corrección en `portal-theme.css`
- **Regla:** Si en el futuro se agrega otra página que use `css/main.css` y necesite scroll normal, aplicar el mismo patrón de override en su tema CSS específico.

---

## DEC-004: AudioContext en vez de Audio() para notificaciones
- **Estado:** ✅ Vigente (requerido por Chrome)
- **Fecha:** Mayo 2026
- **Contexto:** Chrome bloquea la reproducción automática de audio (`new Audio().play()`) si el usuario no ha interactuado primero con la página. Esto impedía que las notificaciones sonoras funcionaran.
- **Decisión:** Usar `AudioContext` con osciladores para generar tonos programáticos (Do-Mi-Sol). Se solicita permiso de notificación al primer clic del usuario.
- **Ubicación:** `script.js` → `NotificationHelper.playPing()` (líneas 1262-1296)
- **Consecuencias:**
  - ✅ Funciona en Chrome sin restricciones (después del primer clic)
  - ✅ No requiere archivos de audio externos
  - ❌ El sonido es sintético, no un audio grabado
- **NO cambiar a:** `new Audio('archivo.mp3')` — Chrome lo bloqueará.

---

## DEC-005: Prefijos de ID diferentes (TKT vs REQ)
- **Estado:** ✅ Intencional
- **Fecha:** Mayo 2026
- **Contexto:** Los tickets creados desde el dashboard usan `TKT-XXX` y los creados desde el portal usan `REQ-XXX`.
- **Decisión:** Mantener prefijos diferentes para distinguir el origen del ticket.
- **Ubicaciones:**
  - Dashboard → `script.js` línea 57: `'TKT-' + String(acts.length + 1).padStart(3, '0')`
  - Portal → `portal_avanzado.html` línea 884: `'REQ-' + String(acts.length + 1).padStart(3, '0')`
- **Consecuencias:**
  - ✅ Se puede saber de dónde vino cada ticket con solo ver el ID
  - ❌ Puede confundir si no se documenta (ahora ya está documentado aquí)
- **NO unificar** los prefijos sin discutirlo primero.

---

## DEC-006: Evento `storage` para comunicación entre pestañas
- **Estado:** ✅ Vigente
- **Fecha:** Mayo 2026
- **Contexto:** Cuando un colaborador envía un ticket desde el portal (pestaña 1), la administradora necesita recibir una notificación en el dashboard (pestaña 2) sin recargar la página.
- **Decisión:** Usar el evento nativo `window.storage` que se dispara automáticamente cuando otra pestaña modifica `localStorage`. El dashboard escucha cambios en `db_actividades` y compara la longitud del array viejo vs nuevo.
- **Ubicación:** `script.js` → líneas 1300-1326
- **Consecuencias:**
  - ✅ Comunicación en tiempo real entre pestañas sin WebSockets
  - ✅ Cero infraestructura adicional
  - ❌ Solo funciona entre pestañas del mismo navegador/máquina
  - ❌ El evento `storage` NO se dispara en la pestaña que hizo el cambio (solo en las demás)
- **Migración futura:** Cuando se implemente el backend real, reemplazar con WebSockets o Server-Sent Events (SSE).

---

## Plan de Modularización Futuro (script.js)

> **Estado:** 🟢 Planificado, NO ejecutar aún.
> Ejecutar cuando: El proyecto crezca con más funcionalidades o se migre a backend real.
> Última verificación: 2026-05-11 (verificado línea por línea contra script.js 1326 líneas)

### Mapa completo de bloques (cada línea asignada una sola vez):

| Bloque de código | Líneas | Funciones principales |
|---|---|---|
| Mock google.script.run | 1-78 | Objeto `google` con métodos simulados |
| Estado global + Init | 79-103 | Variables globales (`searchTimeout`, `currentSection`), DOMContentLoaded principal |
| Dropdowns + Trámites | 108-211 | `cargarSolicitantes`, `cargarResponsables`, arrays `tramitesArea1/2`, `actualizarTramitesMain/Modal` |
| Navegación | 213-272 | `showSection`, `switchView`, `loadGestion` |
| Dashboard stats | 274-325 | `loadDashboardData`, `setDefaultStats`, `animateValue` |
| Tickets recientes | 327-367 | `loadRecentTickets`, `renderTickets` |
| Network pulse | 369-423 | `loadNetworkPulse`, `renderNetworkMetrics` |
| Guardar actividad + formulario | 425-520 | `guardarMiActividad`, `setBtnLoading`, `resetForm`, `setDefaultDates`, `setHoy` |
| Toast + Búsqueda | 522-591 | `showToast`, `handleSearch`, `showSearchResults`, `removeSearchResults`, `selectSearchResult` |
| Tabla actividades (sección Recents) | 593-747 | `loadActivityTable`, `cargarFiltroResponsables`, `filtrarActividades`, `limpiarFiltrosActividades`, `actualizarEstadisticasRapidas`, `renderActivityTable` |
| Sparklines | 749-804 | `drawSparklines` (Canvas) |
| Utilidades | 806-817 | `escapeHtml` |
| Control estado sistemas | 819-854 | `toggleMensajeControl`, `publicarEstadoSistema` |
| Solicitudes activas (Gestión) | 856-906 | `ESTADOS_INACTIVOS`, `loadSolicitudes` |
| Kanban | 908-959 | `KANBAN_COLS`, `loadKanban` |
| Modal edición ticket | 961-1051 | `abrirModalEdicion`, `setSelectVal`, `cerrarModal`, `guardarEdicionTicket` |
| Widget Mi Estado | 1053-1137 | `ESTADO_LABELS`, `cargarNombresEnWidget`, `setEstadoRapido`, `actualizarPreviewPanel`, `publicarMiEstado`, segundo DOMContentLoaded |
| Registro rápido | 1139-1218 | `abrirModalRegistroRapido`, `cerrarModalRapido`, `guardarRegistroRapido` |
| Notificaciones | 1220-1326 | `NotificationHelper` (init, notify, playPing), listener `storage` |

### Estructura propuesta de módulos:
```
entorno_local/
├── js/
│   ├── app.js             → Estado global + DOMContentLoaded init (L79-103)
│   ├── db-service.js      → Servicio de Base de Datos (L1-78)
│   ├── data-manager.js    → Dropdowns + trámites + guardar actividad + formulario (L108-211, L425-520)
│   ├── navigation.js      → Secciones + vistas tabla/kanban (L213-272)
│   ├── dashboard.js       → Stats + animaciones + tickets recientes + network pulse (L274-423)
│   ├── sparklines.js      → Gráficas Canvas (L749-804)
│   ├── activity-table.js  → Tabla de actividades con filtros (sección Recents) (L593-747)
│   ├── tickets.js         → Solicitudes activas + kanban + modal edición + registro rápido (L856-1218)
│   ├── notifications.js   → NotificationHelper + evento storage (L1220-1326)
│   ├── widgets.js         → Mi Estado + Control sistemas (L819-854, L1053-1137)
│   └── utils.js           → escapeHtml, showToast, búsqueda (L522-591, L806-817)
├── index.html             → Solo estructura HTML, importa los JS modulares
├── portal_avanzado.html   → Mantener independiente (por ahora)
├── styles.css
└── database.html
```

### Orden de carga requerido (por dependencias):
```html
<!-- 1. Utilidades (sin dependencias) -->
<script src="js/utils.js"></script>
<!-- 2. Backend simulado (sin dependencias) -->
<script src="js/db-service.js"></script>
<!-- 3. Módulos de funcionalidad (dependen de utils + mock) -->
<script src="js/data-manager.js"></script>
<script src="js/navigation.js"></script>
<script src="js/dashboard.js"></script>
<script src="js/sparklines.js"></script>
<script src="js/activity-table.js"></script>
<script src="js/tickets.js"></script>
<script src="js/widgets.js"></script>
<script src="js/notifications.js"></script>
<!-- 4. Inicialización (depende de todos los anteriores) -->
<script src="js/app.js"></script>
```

> **Resultado (2026-05-11):** El plan de modularización fue ejecutado con éxito. El archivo `script.js` original de 1326 líneas fue eliminado, y el proyecto ahora se ejecuta basándose en los 11 submódulos mencionados.

## DEC-003: Arquitectura Orientada a Eventos y Limpieza de HTML (Mayo 2026)

**Problema:** El HTML contenía cientos de atributos `onclick`, `onchange` y `oninput`, lo que dificultaba la separación de lógica y el mantenimiento modular. Además, el backend simulaba una API de Google Apps Script (`google.script.run`) que era lenta de procesar para las IAs.

**Decisión:**
1. **Extracción Total:** Eliminar todo rastro de JavaScript inline del archivo `index.html`.
2. **Event Listeners:** Usar `addEventListener` exclusivamente dentro de los archivos JS.
3. **Desacoplamiento vía CustomEvents:** En lugar de llamar funciones de otros archivos directamente (ej: `dashboard.js` llamando a `tickets.js`), los componentes emiten eventos (ej: `actividadGuardada`) que otros escuchan.
4. **API de Promesas:** `DbService` reemplaza la simulación de Apps Script con una interfaz asíncrona estándar (`.then()` / `await`).

**Razón:** Esto convierte al proyecto en una Web App Frontend moderna, permitiendo que las IAs trabajen en un archivo sin romper los demás y siguiendo estándares de la industria.
