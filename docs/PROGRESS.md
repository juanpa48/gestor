# Bitácora de Seguimiento (Progress Tracker)

## Últimos Objetivos Completados
- **Gestión de Usuarios (CRUD):** Se implementaron botones de "Editar", "Suspender" (Soft Delete) y "Eliminar" (Hard Delete) en el panel de Ajustes (`Settings.jsx`).
- **Unificación de Roles:** El sistema centraliza la creación de perfiles (Solicitantes, Gestores, Admins) en la base `db_usuarios`, alimentando automáticamente los Dashboards dinámicamente por área.

---

## Nuevo Objetivo: Gestión de SLAs y Tipificación ITIL

**Contexto:** Se requiere implementar métricas de tiempos de resolución de ITIL. Se debe poder clasificar tickets como "Incidente" o "Requerimiento", y añadir estados de "Revisado" y "Suspendido" que afecten el cálculo del tiempo SLA configurable por el Administrador.

### Fases de Implementación:

- [x] **Fase 1: Configuración de SLAs en Ajustes (`Settings.jsx`)**
  - [x] Añadir sección en Ajustes usando clases `.glass-panel` y `.glass-input`.
  - [x] Definir horas límite de SLA por cada prioridad (Urgente, Alta, Media, Baja).
  - [x] Guardar configuración en `localStorage` (vía `SettingsManager`).
- [x] **Fase 2: Tipificación del Ticket (Incidente vs Requerimiento)**
  - [x] Portal: Añadir selector de tipo (radio buttons con diseño de tarjetas seleccionables y efectos hover en `forms.css`).
  - [x] Dashboard: Crear clases `.tipo-badge.incidente` y `.tipo-badge.requerimiento` en `widgets.css` y renderizar el tipo en `Gestion.jsx`.
- [x] **Fase 3: Nuevos Estados (Revisado y Suspendido) y SLA Tracker**
  - [x] Modal: Añadir botones con íconos para "Revisado" (ojo) y "Suspender" (pausa) respetando la grilla `.modal-footer`.
  - [x] Lógica: En `createAreaContext.jsx`, implementar la matemática (`fechaPausa`, `tiempoPausadoTotal`) para pausar el SLA de Resolución.
- [x] **Fase 4: Semáforos SLA Visuales (`Actividades.jsx`)**
  - [x] Calcular porcentaje consumido del SLA.
  - [x] Crear clases `.sla-ok` (Verde), `.sla-warning` (Amarillo) y `.sla-danger` (Rojo) en `widgets.css`.
  - [x] Mostrar la insignia de tiempo restante en las tablas del Dashboard.
- [x] **Fase 5: Auditoría Visual y de Estilos (QA)**
  - [x] Verificación estricta de contrastes (modo oscuro y modo portal).
  - [x] Comprobación de que no haya estilos `inline` prohibidos.
  - [x] Ajustes de `flexbox` y `gap` para que los nuevos botones no rompan la UI móvil ni de escritorio.
  - [x] Mostrar insignias de colores (Verde, Amarillo, Rojo) según el estado del SLA (A tiempo, Por Vencer, Vencido).

---

## Nuevo Objetivo: Reactivación de Widget de Estado de Sistemas
- [x] Habilitar la visibilidad en CSS retirando `display: none` de `#panelControlSistemas`.
- [x] Implementar renderizado condicional en `PanelPrincipal.jsx` para mostrar el Widget únicamente si el usuario está en el área `ti` y posee el rol `admin_ti`.
- [x] Ajustar el campo de "Mensaje a Empleados" cambiando de `<input>` temporal a un `<textarea>` permanente para mejor detalle.
