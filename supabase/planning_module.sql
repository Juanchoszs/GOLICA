-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL, -- We store the ID from the coaches table or admins table
    team_id UUID, -- Optional, if we want to link to a specific team/category
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    category TEXT,
    general_objective TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create session_phases table
CREATE TABLE IF NOT EXISTS session_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER, -- in minutes
    observations TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create session_exercises table
CREATE TABLE IF NOT EXISTS session_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES session_phases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT,
    description TEXT,
    duration INTEGER, -- in minutes
    players_count TEXT,
    space_dimensions TEXT,
    intensity TEXT,
    materials TEXT,
    variations TEXT,
    observations TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Permissive for now as per existing pattern for prototype)
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for training_sessions" ON training_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for session_phases" ON session_phases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for session_exercises" ON session_exercises FOR ALL USING (true) WITH CHECK (true);
