import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PropertyCard from '../../components/ui/PropertyCard';
import { propertiesApi } from '../../api/client';

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'campo', label: 'Campo' },
];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Estado local del input de búsqueda: se actualiza en cada tecla pero solo
  // propaga al URL (y dispara el fetch) 400ms después de que el usuario para de tipear.
  const [searchDraft, setSearchDraft] = useState('');
  const searchDebounceRef = useRef(null);

  const getParams = useCallback(() => ({
    operation: searchParams.get('operation') || '',
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rooms: searchParams.get('rooms') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    garage: searchParams.get('garage') || '',
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  }), [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = getParams();
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
    propertiesApi.getAll(cleanParams)
      .then(({ data }) => {
        setProperties(data.properties);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getParams]);

  const updateParam = (key, value) => {
    const current = Object.fromEntries(searchParams.entries());
    if (value) current[key] = value; else delete current[key];
    current.page = '1';
    setSearchParams(current);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchDraft(val);
    // Esperar 400ms desde la última tecla antes de actualizar la URL y disparar el fetch
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => updateParam('search', val), 400);
  };

  // Sincronizar el draft si la URL cambia por otra vía (limpiar filtros, back/forward)
  useEffect(() => {
    setSearchDraft(searchParams.get('search') || '');
  }, [searchParams]);

  const clearAll = () => { setSearchDraft(''); setSearchParams({}); };

  const params = getParams();
  const hasFilters = !!(params.operation || params.type || params.city || params.minPrice || params.maxPrice || params.rooms);

  return (
    <>
      <Helmet>
        <title>Propiedades en Venta y Alquiler | Silvana Parodi Propiedades</title>
        <meta name="description" content="Encontrá casas, departamentos, locales y más en Argentina. Filtrá por ubicación, precio, ambientes y más." />
      </Helmet>

      <div className="pt-20 min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
              {params.operation === 'venta' ? 'Propiedades en Venta'
                : params.operation === 'alquiler' ? 'Propiedades en Alquiler'
                : 'Todas las Propiedades'}
            </h1>
            <p className="text-gray-500">
              {loading ? 'Cargando...' : `${pagination.total} propiedad${pagination.total !== 1 ? 'es' : ''} encontrada${pagination.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search input */}
          <div className="relative mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <label htmlFor="properties-search" className="sr-only">Buscar por título, dirección o barrio</label>
            <input
              id="properties-search"
              type="text"
              placeholder="Buscar por título, dirección, barrio..."
              value={searchDraft}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchDraft && (
              <button
                onClick={() => { setSearchDraft(''); updateParam('search', ''); }}
                aria-label="Borrar búsqueda"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Operation tabs */}
          <div className="flex gap-2 mb-6">
            <div role="group" aria-label="Filtrar por operación" className="flex gap-2">
              {[
                { value: '', label: 'Todo' },
                { value: 'venta', label: 'Venta' },
                { value: 'alquiler', label: 'Alquiler' },
                { value: 'alquiler-temporario', label: 'Temp.' },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => updateParam('operation', op.value)}
                  aria-pressed={params.operation === op.value}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    params.operation === op.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls="properties-filters-panel"
              className={`ml-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${
                hasFilters
                  ? 'border-primary-500 text-primary-500 bg-primary-50'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
              </svg>
              Filtros{hasFilters && <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center" aria-hidden="true">!</span>}
            </button>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <div id="properties-filters-panel" className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label htmlFor="filter-type" className="label text-xs">Tipo</label>
                  <select id="filter-type" value={params.type} onChange={(e) => updateParam('type', e.target.value)} className="input py-2.5 text-sm">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-city" className="label text-xs">Ciudad / Barrio</label>
                  <input id="filter-city" type="text" placeholder="Ej: Palermo" value={params.city}
                    onChange={(e) => updateParam('city', e.target.value)} className="input py-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="filter-min-price" className="label text-xs">Precio mínimo</label>
                  <input id="filter-min-price" type="number" placeholder="Sin mínimo" value={params.minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)} className="input py-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="filter-max-price" className="label text-xs">Precio máximo</label>
                  <input id="filter-max-price" type="number" placeholder="Sin máximo" value={params.maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)} className="input py-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="filter-rooms" className="label text-xs">Ambientes</label>
                  <select id="filter-rooms" value={params.rooms} onChange={(e) => updateParam('rooms', e.target.value)} className="input py-2.5 text-sm">
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option><option value="2">2+</option>
                    <option value="3">3+</option><option value="4">4+</option><option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-bedrooms" className="label text-xs">Dormitorios</label>
                  <select id="filter-bedrooms" value={params.bedrooms} onChange={(e) => updateParam('bedrooms', e.target.value)} className="input py-2.5 text-sm">
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option><option value="2">2+</option>
                    <option value="3">3+</option><option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-bathrooms" className="label text-xs">Baños</label>
                  <select id="filter-bathrooms" value={params.bathrooms} onChange={(e) => updateParam('bathrooms', e.target.value)} className="input py-2.5 text-sm">
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-garage" className="label text-xs">Cochera</label>
                  <select id="filter-garage" value={params.garage} onChange={(e) => updateParam('garage', e.target.value)} className="input py-2.5 text-sm">
                    <option value="">Indistinto</option>
                    <option value="true">Con cochera</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={clearAll} className="btn-ghost text-sm text-gray-500">
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : properties.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-gray-300" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">No encontramos propiedades</h2>
              <p className="text-gray-400 mb-6">Intentá con otros filtros o consultanos directamente</p>
              <button onClick={clearAll} className="btn-primary">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <h2 className="sr-only">Resultados de la búsqueda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <nav className="flex justify-center gap-2 mt-10" aria-label="Paginación de resultados">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    const current = parseInt(params.page) || 1;
                    return (
                      <button
                        key={p}
                        onClick={() => updateParam('page', String(p))}
                        aria-label={`Ir a la página ${p}`}
                        aria-current={p === current ? 'page' : undefined}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          p === current
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
