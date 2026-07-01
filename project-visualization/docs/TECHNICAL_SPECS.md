# Especificaciones Técnicas (Versión Maestra)

Este documento desglosa la implementación actual del proyecto desde una perspectiva operativa: módulos, patrones, flujo de datos, acoplamiento, convenciones, escalabilidad y riesgos. Su objetivo es servir como manual de ingeniería definitivo para desarrolladores humanos e IAs.

## 1. Stack Tecnológico Actual

- **Frontend:** HTML5, CSS3 modular (Arquitectura por capas), JavaScript Vanilla (ES6+).
- **Servidor:** Node.js + `http-server` (Puerto 3000).
- **Persistencia:** `localStorage` del navegador.
- **Comunicación en Tiempo Real:** Evento nativo `storage` para sincronización inter-pestañas.
- **Notificaciones:** API de Notificaciones del navegador + `AudioContext` para alertas sonoras.
- **Gráficos:** API Canvas para sparklines decorativas.

## 2. Patrones de Diseño Implementados

### Service Layer / Facade
`window.DbService` centraliza el acceso a datos. Todos los métodos son `async` y retornan promesas, simulando latencia de red (`setTimeout` de 300ms a 800ms). Esto aísla la UI del mecanismo de almacenamiento.

### Observer / Pub-Sub (Event-Driven)
Uso de `CustomEvent` para desacoplar módulos. Permite que el sistema sea resiliente y extensible.

| Evento | Emisor | Receptores |
|---|---|---|
| `actividadGuardada` | `data-manager.js` | `dashboard.js`, `activity-table.js`, `tickets.js` |
| `ticketActualizado` | `tickets.js` | `dashboard.js`, `activity-table.js` |
| `sectionChanged` | `navigation.js` | `tickets.js` (init de carga de gestión) |
| `nuevoTicketExterno` | `notifications.js` | `dashboard.js`, `activity-table.js`, `tickets.js` |
| `ticketSeleccionado` | `utils.js` (búsqueda) | `tickets.js` (apertura de modal) |

### Single Responsibility & Source of Truth
- Cada módulo tiene un dominio funcional único.
- `tramites-data.js` es la **Fuente Única de Verdad** para el catálogo de trámites.

## 3. Estructura y Responsabilidad de Módulos

### Dashboard Administrativo (`index.html`)
- `app.js`: Punto de entrada y orquestación inicial.
- `navigation.js`: Control de visibilidad de secciones y toggle Tabla/Kanban.
- `dashboard.js`: Gestión de métricas, tickets recientes y animaciones.
- `tickets.js`: Ciclo de vida de solicitudes: edición, KanBan y registro rápido.
- `activity-table.js`: Tabla principal con sistema de filtrado avanzado.
- `notifications.js`: Lote de alertas (Audio + Browser) y listener de `storage`.

### Portal de Colaboradores (`portal_avanzado.html`)
- `portal/form-ui.js`: Lógica reactiva de la interfaz del formulario.
- `portal/submit.js`: Validación y transmisión de solicitudes (`REQ-XXX`).
- `portal/stats.js`: Sincronización de historial personal y estadísticas públicas.

### Herramienta Independiente
- `database.html`: Sandbox para mantenimiento manual CRUD de `localStorage`. No usa `DbService`.

## 4. Convenciones y Flujo de Datos

### Prefijos de Identidad
- **`REQ-XXX`**: Solicitudes originadas en el Portal.
- **`TKT-XXX`**: Registros manuales creados en el Dashboard.

### Flujo de creación Portal -> Dashboard
1. `submit.js` valida y guarda vía `DbService.saveActividades()`.
2. Browser dispara evento `storage` en pestañas inactivas.
3. `notifications.js` detecta el cambio de longitud y emite `nuevoTicketExterno`.
4. El Dashboard refresca visuales y emite alerta sonora (Do-Mi-Sol).

## 5. Modelo de Datos del Ticket (16 Campos)

| Variable | Origen | Obs. Desarrollo |
|---|---|---|
| `id` | Generado | Prefijo TKT/REQ + longitud array + 1. |
| `fechaCreacion` | Generado | `toLocaleString()` (Dependiente de región). |
| `nombre` | Formulario | Nombre del colaborador/solicitante. |
| `solicitante` | Formulario | Redundante con `nombre` en portal. |
| `solicitud` | Formulario | Descripción del trámite. |
| `estado` | Fijo | "Pendiente" por defecto. |
| `prioridad` | Formulario | Bajo, Media, Alta. |
| `responsable` | Dashboard | Asignado por gestora TI. |
| `grupo` | Formulario | Área de gestión (SSOT). |
| `grupoExtra` | Formulario | Tipo de trámite específico (SSOT). |
| `clasificacion`| Dashboard | Categorización técnica adicional. |
| `fechaInicio` | Dashboard | Registro de inicio de labores. |
| `fechaFin` | Dashboard | Registro de finalización. |
| `fechaProgramada`| Dashboard | Deadline de atención. |
| `accion` | Dashboard | Observaciones/Bitácora de la gestora. |
| `detalles` | Formulario | Ruta T de carpetas físicas (PDFs). |

## 6. Auditoría de Riesgos Técnicos Críticos

1. **Colisión de IDs:** Generar IDs basados en `.length + 1` es propenso a duplicados si se eliminan registros o hay concurrencia.
2. **Parsing de Fechas:** `toLocaleString()` es inconsistente entre sistemas operativos, lo que puede causar `NaN` al intentar re-instanciar fechas.
3. **Límite de Almacenamiento:** `localStorage` (∼5MB) limita el crecimiento exponencial de datos históricos.
4. **Broadcast Aislado:** El evento `storage` NO funciona entre computadoras diferentes (necesita WebSockets para producción).
5. **Código Muerto:** `dashboard.js` intenta renderizar sobre `#ticketsList` y `#networkMetrics`, nodos que ya no existen en `index.html`.
6. **Sanitización Parcial:** Se requiere aplicar `escapeHtml` uniformemente en el portal y en `database.html`.

## 7. Buenas Prácticas Recomendadas

- **Normalizar Fechas:** Migrar a formato ISO-8601 (`toISOString()`).
- **Desacoplamiento del Portal:** Migrar las llamadas directas a funciones hacia un sistema de eventos para mayor resiliencia.
- **Limpieza de DOM:** Eliminar del JS los selectores hacia nodos inexistentes para evitar logs de error silentes.
- **Seguridad:** Implementar capa de autenticación y autorización antes de cualquier despliegue web real.

## 8. Recomendaciones para IAs Futuras

- **Orden de Lectura:** Seguir estrictamente el `CONTEXT.md` antes de proponer cambios.
- **Validación DOM:** Antes de modificar lógica de UI, verificar si el ID del elemento persiste en el HTML.
- **No duplicar catálogos:** Cualquier nuevo trámite debe ir en `tramites-data.js`.
- **Baby Steps:** Mantener cambios atómicos para evitar cortes de tokens y facilitar la verificación.
