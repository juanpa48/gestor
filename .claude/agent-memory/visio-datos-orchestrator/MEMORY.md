# Sistema de Gestión de Trámites - Gestión Empresarial - Memoria del Proyecto

## Estructura del Proyecto

### Arquitectura "Local First"
El proyecto utiliza una estrategia de desarrollo local primero, donde los archivos en `/entorno_local` sirven como prototipos rápidos usando `localStorage`. El sistema está diseñado para gestionar solicitudes de trámites legales y administrativos para el área de Gestión Empresarial.

---

## Entorno Local (`/entorno_local/`)

### Archivos Principales

| Archivo | Proposito |
|---------|-----------|
| `portal_avanzado.html` | Portal del Colaborador - envía solicitudes de trámites, ve estado de sistemas y equipo. |
| `script.js` | Mock de google.script.run + lógica del Dashboard de Gestión. |
| `database.html` | Visor/administrador de datos en localStorage (Simulación de DB). |
| `styles.css` | Estilos globales del sistema (Glassmorphism). |

### Base de Datos Local (localStorage)

| Clave | Descripcion | Estructura |
|-------|-------------|------------|
| `db_actividades` | Trámites/solicitudes | Array de objetos con id, fechaCreacion, solicitante, trámite, estado, prioridad, responsable, etc. |
| `db_solicitantes` | Lista de contadores/empleados | Array de strings |
| `db_responsables` | Equipo de Gestión Empresarial | Array de objetos: `{nombre, cargo, foto}` |
| `db_tramites` | Tipos de trámites predefinidos | Array de strings (Área 1 y Área 2) |
| `db_sistemas` | Estado de servicios críticos | Objeto: `{servidor: {estado, mensaje}, contable: {...}, red: {...}}` |
| `db_estado_personal` | Disponibilidad del equipo | Objeto: `{nombre: {estado, label}}` |

---

## Áreas de Responsabilidad

### Área 1 (Trámites Estructurales)
- Creación/Cancelación de empresas, Devolución saldo a favor, RUT primera vez, Constitución establecimientos, Reformas, Capitalización, RUP/RUB, etc.

### Área 2 (Trámites Operativos)
- Actualización RUT, Resolución facturación, Facturas electrónicas, Documento soporte, Certificados, Firmas de documentos.

**Requisitos Críticos:**
- Firmas: Deben incluir la ruta de la carpeta en la unidad T.
- Formato: Solo se acepta formato PDF.
- Descripción: Debe ser lo más específica posible.

---

## Esquema de Datos (Estructura de Columnas)

El sistema mantiene una estructura compatible con hojas de cálculo para facilitar la migración:

| Columna | Campo | Tipo |
|---------|-------|------|
| A (0) | Fecha de Creación | auto |
| B (1) | Solicitante | texto |
| C (2) | Cargo | texto |
| D (3) | Solicitud (Descripción) | texto |
| E (4) | Prioridad | texto |
| F (5) | Estado | texto |
| G (6) | Área de Gestión | texto |
| H (7) | Tipo de Trámite | texto |
| I (8) | Fecha de Inicio | fecha |
| J (9) | Fecha de Finalización | fecha |
| K (10) | Tiempo de Respuesta | calculado |
| L (11) | Clasificación | texto |
| M (12) | Observaciones | texto (reemplaza Acción Técnica) |
| N (13) | Fecha Programada | texto |
| O (14) | Ruta T / Anexos | texto |
| P (15) | Responsable Asignado | texto |

---

## Componentes del Sistema

### Portal del Colaborador (`portal_avanzado.html`)
- Formulario adaptado para trámites empresariales.
- Validaciones para "Firma de documentos" (Ruta T y PDF).
- Estado de servicios y equipo de gestión en tiempo real.

### Gestión Dashboard (`index.html` / `script.js`)
- Panel de indicadores (Canvas) para medir resoluciones y carga de trabajo.
- Gestión de tickets con vista Kanban.
- Buscador y filtrado por área de responsabilidad.

---

## Diseno Visual (Glassmorphism)
- Fondo con gradientes radiales y paneles con `backdrop-filter: blur()`.
- Paleta: Rojo (#e8192c), Navy (#1e3a5f), Verde (#22c55e).
- Micro-animaciones para transiciones de estado.

---

## Notas de Implementacion

1. **Transición Local:** El mock en `script.js` debe actualizarse para reflejar las nuevas categorías de trámites.
2. **Eliminación de IT:** Se debe eliminar el concepto de "Acción Técnica" y reemplazarlo por "Observaciones" o "Detalle del Trámite".
3. **Validación Documental:** El sistema debe enfatizar el uso de la unidad T para firmas.

---

## Rutas de Archivos
```
/home/laboratirio-ubuntu/Documentos/Gestion empresarial 1.0/
├── agent.md                    # Instrucciones para la IA
├── resumen.txt                 # Resumen ejecutivo del proyecto
├── entorno_local\
│   ├── portal_avanzado.html    # Interfaz de usuario
│   ├── script.js               # Lógica y Mocks
│   ├── index.html              # Dashboard principal
│   └── database.html           # Administrador de datos
└── .claude/agent-memory/.../MEMORY.md
```