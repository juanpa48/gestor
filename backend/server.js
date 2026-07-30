const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir la carpeta uploads como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar que exista la carpeta uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const area = req.body.area || 'misc';
    const ticketId = req.body.ticketId || 'misc';
    const dynamicDir = path.join(uploadDir, area, ticketId);
    if (!fs.existsSync(dynamicDir)) {
      fs.mkdirSync(dynamicDir, { recursive: true });
    }
    cb(null, dynamicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ==========================================
// HELPER: Hash de contraseña (misma lógica que el frontend)
// ==========================================
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ==========================================
// API: HEALTH CHECK
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, db: 'disconnected', error: err.message });
  }
});

// ==========================================
// API: AUTENTICACIÓN
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado.' });
    }
    
    const user = result.rows[0];
    
    // Verificar bloqueo
    if (user.bloqueado) {
      if (user.bloqueado_hasta) {
        const ahora = Date.now();
        if (ahora < parseInt(user.bloqueado_hasta)) {
          const minRestantes = Math.ceil((parseInt(user.bloqueado_hasta) - ahora) / 60000);
          return res.json({ success: false, message: `Cuenta bloqueada. Intente de nuevo en ${minRestantes} minuto(s).` });
        } else {
          // Desbloquear
          await pool.query(
            'UPDATE usuarios SET bloqueado = false, bloqueado_hasta = NULL, intentos_fallidos = 0 WHERE id = $1',
            [user.id]
          );
          user.bloqueado = false;
          user.intentos_fallidos = 0;
        }
      } else {
        return res.json({ success: false, message: 'Cuenta bloqueada permanente. Contacte al Admin de TI.' });
      }
    }
    
    // Verificar contraseña
    const providedHash = hashPassword(password);
    
    if (providedHash !== user.password_hash) {
      const intentos = (user.intentos_fallidos || 0) + 1;
      let msg = 'Contraseña incorrecta.';
      
      if (intentos >= 4) {
        const bloqueadoHasta = Date.now() + (15 * 60 * 1000);
        await pool.query(
          'UPDATE usuarios SET intentos_fallidos = $1, bloqueado = true, bloqueado_hasta = $2 WHERE id = $3',
          [intentos, bloqueadoHasta.toString(), user.id]
        );
        msg = 'Cuenta bloqueada por superar intentos. Intente en 15 minutos.';
      } else {
        await pool.query(
          'UPDATE usuarios SET intentos_fallidos = $1 WHERE id = $2',
          [intentos, user.id]
        );
        msg += ` Te quedan ${4 - intentos} intento(s).`;
      }
      
      return res.json({ success: false, message: msg });
    }
    
    // Login exitoso
    await pool.query('UPDATE usuarios SET intentos_fallidos = 0 WHERE id = $1', [user.id]);
    
    const userData = {
      id: user.codigo,
      username: user.username,
      nombreReal: user.nombre_real,
      role: user.role,
      area: user.area,
      cargo: user.cargo || ''
    };
    
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado.' });
    }
    
    const user = result.rows[0];
    const oldHash = hashPassword(oldPassword);
    
    if (oldHash !== user.password_hash) {
      return res.json({ success: false, message: 'La contraseña actual es incorrecta.' });
    }
    
    const newHash = hashPassword(newPassword);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
    
    res.json({ success: true, message: 'Contraseña actualizada con éxito.' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ==========================================
// API: USUARIOS
// ==========================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT codigo, username, nombre_real, role, area, cargo, cedula, jefe_inmediato, celular, bloqueado, intentos_fallidos FROM usuarios ORDER BY id');
    const users = result.rows.map(u => ({
      id: u.codigo,
      username: u.username,
      nombreReal: u.nombre_real,
      role: u.role,
      area: u.area,
      cargo: u.cargo,
      cedula: u.cedula,
      jefeInmediato: u.jefe_inmediato,
      celular: u.celular,
      bloqueado: u.bloqueado,
      intentosFallidos: u.intentos_fallidos
    }));
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const { codigo, username, nombreReal, password, role, area, cargo, cedula, jefeInmediato, celular } = req.body;
    const hash = hashPassword(password || 'emp123');
    
    await pool.query(
      `INSERT INTO usuarios (codigo, username, nombre_real, password_hash, role, area, cargo, cedula, jefe_inmediato, celular)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [codigo, username, nombreReal, hash, role, area || null, cargo || '', cedula || '', jefeInmediato || '', celular || '']
    );
    
    res.json({ success: true, message: 'Usuario creado.' });
  } catch (err) {
    if (err.code === '23505') {
      return res.json({ success: false, message: 'El usuario ya existe.' });
    }
    console.error('Error al crear usuario:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/usuarios/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { nombreReal, role, area, cargo, cedula, jefeInmediato, celular, bloqueado, password } = req.body;
    
    if (password) {
      const hash = hashPassword(password);
      await pool.query(
        `UPDATE usuarios SET nombre_real = COALESCE($1, nombre_real), role = COALESCE($2, role), 
         area = COALESCE($3, area), cargo = COALESCE($4, cargo), cedula = COALESCE($5, cedula), jefe_inmediato = COALESCE($6, jefe_inmediato), celular = COALESCE($7, celular),
         bloqueado = COALESCE($8, bloqueado), password_hash = $9
         WHERE username = $10`,
        [nombreReal, role, area, cargo, cedula, jefeInmediato, celular, bloqueado, hash, username]
      );
    } else {
      await pool.query(
        `UPDATE usuarios SET nombre_real = COALESCE($1, nombre_real), role = COALESCE($2, role), 
         area = COALESCE($3, area), cargo = COALESCE($4, cargo), cedula = COALESCE($5, cedula), jefe_inmediato = COALESCE($6, jefe_inmediato), celular = COALESCE($7, celular),
         bloqueado = COALESCE($8, bloqueado)
         WHERE username = $9`,
        [nombreReal, role, area, cargo, cedula, jefeInmediato, celular, bloqueado, username]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/usuarios/:username', async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE username = $1', [req.params.username]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: TICKETS
// ==========================================
app.get('/api/tickets', async (req, res) => {
  try {
    const { area_key } = req.query;
    let result;
    
    if (area_key) {
      result = await pool.query('SELECT * FROM tickets WHERE area_key = $1 ORDER BY id', [area_key]);
    } else {
      result = await pool.query('SELECT * FROM tickets ORDER BY id');
    }
    
    // Transformar snake_case a camelCase para compatibilidad con el frontend
    const tickets = result.rows.map(mapTicketFromDB);
    res.json(tickets);
  } catch (err) {
    console.error('Error al obtener tickets:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const t = req.body;
    
    // Generar código automático
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM tickets WHERE area_key = $1',
      [t.areaKey]
    );
    const count = parseInt(countResult.rows[0].count, 10) + 1;
    const codigo = `${t.prefix || 'TKT'}-` + String(count).padStart(3, '0');
    
    const result = await pool.query(
      `INSERT INTO tickets (
        codigo, area_key, solicitante, solicitud, descripcion, estado, prioridad, 
        tipo, tipo_solicitud, clasificacion, responsable, accion, empresa, nit,
        cargo_solicitante, fecha_creacion, fecha_iso, fecha_inicio, fecha_inicio_timestamp,
        fecha_fin, fecha_fin_timestamp, fecha_pausa, fecha_cierre_timestamp, tiempo,
        tiempo_pausado_total, agent_pause_start, fecha_permiso, hora_salida, hora_llegada,
        adjuntos, nombre, area, detalles, grupo_extra, novedad_nomina
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35
      ) RETURNING *`,
      [
        codigo, t.areaKey, t.solicitante, t.solicitud, t.descripcion,
        t.estado || 'Pendiente', t.prioridad, t.tipo, t.tipoSolicitud,
        t.clasificacion, t.responsable, t.accion, t.empresa, t.nit,
        t.cargoSolicitante || t.cargo, t.fechaCreacion || new Date().toLocaleString(),
        t.fechaISO || new Date().toISOString(), t.fechaInicio,
        t.fechaInicioTimestamp, t.fechaFin, t.fechaFinTimestamp,
        t.fechaPausa !== undefined ? t.fechaPausa : null,
        t.fechaCierreTimestamp, t.tiempo,
        t.tiempoPausadoTotal || 0, t.agentPauseStart,
        t.fechaPermiso, t.horaSalida, t.horaLlegada,
        t.adjuntos ? JSON.stringify(t.adjuntos) : null,
        t.nombre || t.solicitante, t.area || t.tipoSolicitud || 'General',
        t.detalles ? JSON.stringify(t.detalles) : null, t.grupoExtra || null, t.novedadNomina || false
      ]
    );
    
    const ticket = mapTicketFromDB(result.rows[0]);
    res.json({ success: true, message: `Actividad ${codigo} guardada.`, ticket });
  } catch (err) {
    console.error('Error al crear ticket:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/tickets/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const t = req.body;
    
    const result = await pool.query(
      `UPDATE tickets SET 
        solicitante = $1, solicitud = $2, descripcion = $3, estado = $4, prioridad = $5,
        tipo = $6, tipo_solicitud = $7, clasificacion = $8, responsable = $9, accion = $10,
        fecha_inicio = $11, fecha_inicio_timestamp = $12, fecha_fin = $13, fecha_fin_timestamp = $14,
        fecha_pausa = $15, fecha_cierre_timestamp = $16, tiempo = $17, tiempo_pausado_total = $18,
        agent_pause_start = $19, fecha_permiso = $20, hora_salida = $21, hora_llegada = $22,
        adjuntos = $23, nombre = $24, area = $25, empresa = $26, nit = $27, cargo_solicitante = $28, detalles = $29, grupo_extra = $30, novedad_nomina = $31
       WHERE codigo = $32 RETURNING *`,
      [
        t.solicitante, t.solicitud, t.descripcion, t.estado, t.prioridad,
        t.tipo, t.tipoSolicitud, t.clasificacion, t.responsable, t.accion,
        t.fechaInicio, t.fechaInicioTimestamp, t.fechaFin, t.fechaFinTimestamp,
        t.fechaPausa !== undefined ? t.fechaPausa : null,
        t.fechaCierreTimestamp, t.tiempo, t.tiempoPausadoTotal,
        t.agentPauseStart, t.fechaPermiso, t.horaSalida, t.horaLlegada,
        t.adjuntos ? JSON.stringify(t.adjuntos) : null,
        t.nombre, t.area, t.empresa, t.nit, t.cargoSolicitante || t.cargo, t.detalles ? JSON.stringify(t.detalles) : null, t.grupoExtra || null, t.novedadNomina || false,
        codigo
      ]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar ticket:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk update (para saveActividades que guarda todo el array)
app.put('/api/tickets/bulk/:area_key', async (req, res) => {
  try {
    const { area_key } = req.params;
    const { tickets } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const t of tickets) {
        await client.query(
          `UPDATE tickets SET
            estado = $1, prioridad = $2, responsable = $3, accion = $4,
            fecha_inicio = $5, fecha_inicio_timestamp = $6, fecha_fin = $7,
            fecha_fin_timestamp = $8, fecha_pausa = $9, fecha_cierre_timestamp = $10,
            tiempo = $11, tiempo_pausado_total = $12, agent_pause_start = $13,
            novedad_nomina = $14, detalles = $15, grupo_extra = $16,
            clasificacion = $17, tipo_solicitud = $18
          WHERE codigo = $19 AND area_key = $20`,
          [
            t.estado, t.prioridad, t.responsable, t.accion,
            t.fechaInicio, t.fechaInicioTimestamp, t.fechaFin,
            t.fechaFinTimestamp, t.fechaPausa || null, t.fechaCierreTimestamp,
            t.tiempo, t.tiempoPausadoTotal || 0, t.agentPauseStart || null,
            t.novedadNomina || false, t.detalles ? JSON.stringify(t.detalles) : null, t.grupoExtra || null,
            t.clasificacion || null, t.tipoSolicitud || null,
            t.id, area_key
          ]
        );
      }
      
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error en bulk update:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auto-close tickets
app.post('/api/tickets/auto-close', async (req, res) => {
  try {
    const { area_key, gracePeriodHours } = req.body;
    const hours = gracePeriodHours || 72;
    const now = Date.now();
    const thresholdMs = hours * 60 * 60 * 1000;
    
    const result = await pool.query(
      `UPDATE tickets SET 
        estado = 'Cerrado', 
        fecha_cierre_timestamp = $1,
        accion = COALESCE(accion, '') || $2
      WHERE area_key = $3 
        AND estado = 'Resuelto' 
        AND fecha_fin_timestamp IS NOT NULL
        AND ($1 - fecha_fin_timestamp) >= $4
      RETURNING codigo`,
      [now, `\n[SISTEMA]: Ticket cerrado automáticamente tras expirar periodo de gracia de ${hours}h.`, area_key, thresholdMs]
    );
    
    res.json({ success: true, updated: result.rowCount > 0, count: result.rowCount });
  } catch (err) {
    console.error('Error en auto-close:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search tickets
app.get('/api/tickets/search', async (req, res) => {
  try {
    const { q, area_key } = req.query;
    const term = (q || '').toLowerCase();
    
    let result;
    if (term) {
      result = await pool.query(
        `SELECT * FROM tickets WHERE area_key = $1 AND (LOWER(codigo) LIKE $2 OR LOWER(solicitud) LIKE $2) ORDER BY id DESC`,
        [area_key, `%${term}%`]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM tickets WHERE area_key = $1 ORDER BY id DESC',
        [area_key]
      );
    }
    
    const tickets = result.rows.map(mapTicketFromDB);
    res.json({ success: true, resultados: tickets });
  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dashboard stats
app.get('/api/tickets/stats', async (req, res) => {
  try {
    const { area_key } = req.query;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE estado = 'Pendiente') as total_open,
        COUNT(*) FILTER (WHERE estado = 'En progreso') as in_progress,
        COUNT(*) FILTER (WHERE prioridad = 'Urgente') as urgent,
        COUNT(*) FILTER (WHERE estado IN ('Resuelto', 'Cerrado')) as resolved
      FROM tickets WHERE area_key = $1`,
      [area_key]
    );
    
    const stats = result.rows[0];
    res.json({
      success: true,
      totalOpen: parseInt(stats.total_open),
      inProgress: parseInt(stats.in_progress),
      urgentTasks: parseInt(stats.urgent),
      resolvedTickets: parseInt(stats.resolved)
    });
  } catch (err) {
    console.error('Error en stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Recent tickets
app.get('/api/tickets/recent', async (req, res) => {
  try {
    const { area_key } = req.query;
    const result = await pool.query(
      'SELECT * FROM tickets WHERE area_key = $1 ORDER BY id DESC LIMIT 5',
      [area_key]
    );
    
    const tickets = result.rows.map(r => ({
      titulo: r.solicitud || r.nombre,
      timeAgo: r.fecha_creacion,
      isUrgent: r.prioridad === 'Urgente' || r.prioridad === 'Alta'
    }));
    
    res.json({ success: true, tickets });
  } catch (err) {
    console.error('Error en recent tickets:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Agent pause state update
app.post('/api/tickets/agent-pause', async (req, res) => {
  try {
    const { agentName, isPaused } = req.body;
    const now = Date.now();
    
    if (isPaused) {
      await pool.query(
        `UPDATE tickets SET agent_pause_start = $1 
         WHERE responsable = $2 AND estado IN ('Pendiente', 'En progreso', 'Suspendido') 
         AND agent_pause_start IS NULL`,
        [now, agentName]
      );
    } else {
      // Obtener tickets pausados de este agente
      const paused = await pool.query(
        `SELECT codigo, agent_pause_start, tiempo_pausado_total FROM tickets 
         WHERE responsable = $1 AND agent_pause_start IS NOT NULL 
         AND estado IN ('Pendiente', 'En progreso', 'Suspendido')`,
        [agentName]
      );
      
      for (const ticket of paused.rows) {
        const pausedTimeMs = now - parseInt(ticket.agent_pause_start);
        const newTotal = (parseInt(ticket.tiempo_pausado_total) || 0) + pausedTimeMs;
        
        await pool.query(
          'UPDATE tickets SET agent_pause_start = NULL, tiempo_pausado_total = $1 WHERE codigo = $2',
          [newTotal, ticket.codigo]
        );
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error en agent-pause:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: FESTIVOS
// ==========================================
app.get('/api/festivos', async (req, res) => {
  try {
    const result = await pool.query('SELECT fecha, nombre FROM festivos ORDER BY fecha');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/festivos', async (req, res) => {
  try {
    const { festivos } = req.body; // Array completo
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM festivos');
      
      for (const f of festivos) {
        const fecha = typeof f === 'string' ? f : f.fecha;
        const nombre = typeof f === 'object' ? f.nombre || '' : '';
        await client.query('INSERT INTO festivos (fecha, nombre) VALUES ($1, $2)', [fecha, nombre]);
      }
      
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: SISTEMAS (Estado de servidores para TI)
// ==========================================
app.get('/api/sistemas', async (req, res) => {
  try {
    const result = await pool.query('SELECT clave, estado, mensaje FROM sistemas');
    const sistemas = {};
    result.rows.forEach(row => {
      sistemas[row.clave] = { estado: row.estado, mensaje: row.mensaje };
    });
    res.json(sistemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sistemas', async (req, res) => {
  try {
    const sistemas = req.body;
    
    for (const [clave, datos] of Object.entries(sistemas)) {
      await pool.query(
        `INSERT INTO sistemas (clave, estado, mensaje, updated_at) 
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (clave) DO UPDATE SET estado = $2, mensaje = $3, updated_at = NOW()`,
        [clave, datos.estado, datos.mensaje]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: ASISTENCIA DIARIA
// ==========================================
  app.get('/api/asistencia', async (req, res) => {
    try {
      const result = await pool.query('SELECT fecha, datos FROM asistencia_diaria');
      
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(0, 0, 0, 0); // 12:00 AM
      if (now.getTime() < cutoff.getTime()) {
        cutoff.setDate(cutoff.getDate() - 1);
      }
      const cutoffTime = cutoff.getTime();
      
      const asistencia = {};
      
      for (const row of result.rows) {
        const record = typeof row.datos === 'string' ? JSON.parse(row.datos) : row.datos;
        const username = row.fecha;
        
        if (record && record.timestamp && record.timestamp < cutoffTime) {
          // Limpieza de DB: Eliminar de la tabla diaria
          await pool.query('DELETE FROM asistencia_diaria WHERE fecha = $1', [username]);
          
          // Registrar histórico automático si no estaba finalizado y no era de oficina
          if (record.estado !== 'Resuelto' && record.ubicacion !== 'Oficina') {
            await pool.query(
              `INSERT INTO asistencia_historico (nombre, ubicacion, accion, fecha_iso, detalles, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                record.nombre || username,
                record.ubicacion,
                'Fin de Turno (Automático)',
                cutoff.toISOString(),
                record.detalles ? JSON.stringify(record.detalles) : null,
                Date.now()
              ]
            );
          }
        } else {
          asistencia[username] = record;
        }
      }
      
      res.json(asistencia);
    } catch (err) {
      console.error('Error fetching asistencia:', err);
      res.status(500).json({ error: err.message });
    }
  });

app.put('/api/asistencia', async (req, res) => {
  try {
    const asistencia = req.body;
    
    for (const [fecha, datos] of Object.entries(asistencia)) {
      await pool.query(
        `INSERT INTO asistencia_diaria (fecha, datos, updated_at) 
         VALUES ($1, $2, NOW())
         ON CONFLICT (fecha) DO UPDATE SET datos = $2, updated_at = NOW()`,
        [fecha, typeof datos === 'string' ? datos : JSON.stringify(datos)]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving asistencia:', err);
    res.status(500).json({ error: err.message });
  }
});

// HISTORICO DE ASISTENCIA
app.get('/api/asistencia/historico', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asistencia_historico ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching historico de asistencia:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/asistencia/historico', async (req, res) => {
  try {
    const { nombre, ubicacion, accion, fechaISO, detalles, timestamp } = req.body;
    await pool.query(
      `INSERT INTO asistencia_historico (nombre, ubicacion, accion, fecha_iso, detalles, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nombre, ubicacion, accion, fechaISO, detalles ? JSON.stringify(detalles) : null, timestamp || Date.now()]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving historico de asistencia:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: ESTADO PERSONAL
// ==========================================
app.get('/api/estado-personal', async (req, res) => {
  try {
    const result = await pool.query('SELECT username, datos FROM estado_personal');
    const estados = {};
    result.rows.forEach(row => {
      estados[row.username] = row.datos;
    });
    res.json(estados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/estado-personal', async (req, res) => {
  try {
    const estados = req.body;
    
    for (const [username, datos] of Object.entries(estados)) {
      await pool.query(
        `INSERT INTO estado_personal (username, datos, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (username) DO UPDATE SET datos = $2, updated_at = NOW()`,
        [username, JSON.stringify(datos)]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: SETTINGS (Configuración de áreas)
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT area, config FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.area] = row.config;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings/:area', async (req, res) => {
  try {
    const result = await pool.query('SELECT config FROM settings WHERE area = $1', [req.params.area]);
    if (result.rows.length === 0) {
      return res.json({ tiposSolicitud: [], slas: { Urgente: 2, Alta: 8, Media: 24, Baja: 48 } });
    }
    res.json(result.rows[0].config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const config = req.body;
    
    await pool.query(
      `INSERT INTO settings (area, config, updated_at) 
       VALUES ($1, $2, NOW())
       ON CONFLICT (area) DO UPDATE SET config = $2, updated_at = NOW()`,
      [area, JSON.stringify(config)]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: NOTIFICACIONES
// ==========================================
app.get('/api/notificaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT datos FROM notificaciones WHERE id = 1');
    if (result.rows.length === 0) {
      return res.json([]);
    }
    res.json(result.rows[0].datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notificaciones', async (req, res) => {
  try {
    const { notificaciones } = req.body;
    await pool.query(
      `INSERT INTO notificaciones (id, datos, updated_at) 
       VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET datos = $1, updated_at = NOW()`,
      [JSON.stringify(notificaciones || [])]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: CLIENTES
// ==========================================
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, nit FROM clientes ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, nit } = req.body;
    await pool.query('INSERT INTO clientes (nombre, nit) VALUES ($1, $2)', [nombre, nit || '']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit } = req.body;
    await pool.query('UPDATE clientes SET nombre = $1, nit = $2 WHERE id = $3', [nombre, nit || '', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API: UPLOAD (existente, sin cambios)
// ==========================================
app.post('/api/upload', upload.array('adjuntos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se subieron archivos.' });
    }

    const area = req.body.area || 'misc';
    const ticketId = req.body.ticketId || 'misc';
    const urls = req.files.map(file => {
      // Usar el host dinámico (ej: 192.168.1.9:3001) para que funcione en producción y local
      return `${req.protocol}://${req.get('host')}/uploads/${area}/${ticketId}/${file.filename}`;
    });

    res.json({
      success: true,
      message: 'Archivos subidos exitosamente',
      urls: urls
    });
  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ==========================================
// HELPER: Mapear ticket de DB (snake_case) a Frontend (camelCase)
// ==========================================
function mapTicketFromDB(row) {
  return {
    id: row.codigo,
    areaKey: row.area_key,
    solicitante: row.solicitante,
    solicitud: row.solicitud,
    descripcion: row.descripcion,
    estado: row.estado,
    prioridad: row.prioridad,
    tipo: row.tipo,
    tipoSolicitud: row.tipo_solicitud,
    clasificacion: row.clasificacion,
    responsable: row.responsable,
    accion: row.accion,
    empresa: row.empresa,
    nit: row.nit,
    cargoSolicitante: row.cargo_solicitante,
    fechaCreacion: row.fecha_creacion,
    fechaISO: row.fecha_iso,
    fechaInicio: row.fecha_inicio,
    fechaInicioTimestamp: row.fecha_inicio_timestamp ? parseInt(row.fecha_inicio_timestamp) : null,
    fechaFin: row.fecha_fin,
    fechaFinTimestamp: row.fecha_fin_timestamp ? parseInt(row.fecha_fin_timestamp) : null,
    fechaPausa: row.fecha_pausa ? parseInt(row.fecha_pausa) : null,
    fechaCierreTimestamp: row.fecha_cierre_timestamp ? parseInt(row.fecha_cierre_timestamp) : null,
    tiempo: row.tiempo,
    tiempoPausadoTotal: parseInt(row.tiempo_pausado_total) || 0,
    agentPauseStart: row.agent_pause_start ? parseInt(row.agent_pause_start) : null,
    fechaPermiso: row.fecha_permiso,
    horaSalida: row.hora_salida,
    horaLlegada: row.hora_llegada,
    adjuntos: row.adjuntos ? JSON.parse(row.adjuntos) : [],
    nombre: row.nombre,
    area: row.area,
    detalles: row.detalles ? (typeof row.detalles === 'string' ? JSON.parse(row.detalles) : row.detalles) : null,
    grupoExtra: row.grupo_extra,
    novedadNomina: row.novedad_nomina || false
  };
}

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`\n🚀 Backend de Gestor corriendo en http://localhost:${PORT}`);
  console.log(`📂 Uploads: POST http://localhost:${PORT}/api/upload`);
  console.log(`🔗 DB: PostgreSQL en ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`💊 Health check: GET http://localhost:${PORT}/api/health\n`);
});
