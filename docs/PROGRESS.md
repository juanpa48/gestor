# Bitácora de Seguimiento (Progress Tracker)

## Últimos Objetivos Completados
- **Gestión de Usuarios (CRUD):** Se implementaron botones de "Editar", "Suspender" (Soft Delete) y "Eliminar" (Hard Delete) en el panel de Ajustes (`Settings.jsx`).
- **Unificación de Roles:** El sistema centraliza la creación de perfiles (Solicitantes, Gestores, Admins) en la base `db_usuarios`, alimentando automáticamente los Dashboards dinámicamente por área.
- **Gestión de SLAs y Tipificación ITIL:** Configuración de SLAs, tipificación, semáforos, pausas de SLA implementados en Dashboard y Portal.
- **Reactivación de Widget de Estado de Sistemas:** Habilitado para rol `admin_ti` en Panel Principal.
- **Módulo de Gestión Humana (Especialización):** Eliminación de Tipo y Prioridad para GH, límite estricto de SLA a 9h, y adición del flag `Novedad de Nómina`.

---

## 🚀 Bitácora de Progreso (Gestión Empresarial)

## Nuevo Objetivo: Módulo de Convenios y Firma Digital
> **Contexto:** Se requiere construir el segundo formulario altamente especializado de GH ("Convenios") el cual involucra deducciones de nómina. Para dar respaldo legal, se implementará un componente de Firma Digital Canvas en el formulario del empleado y un Generador de Acta PDF en el Dashboard del Gestor.

- [ ] **Fase 1: Construcción del Formulario de Convenios (`FormConvenio.jsx`)**
  - [ ] Crear campos: Deducción de nómina, Valor, Cuotas, Periodicidad, Fechas.
  - [ ] Implementar formateo automático de moneda ($ COP) en el campo Valor.
  - [ ] Conectar `FormConvenio` al controlador `FormGH.jsx`.
- [ ] **Fase 2: Implementación de la Firma Digital Legal**
  - [ ] Instalar e integrar `react-signature-canvas`.
  - [ ] Agregar el texto de consentimiento legal en el formulario.
  - [ ] Codificar la firma como imagen Base64 dentro del objeto `detalles`.
- [ ] **Fase 3: Generador de Evidencia en Dashboard**
  - [ ] Diseñar el componente `ActaDeduccion.jsx` (Vista estilo documento legal).
  - [ ] Modificar el Modal de `Gestion.jsx` para mostrar el botón "Generar Acta PDF" si el ticket es de convenio.
  - [ ] Integrar ventana de impresión (`window.print()`) para descargar el PDF.

---

## Objetivo Completado: Formularios Dinámicos de Gestión Humana (GH)
> **Contexto:** GH requiere 9 trámites altamente especializados. Cada trámite transforma el formulario añadiendo campos condicionales (ej. Fecha de Permiso, Hora Inicio/Fin, Cómo Compensa). Se implementará un patrón de Controlador Modular que empaqueta estos campos en un objeto JSON (`detalles`) en la tabla única.

- [x] **Fase 1: Arquitectura Base y Preparación del Controlador**
  - [x] Refactorizar `FormGH.jsx` para despachar componentes basados en `tipoTramite`.
  - [x] Preparar `handleSubmit` para recibir el objeto `detalles`.
- [x] **Fase 2: Componente Dinámico Piloto (`FormPermiso.jsx`)**
  - [x] Crear el formulario especializado de permisos.
  - [x] Consumir `cedula`, `celular`, `jefeInmediato` del usuario actual.
- [x] **Fase 3: Adaptación del Dashboard del Gestor**
  - [x] Modificar `Gestion.jsx` para imprimir el JSON `detalles` dinámicamente.
- [x] **Fase 4: Limpieza de Base de Datos**
  - [x] Limpiar sub-trámites en la UI de Ajustes.

---

## Nuevo Objetivo: Motor SLA Avanzado (ITIL)
- [x] **Horario Laboral:** Implementación matemática en `businessHours.js` para descontar horas nocturnas y fines de semana del SLA.
- [x] **Pausas Dinámicas:** Al cambiar a "Almuerzo", "Reunión" o "Ausente", se pausan automáticamente los tickets en progreso del gestor y se reanudan al cambiar a disponible.
- [x] **Módulo de Festivos:** Interfaz para que el administrador configure las fechas festivas y el SLA las descuente automáticamente.
- [x] **Reglas de Cierre ITIL:** Los tickets "Resueltos" pasan automáticamente a estado "Cerrado" pasadas las 72 horas.
- [x] **Métricas de Estados Completas:** Renderizado de tarjetas de estadísticas para todos los estados posibles en la vista de Dashboard (Actividades).
