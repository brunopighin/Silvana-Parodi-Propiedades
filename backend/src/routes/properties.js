const express = require('express');
const prisma = require('../lib/prisma');
const slugify = require('slugify');
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');
const { upload, processUploadedImages, deleteImage, videoUpload, deleteVideo } = require('../middleware/upload');

const router = express.Router();

// GET /api/properties - Lista pública con filtros
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      operation, type, city, neighborhood, province,
      minPrice, maxPrice, rooms, bedrooms, bathrooms,
      garage, pool, featured, status, search,
      page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'title', 'updatedAt'];
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const where = {};
    const isAdmin = req.user?.role === 'admin';

    // Solo mostrar disponibles al público
    if (!isAdmin) {
      where.status = { in: ['disponible', 'reservado'] };
    } else if (status) {
      where.status = status;
    }

    if (operation) where.operation = operation;
    if (type) where.type = type;
    if (city) where.city = { contains: city };
    if (province) where.province = { contains: province };
    if (neighborhood) where.neighborhood = { contains: neighborhood };
    if (featured === 'true') where.featured = true;
    if (garage === 'true') where.garage = true;
    if (pool === 'true') where.pool = true;
    if (rooms) where.rooms = { gte: parseInt(rooms) };
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
        { neighborhood: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: [{ order: 'asc' }],
            take: 3,
          },
        },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip,
        take: parseInt(limit),
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener propiedades' });
  }
});

// GET /api/properties/stats (admin) - conteo por estado sin traer registros
router.get('/stats', protect, requireAdmin, async (req, res) => {
  try {
    const [total, disponible, vendido, alquilado, reservado] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'disponible' } }),
      prisma.property.count({ where: { status: 'vendido' } }),
      prisma.property.count({ where: { status: 'alquilado' } }),
      prisma.property.count({ where: { status: 'reservado' } }),
    ]);
    res.json({ total, disponible, vendido, alquilado, reservado });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/properties/by-id/:id (admin)
router.get('/by-id/:id', protect, requireAdmin, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: { orderBy: [{ order: 'asc' }] } },
    });
    if (!property) return res.status(404).json({ error: 'No encontrada' });
    res.json(property);
  } catch {
    res.status(500).json({ error: 'Error' });
  }
});

// GET /api/properties/featured
router.get('/featured', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { featured: true, status: { in: ['disponible', 'reservado'] } },
      include: {
        images: { orderBy: [{ order: 'asc' }], take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    res.json(properties);
  } catch {
    res.status(500).json({ error: 'Error al obtener propiedades destacadas' });
  }
});

// GET /api/properties/:slug
router.get('/:slug', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: [{ order: 'asc' }] },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Incrementar vistas
    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    });

    // Propiedades relacionadas
    const related = await prisma.property.findMany({
      where: {
        type: property.type,
        operation: property.operation,
        id: { not: property.id },
        status: { in: ['disponible', 'reservado'] },
      },
      include: {
        images: { orderBy: [{ order: 'asc' }], take: 1 },
      },
      take: 3,
    });

    res.json({ ...property, related });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener propiedad' });
  }
});

// POST /api/properties - Crear (admin)
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const data = req.body;

    // Generar slug único
    let slug = slugify(data.title, { lower: true, strict: true });
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    // Parsear JSON strings
    if (data.amenities && typeof data.amenities === 'string') {
      data.amenities = data.amenities;
    }
    if (data.services && typeof data.services === 'string') {
      data.services = data.services;
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        slug,
        price: data.price ? parseFloat(data.price) : null,
        totalArea: data.totalArea ? parseFloat(data.totalArea) : null,
        coveredArea: data.coveredArea ? parseFloat(data.coveredArea) : null,
        rooms: data.rooms ? parseInt(data.rooms) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        toilets: data.toilets ? parseInt(data.toilets) : null,
        garageSpaces: data.garageSpaces ? parseInt(data.garageSpaces) : null,
        expenses: data.expenses ? parseFloat(data.expenses) : null,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
        floors: data.floors ? parseInt(data.floors) : null,
        floor: data.floor ? parseInt(data.floor) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        featured: data.featured === true || data.featured === 'true',
        isNew: data.isNew === true || data.isNew === 'true',
        garage: data.garage === true || data.garage === 'true',
        pool: data.pool === true || data.pool === 'true',
        garden: data.garden === true || data.garden === 'true',
        terrace: data.terrace === true || data.terrace === 'true',
        balcony: data.balcony === true || data.balcony === 'true',
      },
    });

    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear propiedad' });
  }
});

// PUT /api/properties/:id - Actualizar (admin)
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { id: _id, images, inquiries, createdAt, updatedAt, views, slug: _slug, videoUrl: _videoUrl, ...data } = req.body;
    const id = parseInt(req.params.id);

    if (data.title) {
      const current = await prisma.property.findUnique({ where: { id } });
      if (current?.title !== data.title) {
        let slug = slugify(data.title, { lower: true, strict: true });
        const existing = await prisma.property.findFirst({
          where: { slug, id: { not: id } },
        });
        if (existing) slug = `${slug}-${Date.now()}`;
        data.slug = slug;
      }
    }

    const toFloat = (v) => {
      if (v === undefined) return undefined;
      if (v === null || v === '') return null;
      // Formato argentino: puntos = miles, coma = decimal → "600.000" → 600000, "1.500,50" → 1500.50
      const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
      return isNaN(n) ? null : n;
    };
    const toInt   = (v) => (v !== undefined ? (v ? parseInt(v) : null) : undefined);
    const toBool  = (v) => (v !== undefined ? (v === true || v === 'true') : undefined);

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        price:            data.price !== undefined ? toFloat(data.price) : undefined,
        totalArea:        toFloat(data.totalArea),
        coveredArea:      toFloat(data.coveredArea),
        expenses:         toFloat(data.expenses),
        latitude:         toFloat(data.latitude),
        longitude:        toFloat(data.longitude),
        rooms:            toInt(data.rooms),
        bedrooms:         toInt(data.bedrooms),
        bathrooms:        toInt(data.bathrooms),
        toilets:          toInt(data.toilets),
        garageSpaces:     toInt(data.garageSpaces),
        yearBuilt:        toInt(data.yearBuilt),
        floors:           toInt(data.floors),
        floor:            toInt(data.floor),
        featured:         toBool(data.featured),
        isNew:            toBool(data.isNew),
        garage:           toBool(data.garage),
        pool:             toBool(data.pool),
        garden:           toBool(data.garden),
        terrace:          toBool(data.terrace),
        balcony:          toBool(data.balcony),
      },
      include: { images: { orderBy: [{ order: 'asc' }] } },
    });

    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar propiedad' });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });

    // Eliminar imágenes
    for (const img of property.images) {
      await deleteImage(img.url, img.publicId);
    }
    // Eliminar video si existe
    if (property.videoUrl) deleteVideo(property.videoUrl);

    await prisma.property.delete({ where: { id } });
    res.json({ message: 'Propiedad eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar propiedad' });
  }
});

// POST /api/properties/:id/images - Subir imágenes
router.post('/:id/images', protect, requireAdmin, upload.array('images', 20), async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes' });
    }

    const processedImages = await processUploadedImages(req.files, `properties/${propertyId}`);

    // Verificar si ya hay imágenes
    const existingCount = await prisma.image.count({ where: { propertyId } });

    const images = await Promise.all(
      processedImages.map((img, index) =>
        prisma.image.create({
          data: {
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            publicId: img.publicId || null,
            order: existingCount + index,
            isMain: existingCount === 0 && index === 0,
            propertyId,
          },
        })
      )
    );

    res.status(201).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir imágenes' });
  }
});

// DELETE /api/properties/:id/images/:imageId
router.delete('/:id/images/:imageId', protect, requireAdmin, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    const image = await prisma.image.findUnique({ where: { id: imageId } });

    if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });

    await deleteImage(image.url, image.publicId);
    await prisma.image.delete({ where: { id: imageId } });

    // Si era la imagen principal, asignar la siguiente
    if (image.isMain) {
      const nextImage = await prisma.image.findFirst({
        where: { propertyId: image.propertyId },
        orderBy: { order: 'asc' },
      });
      if (nextImage) {
        await prisma.image.update({ where: { id: nextImage.id }, data: { isMain: true } });
      }
    }

    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

// PUT /api/properties/:id/images/reorder
router.put('/:id/images/reorder', protect, requireAdmin, async (req, res) => {
  try {
    const { images } = req.body; // [{ id, order, isMain }]

    await Promise.all(
      images.map((img) =>
        prisma.image.update({
          where: { id: img.id },
          data: { order: img.order, isMain: img.isMain || false },
        })
      )
    );

    res.json({ message: 'Orden actualizado' });
  } catch {
    res.status(500).json({ error: 'Error al reordenar imágenes' });
  }
});

// PUT /api/properties/:id/images/:imageId/main
router.put('/:id/images/:imageId/main', protect, requireAdmin, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);

    await prisma.image.updateMany({ where: { propertyId }, data: { isMain: false } });
    await prisma.image.update({ where: { id: imageId }, data: { isMain: true } });

    res.json({ message: 'Imagen principal actualizada' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar imagen principal' });
  }
});

// POST /api/properties/:id/video
router.post('/:id/video', protect, requireAdmin, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún video' });
    const id = parseInt(req.params.id);
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });

    if (property.videoUrl) deleteVideo(property.videoUrl);

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    await prisma.property.update({ where: { id }, data: { videoUrl } });
    res.json({ videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir video' });
  }
});

// DELETE /api/properties/:id/video
router.delete('/:id/video', protect, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Propiedad no encontrada' });

    if (property.videoUrl) deleteVideo(property.videoUrl);
    await prisma.property.update({ where: { id }, data: { videoUrl: null } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar video' });
  }
});

module.exports = router;
