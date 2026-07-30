// ==========================================
// Pool de conexión a PostgreSQL
// ==========================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,                    // Máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,   // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 5000 // Timeout de conexión: 5s
});

// Verificar conexión al arrancar
pool.on('connect', () => {
  console.log('[DB] Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;
