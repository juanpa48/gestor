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
