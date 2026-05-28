import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { buildWhatsAppUrl } from '../../utils/formatters';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSettings();
  const { pathname } = useLocation();

  const isHomePage = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp || '5492323537248',
    '¡Hola! Quiero consultar sobre sus propiedades.'
  );

  const isTransparent = isHomePage && !scrolled && !menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-primary-600 shadow-md'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo-silvana-parodi.png`}
              alt="Silvana Parodi Propiedades"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-white bg-white/20'
                      : isTransparent
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>


          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-3 rounded-lg transition-colors ${
              'text-white hover:bg-white/10'
            }`}
            aria-label="Menú"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden bg-white border-t border-gray-100 transition-all duration-300 ${
        menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
