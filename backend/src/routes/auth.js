const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = require('../lib/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar contraseña actual intentando iniciar sesión
    const supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña vía Admin SDK
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  const { name, email } = req.body;

  try {
    const updates = {};
    if (name) updates.user_metadata = { name };
    if (email && email !== req.user.email) updates.email = email;

    const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      updates
    );

    if (error) throw error;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
        role: 'admin',
      },
    });
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;
