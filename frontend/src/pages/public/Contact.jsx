import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { inquiriesApi } from '../../api/client';
import { buildWhatsAppUrl } from '../../utils/formatters';

export default function Contact() {
  const { settings } = useSettings();
  const [submitStatus, setSubmitStatus] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp || '5492323537248',
    '¡Hola! Me gustaría consultar sobre sus propiedades y servicios.'
  );

  const onSubmit = async (data) => {
    try {
      await inquiriesApi.create(data);
      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Contacto | Silvana Parodi Propiedades</title>
        <meta name="description" content="Contactá a Silvana Parodi Propiedades por WhatsApp, teléfono o email. Te asesoramos en la compra, venta y alquiler de propiedades." />
      </Helmet>

      <div className="pt-20">
        {/* Hero */}
        <section className="text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <div className="relative container mx-auto px-4">
            <span className="section-tag text-white/80">Contacto</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
              Hablemos sobre<br />
              <span className="text-gradient">tu próxima propiedad</span>
            </h1>
            <p className="text-white/80 max-w-xl text-lg">
              Nuestro equipo está disponible para asesorarte en cada paso del proceso.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact info */}
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">Información de contacto</h2>

                <div className="space-y-6 mb-10">
                  {[
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                      label: 'Dirección',
                      value: settings.address ? `${settings.address}, ${settings.city}, ${settings.province}` : null,
                    },
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>,
                      label: 'Teléfono',
                      value: settings.phone,
                      href: `tel:${settings.phone}`,
                    },
                    {
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>,
                      label: 'WhatsApp',
                      value: settings.whatsapp ? `+${settings.whatsapp}` : null,
                      href: whatsappUrl,
                      color: 'text-emerald-600',
                    },
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                      label: 'Email',
                      value: settings.email,
                      href: `mailto:${settings.email}`,
                    },
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                      label: 'Horarios',
                      value: settings.hours,
                    },
                  ].filter((item) => item.value).map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className={`w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color || 'text-primary-600'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-gray-800 hover:text-primary-600 transition-colors font-medium">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-800 font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-4 rounded-2xl transition-all w-full justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                  Escribir por WhatsApp ahora
                </a>

              </div>

              {/* Contact form */}
              <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Envianos un mensaje</h2>
                <p className="text-gray-500 text-sm mb-6">Te respondemos dentro de las 24 horas</p>

                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="w-8 h-8">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">¡Mensaje enviado!</h3>
                    <p className="text-gray-500 mb-6">Nos comunicaremos con vos a la brevedad.</p>
                    <button onClick={() => setSubmitStatus(null)} className="btn-secondary text-sm">
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nombre *</label>
                        <input {...register('name', { required: 'Requerido' })}
                          className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Tu nombre" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
                          type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="tu@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="label">Teléfono</label>
                      <input {...register('phone')} className="input" placeholder="+54 11 1234-5678" />
                    </div>

                    <div>
                      <label className="label">Mensaje *</label>
                      <textarea {...register('message', { required: 'Requerido', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
                        rows={5} className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                        placeholder="¿En qué podemos ayudarte?" />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    {submitStatus === 'error' && (
                      <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                        Hubo un error al enviar el mensaje. Por favor intentá nuevamente.
                      </p>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Enviando...
                        </span>
                      ) : 'Enviar mensaje'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          {(settings.address || settings.maps_embed) && (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Cómo llegarnos</h2>
              {settings.address && (
                <p className="text-gray-500 mb-4">
                  {settings.address}{settings.city ? `, ${settings.city}` : ''}{settings.province ? `, ${settings.province}` : ''}
                </p>
              )}
              <div className="h-56 max-w-lg rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src={
                    settings.maps_embed && !settings.maps_embed.includes('0x0')
                      ? settings.maps_embed
                      : `https://maps.google.com/maps?q=${encodeURIComponent(
                          `${settings.address || ''}${settings.city ? ', ' + settings.city : ''}${settings.province ? ', ' + settings.province : ''}, Argentina`
                        )}&output=embed&zoom=16`
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de la inmobiliaria"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
