const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/inquiries - Crear consulta (público)
router.post('/', async (req, res) => {
  const { name, email, phone, message, propertyId } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        propertyId: propertyId ? parseInt(propertyId) : null,
      },
    });
    res.status(201).json({ message: 'Consulta enviada exitosamente', id: inquiry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar consulta' });
  }
});

// GET /api/inquiries - Listar (admin)
router.get('/', protect, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, read, archived } = req.query;
    const where = {};
    if (read !== undefined) where.read = read === 'true';
    if (archived !== undefined) where.archived = archived === 'true';
    else where.archived = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({ inquiries, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch {
    res.status(500).json({ error: 'Error al obtener consultas' });
  }
});

// PUT /api/inquiries/:id/read
router.put('/:id/read', protect, requireAdmin, async (req, res) => {
  try {
    await prisma.inquiry.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true },
    });
    res.json({ message: 'Marcada como leída' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// PUT /api/inquiries/:id/archive
router.put('/:id/archive', protect, requireAdmin, async (req, res) => {
  try {
    await prisma.inquiry.update({
      where: { id: parseInt(req.params.id) },
      data: { archived: true, read: true },
    });
    res.json({ message: 'Consulta archivada' });
  } catch {
    res.status(500).json({ error: 'Error al archivar' });
  }
});

// DELETE /api/inquiries/:id
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    await prisma.inquiry.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Consulta eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

// GET /api/inquiries/stats
router.get('/stats/count', protect, requireAdmin, async (req, res) => {
  try {
    const [total, unread] = await Promise.all([
      prisma.inquiry.count({ where: { archived: false } }),
      prisma.inquiry.count({ where: { read: false, archived: false } }),
    ]);
    res.json({ total, unread });
  } catch {
    res.status(500).json({ error: 'Error' });
  }
});

module.exports = router;
