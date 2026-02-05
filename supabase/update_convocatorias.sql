-- Script para actualizar la tabla convocatorias con campos de hora y ubicación
-- Ejecutar este script en Supabase SQL Editor

-- Verificar si la tabla existe, si no la creamos
CREATE TABLE IF NOT EXISTS convocatorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opponent TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT,
    formation TEXT,
    players JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Agregar columna 'time' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'convocatorias' AND column_name = 'time'
    ) THEN
        ALTER TABLE convocatorias ADD COLUMN time TIME;
    END IF;
END $$;

-- Agregar columna 'location' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'convocatorias' AND column_name = 'location'
    ) THEN
        ALTER TABLE convocatorias ADD COLUMN location TEXT;
    END IF;
END $$;

-- Habilitar RLS si no está habilitado
ALTER TABLE convocatorias ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (ajustar según necesidades)
DROP POLICY IF EXISTS "Public select convocatorias" ON convocatorias;
DROP POLICY IF EXISTS "Public insert convocatorias" ON convocatorias;
DROP POLICY IF EXISTS "Public update convocatorias" ON convocatorias;
DROP POLICY IF EXISTS "Public delete convocatorias" ON convocatorias;

-- Políticas temporales para desarrollo (ajustar según necesidades de seguridad)
CREATE POLICY "Public select convocatorias" ON convocatorias FOR SELECT USING (true);
CREATE POLICY "Public insert convocatorias" ON convocatorias FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update convocatorias" ON convocatorias FOR UPDATE USING (true);
CREATE POLICY "Public delete convocatorias" ON convocatorias FOR DELETE USING (true);

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_convocatorias_date ON convocatorias(date DESC);
CREATE INDEX IF NOT EXISTS idx_convocatorias_category ON convocatorias(category);

-- Comentarios en las columnas
COMMENT ON COLUMN convocatorias.opponent IS 'Nombre del equipo rival';
COMMENT ON COLUMN convocatorias.date IS 'Fecha y hora del partido';
COMMENT ON COLUMN convocatorias.time IS 'Hora específica del partido (formato HH:MM)';
COMMENT ON COLUMN convocatorias.location IS 'Ubicación o estadio donde se jugará el partido';
COMMENT ON COLUMN convocatorias.category IS 'Categoría del equipo (Sub-8, Sub-10, etc.)';
COMMENT ON COLUMN convocatorias.formation IS 'Formación táctica utilizada (4-3-3, 4-4-2, etc.)';
COMMENT ON COLUMN convocatorias.players IS 'Lista de jugadores convocados en formato JSONB';
