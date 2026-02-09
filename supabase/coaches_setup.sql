-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    identification TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert some test coaches
INSERT INTO coaches (name, identification, password, email, phone, category)
VALUES 
('Carlos Pérez', 'carlos.coach', 'Coach2024!', 'carlos@example.com', '3001234567', 'Juvenil'),
('María Rodríguez', 'maria.coach', 'Coach2024!', 'maria@example.com', '3001234568', 'Infantil'),
('Juan García', 'juan.coach', 'Coach2024!', 'juan@example.com', '3001234569', 'Cadete')
ON CONFLICT (identification) DO NOTHING;

-- Enable RLS
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Policies for coaches
CREATE POLICY "Enable select for authentication" ON coaches FOR SELECT USING (true);
CREATE POLICY "Enable insert for coaches registration" ON coaches FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for coaches" ON coaches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for coaches" ON coaches FOR DELETE USING (true);