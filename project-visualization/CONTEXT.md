# 🚀 CONTEXTO DEL PROYECTO — LEE ESTO PRIMERO

> Si eres un asistente de IA y vas a trabajar en este proyecto, sigue estos pasos en orden.
> Esto garantiza que entiendas el contexto completo antes de tocar código.

## Paso 1: Entiende de qué trata el proyecto

Lee `resumen.txt` → Explica el negocio, las áreas de trámites y la estrategia de desarrollo.

## Paso 2: Conoce las reglas técnicas

Lee `agent.md` → Stack técnico, estructura de archivos y reglas que debes seguir.

## Paso 3: Revisa los cambios recientes

Lee `CHANGELOG.md` → Qué se hizo recientemente y en qué archivos.

## Paso 4: Entiende las conexiones

Lee `docs/DEPENDENCIES.md` → Mapa de cómo se conectan los archivos entre sí y el flujo de datos.

## Paso 5: No "arregles" lo que es intencional

Lee `docs/DECISIONS.md` → Decisiones de diseño que parecen raras pero son a propósito.

---

## Orden de lectura rápido

| #   | Archivo                | ¿Para qué?                   |
| --- | ---------------------- | ---------------------------- |
| 1   | `resumen.txt`          | Contexto del negocio         |
| 2   | `agent.md`             | Reglas técnicas y estructura |
| 3   | `CHANGELOG.md`         | Cambios recientes            |
| 4   | `docs/DEPENDENCIES.md` | Conexiones entre archivos    |
| 5   | `docs/DECISIONS.md`    | Decisiones intencionales     |

---

## Estado actual del proyecto (Mayo 2026)

- ✅ Modularización de script.js: **COMPLETADA** (Archivo único eliminado).
- ✅ Refactorización HTML (Cleanup): **COMPLETADA** (Eventos inline eliminados de index.html).
- ✅ Dashboard funcional con arquitectura de Eventos y DbService (Promesas).
- ✅ Migración total de módulos JS al sistema de eventos: **COMPLETADA** (tickets.js, activity-table.js, dashboard.js 100% desacoplados).
- 🔲 Migración a backend real (Node.js/Express + PostgreSQL).
- ✅ Modularización CSS y Extracción de estilos (Dashboard y Portal): **COMPLETADA**
- ✅ Modularizar JS de portal_avanzado.html: **COMPLETADA** (0 líneas inline — 4 módulos: form-ui.js, submit.js, stats.js + tramites-data.js compartido)
