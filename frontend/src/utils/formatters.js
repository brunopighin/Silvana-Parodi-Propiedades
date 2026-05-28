export const formatPrice = (price, currency = 'ARS') => {
  if (!price && price !== 0) return 'Consultar';

  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
};

export const formatArea = (area) => {
  if (!area) return null;
  return `${area.toLocaleString('es-AR')} m²`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const operationLabel = (op) => {
  const map = {
    venta: 'Venta',
    alquiler: 'Alquiler',
    'alquiler-temporario': 'Alquiler Temp.',
  };
  return map[op] || op;
};

export const typeLabel = (type) => {
  const map = {
    casa: 'Casa',
    departamento: 'Departamento',
    ph: 'PH',
    local: 'Local Comercial',
    oficina: 'Oficina',
    terreno: 'Terreno',
    galpon: 'Galpón',
    campo: 'Campo',
    cochera: 'Cochera',
  };
  return map[type] || type;
};

export const statusLabel = (status) => {
  const map = {
    disponible: 'Disponible',
    vendido: 'Vendido',
    alquilado: 'Alquilado',
    reservado: 'Reservado',
  };
  return map[status] || status;
};

export const conditionLabel = (condition) => {
  const map = {
    excelente: 'Excelente',
    'muy-bueno': 'Muy bueno',
    bueno: 'Bueno',
    'a-refaccionar': 'A refaccionar',
  };
  return map[condition] || condition;
};

export const buildWhatsAppUrl = (phone, message) => {
  const clean = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
};


export const propertyWhatsAppMessage = (property, phone) => {
  const msg = `Hola, quiero consultar por la propiedad "${property.title}" ubicada en ${property.address}, ${property.city}. ¿Podría darme más información?`;
  return buildWhatsAppUrl(phone, msg);
};
