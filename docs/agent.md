# Gestión Empresarial — Instrucciones para IA

> Sistema de gestión de trámites para el departamento de Gestión Empresarial.
> Apoya a contadores en diligencias legales y administrativas (RUT, RUP, reformas, firmas, etc.)

## Stack Técnico (React)
- **Frontend:** React 18 (Vite) + Context API + react-router-dom
- **UI:** CSS (Glassmorphism) mediante `className` (sin Tailwind)
- **Gráficos:** react-chartjs-2
- **Seguridad:** Autenticación local con hashing SHA-256 (`AuthContext.jsx`)
- **Backend actual:** localStorage (mock de backend vía `DbService` y `SettingsManager`)
- **Backend futuro:** Node.js/Express + PostgreSQL
- **Servidor local dev:** `npm run dev` (Vite, puerto 5173 por defecto)
- **Diseño:** Dashboard oscuro (`/`) | Portal claro (`/portal`)

## Estructura del Proyecto
```
/
├── docs/
│   ├── CONTEXT.md                   ← 🚀 PUNTO DE ENTRADA — La IA debe leer esto primero
│   ├── CHANGELOG.md                 ← Historial de cambios
│   ├── agent.md                     ← Este archivo (reglas técnicas)
│   ├── DEPENDENCIES.md              ← Mapa de conexiones entre componentes
│   ├── DECISIONS.md                 ← Decisiones de diseño (NO "arreglar" sin leer)
│   └── PROGRESS.md                  ← Bitácora de seguimiento
├── src/
│   ├── components/                  ← Componentes React reutilizables (layout, dashboard)
│   ├── contexts/                    ← ActiveAreaContext, AuthContext, TicketContext
│   ├── pages/                       ← Vistas enrutadas (Portal, PanelPrincipal, Actividades, Gestion, Settings, Login)
│   ├── services/                    ← DbService.js, SettingsManager.js (Persistencia async local)
│   └── styles/                      ← Arquitectura CSS Modular (main.css)
├── package.json
└── vite.config.js
```

## ⚠️ Antes de Cualquier Cambio
1. **Leer** `docs/DEPENDENCIES.md` → Saber qué archivos se afectan.
2. **Leer** `docs/DECISIONS.md` → Verificar si algo "raro" es intencional.
3. **Verificar** si el cambio afecta más de 1 componente.
4. **Regla de ORO Documental:** Al finalizar CUALQUIER fase u objetivo importante, es **OBLIGATORIO** actualizar todos los archivos `.md` de la carpeta `docs/` para que reflejen la nueva realidad del código, evitando confundir a futuras IAs.

## 🤖 Metodología de Trabajo AI-Friendly (Baby Steps)
Para garantizar el éxito en desarrollos complejos y EVITAR errores por límite de tokens (cortes a medio camino), TODO objetivo debe seguir esta metodología:
1. **Análisis:** Comprender exhaustivamente el código base antes de codificar.
2. **Planeación Fases:** Diseñar un plan estructurado en Fases y Pasos enumerados lógicamente según el análisis.
3. **Archivo de Seguimiento (Tracker):** Usar el tracker `docs/PROGRESS.md` como bitácora. Marcar con `[x]` el avance.
4. **Desarrollo Atómico y Margen de Seguridad (Token-Safe):** Fragmentar el trabajo para que cada paso consuma aproximadamente un **70% u 80% de su límite normal de tokens**.
5. **Aprobación Incremental:** Pausar al final de cada sub-paso para recibir la orden y continuar. Nunca emitir una refactorización masiva inyectada en todo un turno.

## Reglas Críticas

### 🚫 REGLA ABSOLUTA — CERO ESTILOS INLINE

> Esta regla aplica tanto en la versión anterior (Vanilla) como en la actual (React).
> **VIOLAR ESTA REGLA ES UN ERROR GRAVE**.

**ESTÁ PROHIBIDO** usar el atributo `style={{ ... }}` en componentes de React (`src/pages/*`, `src/components/*`), a excepción estricta de animaciones de montaje muy específicas (ej. `animationDelay`) u ocultamiento dinámico duro donde las clases no apliquen.

Siempre se debe preferir el uso de `className` asociado a los archivos CSS existentes.

---

### 🖌️ Protocolo Obligatorio para CSS

La arquitectura CSS Vanilla se portó intacta a React. Identifica la superficie:

| Superficie | Archivo CSS correcto |
|---|---|
| Dashboard — Layout/Estructura | `src/styles/layout/sidebar.css`, `topbar.css`, `grids.css` |
| Dashboard — Componentes visuales | `src/styles/components/cards.css`, `forms.css`, `buttons.css`, `widgets.css` |
| Portal (`/portal`) | `src/styles/themes/portal-theme.css` |
| Global (tokens) | `src/styles/base/variables.css` |

**Para AGREGAR un estilo nuevo:**
1. Identifica el archivo CSS correspondiente en `src/styles/`.
2. Crea una clase con nombre semántico.
3. Escribe la regla en ese archivo CSS.
4. Asigna la clase vía `className` en el componente React.

---

### Frontend (🎨)
- NUNCA modificar el diseño Glassmorphism existente sin autorización.
- El Portal (`/portal`) muta la clase del body en su `useEffect` (`document.body.className = 'portal'`).
- Mantener compatibilidad visual 1:1 con el diseño aprobado.

### Datos y Seguridad (⚙️)
- El Contexto `TicketContext.jsx` es el motor central de estado de tickets.
- La Seguridad recae en `AuthContext.jsx` y `ProtectedRoute.jsx`.
- localStorage es el backend actual vía `DbService.js` (Tickets) y `SettingsManager.js` (Ajustes).
- Catálogo: Los trámites ya NO están quemados en código. Viven en `db_settings` gestionados por el `SettingsManager.js`.

### Calidad (🐛)
- Probar cambios corriendo `npm run dev`.
- Verificar consistencia entre vistas (`/` y `/portal`).

## Áreas de Negocio
- **Área 1 (Estructurales/Legales):** Creación de empresas, RUT, representante legal, reforma de estatutos, RUP/RUB, etc.
- **Área 2 (Operativos/Documentales):** Actualización RUT, facturación, certificados, firmas (requiere ruta T + formato PDF).
- Detalle completo en: `resumen.txt`

---

## 📝 Después de Cada Cambio — Documentación Obligatoria

Cuando termines de hacer cambios en el código, ANTES de decirle al usuario que terminaste, verifica esta lista:

- [ ] **docs/CHANGELOG.md** → ¿Registraste qué cambiaste, en qué archivos y por qué?
- [ ] **docs/DEPENDENCIES.md** → ¿Cambiaste cómo se conectan los archivos? Si sí, actualízalo.
- [ ] **docs/DECISIONS.md** → ¿Tomaste una decisión de diseño que podría parecer rara? Documéntala.
- [ ] **docs/CONTEXT.md** → ¿Cambió el estado general del proyecto?