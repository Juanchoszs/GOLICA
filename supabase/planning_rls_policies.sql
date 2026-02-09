-- Update RLS policies for training planning module
-- This file should be run after coaches_setup.sql and planning_module.sql

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Enable all access for training_sessions" ON training_sessions;
DROP POLICY IF EXISTS "Enable all access for session_phases" ON session_phases;
DROP POLICY IF EXISTS "Enable all access for session_exercises" ON session_exercises;

-- Create proper RLS policies for coaches and admins

-- Training Sessions Policies
CREATE POLICY "Coaches can view own sessions" ON training_sessions FOR SELECT 
    USING (
        coach_id = (
            SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        ) OR
        coach_id = (
            SELECT id FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Coaches can create own sessions" ON training_sessions FOR INSERT 
    WITH CHECK (
        coach_id = (
            SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Coaches can update own sessions" ON training_sessions FOR UPDATE 
    USING (
        coach_id = (
            SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Coaches can delete own sessions" ON training_sessions FOR DELETE 
    USING (
        coach_id = (
            SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Admins can view all sessions" ON training_sessions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Admins can manage all sessions" ON training_sessions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

-- Session Phases Policies (cascade from sessions)
CREATE POLICY "Coaches can view phases of own sessions" ON session_phases FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM training_sessions 
            WHERE training_sessions.id = session_phases.session_id 
            AND training_sessions.coach_id = (
                SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
            )
        ) OR
        EXISTS (
            SELECT 1 FROM training_sessions 
            WHERE training_sessions.id = session_phases.session_id 
            AND training_sessions.coach_id = (
                SELECT id FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
            )
        )
    );

CREATE POLICY "Admins can view all phases" ON session_phases FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Admins can manage all phases" ON session_phases FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

-- Session Exercises Policies (cascade from phases)
CREATE POLICY "Coaches can view exercises of own sessions" ON session_exercises FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM session_phases 
            JOIN training_sessions ON training_sessions.id = session_phases.session_id
            WHERE session_phases.id = session_exercises.phase_id 
            AND training_sessions.coach_id = (
                SELECT id FROM coaches WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
            )
        ) OR
        EXISTS (
            SELECT 1 FROM session_phases 
            JOIN training_sessions ON training_sessions.id = session_phases.session_id
            WHERE session_phases.id = session_exercises.phase_id 
            AND training_sessions.coach_id = (
                SELECT id FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
            )
        )
    );

CREATE POLICY "Admins can view all exercises" ON session_exercises FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

CREATE POLICY "Admins can manage all exercises" ON session_exercises FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM admins WHERE identification = current_setting('request.jwt.claims', true)::json->>'identification'
        )
    );

-- Development policies (fallback when JWT is not configured)
CREATE POLICY "Public select training_sessions" ON training_sessions FOR SELECT USING (true);
CREATE POLICY "Public select session_phases" ON session_phases FOR SELECT USING (true);
CREATE POLICY "Public select session_exercises" ON session_exercises FOR SELECT USING (true);