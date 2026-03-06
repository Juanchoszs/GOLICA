-- =============================================================================
-- 008_storage_board_images_bucket.sql
-- Crea el bucket board-images y políticas RLS para que la pizarra táctica
-- se suba correctamente desde la app. Ejecutar en Supabase SQL Editor o vía migración.
-- =============================================================================

-- 1. Crear bucket board-images (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-images', 'board-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Crear bucket planning-images (por si se usa en el futuro)
INSERT INTO storage.buckets (id, name, public)
VALUES ('planning-images', 'planning-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Políticas RLS para board-images
-- Permitir a usuarios autenticados subir archivos al bucket board-images
DROP POLICY IF EXISTS "Authenticated users can upload board images" ON storage.objects;
CREATE POLICY "Authenticated users can upload board images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'board-images');

-- Permitir lectura pública de los archivos del bucket (para ver pizarras en la app)
DROP POLICY IF EXISTS "Public read for board-images" ON storage.objects;
CREATE POLICY "Public read for board-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'board-images');

-- Permitir a usuarios autenticados actualizar/borrar sus propios archivos (opcional)
DROP POLICY IF EXISTS "Authenticated users can update board images" ON storage.objects;
CREATE POLICY "Authenticated users can update board images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'board-images');

DROP POLICY IF EXISTS "Authenticated users can delete board images" ON storage.objects;
CREATE POLICY "Authenticated users can delete board images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'board-images');

-- 4. Políticas RLS para planning-images (mismo patrón)
DROP POLICY IF EXISTS "Authenticated users can upload planning images" ON storage.objects;
CREATE POLICY "Authenticated users can upload planning images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'planning-images');

DROP POLICY IF EXISTS "Public read for planning-images" ON storage.objects;
CREATE POLICY "Public read for planning-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'planning-images');
