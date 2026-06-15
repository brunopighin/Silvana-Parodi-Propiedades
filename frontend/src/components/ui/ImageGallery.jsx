import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ImageGallery({ images, title = 'la propiedad' }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const thumbsRef = useRef(null);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(images.length - 1, c + 1)), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  // Scroll thumbnail into view in lightbox
  useEffect(() => {
    if (!lightbox || !thumbsRef.current) return;
    const thumb = thumbsRef.current.children[current];
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [current, lightbox]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  if (!images?.length) return null;

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full h-full cursor-zoom-in"
            aria-label={`Ampliar imagen ${current + 1} de ${images.length} de ${title}`}
          >
            <img
              src={images[current]?.url}
              alt={`Foto ${current + 1} de ${title}`}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
            />
          </button>

          {images.length > 1 && (
            <>
              {current > 0 && (
              <button
                onClick={prev}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              )}
              {current < images.length - 1 && (
              <button
                onClick={next}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5" aria-hidden="true">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-10 pointer-events-none">
                {current + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 pointer-events-none z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" aria-hidden="true">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            Ampliar
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrent(i)}
                aria-label={`Ver foto ${i + 1} de ${title}`}
                aria-current={i === current}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? 'border-primary-600 opacity-100 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — portal para escapar del stacking context del transform en <main> */}
      {lightbox && createPortal(
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" role="dialog" aria-modal="true" aria-label={`Galería de imágenes de ${title}`}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
            <span className="text-white/60 text-sm">{current + 1} / {images.length}</span>
            <button
              className="text-white/70 hover:text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(false)}
              aria-label="Cerrar galería de imágenes"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 px-16">
            {current > 0 && (
              <button
                onClick={prev}
                aria-label="Imagen anterior"
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={next}
                aria-label="Imagen siguiente"
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6" aria-hidden="true">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
            <img
              src={images[current]?.url}
              alt={`Foto ${current + 1} de ${title}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex-shrink-0 px-4 py-4">
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrent(i)}
                    aria-label={`Ver foto ${i + 1} de ${title}`}
                    aria-current={i === current}
                    className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${
                      i === current
                        ? 'border-white opacity-100 scale-105'
                        : 'border-transparent opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img
                      src={img.thumbnailUrl || img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
