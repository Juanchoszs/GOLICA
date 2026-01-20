-- 1. Crear el bucket de almacenamiento para documentos de jugadores
INSERT INTO storage.buckets (id, name, public) 
VALUES ('player-documents', 'player-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar RLS (Seguridad de Nivel de Fila) para el Storage
-- Usamos 'public' porque la app usa un sistema de login avanzado/personalizado

-- Permitir subida (Insert)
CREATE POLICY "Public can upload documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'player-documents');

-- Permitir actualización (Update - necesario para sobrescribir archivos)
CREATE POLICY "Public can update documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'player-documents');

-- Permitir visualización (Select)
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'player-documents');

-- Permitir eliminación (Delete - opcional)
CREATE POLICY "Public can delete documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'player-documents');

-- 3. Añadir columnas a la tabla de jugadores para las nuevas URLs
ALTER TABLE players ADD COLUMN IF NOT EXISTS id_card_url TEXT; -- Antigua (opcional mantener)
ALTER TABLE players ADD COLUMN IF NOT EXISTS id_card_front_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS id_card_back_url TEXT;