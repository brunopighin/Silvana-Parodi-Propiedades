const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Claves que se exponen públicamente
const PUBLIC_KEYS = new Set([
  'agency_name', 'agency_tagline', 'agency_description',
  'phone', 'whatsapp', 'email', 'address', 'city',
  'hero_title', 'hero_subtitle', 'meta_title', 'meta_description',
  'facebook', 'instagram', 'matricula',
]);

// GET /api/settings (público - solo datos de contacto y config general)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = {};
    settings.forEach((s) => {
      if (PUBLIC_KEYS.has(s.key)) obj[s.key] = s.value;
    });
    res.json(obj);
  } catch {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PUT /api/settings (admin)
router.put('/', protect, requireAdmin, async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }

    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    res.json({ message: 'Configuración actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

module.exports = router;
