const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

// Rutas protegidas (solo usuarios logueados pueden entrar)
router.use(verificarToken);

// GET /api/estudiantes
router.get('/', estudiantesController.listar);

// POST /api/estudiantes
router.post('/', estudiantesController.crear);

// PUT /api/estudiantes/:id
router.put('/:id', estudiantesController.actualizar);

// DELETE /api/estudiantes/:id
router.delete('/:id', estudiantesController.eliminar);

module.exports = router;