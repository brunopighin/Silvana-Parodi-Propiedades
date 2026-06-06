require('dotenv').config();
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error('prisma generate falló:', e.message);
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Necesario para rate limiting detrás de proxy (Hostinger, Nginx, etc.)
app.set('trust proxy', 1);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intentá de nuevo en 15 minutos.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login, intentá de nuevo en 15 minutos.' },
});

const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { error: 'Límite de consultas alcanzado, intentá de nuevo en 1 hora.' },
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api', generalLimiter);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authLimiter, require('./src/routes/auth'));
app.use('/api/properties', require('./src/routes/properties'));
app.use('/api/inquiries', inquiryLimiter, require('./src/routes/inquiries'));
app.use('/api/testimonials', require('./src/routes/testimonials'));
app.use('/api/settings', require('./src/routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DB test (temporal - borrar después)
app.get('/api/db-test', async (req, res) => {
  const t = (ms, msg) => new Promise((_, r) => setTimeout(() => r(new Error(msg)), ms));
  const steps = [];
  try {
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const version = require('@prisma/client/package.json').version;
    steps.push('packages_loaded');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
      ssl: { rejectUnauthorized: false },
    });

    await Promise.race([pool.query('SELECT 1'), t(4000, 'pool_timeout')]);
    steps.push('pool_ok');

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    steps.push('prisma_created');

    await Promise.race([prisma.$connect(), t(4000, 'connect_timeout')]);
    steps.push('connect_ok');

    const count = await Promise.race([prisma.user.count(), t(4000, 'query_timeout')]);
    steps.push('query_ok');

    await pool.end().catch(() => {});
    res.json({ ok: true, count, version, steps });
  } catch (e) {
    res.json({ ok: false, error: e.message, steps });
  }
});

// Sitemap dinámico
app.get('/sitemap.xml', async (req, res) => {
  const prisma = require('./src/lib/prisma');
  const base = process.env.SITE_URL || 'https://www.silvanaparodi.com.ar';
  const today = new Date().toISOString().split('T')[0];

  try {
    const properties = await prisma.property.findMany({
      where: { status: { in: ['disponible', 'reservado'] } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/propiedades', priority: '0.9', changefreq: 'daily' },
      { url: '/servicios', priority: '0.7', changefreq: 'monthly' },
      { url: '/nosotros', priority: '0.6', changefreq: 'monthly' },
      { url: '/contacto', priority: '0.6', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${properties.map(p => `  <url>
    <loc>${base}/propiedad/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generando sitemap');
  } finally {
    await prisma.$disconnect();
  }
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
server.timeout = 600000; // 10 minutos para uploads de video

module.exports = app;
