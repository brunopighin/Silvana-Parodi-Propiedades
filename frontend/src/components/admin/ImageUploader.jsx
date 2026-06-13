import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { propertiesApi } from '../../api/client';

const hashFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export default function ImageUploader({ propertyId, images, onImagesChange }) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const [dupError, setDupError] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(false);
  const uploadedHashes = useRef(new Set());

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!propertyId || acceptedFiles.length === 0) return;

    setDupError(null);

    // Calcular hashes de los archivos seleccionados
    const withHashes = await Promise.all(
      acceptedFiles.map(async (file) => ({ file, hash: await hashFile(file) }))
    );

    // Detectar duplicados entre sí y contra los ya subidos
    const duplicates = [];
    const toUpload = [];
    const seen = new Set();

    for (const { file, hash } of withHashes) {
      if (uploadedHashes.current.has(hash) || seen.has(hash)) {
        duplicates.push(file.name);
      } else {
        seen.add(hash);
        toUpload.push({ file, hash });
      }
    }

    if (duplicates.length > 0) {
      setDupError(`Imagen${duplicates.length > 1 ? 's' : ''} duplicada${duplicates.length > 1 ? 's' : ''}: ${duplicates.join(', ')}`);
    }

    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const files = toUpload.map(({ file }) => file);
      const { data } = await propertiesApi.uploadImages(propertyId, files);
      toUpload.forEach(({ hash }) => uploadedHashes.current.add(hash));
      onImagesChange([...images, ...data]);
    } catch (err) {
      alert('Error al subir imágenes: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  }, [propertyId, images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    disabled: !propertyId || uploading,
  });

  const handleDelete = async (imageId) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await propertiesApi.deleteImage(propertyId, imageId);
      onImagesChange(images.filter((i) => i.id !== imageId));
    } catch {
      alert('Error al eliminar imagen');
    }
  };

  const handleSetMain = async (imageId) => {
    try {
      await propertiesApi.setMainImage(propertyId, imageId);
      onImagesChange(images.map((i) => ({ ...i, isMain: i.id === imageId })));
    } catch {
      alert('Error al cambiar imagen principal');
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    const withOrder = newImages.map((img, i) => ({ ...img, order: i, isMain: i === 0 }));
    onImagesChange(withOrder);
    setPendingOrder(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await propertiesApi.reorderImages(
        propertyId,
        images.map(({ id, order, isMain }) => ({ id, order, isMain }))
      );
      setPendingOrder(false);
    } catch {
      alert('Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!propertyId && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          Guardá la propiedad primero para poder cargar imágenes.
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-primary-500 bg-primary-50' :
          !propertyId ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' :
          'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-primary-500">
            <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="font-semibold">Subiendo y optimizando imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div>
              <p className="font-semibold text-gray-600">
                {isDragActive ? 'Soltá las imágenes aquí' : 'Arrastrá imágenes o hacé clic para seleccionar'}
              </p>
              <p className="text-sm mt-1">JPG, PNG, WebP · Máximo 10MB por imagen · Hasta 20 imágenes</p>
              <p className="text-xs mt-1 text-primary-500">Las imágenes se convierten automáticamente a WebP optimizado</p>
            </div>
          </div>
        )}
      </div>

      {/* Error de duplicados */}
      {dupError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{dupError} — no se subió para evitar repetidos.</span>
          <button onClick={() => setDupError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600">
              {images.length} imagen{images.length !== 1 ? 'es' : ''} cargada{images.length !== 1 ? 's' : ''}.
              La primera con borde dorado es la principal.
            </p>
            {pendingOrder && (
              <button
                onClick={saveOrder}
                disabled={saving}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                )}
                {saving ? 'Guardando...' : 'Guardar orden'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(img.id); }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (fromIndex !== index) moveImage(fromIndex, index);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing border-2 transition-all ${
                  img.isMain ? 'border-amber-400 shadow-lg' :
                  dragOverId === img.id ? 'border-primary-500' : 'border-transparent'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {img.isMain && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Principal
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isMain && (
                    <button
                      onClick={() => handleSetMain(img.id)}
                      title="Hacer principal"
                      className="w-8 h-8 bg-amber-400 hover:bg-amber-500 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    title="Eliminar imagen"
                    className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/50 text-white text-xs rounded flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Arrastrá las imágenes para cambiar el orden · Presioná <strong>Guardar orden</strong> para aplicar los cambios en la web
          </p>
        </div>
      )}
    </div>
  );
}
