const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings (público - para datos de contacto, config general)
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    res.json(obj);
  } catch {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PUT /api/settings (admin)
router.put('/', protect, async (req, res) => {
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
