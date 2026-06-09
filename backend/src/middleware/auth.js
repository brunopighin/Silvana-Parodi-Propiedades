const supabaseAdmin = require('../lib/supabase');

const getUser = async (token) => {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Error('Token inválido o expirado');
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
    role: 'admin',
  };
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    req.user = await getUser(header.split(' ')[1]);
  } catch { /* token inválido — continúa como anónimo */ }
  next();
};

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado - Token requerido' });
  }
  try {
    req.user = await getUser(header.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const requireAdmin = (req, res, next) => next();

module.exports = { protect, requireAdmin, optionalAuth };
