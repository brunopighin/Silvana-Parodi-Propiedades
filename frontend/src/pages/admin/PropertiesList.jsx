import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi } from '../../api/client';
import { formatPrice, operationLabel, typeLabel, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['', 'disponible', 'vendido', 'alquilado', 'reservado'];

export default function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const load = () => {
    setLoading(true);
    const params = { limit: 15, page };
    if (status) params.status = status;
    if (search) params.search = search;

    propertiesApi.getAll(params)
      .then(({ data }) => {
        setProperties(data.properties);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, page]);

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await propertiesApi.delete(id);
      load();
    } catch {
      alert('Error al eliminar la propiedad');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await propertiesApi.update(id, { status: newStatus });
      load();
    } catch {
      alert('Error al cambiar el estado');
    }
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      await propertiesApi.update(id, { featured: !featured });
      load();
    } catch {
      alert('Error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
            <p className="text-gray-500 text-sm">{pagination.total} propiedades en total</p>
          </div>
          <Link to="/admin/propiedades/nueva" className="btn-primary text-sm py-2.5 self-start">
            + Nueva propiedad
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSearchParams(s ? { status: s } : {})}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s || 'Todos'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              className="input py-2 text-sm w-48"
            />
            <button onClick={load} className="btn-primary py-2 px-4 text-sm">Buscar</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Cargando...</div>
          ) : properties.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 mb-4">No hay propiedades</p>
              <Link to="/admin/propiedades/nueva" className="btn-primary text-sm">Cargar primera propiedad</Link>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {properties.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0].thumbnailUrl || p.images[0].url} className="w-full h-full object-cover" alt="" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                        <p className="text-primary-500 font-bold text-sm">{formatPrice(p.price, p.currency)}</p>
                        <p className="text-xs text-gray-500">{p.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to={`/admin/propiedades/${p.id}`} className="flex-1 text-center py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.title)} className="py-1.5 px-3 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-4 py-3 w-16">Foto</th>
                      <th className="text-left px-4 py-3">Propiedad</th>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-left px-4 py-3">Precio</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Dest.</th>
                      <th className="text-left px-4 py-3">Fecha</th>
                      <th className="text-left px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {properties.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100">
                            {p.images?.[0] ? (
                              <img src={p.images[0].thumbnailUrl || p.images[0].url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm max-w-xs truncate">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.city} · {operationLabel(p.operation)}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{typeLabel(p.type)}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-primary-600 text-sm">{formatPrice(p.price, p.currency)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border-0 cursor-pointer outline-none ${
                              p.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                              p.status === 'vendido' ? 'bg-gray-100 text-gray-600' :
                              p.status === 'alquilado' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            <option value="disponible">Disponible</option>
                            <option value="reservado">Reservado</option>
                            <option value="vendido">Vendido</option>
                            <option value="alquilado">Alquilado</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleFeatured(p.id, p.featured)}
                            className={`p-1.5 rounded-lg transition-colors ${p.featured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:bg-gray-100'}`}
                            title={p.featured ? 'Quitar destacado' : 'Marcar destacado'}
                          >
                            <svg viewBox="0 0 24 24" fill={p.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Link to={`/propiedad/${p.slug}`} target="_blank"
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ver en sitio">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                            </Link>
                            <Link to={`/admin/propiedades/${p.id}`}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Editar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </Link>
                            <button onClick={() => handleDelete(p.id, p.title)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-1.5 p-4 border-t border-gray-100">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button key={pg} onClick={() => setSearchParams({ ...(status && { status }), page: String(pg) })}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          pg === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{pg}</button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
