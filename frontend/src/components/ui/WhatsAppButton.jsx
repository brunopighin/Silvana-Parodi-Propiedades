import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { buildWhatsAppUrl } from '../../utils/formatters';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const [hovered, setHovered] = useState(false);
  const url = buildWhatsAppUrl(
    settings.whatsapp || '5492323537248',
    '¡Hola! Estoy interesado en sus propiedades. ¿Me pueden asesorar?'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip */}
      <div className={`bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-xl shadow-lg transition-all duration-300 whitespace-nowrap ${
        hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
      }`}>
        ¡Hablanos por WhatsApp!
      </div>

      {/* Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        {/* Pulso */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 relative">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.868 9.868 0 0 1-5.042-1.379l-.361-.213-3.741.898.913-3.74-.234-.381A9.865 9.865 0 0 1 2.118 12c0-5.444 4.438-9.882 9.882-9.882 5.444 0 9.882 4.438 9.882 9.882 0 5.444-4.438 9.882-9.882 9.882z"/>
        </svg>
      </a>
    </div>
  );
}
