import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import ImageGallery from '../../components/ui/ImageGallery';
import PropertyCard from '../../components/ui/PropertyCard';
import { propertiesApi, inquiriesApi } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import {
  formatPrice, formatArea, operationLabel, typeLabel,
  conditionLabel, formatDate, propertyWhatsAppMessage
} from '../../utils/formatters';

const Feature = ({ icon, label, value }) => value == null || value === '' ? null : (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500 flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
    </div>
  </div>
);

export default function PropertyDetail() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [property?.title]);
  const { settings } = useSettings();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    setLoading(true);
    propertiesApi.getBySlug(slug)
      .then(({ data }) => setProperty(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  const onSubmit = async (data) => {
    try {
      await inquiriesApi.create({ ...data, propertyId: property?.id });
      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="skeleton aspect-[16/10] rounded-2xl mb-4" />
            </div>
            <div className="space-y-4">
              <div className="skeleton h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Propiedad no encontrada</h2>
          <Link to="/propiedades" className="btn-primary">Ver todas las propiedades</Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = propertyWhatsAppMessage(property, settings.whatsapp || '5492323537248');
  let amenities = [], services = [];
  try { amenities = property.amenities ? JSON.parse(property.amenities) : []; } catch {}
  try { services = property.services ? JSON.parse(property.services) : []; } catch {}

  return (
    <>
      <Helmet>
        <title>{property.title} | Silvana Parodi Propiedades</title>
        <meta name="description" content={property.description?.substring(0, 160)} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: property.description?.substring(0, 300),
          url: `https://www.silvanaparodipropiedades.com/propiedad/${property.slug}`,
          image: property.images?.[0]?.url,
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: property.currency || 'USD',
            availability: property.status === 'disponible'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: property.address,
            addressLocality: property.city,
            addressRegion: property.province,
            addressCountry: 'AR',
          },
          floorSize: property.coveredArea ? {
            '@type': 'QuantitativeValue',
            value: property.coveredArea,
            unitCode: 'MTK',
          } : undefined,
          numberOfRooms: property.rooms,
          numberOfBedrooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
        }).replace(/</g, '\\u003c')}</script>
      </Helmet>

      <div className="pt-20 min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Ruta de navegación">
              <Link to="/" className="hover:text-primary-600">Inicio</Link>
              <span aria-hidden="true">/</span>
              <Link to="/propiedades" className="hover:text-primary-600">Propiedades</Link>
              <span aria-hidden="true">/</span>
              <span className="text-gray-900 truncate max-w-xs" aria-current="page">{property.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <ImageGallery images={property.images} title={property.title} />

              {/* Title & Status */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${property.operation === 'venta' ? 'bg-primary-100 text-primary-600' : 'bg-blue-100 text-blue-700'}`}>
                    {operationLabel(property.operation)}
                  </span>
                  <span className="badge bg-gray-100 text-gray-700">{typeLabel(property.type)}</span>
                  {property.isNew && <span className="badge badge-nuevo">Nuevo</span>}
                  {property.featured && <span className="badge badge-destacado">Destacado</span>}
                  {property.status === 'vendido' && <span className="badge badge-vendido">Vendido</span>}
                  {property.status === 'alquilado' && <span className="badge badge-alquilado">Alquilado</span>}
                  {property.status === 'reservado' && <span className="badge badge-reservado">Reservado</span>}
                </div>

                <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>

                <p className="flex items-center gap-2 text-gray-500 mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary-500" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {property.address}{property.neighborhood ? `, ${property.neighborhood}` : ''}, {property.city}, {property.province}
                </p>

                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-t border-gray-100">
                  {property.rooms && (
                    <div className="text-center bg-gray-50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-gray-900">{property.rooms}</p>
                      <p className="text-xs text-gray-500">Ambientes</p>
                    </div>
                  )}
                  {property.bedrooms !== null && property.bedrooms !== undefined && (
                    <div className="text-center bg-gray-50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                      <p className="text-xs text-gray-500">Dormitorios</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center bg-gray-50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-xs text-gray-500">Baños</p>
                    </div>
                  )}
                  {property.coveredArea && (
                    <div className="text-center bg-gray-50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-gray-900">{property.coveredArea}</p>
                      <p className="text-xs text-gray-500">m² cubiertos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Descripción</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Características</h2>
                <div className="grid md:grid-cols-2 gap-x-6">
                  <Feature icon="🏗️" label="Tipo" value={typeLabel(property.type)} />
                  <Feature icon="📐" label="Superficie total" value={formatArea(property.totalArea)} />
                  <Feature icon="📏" label="Superficie cubierta" value={formatArea(property.coveredArea)} />
                  <Feature icon="🛏️" label="Dormitorios" value={property.bedrooms} />
                  <Feature icon="🚿" label="Baños" value={property.bathrooms} />
                  <Feature icon="🚽" label="Toilettes" value={property.toilets} />
                  <Feature icon="🚗" label="Cochera" value={property.garage ? `Sí (${property.garageSpaces || 1} lugar${(property.garageSpaces || 1) > 1 ? 'es' : ''})` : 'No'} />
                  <Feature icon="🏊" label="Pileta" value={property.pool ? 'Sí' : null} />
                  <Feature icon="🌿" label="Jardín" value={property.garden ? 'Sí' : null} />
                  <Feature icon="🔄" label="Acepta entrega y financiación" value={property.acceptsTradeIn ? 'Sí' : null} />
                  <Feature icon="🏦" label="Apta crédito" value={property.aptaCredito ? 'Sí' : null} />
                  <Feature icon="🏗️" label="Año de construcción" value={property.yearBuilt} />
                  <Feature icon="🧭" label="Orientación" value={property.orientation} />
                  <Feature icon="⭐" label="Estado" value={property.condition ? conditionLabel(property.condition) : null} />
                  {property.floor && <Feature icon="🏢" label="Piso" value={`${property.floor}°`} />}
                  {property.expenses > 0 && (
                    <Feature icon="💰" label="Expensas" value={formatPrice(property.expenses, property.expensesCurrency)} />
                  )}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-gray-900 text-lg mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a) => (
                      <span key={a} className="bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-xl">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {services.length > 0 && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-gray-900 text-lg mb-4">Servicios</h2>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span key={s} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-xl">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {property.videoUrl && (
                <div className="bg-white rounded-2xl p-6">
                  <h2 className="font-semibold text-gray-900 text-lg mb-4">Video de la propiedad</h2>
                  <div className="rounded-xl overflow-hidden flex justify-center bg-gray-100">
                    <video
                      src={property.videoUrl}
                      controls
                      className="max-h-[640px] max-w-full rounded-xl"
                      preload="metadata"
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Ubicación</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {property.address}, {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}, {property.province}
                </p>
                <div className="aspect-[16/7] bg-gray-100 rounded-xl overflow-hidden">
                  <iframe
                    title="Mapa"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      property.latitude && property.longitude
                        ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&output=embed&zoom=16`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(`${property.address}, ${property.neighborhood ? property.neighborhood + ', ' : ''}${property.city}, ${property.province}, Argentina`)}&output=embed`
                    }
                  />
                </div>
              </div>

              {/* Inquiry form */}
              <div className="bg-white rounded-2xl p-6" id="consultar">
                <h2 className="font-semibold text-gray-900 text-lg mb-1">Consultá por esta propiedad</h2>
                <p className="text-gray-500 text-sm mb-5">Un asesor te contactará a la brevedad</p>

                {submitStatus === 'success' ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-center">
                    <p className="font-semibold mb-1">¡Consulta enviada!</p>
                    <p className="text-sm">Te contactaremos a la brevedad. Gracias.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="inquiry-name" className="label">Nombre completo</label>
                        <input id="inquiry-name" {...register('name', { required: 'Requerido' })}
                          className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Tu nombre"
                          aria-invalid={errors.name ? 'true' : 'false'} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="inquiry-email" className="label">Email</label>
                        <input id="inquiry-email" {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
                          className={`input ${errors.email ? 'input-error' : ''}`} placeholder="tu@email.com"
                          aria-invalid={errors.email ? 'true' : 'false'} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="inquiry-phone" className="label">Teléfono (opcional)</label>
                      <input id="inquiry-phone" {...register('phone')} className="input" placeholder="+54 11 1234-5678" />
                    </div>
                    <div>
                      <label htmlFor="inquiry-message" className="label">Mensaje</label>
                      <textarea id="inquiry-message" {...register('message', { required: 'Requerido' })}
                        rows={4} className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                        defaultValue={`Hola, quiero consultar por la propiedad "${property.title}".`}
                        aria-invalid={errors.message ? 'true' : 'false'} />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>
                    {submitStatus === 'error' && (
                      <p className="text-red-500 text-sm">Hubo un error. Intentá de nuevo.</p>
                    )}
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                      {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Price card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
                <p className="text-3xl font-bold text-primary-500 mb-1">
                  {formatPrice(property.price, property.currency)}
                </p>
                {property.expenses > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    + Expensas {formatPrice(property.expenses, property.expensesCurrency)}
                  </p>
                )}

                <div className="space-y-3 mb-6">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Consultar por "${property.title}" por WhatsApp (se abre en una pestaña nueva)`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                  <a href="#consultar"
                    className="flex items-center justify-center w-full py-3 btn-secondary">
                    Enviar consulta
                  </a>
                </div>

                {/* Compartir */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Compartir propiedad</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${property.title} - ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Compartir esta propiedad por WhatsApp (se abre en una pestaña nueva)"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-xl transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <button
                      onClick={handleShare}
                      aria-label={copied ? 'Link copiado al portapapeles' : 'Copiar link de esta propiedad'}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-emerald-500" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copiar link
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Related properties */}
          {property.related?.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Propiedades similares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.related.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
