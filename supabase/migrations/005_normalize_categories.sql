-- 005_normalize_categories.sql
-- Añade columnas category_id y migra datos desde las columnas de texto existentes.

-- TRAINING_SESSIONS: vincular a categories(id)
ALTER TABLE public.training_sessions
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

UPDATE public.training_sessions ts
SET category_id = c.id
FROM public.categories c
WHERE ts.category_name IS NOT NULL
  AND ts.category_id IS NULL
  AND c.name = ts.category_name;

-- PLAYERS: vincular a categories(id)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

UPDATE public.players p
SET category_id = c.id
FROM public.categories c
WHERE p.category IS NOT NULL
  AND p.category_id IS NULL
  AND c.name = p.category;

-- CONVOCATORIAS: vincular a categories(id)
ALTER TABLE public.convocatorias
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

UPDATE public.convocatorias co
SET category_id = c.id
FROM public.categories c
WHERE co.category IS NOT NULL
  AND co.category_id IS NULL
  AND c.name = co.category;

