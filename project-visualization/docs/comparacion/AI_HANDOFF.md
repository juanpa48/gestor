# Guía para Futuras IAs

Esta guía resume cómo entrar al proyecto sin perder tiempo ni romper decisiones ya tomadas.

## 1. Qué es este proyecto

Es una web app local para gestionar trámites de Gestión Empresarial con dos superficies principales:

- dashboard administrativo
- portal de colaboradores

La persistencia actual usa `localStorage`, no backend real.

## 2. Qué debes leer primero

1. `CONTEXT.md`
2. `resumen.txt`
3. `agent.md`
4. `docs/ARCHITECTURE.md`
5. `docs/TECHNICAL_SPECS.md`
6. `docs/DEPENDENCIES.md`
7. `docs/DECISIONS.md`

## 3. Qué no debes asumir

- que existe backend real
- que la documentación histórica siempre coincide con el código
- que todo el proyecto sigue limpio del branding “IT Command”
- que `database.html` sigue el mismo patrón del dashboard

## 4. Puntos críticos del código

- `window.DbService` es la frontera de datos.
- `tramites-data.js` es la fuente única de trámites.
- El dashboard depende de eventos para refrescar módulos.
- El portal mezcla modularidad con funciones globales compartidas.
- `database.html` accede directo a `localStorage`.

## 5. Eventos de dominio relevantes

- `actividadGuardada`
- `ticketActualizado`
- `sectionChanged`
- `nuevoTicketExterno`
- `ticketSeleccionado`

Nota:

- `ticketSeleccionado` hoy se emite desde la búsqueda, pero no tiene listener activo en el código revisado.

## 6. Riesgos que debes vigilar antes de cambiar algo

- IDs de DOM rotos entre HTML y módulos
- sanitización incompleta con `innerHTML`
- datos duplicados por concurrencia entre pestañas
- fechas guardadas con formato dependiente de locale
- diferencias entre naming de negocio y naming heredado de la plantilla

## 7. Estrategia segura de cambio

1. Verifica el HTML y los módulos implicados.
2. Comprueba si hay eventos o claves de storage asociadas.
3. Revisa `DEPENDENCIES.md` y `DECISIONS.md`.
4. Actualiza documentación si cambias arquitectura, flujos o responsabilidades.
