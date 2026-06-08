import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LocalBusinessSchema from '../../components/seo/LocalBusinessSchema';
import PropertyCard from '../../components/ui/PropertyCard';
import SearchBar from '../../components/ui/SearchBar';
import { propertiesApi, testimonialsApi } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import { buildWhatsAppUrl } from '../../utils/formatters';

const services = [
  { icon: '🏠', title: 'Venta de Propiedades', desc: 'Asesoramos en la compra y venta con valuación de mercado, marketing digital y acompañamiento legal.' },
  { icon: '🔑', title: 'Alquileres', desc: 'Gestión integral de alquileres: selección de inquilinos, contratos y administración mensual.' },
  { icon: '📋', title: 'Tasaciones', desc: 'Valuación profesional de su propiedad con análisis comparativo de mercado actualizado.' },
  { icon: '⚙️', title: 'Administración', desc: 'Administramos su propiedad: cobranzas, expensas, mantenimiento e inquilinos.' },
  { icon: '💼', title: 'Asesoramiento', desc: 'Orientación experta en cada etapa: búsqueda, análisis, negociación y escrituración.' },
  { icon: '📈', title: 'Inversiones', desc: 'Identificamos las mejores oportunidades de inversión inmobiliaria para maximizar su retorno.' },
];


function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" fill={s <= rating ? '#EAB308' : 'none'}
          stroke={s <= rating ? '#EAB308' : '#D1D5DB'} strokeWidth="2" className="w-4 h-4">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const { settings } = useSettings();
  const servicesRef = useReveal();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    propertiesApi.getFeatured()
      .then(({ data }) => setFeatured(data))
      .catch(() => {});
    testimonialsApi.getAll()
      .then(({ data }) => setTestimonials(data))
      .catch(() => {});
  }, []);

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp || '5492323537248',
    '¡Hola! Quiero consultar sobre sus propiedades.'
  );

  return (
    <>
      <Helmet>
        <title>{settings.meta_title || 'Silvana Parodi Propiedades'}</title>
        <meta name="description" content={settings.meta_description || 'Comprá, vendé y alquilá propiedades.'} />
      </Helmet>
      <LocalBusinessSchema />

      {/* HERO */}
      <section
        className="relative h-screen flex items-center overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        style={{ perspective: '1200px' }}
      >
        {/* Fondo rojo fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800" />

        {/* Video de fondo */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={`${import.meta.env.BASE_URL}IMG_7084.mp4`} type="video/mp4" />
        </video>

        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />


        <div className="relative container mx-auto px-4 flex flex-col items-center text-center" style={{ marginTop: '5vh' }}>
          <img
            src={`${import.meta.env.BASE_URL}logo-silvana-parodi.png`}
            alt="Silvana Parodi Propiedades"
            className="hero-3d-logo w-56 sm:w-72 md:w-[380px] lg:w-[480px] drop-shadow-2xl mb-4"
            style={{
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
          />
          <h1 className="hero-3d-title font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-3 max-w-2xl">
            {settings.hero_title || 'Tu próximo hogar empieza acá.'}
          </h1>
          <p className="hero-3d-subtitle text-sm md:text-base text-white/75 leading-relaxed mb-6 max-w-xl">
            {settings.hero_subtitle || 'Sabemos que buscar una propiedad es mucho más que un trámite: es una decisión de vida. Por eso, te brindamos la atención cálida y honesta que te merecés, para cuidar tu patrimonio. Encontrá tu espacio con nosotros.'}
          </p>
          <div className="hero-3d-buttons flex flex-wrap justify-center gap-4">
            <Link to="/propiedades?operation=venta"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-all">
              Ver propiedades en venta
            </Link>
            <Link to="/propiedades?operation=alquiler"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-all">
              Alquileres disponibles
            </Link>
          </div>
        </div>


        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <span className="text-xs">Deslizá</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* SEARCH */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-semibold text-gray-700 mb-6">Buscador de propiedades</h2>
          <SearchBar />
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-tag">Propiedades destacadas</span>
            <h2 className="section-title mb-4">Las mejores oportunidades</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Seleccionamos las propiedades más atractivas del mercado para que puedas encontrar tu hogar ideal.
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-7 w-32 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/propiedades" className="btn-secondary">
              Ver todas las propiedades
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* SELL / RENT CTA */}
      <section className="py-20 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-primary-300 font-semibold text-sm uppercase tracking-widest mb-4">
              Propietarios
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              ¿Buscás vender o alquilar<br className="hidden md:block" /> tu inmueble?
            </h2>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Te acompañamos en todo el proceso: tasación gratuita, publicación en los principales portales, gestión de visitas y cierre del negocio. Con la experiencia y dedicación que tu propiedad merece.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: '📋', title: 'Tasación gratuita', desc: 'Valuamos tu propiedad al precio real de mercado sin compromiso.' },
                { icon: '📣', title: 'Máxima difusión', desc: 'Publicamos en los principales portales inmobiliarios del país.' },
                { icon: '🤝', title: 'Gestión completa', desc: 'Nos encargamos de visitas, negociación y toda la documentación.' },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-primary-200 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contacto" className="btn-primary bg-white text-primary-600 hover:bg-primary-50 text-base px-8 py-3.5">
                Quiero tasar mi propiedad
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp || '5492323537248'}?text=${encodeURIComponent('¡Hola! Me gustaría tasar mi propiedad.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={servicesRef} className="reveal py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-tag">Nuestros servicios</span>
            <h2 className="section-title mb-4">Todo lo que necesitás en un solo lugar</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Ofrecemos un servicio integral para compradores, vendedores e inversores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                to="/servicios"
                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Saber más
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="section-tag">Testimonios</span>
              <h2 className="section-title mb-4">Lo que dicen nuestros clientes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <StarRating rating={t.rating} />
                  <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Listo para encontrar tu propiedad?
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-8 text-lg">
            Contactanos hoy y uno de nuestros asesores te guiará en todo el proceso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contacto" className="btn-primary text-base">
              Contactar ahora
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all text-base"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.868 9.868 0 0 1-5.042-1.379l-.361-.213-3.741.898.913-3.74-.234-.381A9.865 9.865 0 0 1 2.118 12c0-5.444 4.438-9.882 9.882-9.882 5.444 0 9.882 4.438 9.882 9.882 0 5.444-4.438 9.882-9.882 9.882z"/>
              </svg>
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
