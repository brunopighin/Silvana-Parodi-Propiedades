import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { propertiesApi, inquiriesApi } from '../../api/client';
import { formatPrice, formatDateTime } from '../../utils/formatters';

const StatCard = ({ label, value, color, icon, to }) => (
  <Link to={to} className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-card transition-all group`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0, disponible: 0, vendido: 0, alquilado: 0, reservado: 0
  });
  const [inquiryStats, setInquiryStats] = useState({ total: 0, unread: 0 });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    // Stats exactas por estado via endpoint dedicado (evita traer 100 propiedades)
    propertiesApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {});

    // Solo las 5 más recientes para la tabla del dashboard
    propertiesApi.getAll({ limit: 5 })
      .then(({ data }) => setRecentProperties(data.properties))
      .catch(() => {});

    inquiriesApi.getStats().then(({ data }) => setInquiryStats(data)).catch(() => {});
    inquiriesApi.getAll({ limit: 5 }).then(({ data }) => setRecentInquiries(data.inquiries || [])).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Resumen de tu inmobiliaria</p>
          </div>
          <Link to="/admin/propiedades/nueva" className="btn-primary text-sm py-2.5">
            + Nueva propiedad
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard to="/admin/propiedades" label="Total propiedades" value={stats.total}
            color="bg-gray-100 text-gray-700"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} />
          <StatCard to="/admin/propiedades?status=disponible" label="Disponibles" value={stats.disponible}
            color="bg-emerald-100 text-emerald-700"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="20 6 9 17 4 12"/></svg>} />
          <StatCard to="/admin/propiedades?status=vendido" label="Vendidas" value={stats.vendido}
            color="bg-gray-100 text-gray-600"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>} />
          <StatCard to="/admin/propiedades?status=alquilado" label="Alquiladas" value={stats.alquilado}
            color="bg-blue-100 text-blue-700"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>} />
          <StatCard to="/admin/consultas" label="Consultas nuevas" value={inquiryStats.unread}
            color="bg-primary-100 text-primary-700"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
        </div>

        {/* Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent properties */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Últimas propiedades</h2>
              <Link to="/admin/propiedades" className="text-sm text-primary-600 hover:underline">Ver todas</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentProperties.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No hay propiedades aún</p>
              ) : recentProperties.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0].thumbnailUrl || p.images[0].url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">{formatPrice(p.price, p.currency)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'vendido' ? 'bg-gray-100 text-gray-600' :
                    p.status === 'alquilado' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{p.status}</span>
                  <Link to={`/admin/propiedades/${p.id}`} className="text-gray-300 hover:text-primary-600 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent inquiries */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                Últimas consultas
                {inquiryStats.unread > 0 && (
                  <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    {inquiryStats.unread}
                  </span>
                )}
              </h2>
              <Link to="/admin/consultas" className="text-sm text-primary-600 hover:underline">Ver todas</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInquiries.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No hay consultas aún</p>
              ) : recentInquiries.map((inq) => (
                <div key={inq.id} className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${inq.read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{inq.name}</p>
                      {inq.property && (
                        <p className="text-xs text-gray-500 truncate">Prop: {inq.property.title}</p>
                      )}
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{inq.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(inq.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
