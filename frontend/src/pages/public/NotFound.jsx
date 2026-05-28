import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada | Silvana Parodi Propiedades</title>
      </Helmet>

      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Número 404 */}
          <div className="relative mb-6">
            <p className="font-display text-[10rem] font-bold leading-none text-primary-100 select-none">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">
            Esta página no existe
          </h1>
          <p className="text-gray-500 mb-8">
            La dirección que ingresaste no corresponde a ninguna sección del sitio. Puede que haya sido movida o eliminada.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">
              Ir al inicio
            </Link>
            <Link to="/propiedades" className="btn-secondary">
              Ver propiedades
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
