const jwt = require('jsonwebtoken');

// Middleware para autenticar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Token inválido ou expirado'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware para verificar roles específicos
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado - permissão insuficiente'
      });
    }

    next();
  };
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  return requireRole(['admin'])(req, res, next);
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin
};