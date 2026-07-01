# Gestión Empresarial — Instrucciones para IA

> Sistema de gestión de trámites para el departamento de Gestión Empresarial.
> Apoya a contadores en diligencias legales y administrativas (RUT, RUP, reformas, firmas, etc.)

## Stack Técnico
- **Frontend:** HTML + CSS (Glassmorphism) + JavaScript vanilla
- **Backend actual:** localStorage (mock de google.script.run) — Ver DEC-001
- **Backend futuro:** Node.js/Express + PostgreSQL
- **Servidor local:** Express en puerto 3000 (`server.js`)
- **Diseño:** Dashboard oscuro (index.html) | Portal claro (portal_avanzado.html)

## Estructura del Proyecto
```
/
├── CONTEXT.md                   ← 🚀 PUNTO DE ENTRADA — La IA debe leer esto primero
├── CHANGELOG.md                 ← Historial de cambios
├── agent.md                     ← Este archivo (reglas técnicas)
├── resumen.txt                  ← Contexto del negocio (áreas, trámites)
├── docs/
│   ├── DEPENDENCIES.md          ← Mapa de conexiones entre archivos
│   └── DECISIONS.md             ← Decisiones de diseño (NO "arreglar" sin leer)
├── entorno_local/
│   ├── index.html               ← Dashboard administrativo
│   ├── portal_avanzado.html     ← Portal del colaborador (CSS/JS inline)
│   ├── script.js                ← Lógica central (solo controla index.html)
│   ├── styles.css               ← Estilos del dashboard
│   ├── database.html            ← Admin de datos (independiente)
│   └── portal.html              ← Portal antiguo (posiblemente en desuso)
├── server.js                    ← Express server
└── package.json
```

## ⚠️ Antes de Cualquier Cambio
1. **Leer** `docs/DEPENDENCIES.md` → Saber qué archivos se afectan
2. **Leer** `docs/DECISIONS.md` → Verificar si algo "raro" es intencional
3. **Verificar** si el cambio afecta más de 1 archivo (especialmente datos duplicados)
4. **Actualizar** `CHANGELOG.md` después de cada cambio importante

## 🤖 Metodología de Trabajo AI-Friendly (Baby Steps)
Para garantizar el éxito en desarrollos complejos y EVITAR errores por límite de tokens (cortes a medio camino), TODO objetivo debe seguir esta metodología:
1. **Análisis:** Comprender exhaustivamente el código base antes de codificar.
2. **Planeación Fases:** Diseñar un plan estructurado en Fases y Pasos enumerados lógicamente según el análisis.
3. **Archivo de Seguimiento (Tracker):** Usar un *único archivo de texto plano* temporal (ej. `PROGRESS.md`) en la raíz como bitácora. Marcar con `[x]` el avance. Al lograr el objetivo, limpiarlo para re-usarlo.
4. **Desarrollo Atómico y Margen de Seguridad (Token-Safe):** La IA es libre de decidir la cantidad de pasos/fases, pero debe fragmentar y calcular el trabajo para que cada paso programado consuma aproximadamente un **70% u 80% de su límite normal de tokens**. Este ~20% restante no significa que la IA debe detenerse a medias dejando archivos truncados; funciona como un **margen o colchón de seguridad**. Puesto que a veces la carga de código es impredecible y consume más de lo planeado (llegando al 95% o 100%), pre-diseñar las tareas al 70-80% salva el exceso y evita que una tarea pesada sature el límite cortando el trabajo abruptamente de la nada. Ante la duda, divídelo en más pasos.
5. **Aprobación Incremental:** Pausar al final de cada sub-paso para recibir la orden ("procede con el paso X y Y") y continuar. Nunca emitir una refactorización masiva inyectada en todo un turno.

## Reglas Críticas

### Frontend (🎨)
- NUNCA modificar el diseño Glassmorphism existente sin autorización
- `portal_avanzado.html` tiene CSS/JS inline (DEC-002) — no intentar "limpiar" esto
- Mantener compatibilidad con modo oscuro en `index.html`
- Toda clase CSS nueva debe seguir los patrones existentes en `styles.css`

### Datos (⚙️)
- localStorage es el backend actual (DEC-001) — no es un error
- `tramitesArea1`/`tramitesArea2` están duplicados en `script.js` Y `portal_avanzado.html` (DEC-003) — **cambiar en AMBOS archivos**
- IDs de tickets: `TKT-XXX` (dashboard) vs `REQ-XXX` (portal) — intencional (DEC-005)
- Audio usa `AudioContext`, NO `new Audio()` — política de Chrome (DEC-004)

### Calidad (🐛)
- Probar cambios en AMBAS vistas: `index.html` Y `portal_avanzado.html`
- Verificar que notificaciones sigan funcionando (evento `storage` entre pestañas)
- No romper la comunicación portal → dashboard (DEC-006)
- Usar `escapeHtml()` para todo contenido dinámico renderizado en el DOM

## Áreas de Negocio
- **Área 1 (Estructurales/Legales):** Creación de empresas, RUT, representante legal, reforma de estatutos, RUP/RUB, etc.
- **Área 2 (Operativos/Documentales):** Actualización RUT, facturación, certificados, firmas (requiere ruta T + formato PDF)
- Detalle completo en: `resumen.txt`

---

## 📝 Después de Cada Cambio — Documentación Obligatoria

Cuando termines de hacer cambios en el código, ANTES de decirle al usuario que terminaste, verifica esta lista:

- [ ] **CHANGELOG.md** → ¿Registraste qué cambiaste, en qué archivos y por qué?
- [ ] **docs/DEPENDENCIES.md** → ¿Cambiaste cómo se conectan los archivos? ¿Agregaste un archivo nuevo? Si sí, actualízalo.
- [ ] **docs/DECISIONS.md** → ¿Tomaste una decisión de diseño que podría parecer rara? Si sí, documéntala como un nuevo DEC-XXX.
- [ ] **CONTEXT.md** → ¿Completaste una tarea del "Estado actual"? Si sí, mueve el 🔲 a ✅.

Si no aplica alguno, no lo toques. Pero SIEMPRE actualiza el CHANGELOG.