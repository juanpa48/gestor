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

### Fases de Ejecución (Baby Steps)

- [ ] **Fase 1: Fundación y Servicios**
  - [ ] Inicializar dependencias (`react-router-dom`, `chart.js`, `react-chartjs-2`).
  - [ ] Migrar `DbService.js` manteniendo las Promesas y `localStorage`.
  - [ ] Configurar los Contextos globales (`TicketContext`, `NotificationContext`).
  - [ ] Migrar catálogo de trámites (`tramitesData.js`).

- [ ] **Fase 2: UI Global y Chrome del Dashboard**
  - [ ] Portar los archivos CSS al nuevo proyecto.
  - [ ] Componente `DashboardLayout` para envolver la app.
  - [ ] Componentes `Sidebar` y `Topbar`.
  - [ ] Componente funcional `NotificationCenter`.

- [ ] **Fase 3: Rutas del Dashboard**
  - [ ] Componente `PanelPrincipal` (Dashboard principal con widgets y charts).
  - [ ] Componente `Actividades` (Tabla y filtros).
  - [ ] Componente `Gestion` (Kanban, tabla y modal de edición).

- [ ] **Fase 4: Portal del Colaborador**
  - [ ] Layout público del portal.
  - [ ] Historial de tickets, formulario con lógica de firmas y áreas.
  - [ ] Widgets del estado del sistema y personal TI.

- [ ] **Fase 5: Notificaciones Nativas y Sincronización**
  - [ ] Lógica de AudioContext ("Do-Mi-Sol") y Notificaciones del navegador.
  - [ ] Sincronización inter-pestañas mediante evento `storage` nativo.

---

## Último objetivo completado
*(Ninguno en este nuevo repositorio)*
