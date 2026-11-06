const { Pool } = require('pg');
require('dotenv').config();

// Creamos un "Pool" de conexiones. 
// Esto es más eficiente que abrir y cerrar una conexión cada vez que 
// alguien hace una petición a la API.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Prueba rápida de conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error al conectar a PostgreSQL:', err.message);
  }
  console.log('✅ Base de datos PostgreSQL conectada correctamente.');
  release(); // Liberamos el cliente de vuelta al pool
});

module.exports = pool;