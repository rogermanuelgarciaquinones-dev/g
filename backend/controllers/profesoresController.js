const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET: Listar todos los profesores
exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.documento, p.especialidad, p.telefono, p.estado, u.nombre, u.email
      FROM profesores p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener profesores.' });
  }
};

// POST: Crear profesor
exports.crear = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, email, documento, especialidad, telefono } = req.body;
    await client.query('BEGIN');

    const hash = await bcrypt.hash('123456', 10); // Contraseña por defecto

    const resUsuario = await client.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) 
       VALUES ($1, $2, $3, 'profesor') RETURNING id`,
      [nombre, email, hash]
    );

    await client.query(
      `INSERT INTO profesores (usuario_id, documento, especialidad, telefono) 
       VALUES ($1, $2, $3, $4)`,
      [resUsuario.rows[0].id, documento, especialidad, telefono]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Profesor creado exitosamente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al crear profesor.' });
  } finally {
    client.release();
  }
};

// PUT: Actualizar profesor
exports.actualizar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, email, documento, especialidad, telefono, estado } = req.body;
    await client.query('BEGIN');

    const resEst = await client.query('SELECT usuario_id FROM profesores WHERE id = $1', [id]);
    const usuarioId = resEst.rows[0].usuario_id;

    await client.query(`UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3`, [nombre, email, usuarioId]);
    await client.query(
      `UPDATE profesores SET documento = $1, especialidad = $2, telefono = $3, estado = $4 WHERE id = $5`,
      [documento, especialidad, telefono, estado, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Profesor actualizado.' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al actualizar.' });
  } finally {
    client.release();
  }
};

// DELETE: Eliminar profesor
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const resEst = await pool.query('SELECT usuario_id FROM profesores WHERE id = $1', [id]);
    await pool.query('DELETE FROM usuarios WHERE id = $1', [resEst.rows[0].usuario_id]);
    res.json({ message: 'Profesor eliminado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar.' });
  }
};