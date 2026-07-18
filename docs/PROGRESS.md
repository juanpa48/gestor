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

---

## Nuevo Objetivo: Métricas de Tiempos y Fechas en Tickets

**Objetivo:** Restaurar y automatizar el registro de fechas clave (`fechaInicio`, `fechaFin`) y el cálculo automático del `tiempo` transcurrido de los tickets, además de proveer campos para registrar la `fechaProgramada` y `accion` técnica por parte del resolutor.

### Fases de Implementación:
- [x] **Fase 1: Contexto de Tickets** (Interceptar "En progreso" y "Resuelto").
- [x] **Fase 2: Modal de Gestión** (Añadir inputs de `fechaProgramada` y `accion`).

---

## Último objetivo completado

Métricas de Tiempos y Fechas: Cálculo automático de `tiempo` de resolución implementado en el Context y adición de inputs `fechaProgramada` y `accion` al modal de Gestión.

---

## Nuevo Objetivo: Expansión Multi-Área (GE + GH + TI)

**Objetivo:** Expandir el sistema de 1 área (Gestión Empresarial) a 3 áreas independientes usando un **patrón Factory** para evitar duplicar código.

| Área | Código | Color | Prefijo | Trámites |
|------|--------|-------|---------|----------|
| Gestión Empresarial | `ge` | `#6366f1` | `GE-001` | Los de `tramitesData.js` |
| Gestión Humana | `gh` | `#10b981` | `GH-001` | Vinculación, Desvinculación, Permiso ausentismo, Solicitud cesantías, Solicitud carta laboral, Solicitud vacaciones |
| Soporte TI | `ti` | `#3b82f6` | `TI-001` | Soporte (placeholder — el usuario lo definirá después) |

---

### Decisiones del Usuario (CONFIRMADAS)

1. **Sin migración de datos** — El usuario regenerará datos de prueba. Se empieza limpio con las nuevas claves de localStorage.
2. **Acceso por link directo** — Cada resolutor recibe su propia URL (`/dashboard/ge`, `/dashboard/gh`, `/dashboard/ti`). NO hay selector de área en el dashboard. El Sidebar solo muestra las opciones internas de ESA área.
3. **El Portal SÍ tiene selector** — Los colaboradores eligen entre las 3 áreas antes de ver el formulario.
4. **Solicitantes compartidos** — `db_solicitantes` es la misma lista para las 3 áreas (un colaborador puede solicitar a cualquier área).
5. **Responsables separados** — Cada área tiene su propio equipo resolutor (`db_responsables_ge`, `db_responsables_gh`, `db_responsables_ti`).

---

### Arquitectura: Factory Pattern

#### Concepto clave
En vez de escribir 3 archivos de Context casi idénticos, se crea UNA función `createAreaContext(config)` en `shared/contexts/` que genera un Context + Provider + hook por cada área. Cada área la invoca con su configuración en 3 líneas.

#### Personalización por niveles
- **Global** (Factory): Lógica compartida — CRUD, métricas de tiempo `HH:mm:ss`, interceptación de estados.
- **Config** (por área): Trámites, estados, prefijos, claves de localStorage, hooks opcionales (`onBeforeSave`, etc.).
- **Exclusivo** (componentes del área): Funcionalidad única como adjuntar archivos en GH.

---

### Datos (localStorage)

| Clave | Área |
|-------|------|
| `db_actividades_ge` | GE |
| `db_actividades_gh` | GH |
| `db_actividades_ti` | TI |
| `db_solicitantes` | Compartida |
| `db_responsables_ge` | GE |
| `db_responsables_gh` | GH |
| `db_responsables_ti` | TI |

---

### Rutas

- `/portal` → Selector de 3 áreas + formulario dinámico
- `/dashboard/ge`, `/dashboard/ge/actividades`, `/dashboard/ge/gestion` → Vistas directas GE
- `/dashboard/gh`, `/dashboard/gh/actividades`, `/dashboard/gh/gestion` → Vistas directas GH
- `/dashboard/ti`, `/dashboard/ti/actividades`, `/dashboard/ti/gestion` → Vistas directas TI
- `/database/ge`, `/database/gh`, `/database/ti` → CRUD separado por área

---

### Fases de Implementación

- [x] **Fase 0: Reorganizar carpetas (COMPLETADA)**
  - Archivos movidos a `shared/` y `areas/gestion-empresarial/`.
  - `areasConfig.js` creado y todos los imports actualizados. Build exitoso verificado.

- [x] **Fase 1: Crear la Factory + GEContext (COMPLETADA)**
  1. Crear `shared/contexts/createAreaContext.js` — extraer TODA la lógica de `src/contexts/TicketContext.jsx` (CRUD, métricas de tiempo `formatDuration`, interceptación de estados, solicitantes, responsables) en una función factory que recibe un `config` con `storageKey`, `responsablesKey`, `prefijo`, etc.
  2. Crear `areas/gestion-empresarial/config.js` con la configuración de GE (usar los valores de `areasConfig.js` + los trámites de `tramitesData.js`).
  3. Crear `areas/gestion-empresarial/context/GEContext.jsx` — solo 3 líneas que invoquen la Factory con el config de GE.
  4. Reemplazar TODOS los `import { useTickets } from '.../contexts/TicketContext'` en los componentes de GE por `import { useAreaTickets } from '.../GEContext'`.
  5. Actualizar `main.jsx` para usar `GEProvider` en vez de `TicketProvider`.
  6. Verificar que GE funciona exactamente igual.
  7. Eliminar el viejo `TicketContext.jsx` cuando todo esté estable.

- [x] **Fase 2: Portal con selector de área (COMPLETADA)**
  - Añadir 3 tarjetas/botones al Portal debajo del logo (GE, GH, TI).
  - Renderizar el formulario correspondiente al área elegida.
  - GE: formulario actual. GH: con los 6 trámites definidos. TI: con "Soporte" (placeholder).

- [x] **Fase 3: Dashboards y Rutas dinámicas (Completado)**
  - [x] **Enrutamiento Dashboard**: Modificar `App.jsx` para usar `<Route path="/dashboard/:area">`.
  - [x] **Componentes Compartidos**: Mover las páginas del dashboard de GE (`PanelPrincipal.jsx`, `Actividades.jsx`, `Gestion.jsx` y sus componentes) a `src/pages/dashboard/`.
  - [x] **ActiveAreaContext**: Crear un contexto "puente" que consuma el ID del área en la URL y pase el proveedor correcto (`GEProvider`, `GHProvider`, `TIProvider`) a las vistas genéricas.
  - [x] **Refactorización Genérica**: Actualizar las páginas para consumir `useActiveArea()` en lugar de `useGEContext()`, eliminando código hardcodeado (ej. reemplazar las listas estáticas de trámites por `config.grupos[].tramites`).
  - [x] **Sidebar Dinámico**: Actualizar los links y el color del Sidebar basado en el `ActiveAreaContext`.

- [x] **Fase 4: Database multi-área (Completado)**
  - [x] Componente genérico `AreaDatabase.jsx` en `src/pages/database/`.
  - [x] Rutas `/database/:area`.

- [ ] **Fase 5: Pulir GH**
  - Campos exclusivos, adjuntar archivos, etc.

---

## Nuevo Objetivo: Campo "Cargo" en Solicitantes

**Contexto:** Los solicitantes se almacenan como strings simples. Se necesita agregar un campo `cargo` para que al crear un ticket se refleje en la tabla de actividades del Database. Sin imagen (a diferencia de responsables).

### Fases de Implementación:

- [x] **Fase 1: Capa de Datos (`DbService.js` + `TicketContext.jsx`)**
  - [x] `DbService.getSolicitantes` normaliza objetos `{nombre, cargo}` → extrae `.nombre` para dropdowns.
  - [x] `TicketContext.addSolicitante` recibe `{nombre, cargo}` y guarda el objeto completo en localStorage.
  - [x] Exponer función `getSolicitanteCargo(nombre)` en el Context para lookup de cargo al crear tickets.

- [x] **Fase 2: UI de Database (`Database.jsx`)**
  - [x] Agregar input de cargo en el formulario de solicitantes.
  - [x] Agregar columna "Cargo" en la tabla de solicitantes.
  - [x] Leer `rawSolicitantes` de localStorage para mostrar objetos completos.

- [x] **Fase 3: Inyección de cargo al crear tickets**
  - [x] `RegistroActividadForm.jsx`: al crear ticket, buscar cargo del solicitante e inyectarlo.
  - [x] `Portal.jsx`: al crear ticket, buscar cargo del solicitante e inyectarlo.

- [x] **Fase 4: Verificación**
  - [x] Crear solicitante con cargo desde `/database`.
  - [x] Crear ticket desde Dashboard y Portal, verificar que cargo aparezca en la tabla de actividades.

---

## Último objetivo completado

Campo "Cargo" en Solicitantes implementado. Los solicitantes se almacenan como objetos `{nombre, cargo}`, los tickets inyectan el cargo automáticamente, y la tabla de actividades en `/database` lo refleja correctamente.

