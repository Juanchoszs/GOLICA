-- 006_create_convocatoria_players.sql
-- Crea tabla puente entre convocatorias y jugadores y migra datos desde el JSON `players`.

CREATE TABLE IF NOT EXISTS public.convocatoria_players (
  convocatoria_id uuid NOT NULL REFERENCES public.convocatorias(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  position_id text,
  position text,
  is_starter boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT convocatoria_players_pkey PRIMARY KEY (convocatoria_id, position_id)
);

-- Migrar datos existentes desde el JSONB convocatorias.players
INSERT INTO public.convocatoria_players (convocatoria_id, player_id, position_id, position, is_starter, created_at)
SELECT
  c.id AS convocatoria_id,
  (p->>'id')::uuid AS player_id,
  p->>'positionId' AS position_id,
  p->>'position' AS position,
  COALESCE((p->>'isStarter')::boolean, true) AS is_starter,
  COALESCE(c.created_at, now()) AS created_at
FROM public.convocatorias c
JOIN LATERAL jsonb_array_elements(c.players) AS p ON true
WHERE c.players IS NOT NULL
  AND jsonb_typeof(c.players) = 'array'
  AND (p->>'id') IS NOT NULL;

