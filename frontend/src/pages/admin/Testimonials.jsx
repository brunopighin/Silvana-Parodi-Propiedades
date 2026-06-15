import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { testimonialsApi } from '../../api/client';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', text: '', rating: 5, role: '', active: true });

  const load = () => {
    setLoading(true);
    testimonialsApi.getAllAdmin()
      .then(({ data }) => setTestimonials(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (editing === 'new') {
        await testimonialsApi.create(form);
      } else {
        await testimonialsApi.update(editing, form);
      }
      setEditing(null);
      setForm({ name: '', text: '', rating: 5, role: '', active: true });
      load();
    } catch {
      alert('Error al guardar');
    }
  };

  const handleEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, text: t.text, rating: t.rating, role: t.role || '', active: t.active });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar testimonio?')) return;
    await testimonialsApi.delete(id).catch(() => {});
    load();
  };

  const handleToggleActive = async (t) => {
    await testimonialsApi.update(t.id, { ...t, active: !t.active }).catch(() => {});
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Testimonios</h1>
          <button onClick={() => { setEditing('new'); setForm({ name: '', text: '', rating: 5, role: '', active: true }); }}
            className="btn-primary text-sm py-2.5">
            + Nuevo testimonio
          </button>
        </div>

        {/* Form */}
        {editing && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{editing === 'new' ? 'Nuevo testimonio' : 'Editar testimonio'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input" placeholder="Nombre del cliente" />
              </div>
              <div>
                <label className="label">Rol / Tipo de cliente</label>
                <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="input" placeholder="Comprador, Inquilino, etc." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Testimonio *</label>
                <textarea value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  rows={4} className="input resize-none" placeholder="¿Qué dijo el cliente?" />
              </div>
              <div>
                <label className="label">Calificación</label>
                <div className="flex gap-2 items-center">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))}
                      className={`text-2xl transition-transform hover:scale-110 ${s <= form.rating ? 'opacity-100' : 'opacity-30'}`}>
                      ⭐
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-primary-500 rounded" />
                  <span className="text-sm font-medium text-gray-700">Visible en el sitio</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="btn-primary text-sm py-2.5">Guardar</button>
              <button onClick={() => setEditing(null)} className="btn-ghost text-sm border border-gray-200">Cancelar</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center text-gray-400 py-8">Cargando...</div>
          ) : testimonials.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-8">No hay testimonios aún</div>
          ) : testimonials.map((t) => (
            <div key={t.id} className={`bg-white rounded-2xl border p-5 transition-all ${t.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={s <= t.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleToggleActive(t)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-primary-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
