import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 'venta',
    icon: '🏡',
    title: 'Venta de Propiedades',
    subtitle: 'Vendemos tu propiedad al mejor precio',
    description: 'Contamos con un equipo de asesores especializados que te acompañarán durante todo el proceso de venta. Realizamos una valuación precisa de mercado, implementamos estrategias de marketing digital y te asesoramos en cada etapa hasta la escrituración.',
    features: ['Tasación gratuita', 'Marketing digital y fotografía profesional', 'Publicación en portales líderes', 'Negociación y cierre', 'Acompañamiento en la escritura'],
  },
  {
    id: 'alquiler',
    icon: '🔑',
    title: 'Alquileres',
    subtitle: 'Gestión integral de tu propiedad',
    description: 'Administramos alquileres de principio a fin: selección y verificación de inquilinos, redacción de contratos, cobro mensual de alquileres y gestión de expensas. Te liberamos de todas las preocupaciones.',
    features: ['Selección rigurosa de inquilinos', 'Contratos con garantías', 'Cobro mensual', 'Gestión de expensas y servicios', 'Renovaciones automáticas'],
  },
  {
    id: 'tasacion',
    icon: '📋',
    title: 'Tasaciones',
    subtitle: 'Conocé el valor real de tu propiedad',
    description: 'Realizamos valuaciones profesionales y actualizadas de propiedades residenciales y comerciales. Utilizamos metodologías de comparación de mercado, análisis de la zona y del estado de la propiedad para determinar su valor real.',
    features: ['Análisis comparativo de mercado', 'Informe detallado', 'Actualización de precios', 'Valuaciones para herencias y divorcios', 'Tasaciones bancarias'],
  },
  {
    id: 'administracion',
    icon: '⚙️',
    title: 'Administración de Propiedades',
    subtitle: 'Tu propiedad en manos expertas',
    description: 'Nos ocupamos de la administración completa de tu inmueble: cobranza de alquileres, pago de impuestos y servicios, seguimiento de expensas, gestión de reparaciones y relación con inquilinos.',
    features: ['Cobranza y rendición mensual', 'Pago de servicios', 'Gestión de mantenimiento', 'Informes periódicos', 'Renovaciones de contrato'],
  },
  {
    id: 'asesoramiento',
    icon: '💼',
    title: 'Asesoramiento Inmobiliario',
    subtitle: 'La guía experta que necesitás',
    description: 'Brindamos asesoramiento integral a compradores, vendedores e inversores. Te ayudamos a entender el mercado, evaluar opciones, negociar condiciones y tomar las mejores decisiones con información actualizada.',
    features: ['Análisis de mercado', 'Planificación de compra', 'Evaluación de proyectos', 'Asesoría legal básica', 'Orientación financiera'],
  },
  {
    id: 'inversiones',
    icon: '📈',
    title: 'Inversiones Inmobiliarias',
    subtitle: 'Hacé crecer tu capital',
    description: 'Identificamos las mejores oportunidades de inversión inmobiliaria según tu perfil y objetivos. Analizamos rentabilidad, plusvalía y riesgos para que tu inversión sea segura y rentable.',
    features: ['Búsqueda de oportunidades', 'Análisis de rentabilidad', 'Proyecciones de valorización', 'Portafolio inmobiliario', 'Inversiones en pozo'],
  },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Servicios Inmobiliarios | Silvana Parodi Propiedades</title>
        <meta name="description" content="Servicios de venta, alquiler, tasaciones, administración y asesoramiento inmobiliario en Argentina." />
      </Helmet>

      <div className="pt-20">
        {/* Hero */}
        <section className="text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-primary-600 to-transparent" />
          <div className="relative container mx-auto px-4">
            <span className="section-tag text-primary-400">Servicios</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
              Servicios inmobiliarios
              <span className="block text-white/70">a tu medida</span>
            </h1>
            <p className="text-white/80 max-w-xl text-lg">
              Tasaciones, ventas, alquileres y administración. Siempre con el respaldo de Silvana Parodi.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              {services.map((service, i) => (
                <div
                  key={service.id}
                  className={`grid lg:grid-cols-2 gap-10 items-center p-8 md:p-10 rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-card transition-all ${
                    i % 2 === 1 ? 'lg:flex-row-reverse bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {service.title}
                    </h2>
                    <p className="text-primary-500 font-semibold mb-4">{service.subtitle}</p>
                    <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                  </div>

                  <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Incluye:</p>
                      <ul className="space-y-3">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 text-gray-700">
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Necesitás asesoramiento?
            </h2>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">
              Contactanos ahora y uno de nuestros especialistas te orientará sin compromiso.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contacto"
                className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-all">
                Enviar consulta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
