const pool = require('./db/pool');
(async () => {
  try {
    const res = await pool.query("SELECT * FROM notificaciones;");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
})();
