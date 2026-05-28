import { Link } from 'react-router-dom';
import { formatPrice, formatArea, operationLabel, typeLabel, propertyWhatsAppMessage } from '../../utils/formatters';
import { useSettings } from '../../hooks/useSettings';
import { useTilt } from '../../hooks/useTilt';

const StatusBadge = ({ status, isNew, featured }) => {
  if (status === 'vendido') return <span className="badge badge-vendido">Vendido</span>;
  if (status === 'alquilado') return <span className="badge badge-alquilado">Alquilado</span>;
  if (status === 'reservado') return <span className="badge badge-reservado">Reservado</span>;
  if (isNew) return <span className="badge badge-nuevo">Nuevo</span>;
  if (featured) return <span className="badge badge-destacado">Destacado</span>;
  return null;
};

const OperationTag = ({ operation }) => {
  const colors = {
    venta: 'bg-primary-500 text-white',
    alquiler: 'bg-blue-600 text-white',
    'alquiler-temporario': 'bg-purple-600 text-white',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors[operation] || 'bg-gray-600 text-white'}`}>
      {operationLabel(operation)}
    </span>
  );
};

export default function PropertyCard({ property }) {
  const { settings } = useSettings();
  const mainImage = property.images?.find((i) => i.isMain) || property.images?.[0];
  const whatsappUrl = propertyWhatsAppMessage(property, settings.whatsapp || '5492323537248');
  const isUnavailable = ['vendido', 'alquilado'].includes(property.status);
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);

  return (
    <article
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="property-card group"
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease', willChange: 'transform', position: 'relative' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <Link to={`/propiedad/${property.slug}`}>
          {mainImage ? (
            <img
              src={mainImage.thumbnailUrl || mainImage.url}
              alt={property.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isUnavailable ? 'grayscale-[40%]' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray-300">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}
        </Link>

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <OperationTag operation={property.operation} />
          <StatusBadge status={property.status} isNew={property.isNew} featured={property.featured} />
        </div>

        {/* Image count */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            {property.images.length}
          </div>
        )}
      </div>

      {/* Shine overlay */}
      <div
        data-shine
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          opacity: 0, pointerEvents: 'none', transition: 'opacity 0.3s', zIndex: 10,
        }}
      />

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <p className="text-lg font-bold text-primary-600 leading-none">
              {formatPrice(property.price, property.currency)}
            </p>
            {property.expenses > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                + Expensas {formatPrice(property.expenses, property.expensesCurrency || 'ARS')}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
            {typeLabel(property.type)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/propiedad/${property.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-1 hover:text-primary-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 flex-shrink-0 text-primary-500">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
        </p>

        {/* Features */}
        <div className="grid grid-cols-4 gap-1 mb-3 py-2 border-t border-gray-100">
          {property.rooms && (
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <span className="text-xs font-semibold text-gray-700">{property.rooms}</span>
              <span className="text-[10px] text-gray-400">amb.</span>
            </div>
          )}
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
                <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7h18M3 7l2.5-4h13L21 7"/>
              </svg>
              <span className="text-xs font-semibold text-gray-700">{property.bedrooms}</span>
              <span className="text-[10px] text-gray-400">dorm.</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
                <path d="M9 6 C9 4.34 10.34 3 12 3 C13.66 3 15 4.34 15 6 L15 10 L3 10 L3 14 C3 17.31 5.69 20 9 20 L15 20 C18.31 20 21 17.31 21 14 L21 10 L15 10"/>
              </svg>
              <span className="text-xs font-semibold text-gray-700">{property.bathrooms}</span>
              <span className="text-[10px] text-gray-400">baños</span>
            </div>
          )}
          {property.coveredArea && (
            <div className="flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
              </svg>
              <span className="text-xs font-semibold text-gray-700">{property.coveredArea}</span>
              <span className="text-[10px] text-gray-400">m²</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/propiedad/${property.slug}`}
            className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Ver propiedad
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            title="Consultar por WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.053 23.947c-.077.31.163.55.473.473l6.123-1.47A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.868 9.868 0 0 1-5.042-1.379l-.361-.213-3.741.898.913-3.74-.234-.381A9.865 9.865 0 0 1 2.118 12c0-5.444 4.438-9.882 9.882-9.882 5.444 0 9.882 4.438 9.882 9.882 0 5.444-4.438 9.882-9.882 9.882z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
