import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUploader from '../../components/admin/ImageUploader';
import VideoUploader from '../../components/admin/VideoUploader';
import { propertiesApi } from '../../api/client';
import AddressAutocomplete from '../../components/admin/AddressAutocomplete';

const TABS = ['general', 'detalles', 'extras', 'imagenes'];
const TAB_LABELS = { general: 'Información General', detalles: 'Detalles', extras: 'Extras y Amenities', imagenes: 'Imágenes' };

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [savedId, setSavedId] = useState(isEdit ? parseInt(id) : null);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [servicesText, setServicesText] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      status: 'disponible',
      operation: 'venta',
      type: 'departamento',
      currency: 'USD',
      expensesCurrency: 'ARS',
      province: 'Buenos Aires',
      garage: false,
      pool: false,
      garden: false,
      terrace: false,
      balcony: false,
      featured: false,
      isNew: false,
      acceptsTradeIn: false,
      aptaCredito: false,
    },
  });

  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    setLoading(true);

    propertiesApi.getById(id).then(({ data }) => {
      reset({ ...data });
      setImages(data.images || []);
      setVideoUrl(data.videoUrl || null);
      setSavedId(data.id);
      if (data.amenities) {
        try { setAmenitiesText(JSON.parse(data.amenities).join('\n')); } catch { }
      }
      if (data.services) {
        try { setServicesText(JSON.parse(data.services).join('\n')); } catch { }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const amenitiesArray = amenitiesText.split('\n').map((s) => s.trim()).filter(Boolean);
      const servicesArray = servicesText.split('\n').map((s) => s.trim()).filter(Boolean);

      const payload = {
        ...data,
        amenities: JSON.stringify(amenitiesArray),
        services: JSON.stringify(servicesArray),
        garage: data.garage === true || data.garage === 'true',
        pool: data.pool === true || data.pool === 'true',
        garden: data.garden === true || data.garden === 'true',
        terrace: data.terrace === true || data.terrace === 'true',
        balcony: data.balcony === true || data.balcony === 'true',
        featured: data.featured === true || data.featured === 'true',
        isNew: data.isNew === true || data.isNew === 'true',
        acceptsTradeIn: data.acceptsTradeIn === true || data.acceptsTradeIn === 'true',
        aptaCredito: data.aptaCredito === true || data.aptaCredito === 'true',
      };

      if (isEdit) {
        await propertiesApi.update(savedId, payload);
        alert('Propiedad actualizada exitosamente');
      } else {
        const { data: created } = await propertiesApi.create(payload);
        setSavedId(created.id);
        setActiveTab('imagenes');
        alert('Propiedad creada. Ahora podés agregar imágenes.');
        navigate(`/admin/propiedades/${created.id}`);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/admin/propiedades" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
              Volver a propiedades
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar propiedad' : 'Nueva propiedad'}
            </h1>
          </div>
          <button onClick={handleSubmit(onSubmit)} disabled={saving} className="btn-primary text-sm py-2.5">
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear propiedad'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* TAB: General */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div>
                  <label className="label">Título de la propiedad *</label>
                  <input {...register('title', { required: 'Requerido' })}
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Ej: Hermoso departamento en Palermo" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="label">Descripción completa *</label>
                  <textarea {...register('description', { required: 'Requerido' })}
                    rows={6} className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                    placeholder="Descripción detallada de la propiedad..." />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Operación *</label>
                    <select {...register('operation')} className="input">
                      <option value="venta">Venta</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="alquiler-temporario">Alquiler Temporario</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tipo de propiedad *</label>
                    <select {...register('type')} className="input">
                      {['casa','departamento','ph','local','oficina','terreno','galpon','campo','cochera'].map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Estado</label>
                    <select {...register('status')} className="input">
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                      <option value="alquilado">Alquilado</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Precio</label>
                    <input {...register('price')} type="text"
                      className="input" placeholder="Ej: 150.000" />
                  </div>
                  <div>
                    <label className="label">Moneda</label>
                    <select {...register('currency')} className="input">
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Expensas (opcional)</label>
                    <input {...register('expenses')} type="text" className="input" placeholder="Ej: 600.000" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dirección</label>
                    <AddressAutocomplete
                      value={watch('address') || ''}
                      onChange={(v) => setValue('address', v)}
                      onSelect={({ address, neighborhood, city, province, latitude, longitude }) => {
                        setValue('address', address);
                        if (neighborhood) setValue('neighborhood', neighborhood);
                        if (city) setValue('city', city);
                        if (province) setValue('province', province);
                        if (latitude) setValue('latitude', latitude);
                        if (longitude) setValue('longitude', longitude);
                      }}
                      error={!!errors.address}
                    />
                    <input type="hidden" {...register('address')} />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="label">Localidad / Barrio</label>
                    <input {...register('neighborhood')} className="input" placeholder="Pueblo Nuevo, Palermo, etc." />
                  </div>
                  <div>
                    <label className="label">Ciudad / Partido *</label>
                    <input {...register('city', { required: 'Requerido' })}
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      placeholder="Ej: Luján, Mercedes, CABA" />
                  </div>
                  <div>
                    <label className="label">Provincia</label>
                    <select {...register('province')} className="input">
                      {['Buenos Aires','CABA','Córdoba','Santa Fe','Mendoza','Rosario','La Plata','Neuquén','Salta','Tucumán'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-primary-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">Propiedad destacada</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" {...register('isNew')} className="w-4 h-4 accent-primary-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">Marcar como nuevo</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: Detalles */}
            {activeTab === 'detalles' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Sup. total (m²)</label>
                    <input {...register('totalArea')} type="number" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Sup. cubierta (m²)</label>
                    <input {...register('coveredArea')} type="number" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Ambientes</label>
                    <input {...register('rooms')} type="number" min="1" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Dormitorios</label>
                    <input {...register('bedrooms')} type="number" min="0" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Baños</label>
                    <input {...register('bathrooms')} type="number" min="0" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Toilettes</label>
                    <input {...register('toilets')} type="number" min="0" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Piso N°</label>
                    <input {...register('floor')} type="number" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Pisos del edificio</label>
                    <input {...register('floors')} type="number" className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="label">Año construcción</label>
                    <input {...register('yearBuilt')} type="number" className="input" placeholder="2020" />
                  </div>
                  <div>
                    <label className="label">Orientación</label>
                    <select {...register('orientation')} className="input">
                      <option value="">-</option>
                      {['Norte','Sur','Este','Oeste','NE','NO','SE','SO'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Estado del inmueble</label>
                    <select {...register('condition')} className="input">
                      <option value="">-</option>
                      <option value="excelente">Excelente</option>
                      <option value="muy-bueno">Muy bueno</option>
                      <option value="bueno">Bueno</option>
                      <option value="a-refaccionar">A refaccionar</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  {[
                    { name: 'garage', label: 'Cochera' },
                    { name: 'pool', label: 'Pileta' },
                    { name: 'garden', label: 'Jardín' },
                    { name: 'terrace', label: 'Terraza' },
                    { name: 'balcony', label: 'Balcón' },
                    { name: 'acceptsTradeIn', label: 'Acepta entrega y financiación' },
                    { name: 'aptaCredito', label: 'Apta crédito' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" {...register(name)} className="w-4 h-4 accent-primary-500 rounded" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Extras */}
            {activeTab === 'extras' && (
              <div className="space-y-5">
                <div>
                  <label className="label">Amenities (uno por línea)</label>
                  <textarea
                    value={amenitiesText}
                    onChange={(e) => setAmenitiesText(e.target.value)}
                    rows={6} className="input resize-none font-mono text-sm"
                    placeholder="SUM&#10;Pileta&#10;Gimnasio&#10;Portero 24hs&#10;Laundry" />
                  <p className="text-xs text-gray-400 mt-1">Ingresá un amenity por línea</p>
                </div>
                <div>
                  <label className="label">Servicios disponibles (uno por línea)</label>
                  <textarea
                    value={servicesText}
                    onChange={(e) => setServicesText(e.target.value)}
                    rows={6} className="input resize-none font-mono text-sm"
                    placeholder="Gas natural&#10;Agua corriente&#10;Electricidad&#10;Internet fibra&#10;Cable" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitud (opcional)</label>
                    <input {...register('latitude')} type="number" step="any" className="input" placeholder="-34.603722" />
                  </div>
                  <div>
                    <label className="label">Longitud (opcional)</label>
                    <input {...register('longitude')} type="number" step="any" className="input" placeholder="-58.381592" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Imágenes */}
            {activeTab === 'imagenes' && (
              <div className="space-y-8">
                {/* Imágenes */}
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Imágenes de la propiedad</h3>
                    <p className="text-sm text-gray-500">
                      Las imágenes se convierten automáticamente a WebP y se optimizan.
                      Podés subir hasta 20 imágenes. Arrastrá para reordenar.
                    </p>
                  </div>
                  <ImageUploader
                    propertyId={savedId}
                    images={images}
                    onImagesChange={setImages}
                  />
                  {!savedId && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="btn-primary"
                      >
                        {saving ? 'Guardando...' : 'Guardar propiedad para poder cargar imágenes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Video */}
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="font-semibold text-gray-900 mb-1">Video de la propiedad</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Subí un video desde tu PC. Se mostrará en la publicación con controles de reproducción.
                  </p>
                  <VideoUploader
                    propertyId={savedId}
                    videoUrl={videoUrl}
                    onVideoChange={setVideoUrl}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            {activeTab !== 'imagenes' && (
              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear propiedad'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
