require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@silvanaparodi.com.ar' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@silvanaparodi.com.ar',
      password: hashedPassword,
      name: 'Silvana Parodi',
      role: 'admin',
    },
  });

  console.log('✓ Usuario admin creado');

  // Configuración inicial — solo se aplica en instalación nueva (update: {})
  const settings = [
    { key: 'agency_name', value: 'Silvana Parodi Propiedades' },
    { key: 'agency_tagline', value: 'Una manera diferente de vivir la experiencia inmobiliaria' },
    { key: 'agency_description', value: 'Martillera Pública y Corredora Inmobiliaria dedicada a acompañar a cada cliente con honestidad, profesionalismo y cercanía en uno de los momentos más importantes de su vida.' },
    { key: 'phone', value: '+54 9 2323 537248' },
    { key: 'whatsapp', value: '5492323537248' },
    { key: 'email', value: 'silvanaparodi.propiedades@gmail.com' },
    { key: 'address', value: '' },
    { key: 'city', value: 'Lobos' },
    { key: 'province', value: 'Buenos Aires' },
    { key: 'zip_code', value: '' },
    { key: 'hours', value: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 10:00 - 13:00' },
    { key: 'facebook', value: '' },
    { key: 'instagram', value: '' },
    { key: 'linkedin', value: '' },
    { key: 'maps_embed', value: '' },
    { key: 'hero_title', value: 'Tu próximo hogar empieza acá.' },
    { key: 'hero_subtitle', value: 'Sabemos que buscar una propiedad es mucho más que un trámite: es una decisión de vida. Por eso, te brindamos la atención cálida y honesta que te merecés. Encontrá tu espacio con nosotros.' },
    { key: 'about_title', value: 'Quiénes Somos' },
    { key: 'about_text', value: 'Detrás de cada operación inmobiliaria hay mucho más que una compra o una venta: hay sueños, proyectos y decisiones importantes de vida. Nos involucramos en cada etapa del proceso brindando siempre honestidad, profesionalismo y cercanía.' },
    { key: 'meta_title', value: 'Silvana Parodi Propiedades — Lobos, Buenos Aires' },
    { key: 'meta_description', value: 'Compra, venta y alquiler de propiedades en Lobos y zona. Martillera Pública y Corredora Inmobiliaria. Más de 80 operaciones exitosas.' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✓ Configuración inicial creada');
  console.log('\n✅ Seed completado exitosamente!');
  console.log('📧 Email admin: ' + (process.env.ADMIN_EMAIL || 'admin@silvanaparodi.com.ar'));
  console.log('⚠️  Recordá cambiar la contraseña del admin desde el panel.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
