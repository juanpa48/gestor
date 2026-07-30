-- ==========================================
-- SCRIPT DE INICIALIZACIÓN - Gestor Empresarial
-- Base de datos: gestordb
-- ==========================================

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,        -- Ej: 'U-01'
  username VARCHAR(50) UNIQUE NOT NULL,
  nombre_real VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'solicitante',  -- admin_ti, gestor, solicitante
  area VARCHAR(10),                          -- ge, gh, ti
  cargo VARCHAR(100) DEFAULT '',
  cedula VARCHAR(30) DEFAULT '',
  jefe_inmediato VARCHAR(100) DEFAULT '',
  celular VARCHAR(20) DEFAULT '',
  bloqueado BOOLEAN DEFAULT FALSE,
  bloqueado_hasta BIGINT,                    -- timestamp en ms
  intentos_fallidos INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Tickets (unificada para todas las áreas)
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,        -- Ej: 'GE-001', 'GH-015', 'TI-042'
  area_key VARCHAR(30) NOT NULL,             -- 'db_actividades_ge', 'db_actividades_gh', 'db_actividades_ti'
  solicitante VARCHAR(100),
  solicitud TEXT,
  descripcion TEXT,
  estado VARCHAR(30) DEFAULT 'Pendiente',    -- Pendiente, En progreso, Suspendido, Resuelto, Cerrado
  prioridad VARCHAR(20),                     -- Urgente, Alta, Media, Baja
  tipo VARCHAR(50),
  tipo_solicitud VARCHAR(100),
  clasificacion VARCHAR(100),
  responsable VARCHAR(100),
  accion TEXT,
  empresa VARCHAR(100),
  nit VARCHAR(30),
  cargo_solicitante VARCHAR(100),
  
  -- Campos de tiempo/SLA
  fecha_creacion VARCHAR(50),
  fecha_iso TIMESTAMP DEFAULT NOW(),
  fecha_inicio VARCHAR(50),
  fecha_inicio_timestamp BIGINT,
  fecha_fin VARCHAR(50),
  fecha_fin_timestamp BIGINT,
  fecha_pausa BIGINT,
  fecha_cierre_timestamp BIGINT,
  tiempo VARCHAR(30),
  tiempo_pausado_total BIGINT DEFAULT 0,
  agent_pause_start BIGINT,
  
  -- Campos específicos de GH
  fecha_permiso VARCHAR(50),
  hora_salida VARCHAR(20),
  hora_llegada VARCHAR(20),
  
  -- Archivos adjuntos (URLs separadas por coma o JSON)
  adjuntos TEXT,
  
  -- Metadata
  nombre VARCHAR(100),
  area VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Festivos
CREATE TABLE IF NOT EXISTS festivos (
  id SERIAL PRIMARY KEY,
  fecha VARCHAR(20) NOT NULL,                -- Formato: 'YYYY-MM-DD'
  nombre VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Estado de Sistemas (para TI)
CREATE TABLE IF NOT EXISTS sistemas (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(30) UNIQUE NOT NULL,         -- 'servidor', 'contable', 'red'
  estado VARCHAR(20) DEFAULT 'ok',           -- ok, warning, error
  mensaje TEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Asistencia Diaria
CREATE TABLE IF NOT EXISTS asistencia_diaria (
  id SERIAL PRIMARY KEY,
  fecha VARCHAR(20) NOT NULL,                -- Formato: 'YYYY-MM-DD'
  datos JSONB DEFAULT '{}',                  -- Toda la info de asistencia del día
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(fecha)
);

-- Tabla de Estado Personal (widgets del dashboard)
CREATE TABLE IF NOT EXISTS estado_personal (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  datos JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Configuración/Settings (tipos de solicitud, SLAs por área)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  area VARCHAR(10) UNIQUE NOT NULL,          -- 'ge', 'gh', 'ti'
  config JSONB NOT NULL,                     -- { tiposSolicitud: [...], slas: {...} }
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Clientes (para GE)
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  nit VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar estados de sistemas por defecto
INSERT INTO sistemas (clave, estado, mensaje) VALUES
  ('servidor', 'ok', ''),
  ('contable', 'ok', ''),
  ('red', 'ok', '')
ON CONFLICT (clave) DO NOTHING;
