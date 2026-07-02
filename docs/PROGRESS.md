# 🎯 Bitácora de Progreso y Objetivos (Tracker)

> **Nota para la IA:** Archivo de seguimiento para la migración a React.
> Seguiremos la metodología de "Baby Steps" documentando cada fase aquí.

## Objetivo Actual: Migración del Proyecto a React (Vite)

**Contexto:** Migrar la aplicación vanilla "project-visualization" (versión actualizada a Junio 2026) a React, manteniendo la arquitectura multi-página (rutas), el centro de notificaciones funcional y las gráficas dinámicas.

**Decisiones Confirmadas:**

- **Rutas:** Pendiente de confirmación (Propuesto: React Router).
- **Estado:** Pendiente de confirmación (Propuesto: React Context API).
- **Gráficos:** Pendiente de confirmación (Propuesto: react-chartjs-2).

---

## Fases de Implementación (Refactorización 1:1)

- [x] **Fase 1: Corrección de Enrutamiento y Layout Base**
  - [x] Validar `App.jsx` y limpiar etiquetas innecesarias.
  - [x] Restablecer la estructura exacta de `layout.js` en `DashboardLayout.jsx` (borrar `.page-content`).
  - [x] Sincronizar el atributo `data-page` en el body según la ruta activa.

- [x] **Fase 2: Panel Principal (Dashboard) - `index.html`**
  - [x] Restablecer jerarquía de clases `.section`, `.stats-grid`, `.content-row`.
  - [x] Crear `RegistroActividadForm.jsx` con los 7 grupos de campos y el modal rápido.
  - [x] Crear `WidgetMiEstado.jsx` con lógica de `.panel-card`.
  - [x] Crear `WidgetSistemas.jsx` con lógica de `.panel-card`.

- [x] **Fase 3: Página de Actividades - `actividades.html`**
  - [x] Restablecer jerarquía de clases base `.section`.
  - [x] Portar los selects de la barra de filtros `.filters-container`.
  - [x] Recrear `.quick-stats` (Totales, Pendientes, Progreso, Resueltos, Urgentes) según `activity-table.js`.
  - [x] Restablecer tabla interactiva en `.table-card`.

- [x] **Fase 4: Página de Gestión - `gestion.html`**
  - [x] Restablecer jerarquía de clases base `.section`.
  - [x] Implementar el `.view-toggle` (Tabla vs Kanban).
  - [x] Portar el modal de edición complejo (`.modal-overlay`) con lógica extraída de `tickets.js`.

- [x] **Fase 5: Portal del Colaborador - `portal_avanzado.html`**
  - [x] Restablecer jerarquía de `.portal-container`, `.top-stats` y `.main-grid`.
  - [x] Reconstruir formulario interactivo (checkbox PDF, prioridades `.priority-btn`, ruta T).
  - [x] Reconstruir historial lateral y widget lateral de personal TI.

---

## Último objetivo completado

Fase 5: Portal del Colaborador completada con éxito. Migración total a React finalizada.

---

## Nuevo Objetivo: Migración del Administrador de Datos (database.html) a React

**Contexto:** El usuario necesita agregar nuevo personal y solicitantes. En Vanilla esto se hacía mediante `database.html`. Se migrará esta herramienta a una nueva ruta nativa en React para compartir el mismo `localStorage` (`localhost:5173`).

### Fases de Implementación:

- [x] **Fase 1: Actualización de la Capa de Datos (`DbService.js` y `TicketContext.jsx`)**
  - [x] Añadir métodos estáticos `saveSolicitantes` y `saveResponsables` en `DbService.js`.
  - [x] Exponer funciones de CRUD en `TicketContext.jsx` (`addSolicitante`, `removeSolicitante`, `addResponsable`, `removeResponsable`).

- [x] **Fase 2: Creación de la página `Database.jsx`**
  - [x] Recrear la lógica de pestañas (Tabs) en React.
  - [x] Pestaña Actividades (Solo lectura, mostrando los 16 campos).
  - [x] Pestaña Solicitantes (Añadir y borrar nombres).
  - [x] Pestaña Responsables (Añadir nombre, cargo, foto y borrar).

- [x] **Fase 3: Integración de Rutas en `App.jsx`**
  - [x] Registrar la ruta `/database` en `App.jsx`.

---

## Último objetivo completado

Migración del Administrador de Datos completada. Ruta `/database` habilitada con soporte CRUD de Solicitantes y Responsables conectado al Context API.

---

## Nuevo Objetivo: Integración de Gráficos del Dashboard Original

**Contexto:** Los gráficos del Dashboard (`StatCards.jsx`) estaban usando gráficos de líneas aleatorios como placeholders. Se migrarán los gráficos reales usando la lógica de `sparklines.js` y `react-chartjs-2`.

### Fases de Implementación:

- [x] **Fase 1: Configuración de Chart.js**
  - [x] Importar los componentes necesarios en `StatCards.jsx` (`ArcElement`, `BarElement`, `Pie`, `Bar`, `Doughnut`).

- [x] **Fase 2: Transcripción de Algoritmos**
  - [x] Calcular distribución por prioridad (Abiertos).
  - [x] Calcular distribución por estado (En Progreso).
  - [x] Calcular volumen por área (Resolución).
  - [x] Calcular urgencias (Pendientes vs Resueltas).

- [x] **Fase 3: Renderizado de Gráficos**
  - [x] Reemplazar `LineChart` falsos.
  - [x] Renderizar `Pie` para Total Abiertos.
  - [x] Renderizar `Bar` horizontal para En Progreso.
  - [x] Renderizar `Bar` vertical para Total Resueltos (Prom. Resolución).
  - [x] Renderizar `Doughnut` para Tareas Urgentes.
  - [x] Ajustar colores (`#e8192c`, `#f59e0b`, `#3b82f6`, `#10b981`).

---

## Último objetivo completado

Integración del Centro de Notificaciones y gráficos de Dashboard con Chart.js finalizada.

---

## Último objetivo completado

- **Database:** Corrección del scroll vertical/horizontal y override de variables globales para recuperar la fidelidad 1:1 al Vanilla JS.
- **Portal:** Solución de la compresión del ancho del formulario.
- **Notificaciones:** Eliminación definitiva de notificaciones duplicadas y sincronización cruzada entre ventanas.
