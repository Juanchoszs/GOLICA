-- ============================================================================
-- MIGRATION 002: Enable Identification Login
-- Ejecuta TODO de una sola vez en Supabase SQL Editor
-- ============================================================================

-- Step 1: Create unique index for profiles identification
DROP INDEX IF EXISTS public.idx_profiles_identification_unique;
CREATE UNIQUE INDEX idx_profiles_identification_unique 
ON public.profiles(identification) WHERE identification IS NOT NULL;

-- Step 2: Create email index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Step 3: Create unique index for players identification
DROP INDEX IF EXISTS public.idx_players_identification_unique;
CREATE UNIQUE INDEX idx_players_identification_unique 
ON public.players(identification) WHERE identification IS NOT NULL;

-- Step 4: Create helper function - get user by identification
CREATE OR REPLACE FUNCTION public.get_user_by_identification(p_identification TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role user_role,
  identification TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT p.id, p.email, p.name, p.role, p.identification
  FROM public.profiles p
  WHERE p.identification = p_identification
  LIMIT 1;
$$;

-- Step 5: Create helper function - get user by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role user_role,
  identification TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT p.id, p.email, p.name, p.role, p.identification
  FROM public.profiles p
  WHERE p.email = p_email
  LIMIT 1;
$$;

-- Step 6: Verify everything
SELECT 'Migration 002 completed successfully' as result;
