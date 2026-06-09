# Deploy en Hostinger Horizons — Silvana Parodi Propiedades

## Datos del proyecto

| Campo | Valor |
|-------|-------|
| Stack | React + Vite (frontend) / Node.js + Express + Prisma (backend) |
| DB | PostgreSQL (Supabase) |
| Almacenamiento | Cloudinary (imágenes) / Supabase Storage (legado) |
| Puerto backend | 3001 (variable `PORT` en Hostinger) |

---

## Variables de entorno requeridas en Hostinger

Configurar en **Horizons → Settings → Environment Variables**:

### Críticas (el servidor no levanta sin estas)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Supabase con pooler (`?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Connection string directa de Supabase (para migraciones) |

### Importantes (funcionalidad reducida si faltan)

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase (admin SDK) |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_JWT_SECRET` | JWT secret de Supabase — **Settings → API → JWT Secret** |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de Storage (`properties` por defecto) |

### Cloudinary (definitivo para evitar el error de threads)

| Variable | Descripción |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloud name de tu cuenta Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

> **Por qué Cloudinary es importante:** Sharp/libvips crea threads del SO por cada imagen.
> Hostinger limita a 120 threads totales. Con 20 imágenes en secuencia, Sharp puede
> alcanzar ese límite y fallar con `glib: Error creating thread`.
> Con Cloudinary el redimensionado ocurre en la nube y el servidor no toca las imágenes.

### Reducción de threads del SO (env vars de Node.js)

Agregar también estas para reducir el baseline de ~44 threads:

| Variable | Valor recomendado |
|----------|-------------------|
| `UV_THREADPOOL_SIZE` | `2` |
| `VIPS_CONCURRENCY` | `1` |
| `NODE_OPTIONS` | `--v8-pool-size=1` |

### Generales

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://www.silvanaparodi.com.ar` |
| `SITE_URL` | `https://www.silvanaparodi.com.ar` |
| `PORT` | (Hostinger asigna automáticamente, no hace falta setear) |

---

## Comandos de build/deploy en Hostinger

| Campo | Valor |
|-------|-------|
| **Build command** | `npm run deploy` |
| **Start command** | `npm start` |
| **Root directory** | `/` (raíz del repo) |

### Qué hace cada script (en `package.json` raíz)

```json
"deploy": "cd frontend && npm install && npm run build && cd ../backend && npm install",
"start":  "cd backend && node server.js"
```

- `deploy`: instala dependencias de frontend, construye el bundle de React, instala dependencias de backend.
  El `postinstall` del backend ejecuta `prisma generate` automáticamente.
- `start`: levanta solo `node server.js` — sin `npx prisma generate` (ya fue generado en el build).

---

## Checklist antes de cada deploy

- [ ] Variables de entorno configuradas en Hostinger (ver tabla arriba)
- [ ] `SUPABASE_JWT_SECRET` seteada (requerida para auth sin llamadas de red)
- [ ] Credenciales de Cloudinary seteadas (para uploads sin procesar imágenes localmente)
- [ ] `.env` NO commiteado al repo (está en `.gitignore`)
- [ ] `backend/uploads/` ignorado en git excepto `.gitkeep`

---

## Arquitectura de uploads de imágenes

```
Frontend (ImageUploader) → POST /api/properties/:id/images (multipart)
                         → Multer (memoryStorage, máx 10 MB/imagen, hasta 20)
                         → upload.js detecta proveedor:
                             1. Cloudinary (si CLOUDINARY_* están seteadas)  ← recomendado
                             2. Supabase Storage (si SUPABASE_* están seteadas)
                             3. Local /uploads/  ← solo desarrollo
```

**Prioridad de borrado:** el proveedor se detecta por la URL de la imagen, no por las
env vars activas. Así, imágenes viejas de Supabase se siguen pudiendo borrar aunque
ahora Cloudinary esté activo.

---

## Diagnóstico de problemas comunes

### El servidor no levanta / loop de reinicios
1. Revisar logs en Horizons → Logs
2. Buscar `❌ Variables críticas faltantes` — setear `DATABASE_URL`
3. Buscar `💥 uncaughtException` — indica error de módulo al cargar

### Uploads de imágenes fallan con error de threads
```
glib: Error creating thread: Resource temporarily unavailable
```
**Solución:** Configurar Cloudinary (ver tabla de variables). Mientras tanto, subir
imágenes de a 3-5 en lugar de todas juntas.

### Error 401 en endpoints admin
Verificar que `SUPABASE_JWT_SECRET` esté seteada. Sin esta variable, el middleware
de auth no puede verificar tokens y devuelve 401 en todos los endpoints protegidos.

### Propiedades/consultas no cargan
Verificar `DATABASE_URL`. Si el pool está saturado, reducir `max` en `prisma.js`
de 3 a 2 y redeploy.

---

## Monitoreo de procesos

En Hostinger la pestaña **Resource Usage** muestra el gráfico de procesos.
- Baseline normal: ~44 threads al arrancar
- Pico durante upload con Sharp: puede llegar a 120 (límite del hosting)
- Con Cloudinary + env vars de threads reducidas: baseline ~25, picos ~40
