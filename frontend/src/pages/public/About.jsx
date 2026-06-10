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
        <meta name="description" content="Conocé la historia y valores de Silvana Parodi Propiedades. Martillera pública y corredora inmobiliaria con más de 80 operaciones exitosas." />
      </Helmet>

      <div className="pt-20">
        {/* Hero */}
        <section className="text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary-900/30 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-primary-600 to-transparent" />
          <div className="relative container mx-auto px-4 text-center">
            <img
              src={`${import.meta.env.BASE_URL}silvana foto.jpg`}
              alt="Silvana Parodi"
              className="w-36 h-36 rounded-full object-cover object-top mx-auto mb-6 shadow-xl ring-4 ring-white/30"
            />
            <span className="section-tag text-white/70">Silvana Parodi Propiedades</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-2">
              Quiénes somos
            </h1>
            <p className="mt-6 text-white/90 max-w-2xl mx-auto text-lg leading-relaxed">
              Después de toda una vida vinculados al mundo comercial, descubrimos que nuestra verdadera pasión son las relaciones humanas. Escuchar, comprender, asesorar y acompañar a cada persona en uno de los momentos más importantes de su vida. Nos involucramos en cada etapa del proceso, desde la búsqueda y la toma de decisiones hasta la transición y el acompañamiento posterior a la operación, brindando siempre honestidad, profesionalismo, cercanía y la seguridad que nuestros clientes merecen. Porque entendemos que detrás de cada propiedad hay una historia, un proyecto y un sueño por cumplir.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="max-w-md mr-auto ml-0 -translate-x-8 sm:-translate-x-12 lg:-translate-x-24 lg:max-w-none">
                <img
                  src={`${import.meta.env.BASE_URL}fotomodificada.jpg`}
                  alt="Oficina de Silvana Parodi Propiedades"
                  className="rounded-2xl shadow-xl w-full object-cover object-left"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-2">Nuestra historia</h2>
                <p className="mt-6 text-gray-700 leading-relaxed text-lg font-medium">
                  Detrás de cada operación inmobiliaria hay mucho más que una compra o una venta: hay sueños, proyectos y decisiones importantes de vida.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Mi camino comenzó con una convicción muy clara: dedicarme a lo que realmente me apasionaba. Por eso estudié la carrera de Martillero Público y Corredor Inmobiliario, formándome con compromiso, esfuerzo y la certeza de que estaba construyendo mi futuro profesional.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Con trabajo, perseverancia y el acompañamiento incondicional de mi familia, logramos dar un gran paso: abrir nuestra propia oficina inmobiliaria. Un proyecto nacido del esfuerzo y construido sobre valores que hoy siguen siendo nuestra esencia.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  A lo largo de estos años hemos acompañado a decenas de familias e inversores en una de las decisiones más importantes de sus vidas, concretando más de 80 operaciones exitosas y desarrollando un profundo conocimiento del mercado inmobiliario.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Pero más allá de los números, lo que verdaderamente nos define es nuestra forma de trabajar: escuchar, comprender, asesorar y acompañar a cada cliente con honestidad, profesionalismo y cercanía durante todo el proceso.
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  La confianza que nuestros clientes depositan en nosotros y sus testimonios son nuestro mayor respaldo.
                </p>
                <p className="mt-4 text-primary-600 leading-relaxed font-medium italic">
                  Te invitamos a conocernos y descubrir una manera diferente de vivir la experiencia inmobiliaria.
                </p>
                <div className="mt-8 flex justify-center lg:justify-start">
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
