const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/testimonials (público: solo activos)
router.get('/', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json(testimonials);
  } catch {
    res.status(500).json({ error: 'Error al obtener testimonios' });
  }
});

// GET /api/testimonials/all (admin: todos)
router.get('/all', protect, requireAdmin, async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(testimonials);
  } catch {
    res.status(500).json({ error: 'Error al obtener testimonios' });
  }
});

// POST /api/testimonials (admin)
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const { name, text, rating, role, active, order } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        text,
        rating: parseInt(rating) || 5,
        role: role || null,
        active: active !== false,
        order: parseInt(order) || 0,
      },
    });
    res.status(201).json(testimonial);
  } catch {
    res.status(500).json({ error: 'Error al crear testimonio' });
  }
});

// PUT /api/testimonials/:id (admin)
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { name, text, rating, role, active, order } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        text,
        rating: rating ? parseInt(rating) : undefined,
        role,
        active,
        order: order !== undefined ? parseInt(order) : undefined,
      },
    });
    res.json(testimonial);
  } catch {
    res.status(500).json({ error: 'Error al actualizar testimonio' });
  }
});

// DELETE /api/testimonials/:id (admin)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Testimonio eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
