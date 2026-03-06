-- ============================================================================
-- MIGRATION 001: Fix Authentication Sync
-- Ejecuta TODO de una sola vez en Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'coach', 'player');
  END IF;
END $$;

-- Step 3: Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, identification, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player'::user_role),
    NEW.raw_user_meta_data->>'identification',
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    role = COALESCE((NEW.raw_user_meta_data->>'role')::user_role, profiles.role),
    identification = COALESCE(NEW.raw_user_meta_data->>'identification', profiles.identification),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END $$;

-- Step 4: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Sync existing users
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'player'::user_role,
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Fix null roles
UPDATE public.profiles SET role = 'player' WHERE role IS NULL;

-- Done
SELECT 'Migration 001 completed successfully' as result;
