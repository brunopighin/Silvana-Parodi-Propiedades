import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const values = [
  { icon: '🤝', title: 'Confianza', desc: 'Construimos relaciones duraderas basadas en la transparencia y la honestidad.' },
  { icon: '⚡', title: 'Compromiso', desc: 'Nos comprometemos con cada cliente para lograr el mejor resultado posible.' },
  { icon: '🎯', title: 'Profesionalismo', desc: 'Nuestro equipo está capacitado y actualizado en las últimas tendencias del mercado.' },
  { icon: '❤️', title: 'Atención Personalizada', desc: 'Cada cliente es único. Adaptamos nuestro servicio a sus necesidades específicas.' },
];


export default function About() {
  const { settings } = useSettings();

  return (
    <>
      <Helmet>
        <title>Quiénes Somos | Silvana Parodi Propiedades</title>
        <meta name="description" content="Conocé la historia, valores y equipo de Silvana Parodi Propiedades. Más de 15 años en el mercado inmobiliario argentino." />
      </Helmet>

      <div className="pt-20">
        {/* Hero */}
        <section className="text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary-900/30 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-primary-600 to-transparent" />
          <div className="relative container mx-auto px-4">
            <span className="section-tag text-primary-400">Quiénes somos</span>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="section-tag">Nuestra historia</span>
                <div className="mt-8">
                  <Link to="/contacto" className="btn-primary">
                    Contactanos hoy
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="section-tag">Nuestros valores</span>
              <h2 className="section-title mt-2">Lo que nos define</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-primary-100 hover:shadow-card transition-all">
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
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
              ¿Querés trabajar con nosotros?
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Contactanos para iniciar el proceso de compra, venta o alquiler de tu propiedad.
            </p>
            <Link to="/contacto" className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-all">
              Hablar con un asesor
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
