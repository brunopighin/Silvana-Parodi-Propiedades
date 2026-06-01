require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@inmobiliaria.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@inmobiliaria.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });

  console.log('✓ Usuario admin creado');

  // Configuración inicial
  const settings = [
    { key: 'agency_name', value: 'RE Propiedades' },
    { key: 'agency_tagline', value: 'Tu hogar ideal, nuestra misión' },
    { key: 'agency_description', value: 'Somos una inmobiliaria con más de 15 años de experiencia en el mercado argentino. Nos especializamos en compra, venta y alquiler de propiedades residenciales y comerciales, brindando un servicio personalizado y profesional.' },
    { key: 'phone', value: '+54 11 1234-5678' },
    { key: 'whatsapp', value: '5492323537248' },
    { key: 'email', value: 'info@repropiedades.com.ar' },
    { key: 'address', value: 'Av. Corrientes 1234, Piso 3, Of. 301' },
    { key: 'city', value: 'Buenos Aires' },
    { key: 'province', value: 'CABA' },
    { key: 'zip_code', value: 'C1043' },
    { key: 'hours', value: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 10:00 - 14:00' },
    { key: 'facebook', value: 'https://facebook.com/repropiedades' },
    { key: 'instagram', value: 'https://instagram.com/repropiedades' },
    { key: 'linkedin', value: '' },
    { key: 'maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9272305408716!2d-58.38375!3d-34.603722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjQiUyA1OMKwMjInNTcuNSJX!5e0!3m2!1ses!2sar!4v1234567890' },
    { key: 'hero_title', value: 'Encontrá tu propiedad ideal' },
    { key: 'hero_subtitle', value: 'Más de 15 años conectando personas con sus hogares. Vendemos, alquilamos y asesoramos con la confianza y profesionalismo que merecés.' },
    { key: 'about_title', value: 'Quiénes Somos' },
    { key: 'about_text', value: 'RE Propiedades nació en 2009 con la misión de brindar el mejor servicio inmobiliario en Argentina. A lo largo de los años, hemos ayudado a cientos de familias y empresas a encontrar su lugar ideal, siempre con honestidad, transparencia y dedicación.\n\nNuestro equipo de profesionales capacitados trabaja para hacer que cada transacción sea simple, segura y satisfactoria. Creemos en el valor de la confianza y en la importancia de acompañar a cada cliente durante todo el proceso.' },
    { key: 'meta_title', value: 'RE Propiedades - Inmobiliaria Premium en Argentina' },
    { key: 'meta_description', value: 'Comprá, vendé y alquilá propiedades con RE Propiedades. Casas, departamentos, locales y más en Buenos Aires y todo el país. Asesoramiento profesional.' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✓ Configuración inicial creada');

  // Propiedades de ejemplo
  const properties = [
    {
      title: 'Departamento moderno en Palermo Soho',
      slug: 'departamento-moderno-palermo-soho-1',
      description: 'Luminoso departamento de 2 ambientes completamente reformado, ubicado en el corazón de Palermo Soho. Cocina americana equipada, living comedor amplio, dormitorio en suite con vestidor. Piso de madera de roble, ventanas termopanel, calefacción central. Edificio con portero 24hs, SUM y laundry. A pasos del Parque Las Heras y de los mejores restaurantes y bares del barrio.',
      price: 125000,
      currency: 'USD',
      operation: 'venta',
      type: 'departamento',
      status: 'disponible',
      featured: true,
      isNew: true,
      address: 'Thames 1234',
      city: 'Buenos Aires',
      province: 'CABA',
      neighborhood: 'Palermo Soho',
      totalArea: 65,
      coveredArea: 58,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      garage: false,
      amenities: JSON.stringify(['SUM', 'Laundry', 'Portero 24hs', 'Ascensor']),
      services: JSON.stringify(['Gas natural', 'Agua corriente', 'Electricidad', 'Internet fibra']),
      condition: 'excelente',
      floor: 4,
      floors: 8,
      orientation: 'Norte',
    },
    {
      title: 'Casa con jardín en San Isidro',
      slug: 'casa-jardin-san-isidro-2',
      description: 'Espectacular casa de estilo colonial moderno con jardín y pileta. 4 dormitorios en suite, living-comedor de 80m2 con doble altura, cocina industrial, estudio, dependencia de servicio. Jardín paisajístico de 400m2 con pileta climatizada, quincho con parrilla y suma exterior. Garage para 3 autos. En barrio residencial tranquilo, a minutos del acceso a la autopista y del centro de San Isidro.',
      price: 650000,
      currency: 'USD',
      operation: 'venta',
      type: 'casa',
      status: 'disponible',
      featured: true,
      isNew: false,
      address: 'Av. del Libertador 5678',
      city: 'San Isidro',
      province: 'Buenos Aires',
      neighborhood: 'San Isidro Centro',
      totalArea: 800,
      coveredArea: 380,
      rooms: 6,
      bedrooms: 4,
      bathrooms: 4,
      toilets: 1,
      garage: true,
      garageSpaces: 3,
      pool: true,
      garden: true,
      terrace: true,
      amenities: JSON.stringify(['Pileta climatizada', 'Quincho', 'Parrilla', 'Jardín 400m2', 'Garage triple']),
      services: JSON.stringify(['Gas natural', 'Agua de red', 'Electricidad trifásica', 'Alarma', 'CCTV']),
      condition: 'muy-bueno',
      yearBuilt: 2018,
    },
    {
      title: 'PH con terraza en Núñez',
      slug: 'ph-terraza-nunez-3',
      description: 'Excepcional PH de 3 ambientes con terraza privada de 40m2 en Núñez. Planta baja con cocina americana, comedor y living. Planta alta con 2 dormitorios en suite y terraza con parrilla y vista al río. Terminaciones de primer nivel: pisos de microcemento, ventanas de piso a techo, domótica integrada. Edificio boutique de solo 6 unidades sin expensas de amenities.',
      price: 185000,
      currency: 'USD',
      operation: 'venta',
      type: 'ph',
      status: 'disponible',
      featured: true,
      isNew: true,
      address: 'Manuela Pedraza 3456',
      city: 'Buenos Aires',
      province: 'CABA',
      neighborhood: 'Núñez',
      totalArea: 110,
      coveredArea: 70,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 2,
      garage: true,
      garageSpaces: 1,
      terrace: true,
      balcony: false,
      amenities: JSON.stringify(['Terraza privada 40m2', 'Parrilla', 'Domótica', 'Vista al río']),
      services: JSON.stringify(['Gas natural', 'Internet fibra', 'Alarma monitoreada']),
      condition: 'excelente',
      floor: 3,
      floors: 3,
      yearBuilt: 2022,
    },
    {
      title: 'Departamento 1 ambiente en Recoleta',
      slug: 'departamento-1-ambiente-recoleta-4',
      description: 'Moderno monoambiente en edificio de primera categoría en Recoleta. Totalmente reformado, balcón con vista a la plaza, cocina americana con electrodomésticos incluidos. Ideal para primera vivienda o inversión. Edificio con gimnasio, SUM y solarium. A pasos de la Recoleta y del barrio de galerías de arte.',
      price: 850000,
      currency: 'ARS',
      operation: 'alquiler',
      type: 'departamento',
      status: 'disponible',
      featured: false,
      isNew: false,
      address: 'Juncal 2890',
      city: 'Buenos Aires',
      province: 'CABA',
      neighborhood: 'Recoleta',
      totalArea: 38,
      coveredArea: 35,
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      garage: false,
      balcony: true,
      amenities: JSON.stringify(['Gimnasio', 'SUM', 'Solarium', 'Portero 24hs']),
      services: JSON.stringify(['Gas', 'Agua', 'Electricidad']),
      expenses: 45000,
      condition: 'excelente',
      floor: 7,
    },
    {
      title: 'Local comercial en Microcentro',
      slug: 'local-comercial-microcentro-5',
      description: 'Amplio local comercial en planta baja en pleno microcentro porteño. 120m2 totales, salón principal de 90m2, depósito/oficina de 20m2, baño completo. Gran vidriería a la calle con excelente visibilidad. Zona de altísimo tránsito peatonal. Ideal para comercio, showroom o restaurante. Entrega inmediata.',
      price: 2500000,
      currency: 'ARS',
      operation: 'alquiler',
      type: 'local',
      status: 'disponible',
      featured: false,
      isNew: false,
      address: 'Florida 456',
      city: 'Buenos Aires',
      province: 'CABA',
      neighborhood: 'Microcentro',
      totalArea: 120,
      coveredArea: 120,
      rooms: 2,
      bedrooms: 0,
      bathrooms: 1,
      garage: false,
      services: JSON.stringify(['Electricidad trifásica', 'Gas', 'Agua']),
      condition: 'bueno',
      floor: 0,
    },
    {
      title: 'Casa en barrio cerrado Nordelta',
      slug: 'casa-barrio-cerrado-nordelta-6',
      description: 'Hermosa casa en barrio privado de Nordelta con acceso a todos los amenities del complejo. 3 dormitorios en suite, living-comedor amplio con salida a jardín y pileta, cocina con isla y family room. Garage doble. El barrio ofrece canchas de tenis, golf, club náutico, escuelas y shopping. Vigilancia 24hs. Excelente estado.',
      price: 420000,
      currency: 'USD',
      operation: 'venta',
      type: 'casa',
      status: 'vendido',
      featured: false,
      isNew: false,
      address: 'Los Robles 789',
      city: 'Tigre',
      province: 'Buenos Aires',
      neighborhood: 'Nordelta',
      totalArea: 500,
      coveredArea: 220,
      rooms: 5,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 1,
      garage: true,
      garageSpaces: 2,
      pool: true,
      garden: true,
      amenities: JSON.stringify(['Pileta', 'Parrilla', 'Golf', 'Club náutico', 'Canchas de tenis', 'Seguridad 24hs']),
      services: JSON.stringify(['Gas natural', 'Internet', 'Cable', 'Alarma']),
      condition: 'muy-bueno',
      yearBuilt: 2015,
    },
  ];

  for (const prop of properties) {
    const existing = await prisma.property.findUnique({ where: { slug: prop.slug } });
    if (!existing) {
      await prisma.property.create({ data: prop });
    }
  }

  console.log('✓ Propiedades de ejemplo creadas');

  // Testimonios
  const testimonials = [
    {
      name: 'María González',
      text: 'Encontramos la casa de nuestros sueños gracias al equipo de RE Propiedades. Nos acompañaron en cada paso del proceso con total transparencia y profesionalismo. ¡Los recomiendo sin dudarlo!',
      rating: 5,
      role: 'Compradora',
      active: true,
      order: 1,
    },
    {
      name: 'Carlos Fernández',
      text: 'Vendimos nuestro departamento en tiempo récord y al precio que esperábamos. El asesoramiento fue excelente y la comunicación siempre fue clara y directa. Muy satisfecho con el servicio.',
      rating: 5,
      role: 'Vendedor',
      active: true,
      order: 2,
    },
    {
      name: 'Laura Martínez',
      text: 'Llevo 3 años alquilando a través de RE Propiedades y siempre tuve una experiencia impecable. La administración es prolija, responden rápido y siempre solucionan los inconvenientes.',
      rating: 5,
      role: 'Inquilina',
      active: true,
      order: 3,
    },
    {
      name: 'Roberto Sánchez',
      text: 'Como inversor inmobiliario, valoro mucho el conocimiento del mercado que tiene el equipo. Me asesoraron muy bien sobre en qué propiedades invertir y los retornos fueron excelentes.',
      rating: 5,
      role: 'Inversor',
      active: true,
      order: 4,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  console.log('✓ Testimonios de ejemplo creados');

  console.log('\n✅ Seed completado exitosamente!');
  console.log('📧 Admin email configurado');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
