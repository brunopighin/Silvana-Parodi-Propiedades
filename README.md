# Inmobiliaria Pro — Sistema Web Completo

Sistema inmobiliario premium con web pública, panel administrador, gestión de propiedades e imágenes optimizadas.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | SQLite (via Prisma ORM) |
| Imágenes | Sharp (local) / Cloudinary (opcional) |
| Autenticación | JWT + bcryptjs |

---

## Instalación rápida

### 1. Clonar / descomprimir el proyecto

```bash
cd C:\Users\bruno\inmobiliaria-pro
```

### 2. Configurar el Backend

```bash
cd backend
npm install
copy .env.example .env
```

Editar `.env` con tus datos (el archivo ya tiene valores por defecto que funcionan).

```bash
npm run db:push       # Crear la base de datos
npm run db:seed       # Cargar datos de ejemplo
npm run dev           # Iniciar servidor en puerto 3001
```

### 3. Configurar el Frontend

```bash
cd ..\frontend
npm install
npm run dev           # Iniciar en http://localhost:5173
```

---

## Acceso al Panel Admin

```
URL:      http://localhost:5173/admin
Email:    admin@inmobiliaria.com
Password: admin123
```

> **Importante:** Cambiar la contraseña desde el panel en Configuración > Seguridad.

---

## Estructura del Proyecto

```
inmobiliaria-pro/
├── backend/
│   ├── server.js              # Entrada del servidor
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.js            # Datos de ejemplo
│   ├── src/
│   │   ├── routes/            # Rutas de la API
│   │   └── middleware/        # Auth y upload
│   └── uploads/               # Imágenes locales
└── frontend/
    └── src/
        ├── pages/
        │   ├── public/        # Sitio web público
        │   └── admin/         # Panel administrador
        ├── components/        # Componentes reutilizables
        ├── api/               # Cliente HTTP
        ├── context/           # AuthContext
        ├── hooks/             # Custom hooks
        └── utils/             # Formatters y helpers
```

---

## Funcionalidades

### Sitio Público
- **Hero** con buscador integrado
- **Buscador avanzado** con filtros: operación, tipo, ubicación, precio, ambientes, dormitorios, baños, cochera
- **Propiedades destacadas** en homepage
- **Galería de imágenes** con lightbox y miniaturas
- **Página de detalle** completa con mapa, características, formulario de consulta
- **Botón WhatsApp** flotante y por propiedad con mensaje automático
- **Servicios**, **Nosotros**, **Contacto** con mapa de Google
- **Testimonios** de clientes
- **SEO** optimizado con meta tags y Open Graph

### Panel Administrador
- **Dashboard** con estadísticas en tiempo real
- **CRUD completo** de propiedades
- **Cambio de estado**: Disponible / Vendido / Alquilado / Reservado
- **Marcar destacadas** con un clic
- **Sistema de imágenes**:
  - Drag & drop para subir múltiples imágenes
  - Conversión automática a WebP
  - Redimensionamiento optimizado
  - Drag & drop para reordenar
  - Selección de imagen principal
  - Eliminación individual
- **Consultas recibidas** con lector de mensajes integrado
- **Testimonios** (crear, editar, activar/desactivar)
- **Configuración** del sitio (nombre, contacto, redes, SEO, hero)
- **Cambio de contraseña** seguro

---

## API Endpoints

### Propiedades (público)
```
GET  /api/properties          Lista con filtros y paginación
GET  /api/properties/featured Propiedades destacadas
GET  /api/properties/:slug    Detalle por slug
```

### Propiedades (admin)
```
POST   /api/properties         Crear
PUT    /api/properties/:id     Editar
DELETE /api/properties/:id     Eliminar
POST   /api/properties/:id/images          Subir imágenes
DELETE /api/properties/:id/images/:imgId   Eliminar imagen
PUT    /api/properties/:id/images/reorder  Reordenar
PUT    /api/properties/:id/images/:id/main Cambiar principal
```

### Consultas
```
POST /api/inquiries       Enviar consulta (público)
GET  /api/inquiries       Listar consultas (admin)
PUT  /api/inquiries/:id/read    Marcar leída
PUT  /api/inquiries/:id/archive Archivar
DELETE /api/inquiries/:id       Eliminar
```

### Otras
```
GET /api/testimonials     Testimonios activos (público)
GET /api/settings         Configuración (público)
PUT /api/settings         Actualizar configuración (admin)
POST /api/auth/login      Login admin
GET  /api/auth/me         Usuario actual
```

---

## Imágenes: Almacenamiento

### Modo Local (por defecto)
Las imágenes se guardan en `backend/uploads/` y se sirven automáticamente.
Se convierten a WebP y se generan miniaturas.

### Modo Cloudinary (recomendado para producción)
1. Crear cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. Copiar credenciales al `.env`:
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```
El sistema detecta automáticamente si Cloudinary está configurado.

**Plan gratuito Cloudinary**: 25 GB almacenamiento, 25 GB bandwidth/mes.

---

## Despliegue en Producción

### Backend (Railway / Render / VPS)
```bash
# Variables de entorno de producción:
NODE_ENV=production
DATABASE_URL=file:./prod.db
JWT_SECRET=clave_secreta_muy_larga_y_aleatoria
FRONTEND_URL=https://tu-dominio.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Subir carpeta dist/ a tu hosting
```

Agregar en `.env` del frontend:
```
VITE_API_URL=https://tu-api.railway.app/api
```

---

## Personalización Rápida

1. **Nombre y datos de la agencia**: Panel Admin → Configuración
2. **WhatsApp**: Panel Admin → Configuración → Contacto → WhatsApp (solo números)
3. **Hero title/subtitle**: Panel Admin → Configuración → Hero
4. **Colores**: `frontend/tailwind.config.js` → `colors.primary`
5. **Logo**: Reemplazar el SVG en `Header.jsx` y `Footer.jsx`

---

## Soporte

Ante cualquier consulta o problema de instalación, el desarrollador puede:
- Actualizar credenciales en el `.env`
- Ejecutar `npm run db:reset` para reiniciar la base de datos
- Revisar logs con `npm run dev`
