import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROPERTY_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local Comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'campo', label: 'Campo' },
];

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    operation: 'venta',
    type: '',
    city: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/propiedades?${params.toString()}`);
  };

  const set = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <label htmlFor="search-city-compact" className="sr-only">Ciudad o barrio</label>
        <input
          id="search-city-compact"
          type="text"
          placeholder="Buscar por ciudad, barrio..."
          value={filters.city}
          onChange={(e) => set('city', e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" className="btn-primary py-2.5 px-5 text-sm">
          Buscar
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl p-5 md:p-6"
    >
      {/* Operation tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5 w-fit" role="group" aria-label="Tipo de operación">
        {[
          { value: 'venta', label: 'Comprar' },
          { value: 'alquiler', label: 'Alquilar' },
          { value: 'alquiler-temporario', label: 'Temp.' },
        ].map((op) => (
          <button
            key={op.value}
            type="button"
            onClick={() => set('operation', op.value)}
            aria-pressed={filters.operation === op.value}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              filters.operation === op.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Text search */}
      <div className="relative mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <label htmlFor="search-text" className="sr-only">Buscar por título, dirección o barrio</label>
        <input
          id="search-text"
          type="text"
          placeholder="Buscar por título, dirección, barrio..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <div>
          <label htmlFor="search-type" className="label text-xs">Tipo de propiedad</label>
          <select
            id="search-type"
            value={filters.type}
            onChange={(e) => set('type', e.target.value)}
            className="input py-2.5 text-sm"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search-city" className="label text-xs">Ubicación</label>
          <input
            id="search-city"
            type="text"
            placeholder="Ciudad o barrio..."
            value={filters.city}
            onChange={(e) => set('city', e.target.value)}
            className="input py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="search-min-price" className="label text-xs">Precio mínimo</label>
          <input
            id="search-min-price"
            type="number"
            placeholder="Sin mínimo"
            value={filters.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
            className="input py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="search-max-price" className="label text-xs">Precio máximo</label>
          <input
            id="search-max-price"
            type="number"
            placeholder="Sin máximo"
            value={filters.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
            className="input py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="search-rooms" className="label text-xs">Ambientes</label>
          <select
            id="search-rooms"
            value={filters.rooms}
            onChange={(e) => set('rooms', e.target.value)}
            className="input py-2.5 text-sm"
          >
            <option value="">Cualquiera</option>
            <option value="1">1 ambiente</option>
            <option value="2">2+ ambientes</option>
            <option value="3">3+ ambientes</option>
            <option value="4">4+ ambientes</option>
            <option value="5">5+ ambientes</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Buscar propiedades
        </button>
      </div>
    </form>
  );
}
