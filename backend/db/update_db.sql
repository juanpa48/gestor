-- ==========================================
-- SCRIPT DE ACTUALIZACIÓN - Gestor Empresarial
-- Ejecutar en el servidor Ubuntu conectado a PostgreSQL (gestordb)
-- ==========================================

-- 1. Tabla de Notificaciones (Historial global)
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  datos JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asegurarnos de que exista al menos el registro inicial (id=1)
INSERT INTO notificaciones (id, datos) VALUES (1, '[]')
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar que exista la tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  nit VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);

-- (Opcional) Puedes insertar algunos clientes de prueba si la tabla acaba de ser creada
-- INSERT INTO clientes (nombre, nit) VALUES ('Empresa A', '900123456-1') ON CONFLICT DO NOTHING;
