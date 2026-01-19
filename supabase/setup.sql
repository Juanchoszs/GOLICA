-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    identification TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create players table (Perfected for self-registration)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    identification TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birth_date DATE,
    category TEXT,
    position TEXT,
    status TEXT DEFAULT 'active',
    description TEXT,
    password TEXT NOT NULL,
    performance JSONB DEFAULT '{"training": 0, "matchGoals": 0, "matchAssists": 0}'::jsonb,
    injuries JSONB DEFAULT '[]'::jsonb,
    tests JSONB DEFAULT '[]'::jsonb,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Insert initial admin users
INSERT INTO admins (name, identification, password, email)
VALUES 
('Maicol', 'maicol.admin', 'Maicol2026!', 'maicol@golica.com'),
('Carolina', 'carolina.admin', 'Carolina2026!', 'carolina@golica.com'),
('Karen', 'karen.admin', 'Karen2026!', 'karen@golica.com'),
('Jeferson', 'jeferson.admin', 'Jeferson2026!', 'jeferson@golica.com'),
('Juancho', 'juancho.admin', 'Juancho2026!', 'juancho@golica.com')
ON CONFLICT (identification) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Tabla para historial de rendimiento diario
CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    rating INTEGER CHECK (rating >= 0 AND rating <= 100),
    type TEXT DEFAULT 'training',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(player_id, date, type)
);

-- Habilitar RLS en performance_logs
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to performance logs"
    ON performance_logs FOR ALL
    USING (EXISTS (SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'));

CREATE POLICY "Players can view their own performance logs"
    ON performance_logs FOR SELECT
    USING (player_id = (SELECT id FROM players WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas temporales para desarrollo (si no hay JWT configurado aún)
CREATE POLICY "Public select performance logs" ON performance_logs FOR SELECT USING (true);
CREATE POLICY "Public insert performance logs" ON performance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update performance logs" ON performance_logs FOR UPDATE USING (true);

-- 5. Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public admins access" ON admins;
DROP POLICY IF EXISTS "Public players access" ON players;
DROP POLICY IF EXISTS "Allow all on admins" ON admins;
DROP POLICY IF EXISTS "Allow all on players" ON players;

-- 6. Direct Policies for perfect operation
-- Policy for Admins: Allow full access (for management)
CREATE POLICY "Admins full access" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Policy for Players: Allow Anyone to Register (INSERT)
CREATE POLICY "Enable insert for players registration" ON players FOR INSERT WITH CHECK (true);

-- Policy for Players: Allow Anyone to View (SELECT) - Needed for login verification
CREATE POLICY "Enable select for authentication" ON players FOR SELECT USING (true);

-- Policy for Players: Allow full access for management/updates
CREATE POLICY "Enable update for players" ON players FOR UPDATE USING (true) WITH CHECK (true);
