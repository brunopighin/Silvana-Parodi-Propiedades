-- ============================================================
-- RLS + Policies para Silvana Parodi Propiedades
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE "Property"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Image"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inquiry"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"        ENABLE ROW LEVEL SECURITY;

-- 2. PROPERTY
-- Público: solo disponible y reservado
CREATE POLICY "Public read properties" ON "Property"
  FOR SELECT USING (status IN ('disponible', 'reservado'));

-- Admin: acceso total (auth.role() = 'authenticated' para usuarios logueados via Supabase Auth)
CREATE POLICY "Admin full access properties" ON "Property"
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. IMAGE
-- Público: puede leer todas las imágenes
CREATE POLICY "Public read images" ON "Image"
  FOR SELECT USING (true);

-- Admin: puede escribir (insert/update/delete)
CREATE POLICY "Admin write images" ON "Image"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update images" ON "Image"
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete images" ON "Image"
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. INQUIRY
-- Público: puede crear consultas
CREATE POLICY "Anyone can create inquiry" ON "Inquiry"
  FOR INSERT WITH CHECK (true);

-- Admin: acceso total
CREATE POLICY "Admin full access inquiries" ON "Inquiry"
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. TESTIMONIAL
-- Público: solo activos
CREATE POLICY "Public read active testimonials" ON "Testimonial"
  FOR SELECT USING (active = true);

-- Admin: acceso total
CREATE POLICY "Admin full access testimonials" ON "Testimonial"
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. SETTING
-- Público: puede leer todo (settings no son sensibles)
CREATE POLICY "Public read settings" ON "Setting"
  FOR SELECT USING (true);

-- Admin: puede actualizar
CREATE POLICY "Admin write settings" ON "Setting"
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 7. USER (tabla interna de Prisma, no usada por el frontend)
CREATE POLICY "Admin only users" ON "User"
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 8. Función para incrementar vistas sin race condition
CREATE OR REPLACE FUNCTION increment_property_views(property_id INT)
RETURNS VOID AS $$
  UPDATE "Property" SET views = views + 1 WHERE id = property_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 9. Storage policies (reemplazar 'properties' con tu bucket real si es diferente)
-- Público puede leer imágenes
CREATE POLICY "Public read storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'properties');

-- Admin puede subir y eliminar
CREATE POLICY "Admin upload storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'properties' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'properties' AND auth.role() = 'authenticated');
