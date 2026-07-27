# Futuros Proyectos y Mejoras (Basado en ITIL)

Este documento contiene las sugerencias arquitectónicas de alto nivel para llevar la aplicación de gestión de tickets a un estándar de clase mundial (Enterprise ITSM), alineándose con las mejores prácticas de **ITIL** (Information Technology Infrastructure Library).

---

## 1. ~~Gestión de SLAs (Acuerdos de Nivel de Servicio)~~ ✅ IMPLEMENTADO
Actualmente, el sistema cuenta con un poderoso motor SLA (ITIL) que descuenta horas no laborales, fines de semana y festivos, además de contar con pausas dinámicas cuando el gestor cambia su estado personal. Los límites son configurables por prioridad, y específicos por área (ej. 9 horas para GH).

---

## 2. Historial de Actividad (Audit Trail / Work Notes) 📝
Transformar el ticket de un formulario estático a una "historia viva".

**Propuesta de implementación:**
- Reemplazar el campo estático de `detalles` (o complementarlo) con un hilo de comentarios tipo "chat" interno.
- Registrar automáticamente los cambios de estado: *(10:15 AM - Juan cambió el estado a "En Progreso")*.
- Permitir a los gestores añadir notas internas que el solicitante no ve *(Ej: "Esperando cotización del proveedor")*, y notas públicas que sí le lleguen al solicitante.
- **Beneficio:** Trazabilidad absoluta. Si un ticket se estanca, cualquier gestor puede leer el historial y saber exactamente qué ha pasado sin tener que preguntar.

---

## 3. ~~Diferenciación: Incidente vs. Requerimiento~~ ✅ IMPLEMENTADO
El sistema soporta la categorización ITIL (Incidente / Problema vs Requerimiento / Solicitud) a través del registro rápido en el Dashboard, forzando la asignación de prioridad (Alta para incidentes, Media para requerimientos). Faltaría expandirlo al portal de colaboradores.

---

## 4. Base de Conocimiento (Knowledge Base / Tier 0 Support) 📚
El principio "Shift-Left" de ITIL busca resolver los problemas antes de que lleguen a los resolutores.

**Propuesta de implementación:**
- Crear un módulo de **Preguntas Frecuentes (FAQ)** o artículos cortos.
- Cuando el usuario entre al Portal e intente crear un ticket (ej. seleccione el trámite "Problema con Contraseña"), el sistema le sugiere leer primero el artículo *"Cómo resetear tu contraseña en 3 pasos"*.
- **Beneficio:** Reducción drástica del volumen de tickets (ticket deflection). El equipo de soporte ahorra tiempo al no tener que responder problemas repetitivos y triviales.

---

## 5. Flujos de Aprobación (Approvals) ✅
Para solicitudes que impliquen gastos o permisos de seguridad.

**Propuesta de implementación:**
- Añadir un estado de `Esperando Aprobación`.
- Si alguien pide un equipo nuevo (Hardware) o acceso a una carpeta confidencial, el ticket no pasa directamente a "Pendiente" para el equipo TI, sino que le envía una alerta a un gerente para que presione "Aprobar" o "Rechazar".
- **Beneficio:** Evita que el equipo resolutor asuma la responsabilidad de autorizar gastos o permisos que le corresponden a la gerencia.
