# 📋 Changelog — Gestión Empresarial

> Este archivo registra los cambios importantes del proyecto.
> Regla: Cada mes se comprime el historial antiguo en un resumen.
> Detalle completo de meses anteriores en: `CHANGELOG_archive.md` (cuando aplique).

---

## Resumen Histórico (Marzo — Junio 2026)

> **Origen:** El proyecto nació como una plantilla de tickets para IT ("IT Command").
> **Migración:** Se adaptó la plantilla para el departamento de Gestión Empresarial usando Vanilla JS y `localStorage`.
> **Desacoplamiento:** Se migró de una arquitectura SPA basada en JS inline a eventos nativos y módulos ES6.

---

## Julio 2026

### [2026-07-19] — Autenticación Local, Seguridad y Ajustes Dinámicos 🔐
- **Archivos:** `AuthContext.jsx`, `ProtectedRoute.jsx`, `SettingsManager.js`, `Login.jsx`, `Settings.jsx`, `App.jsx`.
- **Autenticación (SHA-256):** Se implementó un sistema de login duro. Las contraseñas se almacenan hasheadas con SHA-256 en `db_usuarios` en localStorage.
- **Protección de Rutas y Áreas:** `ProtectedRoute.jsx` bloquea accesos no autorizados. Si la gestora de `GE` intenta acceder a la base de datos de `TI`, el sistema la expulsa a su área correspondiente.
- **Panel de Ajustes Dinámico:** Se eliminó el archivo rígido `tramitesData.js`. Ahora la configuración de trámites por área vive en `db_settings` y se gestiona mediante UI visual (`Settings.jsx`).
- **Módulo TI:** Panel exclusivo para el `admin_ti` para ver los intentos fallidos, desbloquear usuarios bloqueados temporalmente (tras 4 intentos) y restablecer contraseñas de las gestoras.

### [2026-07-16] — Implementación de Métricas de Tiempo y Fechas (Dashboard & Context)
- **Cálculo automático de duración (Columna K):**
  - El sistema ahora genera la propiedad `tiempo` en formato `HH:mm:ss` para facilitar el análisis en bases de datos y Excel.
  - La lógica se inyectó a nivel global en `TicketContext.jsx`, interceptando los estados `En progreso` (crea `fechaInicio` y su timestamp) y `Resuelto/Cerrado` (crea `fechaFin` y calcula la diferencia matemática).
  - Soporte robusto para registros retrospectivos: Si se crea un ticket desde el formulario de registro rápido directamente en estado "Resuelto" con fechas manuales (strings `YYYY-MM-DD`), el Context parsea las fechas, genera los timestamps y arroja la misma métrica `HH:mm:ss`.
- **Nuevos campos en Modal de Gestión:**
  - Se agregó el campo visual de `fechaProgramada` (input tipo `date`) y `accion` (text-area para notas técnicas) dentro del componente `Gestion.jsx`, sincronizados correctamente con el backend local.

### [2026-07-01] — Refactorización Completa y Migración a React (Vite) ✅

- **Archivos:** Todo el directorio `src/`, `package.json`, `index.html`.
- **Cambio:**
  - **Framework:** El proyecto dejó de ser Vanilla JS y se reconstruyó desde cero sobre **React 18** usando **Vite**.
  - **Enrutamiento:** Se implementó `react-router-dom` para manejar la arquitectura multi-página (`/`, `/actividades`, `/gestion`, `/portal`).
  - **Estado Global:** Se reemplazó el uso intensivo de `window.DbService` y el paso de eventos nativos (`CustomEvent`) por el **Context API** (`TicketContext`), manteniendo sincronización en tiempo real entre componentes.
  - **Persistencia:** Se mantiene `localStorage` (DbService) como motor de base de datos local.
  - **Gráficos:** Se reemplazó el uso directo de `Chart.js` por `react-chartjs-2` instanciado a través de componentes en `StatCards.jsx`.
  - **Componentes:**
    - Panel Principal (`PanelPrincipal.jsx`, `WidgetMiEstado.jsx`, `WidgetSistemas.jsx`).
    - Página de Actividades (`Actividades.jsx`).
    - Gestión (`Gestion.jsx` con Kanban integrado y Modal reactivo).
    - Portal del Colaborador (`Portal.jsx` consolidado con lógica condicional reactiva).
  - **CSS:** Se mantuvo la arquitectura CSS intacta, logrando un refactor 1:1 de los estilos visuales mediante uso de `className`.
- **Razón:** Proveer al sistema de una arquitectura frontend moderna, predecible y altamente escalable para prepararlo hacia la integración futura con un backend real (Node/Express/PostgreSQL).

### [2026-07-02] — Correcciones de Interfaz y Lógica de Sincronización
- **Correcciones visuales en Portal y Database:**
  - Solucionado el ancho comprimido del formulario en el Portal sobreescribiendo el `display: flex` heredado del contenedor `#root`.
  - Reparado el import sensible a mayúsculas (`Logo.png`) que rompía el icono superior izquierdo del Portal.
  - Corregido el scroll vertical inoperante en `/database` al anular el `overflow: hidden` declarado en `html` y `body` del `reset.css`.
  - Restaurado el salto de línea y la proporción del "estilo hoja de cálculo" de la tabla de la Base de Datos.
- **Sincronización y Notificaciones:**
  - Eliminado el bug de 3 notificaciones simultáneas al registrar una solicitud. La lógica se centralizó en `actividadGuardada` dentro del `NotificationContext`.
  - Implementación de sincronización robusta entre pestañas (Dashboard y Portal) mediante el evento de `storage` para el array de notificaciones.

### [2026-07-16] — Campo "Cargo" en Solicitantes + Correcciones de Arranque
- **Archivos:** `DbService.js`, `TicketContext.jsx`, `Database.jsx`, `RegistroActividadForm.jsx`, `Portal.jsx`, `vite.config.js`.
- **Cambio:**
  - **Solicitantes con Cargo:** Los solicitantes ahora se almacenan como objetos `{nombre, cargo}` en `localStorage` (antes eran strings simples). Es retrocompatible con datos existentes.
  - **DbService.js:** `getSolicitantes` normaliza objetos a strings para los dropdowns (mismo patrón que `getResponsables`).
  - **TicketContext.jsx:** `addSolicitante` recibe objetos, `removeSolicitante` opera sobre raw localStorage. Nueva función `getSolicitanteCargo(nombre)` para lookup de cargo.
  - **Database.jsx:** Pestaña Solicitantes ahora incluye input de cargo y columna Cargo en la tabla. Lee `rawSolicitantes` de localStorage para mostrar objetos completos.
  - **Inyección de cargo en tickets:** Tanto `RegistroActividadForm.jsx` como `Portal.jsx` inyectan el `cargo` del solicitante al crear un ticket, visible en la tabla de Actividades del Database.
  - **Corrección de arranque:** Escapadas las backslashes en placeholders de `Portal.jsx` y `RegistroActividadForm.jsx` que causaban error de parseo octal en Vite 8.
  - **Vite config:** Excluida la carpeta `project-visualization/` del escaneo de dependencias para evitar errores de build.
- **Razón:** Permitir que los tickets reflejen el cargo del solicitante en las métricas y tablas de actividades.

---

## Junio 2026

### [2026-06-29] — Gráficas funcionales en el Dashboard con Chart.js
- Importación de Chart.js v4 y reescritura de `sparklines.js`.

### [2026-06-29] — Refactor: separación del dashboard en páginas independientes
- El dashboard dejó de ser una SPA de una sola página. Ahora cada módulo es una página real (`index.html`, `actividades.html`, `gestion.html`).

### [2026-06-29] — Centro de notificaciones funcional
- El icono de campana (`#notifBtn`) ahora es funcional y muestra un panel desplegable de notificaciones usando `localStorage`.

### [2026-06-23] — Refuerzo de Reglas en agent.md
- Protocolo CSS Obligatorio y 0 estilos inline.

### [2026-06-23] — Ocultamiento del Panel "Control Estado Sistemas"
- Ocultamiento vía CSS puro.

---

*(Para los registros detallados previos a junio de 2026, consultar archivo histórico).*
