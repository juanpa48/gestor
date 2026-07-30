// ==========================================
// Script de inicialización de la Base de Datos
// Ejecutar: node db/setup.js
// ==========================================
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Función para hashear contraseñas (misma lógica que el frontend)
async function hashPassword(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash;
}

async function setup() {
  const client = await pool.connect();
  
  try {
    console.log('[SETUP] Conectado a PostgreSQL exitosamente.');
    console.log(`[SETUP] Host: ${process.env.DB_HOST}, DB: ${process.env.DB_NAME}`);
    
    // 1. Ejecutar el script SQL de inicialización
    console.log('\n[SETUP] Creando tablas...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await client.query(sqlFile);
    console.log('[SETUP] ✅ Tablas creadas exitosamente.');
    
    // 2. Crear usuarios fundacionales (si no existen)
    console.log('\n[SETUP] Creando usuarios fundacionales...');
    
    const defaultUsers = [
      { codigo: 'U-01', username: 'admin_ti', nombreReal: 'Administrador TI', password: 'admin123', role: 'admin_ti', area: 'ti' },
      { codigo: 'U-02', username: 'gestor_ge', nombreReal: 'Gestor Empresarial', password: 'ge123', role: 'gestor', area: 'ge' },
      { codigo: 'U-03', username: 'gestor_gh', nombreReal: 'Gestor de RRHH', password: 'gh123', role: 'gestor', area: 'gh' },
      { codigo: 'U-04', username: 'gestor_ti', nombreReal: 'Soporte TI Nivel 1', password: 'ti123', role: 'gestor', area: 'ti' },
      { codigo: 'U-05', username: 'empleado1', nombreReal: 'Juan Pérez', password: 'emp123', role: 'solicitante', area: null, cargo: 'Auxiliar Contable' }
    ];
    
    for (const user of defaultUsers) {
      const existingUser = await client.query('SELECT id FROM usuarios WHERE username = $1', [user.username]);
      
      if (existingUser.rows.length === 0) {
        const hash = await hashPassword(user.password);
        await client.query(
          `INSERT INTO usuarios (codigo, username, nombre_real, password_hash, role, area, cargo) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user.codigo, user.username, user.nombreReal, hash, user.role, user.area, user.cargo || '']
        );
        console.log(`  ✅ Usuario '${user.username}' creado.`);
      } else {
        console.log(`  ⏭️  Usuario '${user.username}' ya existe, se omite.`);
      }
    }
    
    // 3. Crear configuración por defecto de áreas (Settings)
    console.log('\n[SETUP] Creando configuración de áreas...');
    
    const defaultSettings = {
      ge: {
        tiposSolicitud: [
          {
            nombre: 'Estructurales y Legales',
            tramites: [
              "Creación y/o Cancelación de empresas",
              "Devolución de saldo a favor en rentas",
              "RUT por primera vez",
              "Constitución y cancelación de establecimientos de comercio",
              "Cambio de representante legal y sus anexos",
              "Anexo y retiro de revisoría fiscal",
              "Venta de acciones y compraventas",
              "Reforma de estatutos",
              "Cambio de dirección de la empresa",
              "Capitalización",
              "Anexo y cambio de actividades económicas",
              "Cambio de correos electrónicos y números telefónicos",
              "Inscripción o renovación en el RUP",
              "Inscripción o renovación en el RUB",
              "Renovación o actualización de cámara de comercio",
              "Otro (especificar en descripción)"
            ]
          },
          {
            nombre: 'Operativos y Documentales',
            tramites: [
              "Actualización de RUT",
              "Resolución de facturación",
              "Firma Electrónica",
              "Facturas electrónicas",
              "Documento soporte",
              "Certificados",
              "Firma electrónica de estados financieros y declaraciones de renta",
              "Renovación de firma digital de Token",
              "Otro (especificar en descripción)"
            ]
          }
        ],
        slas: { Urgente: 2, Alta: 8, Media: 24, Baja: 48 }
      },
      gh: {
        tiposSolicitud: [
          { nombre: 'Permisos', tramites: ["Personal", "Salud", "Educativo", "Licencia no remunerada (LNR)"] },
          { nombre: 'Convenios', tramites: ["Servicio", "Smartfit", "Gafas", "Psicología", "Préstamo personal", "Bolsos", "Comfama cursos"] },
          { nombre: 'Vacaciones', tramites: ["Disfrute de Vacaciones", "Vacaciones compensadas"] },
          { nombre: 'Cesantías', tramites: ["Estudio", "Compra de vivienda", "Modificación de vivienda"] },
          { nombre: 'Auxilio Educativo', tramites: ["Posgrado", "Diplomado", "Curso"] },
          { nombre: 'Certificado Laboral', tramites: ["General"] },
          { nombre: 'Sistema de Gestión', tramites: ["General"] },
          { nombre: 'Reporte de Asistencia', tramites: ["Cliente", "Trabajo en Casa"] }
        ],
        slas: { Urgente: 2, Alta: 8, Media: 24, Baja: 48 }
      },
      ti: {
        tiposSolicitud: [
          { nombre: 'Soporte Técnico', tramites: ["Soporte"] }
        ],
        slas: { Urgente: 2, Alta: 8, Media: 24, Baja: 48 }
      }
    };
    
    for (const [areaId, config] of Object.entries(defaultSettings)) {
      const existing = await client.query('SELECT id FROM settings WHERE area = $1', [areaId]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO settings (area, config) VALUES ($1, $2)',
          [areaId, JSON.stringify(config)]
        );
        console.log(`  ✅ Configuración del área '${areaId}' creada.`);
      } else {
        console.log(`  ⏭️  Configuración del área '${areaId}' ya existe, se omite.`);
      }
    }
    
    console.log('\n========================================');
    console.log('🎉 ¡Base de datos inicializada con éxito!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
