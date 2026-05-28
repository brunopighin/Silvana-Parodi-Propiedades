import { useState, useEffect } from 'react';
import { settingsApi } from '../api/client';

const DEFAULT_SETTINGS = {
  agency_name: 'Silvana Parodi Propiedades',
  agency_tagline: 'No es un trabajo, es una pasión ❤️',
  agency_description: '',
  phone: '+5492323537248',
  whatsapp: '5492323537248',
  email: 'silvanaparodiprop@gmail.com',
  address: 'El Callao 564',
  city: 'Luján',
  province: 'Buenos Aires',
  hours: 'Lunes a Viernes: 09:00 a 12:30 | Sábados: 09:00 a 12:00',
  instagram: 'https://www.instagram.com/silvanaparodipropiedades/',
  facebook: '',
  hero_title: 'Tu próximo hogar empieza acá.',
  hero_subtitle: 'Sabemos que buscar una propiedad es mucho más que un trámite: es una decisión de vida. Por eso, te brindamos la atención cálida y honesta que te merecés, para cuidar tu patrimonio. Encontrá tu espacio con nosotros.',
  about_title: 'Quiénes Somos',
  about_text: 'Silvana Parodi Propiedades nació con la misión de brindar el mejor servicio inmobiliario en Argentina. A lo largo de los años, hemos ayudado a cientos de familias y empresas a encontrar su lugar ideal, siempre con honestidad, transparencia y dedicación.\n\nNuestro equipo de profesionales capacitados trabaja para hacer que cada transacción sea simple, segura y satisfactoria. Creemos en el valor de la confianza y en la importancia de acompañar a cada cliente durante todo el proceso.',
  meta_title: 'Silvana Parodi Propiedades',
  meta_description: 'Comprá, vendé y alquilá propiedades con Silvana Parodi Propiedades. Casas, departamentos, locales y más en Buenos Aires y todo el país.',
  matricula: '4148',
};

let cachedSettings = null;

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    settingsApi.getAll()
      .then(({ data }) => {
        cachedSettings = { ...DEFAULT_SETTINGS, ...data };
        setSettings(cachedSettings);
      })
      .catch(() => {
        cachedSettings = DEFAULT_SETTINGS;
      })
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
