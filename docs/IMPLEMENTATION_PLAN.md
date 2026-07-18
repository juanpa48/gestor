# Plan de Implementación: Expansión Multi-Área

> **Estado actual:** Fase 0 COMPLETADA. La estructura de carpetas ya fue reorganizada.
> **Siguiente paso:** Fase 1 — Crear la Factory `createAreaContext.js`.

---

## Objetivo

Expandir el sistema de 1 área (Gestión Empresarial) a 3 áreas independientes usando un **patrón Factory** para evitar duplicar código.

| Área | Código | Color | Prefijo | Trámites |
|------|--------|-------|---------|----------|
| Gestión Empresarial | `ge` | `#6366f1` | `GE-001` | Los de `tramitesData.js` |
| Gestión Humana | `gh` | `#10b981` | `GH-001` | Vinculación, Desvinculación, Permiso ausentismo, Solicitud cesantías, Solicitud carta laboral, Solicitud vacaciones |
| Soporte TI | `ti` | `#3b82f6` | `TI-001` | Soporte (placeholder — el usuario lo definirá después) |

---

## Decisiones del Usuario (CONFIRMADAS)

1. **Sin migración de datos** — El usuario regenerará datos de prueba. Se empieza limpio con las nuevas claves de localStorage.
2. **Acceso por link directo** — Cada resolutor recibe su propia URL (`/dashboard/ge`, `/dashboard/gh`, `/dashboard/ti`). NO hay selector de área en el dashboard. El Sidebar solo muestra las opciones internas de ESA área.
3. **El Portal SÍ tiene selector** — Los colaboradores eligen entre las 3 áreas antes de ver el formulario.
4. **Solicitantes compartidos** — `db_solicitantes` es la misma lista para las 3 áreas (un colaborador puede solicitar a cualquier área).
5. **Responsables separados** — Cada área tiene su propio equipo resolutor (`db_responsables_ge`, `db_responsables_gh`, `db_responsables_ti`).

---

## Arquitectura: Factory Pattern

### Concepto clave
En vez de escribir 3 archivos de Context casi idénticos, se crea UNA función `createAreaContext(config)` en `shared/contexts/` que genera un Context + Provider + hook por cada área. Cada área la invoca con su configuración en 3 líneas.

### Personalización por niveles
- **Global** (Factory): Lógica compartida — CRUD, métricas de tiempo `HH:mm:ss`, interceptación de estados.
- **Config** (por área): Trámites, estados, prefijos, claves de localStorage, hooks opcionales (`onBeforeSave`, etc.).
- **Exclusivo** (componentes del área): Funcionalidad única como adjuntar archivos en GH.

---

## Estructura de Carpetas (YA IMPLEMENTADA en Fase 0)

```
src/
├── App.jsx
├── main.jsx
├── shared/                              ← NÚCLEO COMPARTIDO
│   ├── components/layout/               ← DashboardLayout, Sidebar, Topbar
│   ├── components/notifications/        ← NotificationCenter
│   ├── contexts/                        ← NotificationContext (y aquí irá createAreaContext.js)
│   ├── services/                        ← DbService, NotificationHelper
│   ├── hooks/                           ← useStorageSync
│   └── styles/                          ← CSS modular completo
├── areas/
│   ├── gestion-empresarial/
│   │   ├── components/                  ← StatCards, RegistroActividadForm, Widgets, Charts
│   │   └── pages/                       ← PanelPrincipal, Actividades, Gestion
│   ├── gestion-humana/                  ← (vacío, por crear)
│   └── soporte-ti/                      ← (vacío, por crear)
├── contexts/
│   └── TicketContext.jsx                ← TODAVÍA AQUÍ (se reemplaza en Fase 1 por GEContext)
├── pages/
│   ├── Portal.jsx
│   └── Database.jsx
├── components/portal/                   ← StaffStatus, SystemStatus, TicketForm, TicketHistory
└── data/
    ├── tramitesData.js
    └── areasConfig.js                   ← Registro maestro de las 3 áreas
```

---

## Datos (localStorage)

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

## Rutas

```
/portal                        → Selector de 3 áreas + formulario dinámico

/dashboard/ge                  → Panel Principal GE (link directo)
/dashboard/ge/actividades
/dashboard/ge/gestion

/dashboard/gh                  → Panel Principal GH (link directo)
/dashboard/gh/actividades
/dashboard/gh/gestion

/dashboard/ti                  → Panel Principal TI (link directo)
/dashboard/ti/actividades
/dashboard/ti/gestion

/database/ge                   → CRUD datos GE
/database/gh                   → CRUD datos GH
/database/ti                   → CRUD datos TI
```

---

## Fases de Implementación

### ✅ Fase 0: Reorganizar carpetas (COMPLETADA)
- Archivos movidos a `shared/` y `areas/gestion-empresarial/`.
- `areasConfig.js` creado.
- Todos los imports actualizados.
- Build exitoso verificado.

### ⬜ Fase 1: Crear la Factory + GEContext
1. Crear `shared/contexts/createAreaContext.js` — extraer TODA la lógica de `src/contexts/TicketContext.jsx` (CRUD, métricas de tiempo `formatDuration`, interceptación de estados, solicitantes, responsables) en una función factory que recibe un `config` con `storageKey`, `responsablesKey`, `prefijo`, etc.
2. Crear `areas/gestion-empresarial/config.js` con la configuración de GE (usar los valores de `areasConfig.js` + los trámites de `tramitesData.js`).
3. Crear `areas/gestion-empresarial/context/GEContext.jsx` — solo 3 líneas que invoquen la Factory con el config de GE.
4. Reemplazar TODOS los `import { useTickets } from '.../contexts/TicketContext'` en los componentes de GE por `import { useAreaTickets } from '.../GEContext'`.
5. Actualizar `main.jsx` para usar `GEProvider` en vez de `TicketProvider`.
6. Verificar que GE funciona exactamente igual.
7. Eliminar el viejo `TicketContext.jsx` cuando todo esté estable.

### ⬜ Fase 2: Portal con selector de área
- Añadir 3 tarjetas/botones al Portal debajo del logo (GE, GH, TI).
- Renderizar el formulario correspondiente al área elegida.
- GE: formulario actual. GH: con los 6 trámites definidos. TI: con "Soporte" (placeholder).

### ⬜ Fase 3: Dashboards + Rutas dinámicas
- Crear componentes genéricos en `shared/common/` (AreaDashboard, AreaGestion, AreaActividades).
- Cada área crea páginas wrapper que consumen los genéricos con su config.
- Implementar rutas `/dashboard/:area/...` en `App.jsx`.
- Sidebar muestra nombre y color del área activa.

### ⬜ Fase 4: Database multi-área
- Componente genérico `AreaDatabase.jsx` en `shared/common/`.
- Rutas `/database/:area`.

### ⬜ Fase 5: Pulir GH
- Campos exclusivos, adjuntar archivos, etc.

---

## Reglas Importantes para la IA que continúe

1. **PROHIBIDO estilos inline** (`style={{...}}`). Usar siempre `className` con las clases CSS de `shared/styles/`.
2. **Baby Steps**: Cada fase debe dejar la app funcional. Si algo falla, revertir.
3. **Actualizar `PROGRESS.md`** al terminar cada fase.
4. **Actualizar `CHANGELOG.md`** al terminar hitos importantes.
5. **Leer `docs/CONTEXT.md`** primero para entender el orden de lectura de documentación.
6. **No tocar `project-visualization/`** — es obsoleto.
7. **Fuente de verdad de trámites**: `src/data/tramitesData.js` (GE) y cada `config.js` de área.
