ALTER TABLE public.training_sessions 
ADD COLUMN IF NOT EXISTS board_images jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.training_sessions
ADD COLUMN IF NOT EXISTS is_reviewed boolean DEFAULT false;

ALTER TABLE public.training_sessions
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.training_sessions
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_training_sessions_category_status 
ON public.training_sessions(category_name, status);

CREATE INDEX IF NOT EXISTS idx_training_sessions_coach_category 
ON public.training_sessions(coach_id, category_name);
