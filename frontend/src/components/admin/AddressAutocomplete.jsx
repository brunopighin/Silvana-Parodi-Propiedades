import { useState, useRef, useEffect, useCallback } from 'react';

export default function AddressAutocomplete({ value, onChange, onSelect, error }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (!q || q.length < 4) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Argentina')}&format=json&addressdetails=1&countrycodes=ar&limit=6`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    search(v);
  };

  const handleSelect = (item) => {
    const addr = item.address;

    const street = [addr.road, addr.house_number].filter(Boolean).join(' ');
    const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || '';
    const city = addr.city || addr.town || addr.municipality || addr.county || '';
    const province = addr.state || '';
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const display = street || item.display_name.split(',')[0];

    setQuery(display);
    setOpen(false);
    setSuggestions([]);
    onSelect({ address: display, neighborhood, city, province, latitude: lat, longitude: lon });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={`input pr-10 ${error ? 'input-error' : ''}`}
          placeholder="Escribí la dirección para buscar..."
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); setSuggestions([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((item) => (
            <li key={item.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {[item.address.road, item.address.house_number].filter(Boolean).join(' ') || item.display_name.split(',')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{item.display_name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
