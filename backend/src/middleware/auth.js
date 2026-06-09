const jwt = require('jsonwebtoken');

const getUser = (token) => {
  // Verificación local del JWT de Supabase — sin llamadas de red, sin threads extra.
  // La misma clave secreta que usa Supabase para firmar tokens la usamos para verificarlos.
  const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.user_metadata?.name || decoded.email?.split('@')[0] || 'Admin',
    role: 'admin',
  };
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    req.user = getUser(header.split(' ')[1]);
  } catch { /* token inválido — continúa como anónimo */ }
  next();
};

const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado - Token requerido' });
  }
  try {
    req.user = getUser(header.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const requireAdmin = (req, res, next) => next();

module.exports = { protect, requireAdmin, optionalAuth };
