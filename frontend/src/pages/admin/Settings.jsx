import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { settingsApi, authApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SECTIONS = {
  agency: {
    label: 'Datos de la Agencia',
    fields: [
      { key: 'agency_name', label: 'Nombre de la agencia', type: 'text' },
      { key: 'agency_tagline', label: 'Slogan', type: 'text' },
      { key: 'agency_description', label: 'Descripción', type: 'textarea' },
    ],
  },
  contact: {
    label: 'Información de Contacto',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'text', placeholder: '+54 11 1234-5678' },
      { key: 'whatsapp', label: 'WhatsApp (solo números)', type: 'text', placeholder: '5492323537248' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'address', label: 'Dirección', type: 'text' },
      { key: 'city', label: 'Ciudad', type: 'text' },
      { key: 'province', label: 'Provincia', type: 'text' },
      { key: 'hours', label: 'Horarios de atención', type: 'text', placeholder: 'Lunes a Viernes: 9:00 - 18:00' },
    ],
  },
  social: {
    label: 'Redes Sociales',
    fields: [
      { key: 'facebook', label: 'Facebook URL', type: 'url' },
      { key: 'instagram', label: 'Instagram URL', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    ],
  },
  hero: {
    label: 'Sección Principal (Hero)',
    fields: [
      { key: 'hero_title', label: 'Título principal', type: 'text' },
    ],
  },
  seo: {
    label: 'SEO y Metadatos',
    fields: [
      { key: 'meta_title', label: 'Título SEO', type: 'text' },
      { key: 'meta_description', label: 'Descripción SEO', type: 'textarea' },
      { key: 'maps_embed', label: 'URL Embed Google Maps', type: 'url' },
    ],
  },
};

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('agency');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    settingsApi.getAll()
      .then(({ data }) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await settingsApi.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordMsg('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('✓ Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPasswordMsg(err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  if (loading) {
    return <AdminLayout><div className="text-center text-gray-400 py-12">Cargando...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 flex items-center gap-2">
            {saving ? 'Guardando...' : saved ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardado
              </>
            ) : 'Guardar cambios'}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 h-fit">
            {Object.entries(SECTIONS).map(([key, section]) => (
              <button key={key} onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === key ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {section.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button onClick={() => setActiveSection('security')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === 'security' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                Seguridad
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
            {activeSection === 'security' ? (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-6">Cambiar contraseña</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-4">
                      Usuario: <strong>{user?.email}</strong>
                    </p>
                  </div>
                  <div>
                    <label className="label">Contraseña actual</label>
                    <input type="password" value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">Nueva contraseña</label>
                    <input type="password" value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                      className="input" placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div>
                    <label className="label">Confirmar nueva contraseña</label>
                    <input type="password" value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                      className="input" placeholder="Repetir contraseña" />
                  </div>
                  {passwordMsg && (
                    <p className={`text-sm ${passwordMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passwordMsg}
                    </p>
                  )}
                  <button onClick={handlePasswordChange} className="btn-primary text-sm">
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-6">
                  {SECTIONS[activeSection]?.label}
                </h2>
                <div className="space-y-5">
                  {SECTIONS[activeSection]?.fields.map((field) => (
                    <div key={field.key}>
                      <label className="label">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={settings[field.key] || ''}
                          onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                          rows={4} className="input resize-none"
                          placeholder={field.placeholder} />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={settings[field.key] || ''}
                          onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                          className="input"
                          placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
