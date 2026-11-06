const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la conexión a la base de datos (esto disparará el console.log de éxito)
const pool = require('./config/db');

// 👇 IMPORTAMOS LAS RUTAS
const authRoutes = require('./routes/auth');
const estudiantesRoutes = require('./routes/estudiantes');
const profesoresRoutes = require('./routes/profesores'); 
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

// 👇 USAMOS LAS RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes',estudiantesRoutes);
app.use('/api/profesores', profesoresRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Gestión Escolar funcionando 🚀' });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});