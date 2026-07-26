# Bitácora de Seguimiento (Progress Tracker)

## Últimos Objetivos Completados
- **Gestión de Usuarios (CRUD):** Se implementaron botones de "Editar", "Suspender" (Soft Delete) y "Eliminar" (Hard Delete) en el panel de Ajustes (`Settings.jsx`).
- **Unificación de Roles:** El sistema centraliza la creación de perfiles (Solicitantes, Gestores, Admins) en la base `db_usuarios`, alimentando automáticamente los Dashboards dinámicamente por área.
- **Gestión de SLAs y Tipificación ITIL:** Configuración de SLAs, tipificación, semáforos, pausas de SLA implementados en Dashboard y Portal.
- **Reactivación de Widget de Estado de Sistemas:** Habilitado para rol `admin_ti` en Panel Principal.
- **Módulo de Gestión Humana (Especialización):** Eliminación de Tipo y Prioridad para GH, límite estricto de SLA a 9h, y adición del flag `Novedad de Nómina`.

---

## Nuevo Objetivo: Refactorización Panel Ajustes (Settings)

**Contexto:** El archivo `Settings.jsx` es actualmente un componente monolítico muy grande que obliga a hacer scroll infinito. Al tener más de 50 usuarios, el renderizado se vuelve pesado. Se requiere dividir este módulo en sub-rutas anidadas (react-router-dom) y un menú lateral de navegación, agrupando la "Gestión de Usuarios" de forma centralizada y paginada.

### Fases de Implementación:

- [x] **Fase 1: Configuración de Sub-Rutas en `App.jsx` y Creación de `SettingsLayout.jsx`**
  - [x] Crear carpeta `src/pages/dashboard/settings/`.
  - [x] Crear componente `SettingsLayout.jsx` con el diseño de navegación lateral (Sidebar).
  - [x] Actualizar `App.jsx` para definir las rutas anidadas (`/settings/usuarios`, `/settings/sla`, etc.).
- [x] **Fase 2: Extracción del Módulo de Festivos y Trámites**
  - [x] Crear `SettingsFestivos.jsx` migrando la lógica desde `Settings.jsx`.
  - [x] Crear `SettingsTramites.jsx` migrando la lógica (Grupos y Tipos).
- [x] **Fase 3: Extracción de SLA y Especialización**
  - [x] Crear `SettingsSLA.jsx`.
  - [x] Asegurar que `SettingsSLA` respeta la validación de `area !== 'gh'`.
- [x] **Fase 4: El Módulo de Usuarios (Consolidación y Optimización)**
  - [x] Crear `SettingsUsuarios.jsx`.
  - [x] Integrar tanto el listado/gestión de resolutores como la creación de nuevas cuentas en una tabla limpia con modal.
- [x] **Fase 5: Testing, Limpieza y Re-vinculación**
  - [x] Comprobar que todas las pestañas guarden correctamente a través de `SettingsManager`.
  - [x] Eliminar el viejo `Settings.jsx` y comprobar links en `DashboardLayout.jsx` (Sidebar principal).

---

## Nuevo Objetivo: Motor SLA Avanzado (ITIL)
- [x] **Horario Laboral:** Implementación matemática en `businessHours.js` para descontar horas nocturnas y fines de semana del SLA.
- [x] **Pausas Dinámicas:** Al cambiar a "Almuerzo", "Reunión" o "Ausente", se pausan automáticamente los tickets en progreso del gestor y se reanudan al cambiar a disponible.
- [x] **Módulo de Festivos:** Interfaz para que el administrador configure las fechas festivas y el SLA las descuente automáticamente.
- [x] **Reglas de Cierre ITIL:** Los tickets "Resueltos" pasan automáticamente a estado "Cerrado" pasadas las 72 horas.
- [x] **Métricas de Estados Completas:** Renderizado de tarjetas de estadísticas para todos los estados posibles en la vista de Dashboard (Actividades).
