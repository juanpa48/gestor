# Bitácora de Seguimiento (Progress Tracker)

## Últimos Objetivos Completados
- **Gestión de Usuarios (CRUD):** Se implementaron botones de "Editar", "Suspender" (Soft Delete) y "Eliminar" (Hard Delete) en el panel de Ajustes (`Settings.jsx`).
- **Unificación de Roles:** El sistema centraliza la creación de perfiles (Solicitantes, Gestores, Admins) en la base `db_usuarios`, alimentando automáticamente los Dashboards dinámicamente por área.
- **Gestión de SLAs y Tipificación ITIL:** Configuración de SLAs, tipificación, semáforos, pausas de SLA implementados en Dashboard y Portal.
- **Reactivación de Widget de Estado de Sistemas:** Habilitado para rol `admin_ti` en Panel Principal.
- **Módulo de Gestión Humana (Especialización):** Eliminación de Tipo y Prioridad para GH, límite estricto de SLA a 9h, y adición del flag `Novedad de Nómina`.

---

## 🚀 Bitácora de Progreso (Gestión Empresarial)

  - [x] **Fase 4: Documentación Obligatoria**
  - [x] Registrar cambio en `CHANGELOG.md` y `ARCHITECTURE.md`.

---

## Objetivo Completado: Motor de Exportación Avanzado y Carga Masiva
> **Contexto:** Habilitar la exportación dinámica (CSV/XLSX) aplanando campos anidados para métricas precisas. Y permitir a los administradores subir usuarios de forma masiva desde una plantilla de Excel (`.xlsx`).

- [x] **Motor de Exportación Dual:**
  - [x] Aplanamiento inteligente de columnas anidadas (ej. `detalles` de Gestión Humana).
  - [x] Exportación a `.csv` con codificación UTF-8 BOM y nombres autogenerados.
- [x] **Importador Masivo de Usuarios:**
  - [x] Modal UI y sistema de descarga de "Plantilla Base.xlsx" en `SettingsUsuarios.jsx`.
  - [x] Motor de lectura usando `FileReader` y la librería `xlsx`.
  - [x] Reglas de seguridad: Hasheo SHA-256 de la `Cédula` como contraseña, filtro anti-duplicados y rol `solicitante` por defecto.

---

## Objetivo Completado: Módulo de Convenios y Firma Digital
> **Contexto:** Se requiere construir el segundo formulario altamente especializado de GH ("Convenios") el cual involucra deducciones de nómina. Para dar respaldo legal, se implementará un componente de Firma Digital Canvas en el formulario del empleado y un Generador de Acta PDF en el Dashboard del Gestor.

- [x] **Fase 1: Construcción del Formulario de Convenios (`FormConvenio.jsx`)**
  - [x] Crear campos: Deducción de nómina, Valor, Cuotas, Periodicidad, Fechas.
  - [x] Implementar formateo automático de moneda ($ COP) en el campo Valor.
  - [x] Conectar `FormConvenio` al controlador `FormGH.jsx`.
- [x] **Fase 2: Implementación de la Firma Digital Legal**
  - [x] Integrar validación legal vía credenciales de login (password y cédula) como firma electrónica de alta seguridad.
  - [x] Agregar el texto de consentimiento legal en el formulario.
  - [x] Guardar estampas de tiempo (`firmaTimestamp` y `firmaISO`) para validación de no repudio.
- [x] **Fase 3: Generador de Evidencia en Dashboard**
  - [x] Diseñar el componente `ActaDeduccion.jsx` (Vista estilo documento legal).
  - [x] Modificar el Modal de `Gestion.jsx` para mostrar el botón "Generar Acta PDF" si el ticket es de convenio.
  - [x] Integrar ventana de impresión (`window.print()`) para descargar el PDF.

---

## Objetivo Completado: Refactorización "Área de Gestión / Grupo" a "Tipo de Solicitud"
> **Contexto:** Se detectó confusión en la terminología en la base de datos y la interfaz de usuario. Se solicitó el cambio masivo del término "Área de Gestión / Grupo" a "Tipo de Solicitud" garantizando la integridad de datos.
- [x] Modificar `SettingsManager.js` y `DbService.js`.
- [x] Modificar Formularios de Portal de Solicitante (`FormGH`, `FormGE`, `FormTI`).
- [x] Modificar componentes de Gestión, Actividades, Estadísticas y Dashboard Charts.
- [x] Conectar correctamente `tiposSolicitud` a los archivos `config.js` de las áreas.

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

---

## Nuevo Objetivo: Reestructuración del Reporte de Asistencia Diario
> **Contexto:** Se requiere separar el módulo de Asistencia Diaria del sistema de tickets (actividades) para evitar contaminación de la base de datos de Gestión Humana y mejorar la confiabilidad del tablero.

- [x] **Fase 1: Capa de Servicios y Desacoplamiento del Formulario**
  - [x] Añadir `getAsistenciaDiaria()` y `saveAsistenciaDiaria(data)` en `DbService.js`.
  - [x] Interceptar en `FormGH.jsx` y evitar crear ticket, guardando en su lugar en la nueva DB.
- [x] **Fase 2: Nuevo Motor del Tablero Kanban**
  - [x] Desvincular de `actividades` y conectar a `db_asistencia_diaria`.
  - [x] Reseteo matemático dinámico en `enrichedUsers` sin bucles.
- [x] **Fase 3: Portal UI y Limpieza de Deuda Técnica**
  - [x] Extraer lógica de botón "Marcar Fin" fuera del renderizado de tickets.
  - [x] Crear insignia "Actualmente en turno" reactiva a `db_asistencia_diaria`.
- [x] **Fase 4: Documentación Obligatoria**
  - [x] Registrar cambio en `CHANGELOG.md`.
  - [x] Actualizar `ARCHITECTURE.md`.
