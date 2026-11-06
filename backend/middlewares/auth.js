const jwt = require('jsonwebtoken');

// 1. Verifica que el usuario haya enviado un Token válido
const verificarToken = (req, res, next) => {
  // El token viene en el header "Authorization" como: "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
  }

  try {
    // Verificamos que el token sea real y no haya expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardamos los datos del usuario en la petición
    next(); // Le decimos que puede pasar a la ruta
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

// 2. Verifica que el usuario tenga el rol correcto
const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({ message: 'Error interno: Token no verificado.' });
    }

    // Si el rol del usuario está dentro de los roles permitidos, pasa
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
      });
    }
    next();
  };
};

module.exports = { verificarToken, permitirRoles };