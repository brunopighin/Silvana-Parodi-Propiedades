import { supabase } from '../lib/supabase';

const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'properties';

// Slug simple sin dependencia externa
const toSlug = (text) =>
  text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');

// Columnas numéricas (Float/Int) de Property: Postgres rechaza '' para estos tipos
const NUMERIC_FIELDS = [
  'price', 'latitude', 'longitude', 'totalArea', 'coveredArea',
  'rooms', 'bedrooms', 'bathrooms', 'toilets', 'garageSpaces',
  'expenses', 'yearBuilt', 'floors', 'floor',
];

// Convierte campos numéricos vacíos ('') a null y los strings con valor a Number
const sanitizeNumericFields = (data) => {
  const result = { ...data };
  for (const field of NUMERIC_FIELDS) {
    if (field in result) {
      const value = result[field];
      result[field] = value === '' || value === null || value === undefined
        ? null
        : Number(value);
    }
  }
  return result;
};

const isAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};

// Elimina un archivo de Supabase Storage por su publicId (path dentro del bucket)
const removeFromStorage = async (url, publicId) => {
  if (!url || !publicId) return;
  if (url.includes('supabase.co')) {
    await supabase.storage.from(BUCKET).remove([publicId]);
  }
};

// ─── Properties ────────────────────────────────────────────────────────────

export const propertiesApi = {
  getAll: async (params = {}) => {
    const {
      operation, type, city, neighborhood, province,
      minPrice, maxPrice, rooms, bedrooms, bathrooms,
      garage, pool, featured, status, search,
      page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc',
    } = params;

    const admin = await isAdmin();
    const ALLOWED_SORT = ['createdAt', 'price', 'title', 'updatedAt'];
    const safeSortBy = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt';
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('Property')
      .select('*, images:Image(id, url, thumbnailUrl, order, isMain)', { count: 'exact' });

    // RLS maneja el filtro de status para anon, pero admin necesita filtro explícito
    if (admin && status) query = query.eq('status', status);

    if (operation)  query = query.eq('operation', operation);
    if (type)       query = query.eq('type', type);
    if (city)       query = query.ilike('city', `%${city}%`);
    if (province)   query = query.ilike('province', `%${province}%`);
    if (neighborhood) query = query.ilike('neighborhood', `%${neighborhood}%`);
    if (featured === 'true') query = query.eq('featured', true);
    if (garage === 'true')   query = query.eq('garage', true);
    if (pool === 'true')     query = query.eq('pool', true);
    if (rooms)      query = query.gte('rooms', parseInt(rooms));
    if (bedrooms)   query = query.gte('bedrooms', parseInt(bedrooms));
    if (bathrooms)  query = query.gte('bathrooms', parseInt(bathrooms));
    if (minPrice)   query = query.gte('price', parseFloat(minPrice));
    if (maxPrice)   query = query.lte('price', parseFloat(maxPrice));
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,neighborhood.ilike.%${search}%`
      );
    }

    query = query
      .order(safeSortBy, { ascending: sortOrder === 'asc' })
      .range(skip, skip + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Ordenar imágenes client-side (embedded selects no garantizan orden)
    const properties = (data || []).map((p) => ({
      ...p,
      images: (p.images || []).sort((a, b) => a.order - b.order),
    }));

    return {
      data: {
        properties,
        pagination: {
          total: count || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || 0) / parseInt(limit)),
        },
      },
    };
  },

  getStats: async () => {
    const [
      { count: total },
      { count: disponible },
      { count: vendido },
      { count: alquilado },
      { count: reservado },
    ] = await Promise.all([
      supabase.from('Property').select('*', { count: 'exact', head: true }),
      supabase.from('Property').select('*', { count: 'exact', head: true }).eq('status', 'disponible'),
      supabase.from('Property').select('*', { count: 'exact', head: true }).eq('status', 'vendido'),
      supabase.from('Property').select('*', { count: 'exact', head: true }).eq('status', 'alquilado'),
      supabase.from('Property').select('*', { count: 'exact', head: true }).eq('status', 'reservado'),
    ]);
    return { data: { total: total || 0, disponible: disponible || 0, vendido: vendido || 0, alquilado: alquilado || 0, reservado: reservado || 0 } };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('Property')
      .select('*, images:Image(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    data.images = (data.images || []).sort((a, b) => a.order - b.order);
    return { data };
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('Property')
      .select('*, images:Image(id, url, thumbnailUrl, order, isMain)')
      .eq('featured', true)
      .in('status', ['disponible', 'reservado'])
      .order('createdAt', { ascending: false })
      .limit(6);
    if (error) throw error;
    return { data: (data || []).map((p) => ({ ...p, images: (p.images || []).sort((a, b) => a.order - b.order) })) };
  },

  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('Property')
      .select('*, images:Image(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;

    data.images = (data.images || []).sort((a, b) => a.order - b.order);

    // Incrementar vistas sin bloquear la respuesta
    supabase.rpc('increment_property_views', { property_id: data.id }).catch(() => {});

    const { data: related } = await supabase
      .from('Property')
      .select('*, images:Image(id, url, thumbnailUrl, order, isMain)')
      .eq('type', data.type)
      .eq('operation', data.operation)
      .neq('id', data.id)
      .in('status', ['disponible', 'reservado'])
      .limit(3);

    return { data: { ...data, related: related || [] } };
  },

  create: async (propertyData) => {
    const { id: _id, images: _img, inquiries: _inq, createdAt: _ca, updatedAt: _ua, ...rest } = propertyData;
    const data = sanitizeNumericFields(rest);

    let slug = toSlug(data.title || '');
    const { data: existing } = await supabase.from('Property').select('id').eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now()}`;

    const { data: property, error } = await supabase
      .from('Property')
      .insert({ ...data, slug, updatedAt: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return { data: property };
  },

  update: async (id, propertyData) => {
    const { id: _id, images: _img, inquiries: _inq, createdAt: _ca, updatedAt: _ua, views: _v, slug: _s, videoUrl: _vid, ...rest } = propertyData;
    const data = sanitizeNumericFields(rest);

    if (data.title) {
      const { data: current } = await supabase.from('Property').select('title').eq('id', id).single();
      if (current?.title !== data.title) {
        let newSlug = toSlug(data.title);
        const { data: exists } = await supabase.from('Property').select('id').eq('slug', newSlug).neq('id', id).maybeSingle();
        if (exists) newSlug = `${newSlug}-${Date.now()}`;
        data.slug = newSlug;
      }
    }

    const { data: property, error } = await supabase
      .from('Property')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select('*, images:Image(*)')
      .single();
    if (error) throw error;
    property.images = (property.images || []).sort((a, b) => a.order - b.order);
    return { data: property };
  },

  delete: async (id) => {
    const { data: property } = await supabase
      .from('Property')
      .select('images:Image(url, publicId)')
      .eq('id', id)
      .single();

    if (property?.images) {
      await Promise.all(property.images.map((img) => removeFromStorage(img.url, img.publicId)));
    }

    const { error } = await supabase.from('Property').delete().eq('id', id);
    if (error) throw error;
    return { data: { message: 'Propiedad eliminada' } };
  },

  // Recibe array de File objects (no FormData)
  uploadImages: async (propertyId, files) => {
    const folder = `properties/${propertyId}`;
    const { count: existingCount } = await supabase
      .from('Image')
      .select('*', { count: 'exact', head: true })
      .eq('propertyId', propertyId);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const name = `${crypto.randomUUID()}.${ext}`;
      const storagePath = `${folder}/${name}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

      const { data: image, error: dbError } = await supabase
        .from('Image')
        .insert({
          url: publicUrl,
          thumbnailUrl: publicUrl,
          publicId: storagePath,
          order: (existingCount || 0) + i,
          isMain: (existingCount || 0) === 0 && i === 0,
          propertyId,
        })
        .select()
        .single();
      if (dbError) throw dbError;
      results.push(image);
    }
    return { data: results };
  },

  deleteImage: async (propertyId, imageId) => {
    const { data: image } = await supabase
      .from('Image').select('url, publicId, isMain').eq('id', imageId).single();

    if (image) {
      await removeFromStorage(image.url, image.publicId);
      await supabase.from('Image').delete().eq('id', imageId);
      if (image.isMain) {
        const { data: next } = await supabase
          .from('Image').select('id').eq('propertyId', propertyId)
          .order('order').limit(1).maybeSingle();
        if (next) await supabase.from('Image').update({ isMain: true }).eq('id', next.id);
      }
    }
    return { data: { message: 'Imagen eliminada' } };
  },

  reorderImages: async (propertyId, images) => {
    await Promise.all(
      images.map((img) =>
        supabase.from('Image').update({ order: img.order, isMain: img.isMain || false }).eq('id', img.id)
      )
    );
    return { data: { message: 'Orden actualizado' } };
  },

  setMainImage: async (propertyId, imageId) => {
    await supabase.from('Image').update({ isMain: false }).eq('propertyId', propertyId);
    await supabase.from('Image').update({ isMain: true }).eq('id', imageId);
    return { data: { message: 'Imagen principal actualizada' } };
  },

  // Video: no soportado en frontend-only (requiere servidor). Se deja como no-op.
  uploadVideo: async () => { throw new Error('Upload de video no disponible en esta versión'); },
  deleteVideo: async () => ({ data: {} }),
};

// ─── Inquiries ──────────────────────────────────────────────────────────────

export const inquiriesApi = {
  create: async (d) => {
    const { data, error } = await supabase.from('Inquiry').insert(d).select().single();
    if (error) throw error;
    return { data };
  },

  getAll: async (params = {}) => {
    const { page = 1, limit = 20, status, archived } = params;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('Inquiry')
      .select('*, property:Property(id, title, slug)', { count: 'exact' })
      .order('createdAt', { ascending: false });

    if (archived !== undefined) query = query.eq('archived', archived === 'true' || archived === true);
    else query = query.eq('archived', false);

    if (status === 'unread') query = query.eq('read', false);

    query = query.range(skip, skip + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return {
      data: {
        inquiries: data || [],
        pagination: { total: count || 0, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil((count || 0) / parseInt(limit)) },
      },
    };
  },

  getStats: async () => {
    const [{ count: total }, { count: unread }] = await Promise.all([
      supabase.from('Inquiry').select('*', { count: 'exact', head: true }).eq('archived', false),
      supabase.from('Inquiry').select('*', { count: 'exact', head: true }).eq('read', false).eq('archived', false),
    ]);
    return { data: { total: total || 0, unread: unread || 0 } };
  },

  markRead: async (id) => {
    const { error } = await supabase.from('Inquiry').update({ read: true }).eq('id', id);
    if (error) throw error;
    return { data: { message: 'Marcada como leída' } };
  },

  archive: async (id) => {
    const { error } = await supabase.from('Inquiry').update({ archived: true }).eq('id', id);
    if (error) throw error;
    return { data: { message: 'Archivada' } };
  },

  delete: async (id) => {
    const { error } = await supabase.from('Inquiry').delete().eq('id', id);
    if (error) throw error;
    return { data: { message: 'Eliminada' } };
  },
};

// ─── Testimonials ───────────────────────────────────────────────────────────

export const testimonialsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('Testimonial').select('*').eq('active', true).order('order');
    if (error) throw error;
    return { data: data || [] };
  },
  getAllAdmin: async () => {
    const { data, error } = await supabase.from('Testimonial').select('*').order('order');
    if (error) throw error;
    return { data: data || [] };
  },
  create: async (d) => {
    const { data, error } = await supabase.from('Testimonial').insert(d).select().single();
    if (error) throw error;
    return { data };
  },
  update: async (id, d) => {
    const { data, error } = await supabase.from('Testimonial').update(d).eq('id', id).select().single();
    if (error) throw error;
    return { data };
  },
  delete: async (id) => {
    const { error } = await supabase.from('Testimonial').delete().eq('id', id);
    if (error) throw error;
    return { data: { message: 'Eliminado' } };
  },
};

// ─── Settings ───────────────────────────────────────────────────────────────

export const settingsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('Setting').select('key, value');
    if (error) throw error;
    const obj = {};
    (data || []).forEach(({ key, value }) => { obj[key] = value; });
    return { data: obj };
  },
  update: async (settings) => {
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      updatedAt: new Date().toISOString(),
    }));
    const { error } = await supabase.from('Setting').upsert(upserts, { onConflict: 'key' });
    if (error) throw error;
    return { data: { message: 'Configuración actualizada' } };
  },
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
        },
      },
    };
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      const err = new Error('Contraseña actual incorrecta');
      err.response = { data: { error: 'Contraseña actual incorrecta' } };
      throw err;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      const err = new Error(updateError.message);
      err.response = { data: { error: updateError.message } };
      throw err;
    }
    return { data: { message: 'Contraseña actualizada correctamente' } };
  },

  updateProfile: async ({ name, email }) => {
    const updates = {};
    if (name) updates.data = { name };
    if (email) updates.email = email;
    const { data: { user }, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
        },
      },
    };
  },
};

export default { propertiesApi, inquiriesApi, testimonialsApi, settingsApi, authApi };
