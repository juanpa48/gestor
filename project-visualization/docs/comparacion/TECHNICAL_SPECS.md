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

`window.DbService` centraliza el acceso a datos y evita que la UI dependa directamente del mecanismo de persistencia.

### Observer / Pub-Sub

El dashboard usa `CustomEvent` para desacoplar módulos. Un módulo emite un evento y otros reaccionan sin conocerse entre sí.

### Single Responsibility Principle

La mayor parte del dashboard está dividida por responsabilidad funcional. Cada archivo tiene un dominio reconocible.

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
- `server.js`: servidor local

### `docs/`

- documentación técnica, dependencias, decisiones y arquitectura

### `entorno_local/`

- aplicación ejecutable en navegador

### `entorno_local/js/`

- lógica del dashboard
- servicios compartidos

### `entorno_local/js/portal/`

- lógica exclusiva del portal

### `entorno_local/css/`

- sistema visual por capas: base, layout, components, themes

## 4. Convenciones Técnicas

### Nombres de almacenamiento

Las claves persistidas siguen el prefijo `db_`.

### Prefijos de tickets

- `TKT-XXX`: creados desde dashboard
- `REQ-XXX`: creados desde portal

Esto comunica origen, pero también introduce heterogeneidad deliberada.

### Exposición global

Los módulos comparten funciones y datos a través de `window`. Es una decisión pragmática para una app sin bundler.

### Binding por IDs de DOM

Gran parte del sistema depende de IDs exactos en HTML. Eso vuelve crítica la sincronía entre estructura HTML y JS.

## 5. Flujo de Datos

### Creación desde portal

1. `submit.js` valida el formulario.
2. Pide actividades existentes a `DbService`.
3. Genera un `REQ-XXX`.
4. Guarda el nuevo ticket.
5. `localStorage` cambia.
6. El dashboard detecta el cambio por `storage`.
7. `notifications.js` emite `nuevoTicketExterno`.
8. Los módulos interesados refrescan su vista.

### Creación desde dashboard

1. `data-manager.js` construye el objeto del formulario.
2. `DbService.guardarActividad()` crea un `TKT-XXX`.
3. Se emite `actividadGuardada`.
4. `dashboard.js`, `activity-table.js` y `tickets.js` recargan su estado.

### Edición desde dashboard

1. `tickets.js` abre modal.
2. Carga el ticket desde `DbService`.
3. Persiste cambios con `saveActividades`.
4. Emite `ticketActualizado`.
5. El dashboard reacciona al evento.

## 6. Manejo de Estado

No existe un estado global formal tipo Redux.

El estado se reparte entre:

- `localStorage`: estado persistente de negocio
- DOM: estado visual y formularios
- variables locales por módulo
- `window.currentSection`: estado simple de navegación

### Consecuencia

El proyecto es simple de ejecutar, pero requiere disciplina fuerte para evitar divergencias entre DOM y datos persistidos.

## 7. Acoplamiento Entre Módulos

### Bajo

- Dashboard entre módulos de tabla, tickets y navegación gracias a eventos.

### Medio

- Portal entre `submit.js`, `stats.js` y `form-ui.js`, porque se apoyan en funciones globales nominales.

### Alto

- Entre JS y HTML por dependencia de IDs.
- En `database.html`, que queda fuera de la arquitectura principal.

## 8. Servicios Principales

### `DbService`

Capacidades actuales:

- solicitantes
- responsables
- actividades
- estadísticas del dashboard
- sistemas
- estado personal

Observación:

- mezcla operaciones CRUD reales con algunos datos simulados como métricas o tiempos promedio.

### Notificaciones

`notifications.js` combina:

- permiso del navegador
- notificación visual del sistema
- toast interno
- audio sintético con `AudioContext`

### Catálogo de trámites

`tramites-data.js` concentra el catálogo funcional del negocio y actúa como configuración compartida.

## 9. Responsabilidad de Carpetas y Archivos

### `entorno_local/index.html`

Shell del dashboard. Debe contener los nodos que los módulos esperan.

### `entorno_local/portal_avanzado.html`

Shell del portal. Orquesta los módulos del colaborador.

### `entorno_local/database.html`

Herramienta auxiliar de mantenimiento manual de datos.

### `entorno_local/css/themes/portal-theme.css`

Capa de override que adapta el sistema base al portal y corrige conflictos con el reset global.

## 10. Estrategia de Escalabilidad

### Lo que sí ayuda a escalar

- `DbService` como punto único de acceso
- separación de módulos
- catálogo centralizado
- uso de promesas

### Lo que hoy limita la escalabilidad

- `localStorage`
- falta de backend
- falta de autenticación
- falta de API de dominio
- polling en portal cada 10 segundos para estado visual
- dependencia de globals y orden de scripts

## 11. Riesgos Técnicos

### Riesgo 1. Inconsistencia documentación vs implementación

La documentación histórica no siempre coincide con el estado real del código. Esto puede inducir cambios erróneos.

### Riesgo 2. Código residual de plantilla original

Persisten textos y conceptos “IT Command” en la UI y archivos. El riesgo es semántico y de mantenimiento.

### Riesgo 3. IDs basados en longitud

La generación `acts.length + 1` puede duplicar IDs en escenarios concurrentes entre pestañas.

### Riesgo 4. Parsing de fechas dependiente de locale

Se usa `toLocaleString()` para guardar fechas y luego se parsean con `new Date()`. Esto puede fallar según región y navegador.

### Riesgo 5. Sanitización parcial

Existe `escapeHtml`, pero no se aplica de forma uniforme. El portal y `database.html` tienen interpolaciones crudas.

### Riesgo 6. Código muerto o UI desalineada

`dashboard.js` referencia `ticketsList` y `networkMetrics`, pero esos nodos no existen hoy en `index.html`.

### Riesgo 7. Herramienta administrativa fuera de arquitectura

`database.html` escribe directo en `localStorage`, salta la capa de servicio y usa inline handlers.

### Riesgo 8. Seguridad inexistente para producción

No hay autenticación, autorización, auditoría, cifrado ni backend seguro.

## 12. Buenas Prácticas Implementadas

- Modularización real del JavaScript principal.
- Eliminación de inline JS en dashboard y portal principal.
- CSS dividido por capas.
- Abstracción de persistencia.
- Catálogo de trámites desacoplado.
- Eventos de dominio simples y entendibles.
- Sanitización utilitaria disponible.
- Documentación ADR ya incorporada al proyecto.

## 13. Buenas Prácticas Recomendadas para Siguientes Fases

- Mantener `DbService` como frontera única de datos.
- No volver a duplicar catálogos.
- No introducir eventos inline en `index.html` ni `portal_avanzado.html`.
- Normalizar fechas en formato ISO.
- Formalizar un contrato de datos para ticket, responsable y estado.
- Crear listeners para eventos actualmente huérfanos o eliminarlos.
- Llevar `database.html` al mismo patrón arquitectónico.

## 14. Modelo Conceptual del Ticket

Campos detectados en uso:

- `id`
- `fechaCreacion`
- `nombre`
- `solicitante`
- `solicitud`
- `estado`
- `prioridad`
- `responsable`
- `grupo`
- `grupoExtra`
- `clasificacion`
- `fechaInicio`
- `fechaFin`
- `fechaProgramada`
- `accion`
- `detalles`

Observación:

- `nombre` y `solicitante` se usan de forma casi redundante.
- `grupoExtra` y `clasificacion` también muestran superposición conceptual.

## 15. Recomendaciones para IAs Futuras

- Leer primero `CONTEXT.md`, `docs/DEPENDENCIES.md` y `docs/DECISIONS.md`.
- Validar siempre la documentación contra el HTML y los módulos reales.
- Antes de tocar módulos, verificar si el nodo DOM que esperan sigue existiendo.
- Tratar `database.html` como herramienta especial, no como referencia arquitectónica.
