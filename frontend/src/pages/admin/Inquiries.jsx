import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { inquiriesApi } from '../../api/client';
import { formatDateTime } from '../../utils/formatters';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const load = () => {
    setLoading(true);
    inquiriesApi.getAll({ archived: showArchived ? 'true' : 'false', limit: 50 })
      .then(({ data }) => setInquiries(data.inquiries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [showArchived]);

  const handleMarkRead = async (id) => {
    await inquiriesApi.markRead(id).catch(() => {});
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, read: true } : i));
    if (selected?.id === id) setSelected((prev) => ({ ...prev, read: true }));
  };

  const handleArchive = async (id) => {
    await inquiriesApi.archive(id).catch(() => {});
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta consulta?')) return;
    await inquiriesApi.delete(id).catch(() => {});
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleSelect = (inq) => {
    setSelected(inq);
    if (!inq.read) handleMarkRead(inq.id);
  };

  const unread = inquiries.filter((i) => !i.read).length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Consultas
              {unread > 0 && (
                <span className="w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm">{inquiries.length} consulta{inquiries.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`text-sm px-4 py-2 rounded-xl border transition-all ${
              showArchived ? 'border-gray-300 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {showArchived ? 'Ver activas' : 'Ver archivadas'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex" style={{ minHeight: '500px' }}>
          {/* List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : inquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay consultas</div>
            ) : (
              inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => handleSelect(inq)}
                  className={`w-full text-left px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selected?.id === inq.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${inq.read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${inq.read ? 'text-gray-700 font-normal' : 'text-gray-900 font-semibold'}`}>
                        {inq.name}
                      </p>
                      {inq.property && (
                        <p className="text-xs text-primary-500 truncate">{inq.property.title}</p>
                      )}
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{inq.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(inq.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 p-6 hidden md:block">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                    <div className="flex gap-3 mt-1 text-sm text-gray-500">
                      <a href={`mailto:${selected.email}`} className="hover:text-primary-600">{selected.email}</a>
                      {selected.phone && (
                        <>
                          <span>·</span>
                          <a href={`tel:${selected.phone}`} className="hover:text-primary-600">{selected.phone}</a>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(selected.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selected.email}?subject=Re: Consulta sobre propiedad`}
                      className="btn-primary text-sm py-2"
                    >
                      Responder por email
                    </a>
                    {selected.phone && (
                      <a
                        href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${selected.name}, te escribo en respuesta a tu consulta.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {selected.property && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm">
                    <span className="text-gray-500">Consulta por: </span>
                    <span className="font-semibold text-gray-900">{selected.property.title}</span>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Mensaje</p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">{selected.message}</p>
                </div>

                <div className="flex gap-3">
                  {!selected.read && (
                    <button onClick={() => handleMarkRead(selected.id)} className="btn-ghost text-sm border border-gray-200">
                      Marcar como leída
                    </button>
                  )}
                  <button onClick={() => handleArchive(selected.id)} className="btn-ghost text-sm border border-gray-200">
                    Archivar
                  </button>
                  <button onClick={() => handleDelete(selected.id)} className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-3 text-gray-200">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p>Seleccioná una consulta para ver el detalle</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
