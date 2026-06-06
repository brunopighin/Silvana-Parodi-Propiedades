const supabaseAdmin = require('../lib/supabase');

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const token = header.split(' ')[1];
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
        role: 'admin',
      };
    }
  } catch { /* token inválido — continúa como anónimo */ }
  next();
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado - Token requerido' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
      role: 'admin',
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

const requireAdmin = (req, res, next) => {
  next();
};

module.exports = { protect, requireAdmin, optionalAuth };
