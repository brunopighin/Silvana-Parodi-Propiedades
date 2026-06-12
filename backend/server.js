require('dotenv').config();

// Flag para distinguir errores de arranque vs. errores en requests en vuelo.
// Durante el arranque cualquier error es fatal; después solo se registra.
let startupComplete = false;

process.on('uncaughtException', (err) => {
  console.error('💥 uncaughtException:', err && err.stack ? err.stack : err);
  if (!startupComplete) {
    setTimeout(() => process.exit(1), 500);
  }
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 unhandledRejection:', reason && reason.stack ? reason.stack : reason);
  if (!startupComplete) {
    setTimeout(() => process.exit(1), 500);
  }
});

// DATABASE_URL es la única variable verdaderamente crítica — sin ella Prisma
// no puede conectarse y ningún endpoint funciona. El resto degrada features
// específicos pero no impide que el servidor levante.
const CRITICAL_ENV_VARS = ['DATABASE_URL'];
const OPTIONAL_ENV_VARS = [
  'DIRECT_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY', 'SUPABASE_JWT_SECRET',
];

const missingCritical = CRITICAL_ENV_VARS.filter((k) => !process.env[k]);
if (missingCritical.length > 0) {
  console.error(`❌ Variables críticas faltantes: ${missingCritical.join(', ')}`);
  console.error('El servidor no puede iniciar sin estas variables. Revisá la configuración del hosting.');
  // Delay de 10 s para evitar loops de restart que agotan el límite de procesos
  setTimeout(() => process.exit(1), 10000);
} else {
  const missingOptional = OPTIONAL_ENV_VARS.filter((k) => !process.env[k]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Variables opcionales no configuradas (funcionalidad reducida): ${missingOptional.join(', ')}`);
  }
  console.log('✅ Variables de entorno verificadas');
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', generalLimiter);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas — se cargan con log previo a cada require para identificar
// en qué módulo específico falla el arranque si ocurre un crash.
console.log('⏳ Cargando módulo: routes/auth');
const authRoutes = require('./src/routes/auth');
console.log('⏳ Cargando módulo: routes/properties');
const propertiesRoutes = require('./src/routes/properties');
console.log('⏳ Cargando módulo: routes/inquiries');
const inquiriesRoutes = require('./src/routes/inquiries');
console.log('⏳ Cargando módulo: routes/testimonials');
const testimonialsRoutes = require('./src/routes/testimonials');
console.log('⏳ Cargando módulo: routes/settings');
const settingsRoutes = require('./src/routes/settings');
console.log('✅ Todos los módulos de rutas cargados correctamente');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/inquiries', inquiryLimiter, inquiriesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sitemap dinámico
app.get('/sitemap.xml', async (req, res) => {
  const prisma = require('./src/lib/prisma');
  const base = process.env.SITE_URL || 'https://www.silvanaparodipropiedades.com';
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
  }
  // NO llamar prisma.$disconnect() — el cliente es un singleton compartido
  // por todos los endpoints; desconectarlo aquí rompería las queries del resto de la app.
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
  startupComplete = true;
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
// 2 min: suficiente para subir 20 imágenes. 600 s era excesivo en hosting compartido.
server.timeout = 120000;
server.keepAliveTimeout = 65000;

module.exports = app;
