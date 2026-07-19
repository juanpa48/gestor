# 📐 Decisiones de Diseño (ADR) — Gestión Empresarial

> **REGLA:** Antes de "arreglar" algo que parece raro en el código, verifica aquí si fue una decisión intencional.
> Formato: Architecture Decision Record (ADR)
> Última actualización: 2026-05-15

---

## DEC-001: localStorage como base de datos provisional (Frontend App)
- **Estado:** ✅ Vigente
- **Fecha:** Mayo 2026
- **Contexto:** El proyecto ha evolucionado para ser una Web App Frontend tradicional. Se requería una forma de almacenar datos durante el desarrollo sin necesitar un backend configurado.
- **Decisión:** Usar `localStorage` del navegador para todas las operaciones de persistencia. Se utiliza un módulo de servicio de datos (`js/db-service.js`) que encapsula la lectura y escritura.
- **Consecuencias:**
  - ✅ Desarrollo rápido y 100% offline, sin latencia de red.
  - ✅ La interfaz y componentes funcionan de forma idéntica a cómo lo harían con un backend real.
  - ❌ Los datos se pierden si el usuario limpia el navegador.
  - ❌ Los datos solo existen en el navegador local (no compartidos entre máquinas).
- **Migración futura:** Reemplazar el `db-service.js` con llamadas reales `fetch()` a una API REST (Node.js/Express + PostgreSQL). El código está diseñado para que este cambio solo requiera modificar los métodos de servicio.

---

## DEC-008: Arquitectura multi-página (separar el dashboard SPA en páginas)
- **Estado:** ❌ OBSOLETA (Reemplazada por DEC-009)
- **Fecha:** Junio 2026
- **Contexto:** En la era de Vanilla JS, se separó el `index.html` en múltiples páginas HTML.
- **Resolución:** Con la migración a React (Julio 2026), volvimos a una SPA (Single Page Application) enrutada por `react-router-dom`. Ahora las páginas son componentes (`PanelPrincipal.jsx`, `Actividades.jsx`, etc.) orquestados bajo el `DashboardLayout.jsx`.

---

## DEC-002: CSS y JS inline en portal_avanzado.html
- **Estado:** ❌ OBSOLETA (Reemplazada por DEC-009)
- **Resolución:** El portal fue refactorizado a `Portal.jsx` en React.

---

## DEC-003: Arrays de trámites duplicados
- **Estado:** ❌ OBSOLETA (Reemplazada por DEC-011)
- **Contexto:** Se usaba `tramitesData.js` estático.
- **Resolución:** Eliminado. Reemplazado por `SettingsManager.js` que guarda trámites dinámicamente.

---

## DEC-007: Conflicto CSS entre reset.css (dashboard) y portal-theme.css (portal)
- **Estado:** ✅ Resuelto (Mayo 2026)
- **Fecha:** Mayo 2026
- **Contexto:** El `reset.css` del dashboard aplica `overflow: hidden` y `display: flex` al `html, body` para implementar el scroll interno de la app (la página completa no hace scroll, sino las secciones internas). Cuando el portal empezó a usar `css/main.css` (que importa `reset.css`), heredó estos estilos y perdió su scroll.
- **Decisión:** Sobreescribir en `body.portal` dentro de `portal-theme.css` los estilos conflictivos:
  - `display: block` (reemplaza el `flex` del dashboard)
  - `overflow-y: auto` (reemplaza el `hidden` del dashboard)
  - `overflow-x: hidden`
  Como `portal-theme.css` se carga después de `main.css`, el selector `body.portal` (más específico que `body`) tiene precedencia.
- **Consecuencias:**
  - ✅ El portal recupera el scroll normal de página
  - ✅ El dashboard no se ve afectado (no tiene clase `.portal`)
  - ✅ Un solo punto de corrección en `portal-theme.css`
- **Regla:** Si en el futuro se agrega otra página que use `css/main.css` y necesite scroll normal, aplicar el mismo patrón de override en su tema CSS específico.

---

## DEC-004: AudioContext en vez de Audio() para notificaciones
- **Estado:** ✅ Vigente (requerido por Chrome)
- **Fecha:** Mayo 2026
- **Contexto:** Chrome bloquea la reproducción automática de audio (`new Audio().play()`) si el usuario no ha interactuado primero con la página. Esto impedía que las notificaciones sonoras funcionaran.
- **Decisión:** Usar `AudioContext` con osciladores para generar tonos programáticos (Do-Mi-Sol). Se solicita permiso de notificación al primer clic del usuario.
- **Ubicación:** `script.js` → `NotificationHelper.playPing()` (líneas 1262-1296)
- **Consecuencias:**
  - ✅ Funciona en Chrome sin restricciones (después del primer clic)
  - ✅ No requiere archivos de audio externos
  - ❌ El sonido es sintético, no un audio grabado
- **NO cambiar a:** `new Audio('archivo.mp3')` — Chrome lo bloqueará.

---

## DEC-005: Prefijos de ID diferentes (TKT vs REQ)
- **Estado:** ✅ Intencional
- **Fecha:** Mayo 2026
- **Contexto:** Los tickets creados desde el dashboard usan `TKT-XXX` y los creados desde el portal usan `REQ-XXX`.
- **Decisión:** Mantener prefijos diferentes para distinguir el origen del ticket.
- **Ubicaciones:**
  - Dashboard → `script.js` línea 57: `'TKT-' + String(acts.length + 1).padStart(3, '0')`
  - Portal → `portal_avanzado.html` línea 884: `'REQ-' + String(acts.length + 1).padStart(3, '0')`
- **Consecuencias:**
  - ✅ Se puede saber de dónde vino cada ticket con solo ver el ID
  - ❌ Puede confundir si no se documenta (ahora ya está documentado aquí)
- **NO unificar** los prefijos sin discutirlo primero.

---

## DEC-006: Evento `storage` para comunicación entre pestañas
- **Estado:** ✅ Vigente
- **Fecha:** Mayo 2026
- **Contexto:** Cuando un colaborador envía un ticket desde el portal (pestaña 1), la administradora necesita recibir una notificación en el dashboard (pestaña 2) sin recargar la página.
- **Decisión:** Usar el evento nativo `window.storage` que se dispara automáticamente cuando otra pestaña modifica `localStorage`. El dashboard escucha cambios en `db_actividades` y compara la longitud del array viejo vs nuevo.
- **Ubicación:** `script.js` → líneas 1300-1326
- **Consecuencias:**
  - ✅ Comunicación en tiempo real entre pestañas sin WebSockets
  - ✅ Cero infraestructura adicional
  - ❌ Solo funciona entre pestañas del mismo navegador/máquina
  - ❌ El evento `storage` NO se dispara en la pestaña que hizo el cambio (solo en las demás)
- **Migración futura:** Cuando se implemente el backend real, reemplazar con WebSockets o Server-Sent Events (SSE).

---

## DEC-009: Migración Completa a React (Vite)
- **Estado:** ✅ Vigente
- **Fecha:** Julio 2026
- **Contexto:** El código Vanilla JS con listeners manuales y manipulación directa del DOM era insostenible para un sistema multi-área.
- **Decisión:** Refactorizar el 100% del frontend a React 18 usando Vite.
- **Consecuencias:**
  - ✅ Componentización real y código ultra-limpio.
  - ✅ Estado reactivo impecable gracias a `Context API`.
  - ❌ El "Plan de Modularización Futuro" en Vanilla JS fue descartado permanentemente.

---

## DEC-010: Autenticación Local con SHA-256
- **Estado:** ✅ Vigente
- **Fecha:** Julio 2026
- **Contexto:** El sistema requería seguridad para que las gestoras de un área no pudieran ver ni modificar los datos de otras áreas.
- **Decisión:** Al no tener backend real, se implementó `AuthContext.jsx` que almacena contraseñas en `localStorage` usando el API de Criptografía Web (SHA-256). Los usuarios se bloquean a los 4 intentos fallidos.
- **Consecuencias:**
  - ✅ Autenticación sorprendentemente segura y realista sin servidor.
  - ✅ El `admin_ti` (Soporte TI) recibe herramientas para gestionar estos bloqueos en el UI.

---

## DEC-011: Configuración Dinámica de Trámites
- **Estado:** ✅ Vigente
- **Fecha:** Julio 2026
- **Contexto:** Requerir intervención de un programador para cambiar los trámites (`tramitesData.js`) era ineficiente.
- **Decisión:** Se creó el `SettingsManager.js` y el componente visual `Settings.jsx`. Los trámites y sus grupos ahora viven en `db_settings` (`localStorage`). Los menús del portal se nutren automáticamente de esta llave en tiempo real.
