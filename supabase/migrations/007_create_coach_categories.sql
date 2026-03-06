-- 007_create_coach_categories.sql
-- Crea tabla puente entre coaches y categories y migra datos desde coaches.assigned_categories (text[]).

CREATE TABLE IF NOT EXISTS public.coach_categories (
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coach_categories_pkey PRIMARY KEY (coach_id, category_id)
);

-- Migrar datos existentes desde el array de texto assigned_categories
INSERT INTO public.coach_categories (coach_id, category_id)
SELECT
  c.id AS coach_id,
  cat.id AS category_id
FROM public.coaches c
JOIN LATERAL unnest(c.assigned_categories) AS cat_name(name) ON TRUE
JOIN public.categories cat ON cat.name = cat_name.name
ON CONFLICT DO NOTHING;

