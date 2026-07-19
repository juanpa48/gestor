# Especificaciones Técnicas (React / Julio 2026)

Este documento desglosa la implementación actual del proyecto desde una perspectiva operativa: módulos, patrones, flujo de datos, acoplamiento, convenciones, escalabilidad y riesgos. Su objetivo es servir como manual de ingeniería definitivo para desarrolladores humanos e IAs.

## 1. Stack Tecnológico Actual

- **Frontend:** React 18, React Router v6.
- **UI:** CSS3 modular (Arquitectura por capas Glassmorphism), preservado de la versión Vanilla.
- **Servidor Local:** Vite (Puerto 5173/5174).
- **Persistencia:** `localStorage` del navegador.
- **Comunicación en Tiempo Real:** Evento nativo `storage` para sincronización inter-pestañas.
- **Notificaciones:** API de Notificaciones del navegador + `AudioContext` para alertas sonoras.
- **Seguridad:** SHA-256 (Web Crypto API) para hasheo de contraseñas local.

## 2. Patrones de Diseño Implementados

### Context API (State Management)
Uso de múltiples contextos para aislar responsabilidades y evitar el *prop drilling*:
- `TicketContext.jsx`: Orquesta el CRUD de tickets (actividades).
- `AuthContext.jsx`: Controla sesión actual, encriptación y acceso a rutas protegidas.
- `ActiveAreaContext.jsx`: Factory dinámico que expone los datos del área actual basada en la URL.
- `NotificationContext.jsx`: Maneja notificaciones visuales y sonoras (mediante `useStorageSync.js`).

### Service Layer / Facade
- `DbService.js` centraliza el acceso a datos asíncronos para Tickets y Usuarios.
- `SettingsManager.js` gestiona la base de datos de configuraciones de cada área.
Ambos aíslan a los componentes React del mecanismo de almacenamiento subyacente.

## 3. Estructura y Responsabilidad de Módulos

### Dashboard Administrativo (`/dashboard/:area`)
- `DashboardLayout.jsx`: Shell principal de la app administrativa (Sidebar, Topbar).
- `PanelPrincipal.jsx`: Gestión de métricas, tickets recientes y widgets rápidos.
- `Actividades.jsx`: Tabla detallada con sistema de filtrado.
- `Gestion.jsx`: Ciclo de vida de solicitudes: edición, vista KanBan y modal.
- `Settings.jsx`: Panel de control dinámico para editar trámites, grupos y administrar cuentas (solo TI).

### Portal de Colaboradores (`/portal/:area`)
- `Portal.jsx`: Lógica reactiva de la interfaz del formulario y renderizado dinámico de trámites (consumiendo `SettingsManager.js`).
- `TicketForm.jsx` y Formularios específicos por área (`FormGE`, `FormGH`, `FormTI`).

### Módulo de Seguridad y Autenticación
- `Login.jsx`: Formulario de acceso protegido.
- `ProtectedRoute.jsx`: Wrapper de componentes que valida si `currentUser` coincide con el área de la URL, rebotando usuarios no autorizados.

## 4. Convenciones y Flujo de Datos

### Prefijos de Identidad
- **`REQ-XXX`**: Solicitudes originadas en el Portal.
- **`TKT-XXX`**: Registros manuales creados en el Dashboard (Panel Principal).

### Flujo de creación Portal -> Dashboard
1. Colaborador envía form (`REQ-XXX`). `Portal.jsx` llama a `addTicket()`.
2. `TicketContext` lo guarda vía `DbService.saveActividades()`.
3. Navegador dispara evento `storage` en pestañas inactivas.
4. `NotificationContext` detecta el cambio de longitud y muestra notificación visual.
5. El Dashboard refresca las listas reactivamente y suena la alerta (Do-Mi-Sol).

## 5. Modelo de Datos del Ticket (16 Campos)

| Variable | Origen | Obs. Desarrollo |
|---|---|---|
| `id` | Generado | Prefijo TKT/REQ + contador. |
| `fechaCreacion` | Generado | `toLocaleString()` (Dependiente de región). |
| `nombre` | Formulario | Nombre del colaborador/solicitante. |
| `cargo` | Backend | Lookup automático del cargo del solicitante. |
| `solicitud` | Formulario | Descripción del trámite. |
| `estado` | Fijo | "Pendiente" por defecto. |
| `prioridad` | Formulario | Bajo, Media, Alta. |
| `responsable` | Dashboard | Asignado por gestora TI. |
| `grupo` | Formulario | Área de gestión (SSOT). |
| `grupoExtra` | Formulario | Tipo de trámite específico (SSOT). |
| `clasificacion`| Dashboard | Categorización técnica adicional. |
| `fechaInicio` | Dashboard | Timestamp y fecha capturada automáticamente al pasar a "En progreso". |
| `fechaFin` | Dashboard | Timestamp y fecha capturada automáticamente al resolver. |
| `tiempo` | Dashboard | Duración calculada en `HH:mm:ss`. |
| `fechaProgramada`| Dashboard | Deadline de atención. |
| `accion` | Dashboard | Observaciones/Bitácora de la gestora. |
| `detalles` | Formulario | Ruta T de carpetas físicas (PDFs). |

## 6. Auditoría de Riesgos Técnicos Críticos

1. **Límite de Almacenamiento:** `localStorage` (∼5MB) limita el crecimiento exponencial de datos históricos.
2. **Colisión de IDs:** Generar IDs basados en contadores es propenso a duplicados si se eliminan registros en concurrencia masiva (aunque se simula un frontend aislado).
3. **Broadcast Aislado:** El evento `storage` NO funciona entre computadoras diferentes.

## 7. Buenas Prácticas Recomendadas

- **Componentes Atómicos:** Si un componente pasa de 300 líneas, considerar extraer lógica a hooks personalizados o subdividirlo en subcomponentes funcionales.
- **No Mutar el Estado Directamente:** Siempre usar las funciones set (`setTickets`, `setGrupos`) expuestas por los Contexts.
- **Limpieza de Hooks:** Todo `useEffect` que añada un event listener debe retornar una función de limpieza para evitar fugas de memoria.

## 8. Recomendaciones para IAs Futuras

- **Orden de Lectura:** Seguir estrictamente el `CONTEXT.md` antes de proponer cambios.
- **Baby Steps:** Mantener cambios atómicos para evitar cortes de tokens y facilitar la verificación.
- **Regla Documental:** Acostumbrarse a actualizar `CHANGELOG.md` y `ARCHITECTURE.md` al finalizar cualquier hito mayor.
