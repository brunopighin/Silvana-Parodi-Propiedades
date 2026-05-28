import { useState, useRef } from 'react';
import { propertiesApi } from '../../api/client';

export default function VideoUploader({ propertyId, videoUrl, onVideoChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !propertyId) return;

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowed.includes(file.type)) {
      alert('Solo se permiten videos MP4, WebM o MOV');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert('El video no puede superar los 200MB');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('video', file);
      const { data } = await propertiesApi.uploadVideo(propertyId, formData, setProgress);
      onVideoChange(data.videoUrl);
    } catch (err) {
      alert('Error al subir video: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar el video de esta propiedad?')) return;
    try {
      await propertiesApi.deleteVideo(propertyId);
      onVideoChange(null);
    } catch {
      alert('Error al eliminar video');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      {!propertyId && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          Guardá la propiedad primero para poder cargar un video.
        </div>
      )}

      {/* Video actual */}
      {videoUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-64 object-contain"
          />
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Video cargado correctamente
            </span>
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      {propertyId && (
        uploading ? (
          <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-2xl p-8">
            <div className="text-center space-y-3">
              <svg className="animate-spin w-10 h-10 text-primary-500 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="font-semibold text-primary-700">Subiendo video...</p>
              <div className="w-full bg-primary-100 rounded-full h-2.5">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-primary-600 font-medium">{progress}%</p>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
                  <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.889L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-600">
                    {videoUrl ? 'Reemplazar video' : 'Subir video de la propiedad'}
                  </p>
                  <p className="text-sm mt-1">Arrastrá o hacé clic para seleccionar</p>
                  <p className="text-xs mt-1 text-gray-400">MP4, WebM, MOV · Máximo 200MB</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
