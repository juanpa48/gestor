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

## Paso 6: Mapa de Arquitectura

Lee `docs/ARCHITECTURE.md` → Diagramas y visión sistémica real validada.

## Paso 7: Manual de Ingeniería

Lee `docs/TECHNICAL_SPECS.md` → Patrones, riesgos, modelo de datos y reglas operativas.

## Paso 8: Plan de Implementación Activo

Lee `docs/IMPLEMENTATION_PLAN.md` → Plan detallado de la expansión multi-área (GE + GH + TI) con fases, decisiones confirmadas por el usuario, y la siguiente tarea pendiente.

---

## Orden de lectura rápido

| #   | Archivo                | ¿Para qué?                   |
| --- | ---------------------- | ---------------------------- |
| 1   | `resumen.txt`          | Contexto del negocio         |
| 2   | `agent.md`             | Reglas técnicas y estructura |
| 3   | `CHANGELOG.md`         | Cambios recientes            |
| 4   | `docs/DEPENDENCIES.md` | Conexiones entre archivos    |
| 5   | `docs/DECISIONS.md`    | Decisiones intencionales     |
| 6   | `docs/ARCHITECTURE.md` | Mapa de Arquitectura real    |
| 7   | `docs/TECHNICAL_SPECS.md`| Manual de Ingeniería / Riesgos|
| 8   | `docs/IMPLEMENTATION_PLAN.md`| Plan activo de expansión multi-área |

---

## Estado actual del proyecto (Julio 2026)

- ✅ **MIGRACIÓN A REACT COMPLETADA**: El proyecto ya no usa Vanilla JS. Todo se convirtió exitosamente a React (Vite).
- ✅ **React Router Integrado**: Múltiples páginas mapeadas a componentes específicos.
- ✅ **Context API Implementada**: Toda la orquestación de datos usa `TicketContext` y Hooks nativos.
- ✅ **Componentización Total**: Markup descompuesto en componentes funcionales reutilizables.
- ✅ **Métricas de Tiempo**: Cálculo automático de duración de tickets en formato `HH:mm:ss`.
- ✅ **Fase 0 Multi-Área Completada**: Estructura de carpetas reorganizada en `shared/` y `areas/`.
- 🟨 **EN CURSO: Fase 1** — Crear la Factory `createAreaContext.js`. Ver `docs/IMPLEMENTATION_PLAN.md`.
- 🔲 Migración a backend real (futuro). Actualmente sigue usando `localStorage` encapsulado en `DbService`.
