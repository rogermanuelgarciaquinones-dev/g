const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET: Listar todos los estudiantes
exports.listar = async (req, res) => {
  try {
    // Hacemos un JOIN para unir los datos del estudiante con los del usuario (nombre, email)
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.documento, 
        e.telefono, 
        e.estado,
        u.nombre, 
        u.email
      FROM estudiantes e
      JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY e.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los estudiantes.' });
  }
};

// POST: Crear un nuevo estudiante (y su usuario)
exports.crear = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, email, documento, telefono, fecha_nacimiento, password } = req.body;

    if (!nombre || !email || !documento) {
      return res.status(400).json({ message: 'Nombre, email y documento son obligatorios.' });
    }

    await client.query('BEGIN'); // Iniciamos transacción

    // 1. Encriptar contraseña (por defecto usaremos 123456 si no envían una)
    const passPlana = password || '123456';
    const hash = await bcrypt.hash(passPlana, 10);

    // 2. Insertar en la tabla usuarios
    const resUsuario = await client.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) 
       VALUES ($1, $2, $3, 'estudiante') RETURNING id`,
      [nombre, email, hash]
    );
    const usuarioId = resUsuario.rows[0].id;

    // 3. Insertar en la tabla estudiantes
    const resEstudiante = await client.query(
      `INSERT INTO estudiantes (usuario_id, documento, fecha_nacimiento, telefono) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [usuarioId, documento, fecha_nacimiento || '2000-01-01', telefono || null]
    );

    await client.query('COMMIT'); // Guardamos los cambios
    res.status(201).json({ message: 'Estudiante creado con éxito.', id: resEstudiante.rows[0].id });

  } catch (error) {
    await client.query('ROLLBACK'); // Si hay error, cancelamos todo
    console.error(error);
    if (error.code === '23505') { // Código de error de Postgres para duplicados
      res.status(400).json({ message: 'El correo o documento ya están registrados.' });
    } else {
      res.status(500).json({ message: 'Error al crear el estudiante.' });
    }
  } finally {
    client.release();
  }
};

// PUT: Actualizar un estudiante
exports.actualizar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // El ID viene en la URL
    const { nombre, email, documento, telefono, estado } = req.body;

    await client.query('BEGIN');

    // 1. Buscamos el usuario_id asociado a este estudiante
    const resEst = await client.query('SELECT usuario_id FROM estudiantes WHERE id = $1', [id]);
    if (resEst.rows.length === 0) {
      throw new Error('Estudiante no encontrado');
    }
    const usuarioId = resEst.rows[0].usuario_id;

    // 2. Actualizamos la tabla usuarios (nombre y email)
    await client.query(
      `UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3`,
      [nombre, email, usuarioId]
    );

    // 3. Actualizamos la tabla estudiantes (documento, teléfono, estado)
    await client.query(
      `UPDATE estudiantes SET documento = $1, telefono = $2, estado = $3 WHERE id = $4`,
      [documento, telefono, estado, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Estudiante actualizado correctamente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el estudiante.' });
  } finally {
    client.release();
  }
};

// DELETE: Eliminar un estudiante (y su usuario)
exports.eliminar = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Como en la BD pusimos ON DELETE CASCADE, si borramos el usuario, 
    // el estudiante se borra automáticamente.
    const resEst = await client.query('SELECT usuario_id FROM estudiantes WHERE id = $1', [id]);
    
    if (resEst.rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }

    await client.query('DELETE FROM usuarios WHERE id = $1', [resEst.rows[0].usuario_id]);
    
    res.json({ message: 'Estudiante eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el estudiante.' });
  } finally {
    client.release();
  }
};