import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../hooks/useSettings';

export default function LocalBusinessSchema() {
  const { settings } = useSettings();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: settings.agency_name || 'Silvana Parodi Propiedades',
    description: settings.agency_tagline || 'Inmobiliaria en Luján, Buenos Aires. Venta, alquiler y tasaciones de propiedades.',
    url: 'https://www.silvanaparodi.com.ar',
    telephone: settings.phone || '+5492323537248',
    email: settings.email || 'silvanaparodiprop@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address || 'El Callao 564',
      addressLocality: settings.city || 'Luján',
      addressRegion: settings.province || 'Buenos Aires',
      addressCountry: 'AR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-34.5701',
      longitude: '-59.1032',
    },
    openingHours: settings.hours || 'Mo-Fr 09:00-12:30, Sa 09:00-12:00',
    areaServed: {
      '@type': 'City',
      name: 'Luján',
    },
    sameAs: [
      settings.instagram,
      settings.facebook,
    ].filter(Boolean),
    priceRange: '$$',
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
