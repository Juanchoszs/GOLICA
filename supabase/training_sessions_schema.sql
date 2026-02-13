-- Training Sessions Schema
-- Complete system for managing training sessions and templates

-- Create categories table if it doesn't exist (or use existing)
-- Assuming you already have a categories or coach_categories table
-- This references existing coach.assigned_categories

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category_name VARCHAR(100), -- Category name from coach.assigned_categories
  
  -- Session metadata
  warmup_duration_minutes INTEGER DEFAULT 0,
  main_duration_minutes INTEGER DEFAULT 0,
  
  -- Board state (JSON)
  board_state JSONB,
  board_elements JSONB DEFAULT '[]'::JSONB,
  board_lines JSONB DEFAULT '[]'::JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, archived
  is_template BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_duration CHECK (warmup_duration_minutes >= 0 AND main_duration_minutes >= 0),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'completed', 'archived'))
);

-- Session Warmup Exercises Table
CREATE TABLE IF NOT EXISTS public.session_warmup_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  
  -- Exercise metadata
  exercise_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  objective TEXT,
  description TEXT,
  duration_minutes INTEGER DEFAULT 10,
  
  -- Equipment/materials
  materials JSONB DEFAULT '[]'::JSONB, -- Array of material names or IDs
  
  -- Sequence
  order_in_session INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_duration CHECK (duration_minutes > 0),
  CONSTRAINT valid_order CHECK (order_in_session > 0)
);

-- Session Main Exercises Table
CREATE TABLE IF NOT EXISTS public.session_main_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  
  -- Basic info
  exercise_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  objective TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 15,
  
  -- Six dimensions of training (0-10 scale)
  technical_offensive INTEGER DEFAULT 5 CHECK (technical_offensive >= 0 AND technical_offensive <= 10),
  technical_defensive INTEGER DEFAULT 5 CHECK (technical_defensive >= 0 AND technical_defensive <= 10),
  tactical_offensive INTEGER DEFAULT 5 CHECK (tactical_offensive >= 0 AND tactical_offensive <= 10),
  tactical_defensive INTEGER DEFAULT 5 CHECK (tactical_defensive >= 0 AND tactical_defensive <= 10),
  psychological INTEGER DEFAULT 5 CHECK (psychological >= 0 AND psychological <= 10),
  physical INTEGER DEFAULT 5 CHECK (physical >= 0 AND physical <= 10),
  
  -- Equipment/materials and variants
  materials JSONB DEFAULT '[]'::JSONB,
  variants JSONB DEFAULT '[]'::JSONB, -- Alternative ways to run the exercise
  
  -- Tactical board reference
  board_snapshot JSONB, -- Snapshot of the tactical board at creation
  
  -- Sequence
  order_in_session INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_duration CHECK (duration_minutes > 0),
  CONSTRAINT valid_order CHECK (order_in_session > 0)
);

-- Session Templates Table
CREATE TABLE IF NOT EXISTS public.session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_name VARCHAR(100), -- Category name from coach.assigned_categories
  
  -- Template data
  warmup_exercises JSONB DEFAULT '[]'::JSONB,
  main_exercises JSONB DEFAULT '[]'::JSONB,
  board_template JSONB DEFAULT '[]'::JSONB,
  
  -- Flags
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session Feedback/Notes Table
CREATE TABLE IF NOT EXISTS public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notes
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- general, improvement, observation, incident
  
  -- Relates to specific exercise if needed
  exercise_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_coach_id ON public.training_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_category_name ON public.training_sessions(category_name);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON public.training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON public.training_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_is_template ON public.training_sessions(is_template);

CREATE INDEX IF NOT EXISTS idx_warmup_exercises_session_id ON public.session_warmup_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_warmup_exercises_order ON public.session_warmup_exercises(session_id, order_in_session);

CREATE INDEX IF NOT EXISTS idx_main_exercises_session_id ON public.session_main_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_main_exercises_order ON public.session_main_exercises(session_id, order_in_session);

CREATE INDEX IF NOT EXISTS idx_templates_coach_id ON public.session_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_templates_category_name ON public.session_templates(category_name);
CREATE INDEX IF NOT EXISTS idx_templates_favorite ON public.session_templates(is_favorite);

CREATE INDEX IF NOT EXISTS idx_notes_session_id ON public.session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_coach_id ON public.session_notes(coach_id);

-- Row Level Security Policies
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_warmup_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_main_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Coaches can only see their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.training_sessions FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Users can create sessions"
  ON public.training_sessions FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own sessions"
  ON public.training_sessions FOR UPDATE
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.training_sessions FOR DELETE
  USING (auth.uid() = coach_id);

-- Policies for exercises
CREATE POLICY "Users can view exercises of their sessions"
  ON public.session_warmup_exercises FOR SELECT
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can create exercises in their sessions"
  ON public.session_warmup_exercises FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can update exercises in their sessions"
  ON public.session_warmup_exercises FOR UPDATE
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can delete exercises in their sessions"
  ON public.session_warmup_exercises FOR DELETE
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

-- Same policies for main exercises
CREATE POLICY "Users can view main exercises of their sessions"
  ON public.session_main_exercises FOR SELECT
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can create main exercises in their sessions"
  ON public.session_main_exercises FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can update main exercises in their sessions"
  ON public.session_main_exercises FOR UPDATE
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can delete main exercises in their sessions"
  ON public.session_main_exercises FOR DELETE
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

-- Policies for templates
CREATE POLICY "Users can view their own templates and public templates"
  ON public.session_templates FOR SELECT
  USING (coach_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create templates"
  ON public.session_templates FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON public.session_templates FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON public.session_templates FOR DELETE
  USING (coach_id = auth.uid());

-- Policies for notes
CREATE POLICY "Users can view notes on their sessions"
  ON public.session_notes FOR SELECT
  USING (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()));

CREATE POLICY "Users can add notes to their sessions"
  ON public.session_notes FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.training_sessions WHERE coach_id = auth.uid()) AND coach_id = auth.uid());

CREATE POLICY "Users can update their own notes"
  ON public.session_notes FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
  ON public.session_notes FOR DELETE
  USING (coach_id = auth.uid());
