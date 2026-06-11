import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img
                src={`${import.meta.env.BASE_URL}logo-silvana-parodi.png`}
                alt="Silvana Parodi Propiedades"
                className="h-24 w-auto object-contain"
              />
            </Link>
            {settings.matricula && (
              <p className="text-xs text-white/70 mb-1">Mat. {settings.matricula}</p>
            )}
            <p className="text-sm text-white leading-relaxed mb-5">
              {settings.agency_tagline || 'No es un trabajo, es una pasión ❤️'}
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.868 9.868 0 0 1-5.042-1.379l-.361-.213-3.741.898.913-3.74-.234-.381A9.865 9.865 0 0 1 2.118 12c0-5.444 4.438-9.882 9.882-9.882 5.444 0 9.882 4.438 9.882 9.882 0 5.444-4.438 9.882-9.882 9.882z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Navegación</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/propiedades', label: 'Propiedades' },
                { to: '/propiedades?operation=venta', label: 'Propiedades en Venta' },
                { to: '/propiedades?operation=alquiler', label: 'Propiedades en Alquiler' },
                { to: '/servicios', label: 'Servicios' },
                { to: '/nosotros', label: 'Nosotros' },
                { to: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-4 text-sm">
              {settings.address && (
                <li className="flex gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 text-white flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="text-white">{settings.address}, {settings.city}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 text-white flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                  </svg>
                  <a href={`tel:${settings.phone}`} className="text-white hover:text-white/80 transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 text-white flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href={`mailto:${settings.email}`} className="text-white hover:text-white/80 transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.hours && (
                <li className="flex gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 text-white flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="text-white">{settings.hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-primary-700/60">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">
          <p className="text-xs text-white/70">
            © {year} {settings.agency_name || 'Silvana Parodi Propiedades'}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/70">
            Desarrollado por <span className="hover:text-white transition-colors">bjpsistemas</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
