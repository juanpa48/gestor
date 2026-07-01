# Especificaciones Técnicas

Este documento desglosa la implementación actual del proyecto desde una perspectiva operativa: módulos, patrones, flujo de datos, acoplamiento, convenciones, escalabilidad y riesgos.

## 1. Stack Actual

- Frontend: HTML, CSS modular, JavaScript vanilla
- Servidor local: Node.js + `http-server`
- Persistencia actual: `localStorage`
- Comunicación entre pestañas: evento nativo `storage`
- Notificaciones: Notification API + `AudioContext`
- Visualización ligera: Canvas para sparklines

## 2. Patrones de Diseño Identificados

### Service Layer / Facade

`window.DbService` centraliza el acceso a datos y evita que la UI dependa directamente del mecanismo de persistencia. Todos sus métodos son `async` y retornan promesas, aunque internamente usan `setTimeout` para simular latencia de red (300ms por defecto, 800ms para guardado).

### Observer / Pub-Sub

El dashboard usa `CustomEvent` para desacoplar módulos. Un módulo emite un evento y otros reaccionan sin conocerse entre sí.

Eventos activos:

| Evento | Emisor | Receptores |
|---|---|---|
| `actividadGuardada` | `data-manager.js` | `dashboard.js`, `activity-table.js`, `tickets.js` |
| `ticketActualizado` | `tickets.js` | `dashboard.js`, `activity-table.js` |
| `sectionChanged` | `navigation.js` | `tickets.js` (para cargar gestión) |
| `nuevoTicketExterno` | `notifications.js` | `dashboard.js`, `activity-table.js`, `tickets.js` |
| `ticketSeleccionado` | `utils.js` (búsqueda) | `tickets.js` |

### Single Source of Truth

`tramites-data.js` concentra el catálogo de trámites y evita duplicidad entre portal y dashboard.

### Progressive Migration Pattern

La interfaz de `DbService` basada en promesas prepara una migración futura a API real sin reescribir toda la UI.

## 3. Estructura Modular

### Raíz

- `CONTEXT.md`: secuencia de lectura para IAs
- `agent.md`: reglas técnicas y de trabajo
- `resumen.txt`: contexto de negocio
- `CHANGELOG.md`: historial de cambios
- `PROGRESS.md`: tracker temporal de objetivos activos
- `server.js`: servidor local

### `docs/`

- documentación técnica, dependencias, decisiones y arquitectura

### `entorno_local/`

- aplicación ejecutable en navegador

### `entorno_local/js/`

- lógica del dashboard (12 archivos)
- servicios compartidos (`db-service.js`, `tramites-data.js`)

### `entorno_local/js/portal/`

- lógica exclusiva del portal (3 archivos)

### `entorno_local/css/`

- sistema visual por capas: base, layout, components, themes

## 4. Convenciones Técnicas

### Nombres de almacenamiento

Las claves persistidas siguen el prefijo `db_`:
`db_actividades`, `db_solicitantes`, `db_responsables`, `db_estado_personal`, `db_sistemas`, `db_mi_seleccion`.

### Prefijos de tickets

- `TKT-XXX`: creados desde dashboard (`db-service.js` línea 63)
- `REQ-XXX`: creados desde portal (`submit.js` línea 57)

Esto comunica origen, pero introduce heterogeneidad deliberada (DEC-005).

### Exposición global

Los módulos comparten funciones y datos a través de `window`. Es una decisión pragmática para una app sin bundler.

### Binding por IDs de DOM

Gran parte del sistema depende de IDs exactos en HTML. Eso vuelve crítica la sincronía entre estructura HTML y JS.

## 5. Flujo de Datos

### Creación desde portal

1. `submit.js` valida el formulario.
2. Pide actividades existentes a `DbService.getActividades()`.
3. Genera un `REQ-XXX` con `acts.length + 1`.
4. Construye objeto de 16 campos y lo agrega al array.
5. Guarda con `DbService.saveActividades(acts)`.
6. `localStorage` cambia.
7. El dashboard detecta el cambio por `storage`.
8. `notifications.js` emite `nuevoTicketExterno`.
9. Los módulos interesados (`dashboard.js`, `activity-table.js`, `tickets.js`) refrescan su vista.

### Creación desde dashboard

1. `data-manager.js` construye el objeto del formulario.
2. `DbService.guardarActividad()` crea un `TKT-XXX`.
3. El módulo emisor dispara `actividadGuardada`.
4. `dashboard.js`, `activity-table.js` y `tickets.js` recargan su estado.

### Edición desde dashboard

1. `tickets.js` abre modal.
2. Carga el ticket desde `DbService.getActividades()`.
3. Persiste cambios con `DbService.saveActividades()`.
4. Emite `ticketActualizado`.
5. `dashboard.js` reacciona al evento.

## 6. Manejo de Estado

No existe un estado global formal tipo Redux.

El estado se reparte entre:

- `localStorage`: estado persistente de negocio
- DOM: estado visual y formularios
- variables locales por módulo (ej: `currentView` en `navigation.js`)
- `window.currentSection`: estado simple de navegación (definido en `app.js`, actualizado en `navigation.js`)

El proyecto es simple de ejecutar, pero requiere disciplina para evitar divergencias entre DOM y datos persistidos.

## 7. Acoplamiento Entre Módulos

### Bajo

- Dashboard entre módulos de tabla, tickets y navegación gracias a eventos.
- Si `sparklines.js` falla, no afecta al resto del dashboard.

### Medio

- Portal entre `submit.js`, `stats.js` y `form-ui.js`: `submit.js` llama directamente a `setPriority()`, `buscarMisTickets()` y `calcularEstadisticas()` (líneas 100-104). No se usan eventos.

### Alto

- Entre JS y HTML por dependencia de IDs exactos. Renombrar un ID rompe el módulo que lo busca.
- `database.html` queda fuera de la arquitectura principal y accede directo a `localStorage`.

## 8. Servicios Principales

### `DbService` (14 métodos)

| Método | Tipo | Uso |
|---|---|---|
| `getSolicitantes()` | lectura | Dropdown de nombres |
| `getResponsables()` | lectura | Dropdown de responsables (parsea objetos a strings) |
| `getDashboardStats()` | lectura | Tarjetas de métricas (calcula open/inProgress/urgent) |
| `getRecentTickets()` | lectura | Últimos 5 tickets |
| `getNetworkPulse()` | lectura | Métricas simuladas de CPU/RAM |
| `guardarActividad(formObj)` | escritura | Crea ticket `TKT-XXX` |
| `buscarActividades(q)` | lectura | Búsqueda por texto en id o solicitud |
| `getActividades()` | lectura | Array completo de actividades |
| `saveActividades(acts)` | escritura | Guarda array completo |
| `getSistemas()` | lectura | Estado de sistemas |
| `saveSistemas(sysObj)` | escritura | Publica estado de sistemas |
| `getEstadoPersonal()` | lectura | Estado del personal |
| `saveEstadoPersonal(estObj)` | escritura | Publica estado personal |

Observación: `getDashboardStats` retorna `avgResolve: '1.5h'` hardcodeado. No es un cálculo real.

### Notificaciones

`notifications.js` combina:

- Permiso del navegador (solicitado al primer clic)
- Notificación visual del sistema (`Notification API` con `requireInteraction: true`)
- Toast interno
- Audio sintético con `AudioContext` (secuencia Do-Mi-Sol con oscilador `square`)

### Catálogo de trámites

`tramites-data.js` concentra el catálogo funcional del negocio:
- Área 1: 17 trámites estructurales/legales
- Área 2: 7 trámites operativos/documentales

## 9. Modelo Conceptual del Ticket

Campos detectados en uso (validado contra `submit.js` líneas 59-76):

| Campo | Tipo | Origen | Observación |
|---|---|---|---|
| `id` | string | generado | `REQ-XXX` o `TKT-XXX` |
| `fechaCreacion` | string | generado | `new Date().toLocaleString()` — dependiente de locale |
| `nombre` | string | formulario | Nombre del colaborador |
| `solicitante` | string | formulario | Idéntico a `nombre` en el portal |
| `solicitud` | string | formulario | Descripción del trámite solicitado |
| `estado` | string | fijo | Siempre "Pendiente" al crear |
| `prioridad` | string | formulario | "Baja", "Media", "Alta" |
| `responsable` | string | vacío | Asignado después por la gestora |
| `grupo` | string | formulario | Área de gestión seleccionada |
| `grupoExtra` | string | formulario | Tipo de trámite seleccionado |
| `clasificacion` | string | vacío | Sin uso claro en portal |
| `fechaInicio` | string | vacío | Para uso de la gestora |
| `fechaFin` | string | vacío | Para uso de la gestora |
| `fechaProgramada` | string | vacío | Para uso de la gestora |
| `accion` | string | vacío | Observaciones futuras de la gestora |
| `detalles` | string | formulario | Ruta T del archivo PDF (si aplica) |

Observaciones:

- `nombre` y `solicitante` se usan de forma casi redundante.
- `grupoExtra` y `clasificacion` también muestran superposición conceptual.
- `detalles` se usa exclusivamente para la ruta de archivos (no para adjuntos binarios).

## 10. Estrategia de Escalabilidad

### Lo que sí ayuda a escalar

- `DbService` como punto único de acceso
- Separación de módulos
- Catálogo centralizado
- Uso de promesas
- CSS modular por capas

### Lo que hoy limita la escalabilidad

- `localStorage` (límite ~5MB)
- Falta de backend
- Falta de autenticación
- Falta de API de dominio
- Dependencia de globals y orden de scripts

## 11. Riesgos Técnicos

### Riesgo 1: Colisión de IDs

La generación `acts.length + 1` puede duplicar IDs si se eliminan tickets y se crean nuevos, o en escenarios concurrentes entre pestañas.

- **Ubicación:** `db-service.js:63` y `submit.js:57`
- **Mitigación sugerida:** Usar `crypto.randomUUID()` o timestamp-based IDs.

### Riesgo 2: Parsing de fechas dependiente de locale

Se usa `new Date().toLocaleString()` para guardar fechas. El formato varía según la configuración regional del navegador (ej: `MM/DD/YYYY` vs `DD/MM/YYYY`). Si se parsean después con `new Date(string)`, puede dar `NaN`.

- **Ubicación:** `db-service.js:65` y `submit.js:61`
- **Mitigación sugerida:** Persistir fechas en formato ISO-8601 (`new Date().toISOString()`).

### Riesgo 3: QuotaExceededError

`localStorage` tiene un límite de ~5MB por dominio. Almacenar adjuntos codificados en base64 saturaría el espacio rápidamente.

- **Estado actual:** Solo se guardan rutas de archivo como strings. Riesgo bajo mientras se mantenga esta práctica.

### Riesgo 4: Comunicación limitada a mismo navegador

El evento `storage` solo funciona entre pestañas del mismo navegador en la misma máquina. Si portal y dashboard se usan en computadoras distintas, no hay sincronización.

- **Mitigación futura:** WebSockets o Server-Sent Events.

### Riesgo 5: Sanitización parcial

`escapeHtml` existe y se usa en `utils.js`, `dashboard.js` (con fallback defensivo en línea 91), y las tablas principales. Sin embargo, `submit.js:109` inyecta `newId` en `innerHTML` sin escapar. `database.html` tiene interpolaciones crudas.

### Riesgo 6: Código muerto activo

`dashboard.js` referencia `#ticketsList` (línea 65) y `#networkMetrics` (línea 110). Esos nodos no existen en `index.html`. Las funciones `loadRecentTickets` y `loadNetworkPulse` hacen `if (!container) return`, así que no causan error, pero son código muerto que se ejecuta innecesariamente en cada carga.

### Riesgo 7: Herramienta administrativa fuera de arquitectura

`database.html` escribe directo en `localStorage`, salta la capa de servicio y usa inline handlers. No valida formato de datos.

### Riesgo 8: Seguridad inexistente para producción

No hay autenticación, autorización, auditoría, cifrado ni backend seguro. Cualquier usuario con acceso a la URL puede ver y modificar datos.

## 12. Buenas Prácticas Implementadas

- Modularización real del JavaScript principal (12 módulos + 3 del portal).
- Eliminación completa de inline JS en dashboard y portal.
- Eliminación completa de inline CSS en dashboard y portal.
- CSS dividido por capas (base, layout, components, themes).
- Abstracción de persistencia con interfaz asíncrona.
- Catálogo de trámites desacoplado y centralizado.
- Eventos de dominio claros y documentados.
- Sanitización utilitaria disponible (`escapeHtml`).
- Documentación ADR incorporada al proyecto (DEC-001 a DEC-007).
- Metodología de trabajo AI-Friendly documentada en `agent.md`.

## 13. Buenas Prácticas Recomendadas para Siguientes Fases

- Mantener `DbService` como frontera única de datos.
- No volver a duplicar catálogos.
- No introducir eventos inline en `index.html` ni `portal_avanzado.html`.
- Normalizar fechas en formato ISO.
- Formalizar un contrato de datos para ticket, responsable y estado.
- Migrar el portal de llamadas directas a funciones (`setPriority`, `buscarMisTickets`) hacia eventos.
- Llevar `database.html` al mismo patrón arquitectónico.
- Limpiar código muerto (`loadRecentTickets`, `loadNetworkPulse` y sus contenedores).
