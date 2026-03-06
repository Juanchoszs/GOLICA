-- ============================================================================
-- INSTRUCCIONES PARA EJECUTAR ESTA MIGRACIÓN EN SUPABASE STUDIO
-- ============================================================================
-- 
-- PASOS:
-- 1. Ve a https://app.supabase.com
-- 2. Selecciona tu proyecto GOLICA
-- 3. Ve a SQL Editor (lado izquierdo)
-- 4. Click en "+ New Query"
-- 5. Copia TODO el contenido de abajo (desde la línea que dice "-- 1. Create enum types...")
-- 6. Pega en el editor de SQL
-- 7. Click en RUN (botón azul)
-- 8. Espera a que se complete
--
-- ============================================================================

-- 1. Create enum types for physiotherapy evaluation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE public.gender_enum AS ENUM ('Masculino', 'Femenino', 'Otro');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yes_no_enum') THEN
    CREATE TYPE public.yes_no_enum AS ENUM ('SI', 'NO');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perception_enum') THEN
    CREATE TYPE public.perception_enum AS ENUM ('Adecuada', 'Regular', 'Inadecuada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sleep_quality_enum') THEN
    CREATE TYPE public.sleep_quality_enum AS ENUM ('Buena', 'Regular', 'Mala');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'personality_enum') THEN
    CREATE TYPE public.personality_enum AS ENUM ('Extrovertido', 'Intermedio/Ambivertido', 'Introvertido');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perception_others_enum') THEN
    CREATE TYPE public.perception_others_enum AS ENUM ('Seguro y sociable', 'Reservado pero accesible', 'Distante o poco participativo');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_enum') THEN
    CREATE TYPE public.support_enum AS ENUM ('Fuerte', 'Moderada', 'Limitada o inexistente');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_enum') THEN
    CREATE TYPE public.exercise_enum AS ENUM ('Buena', 'Regular', 'Mala');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alcohol_consumption_enum') THEN
    CREATE TYPE public.alcohol_consumption_enum AS ENUM ('No consume', 'Ocasional', 'Semanal', 'Frecuente', 'Diario');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tobacco_consumption_enum') THEN
    CREATE TYPE public.tobacco_consumption_enum AS ENUM ('No consume', 'Exfumador', 'Ocasional', 'Diario (≤10 cigarrillos/día)', 'Diario (>10 cigarrillos/día)', 'Otros dispositivos');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spa_consumption_enum') THEN
    CREATE TYPE public.spa_consumption_enum AS ENUM ('No refiere consumo', 'Ocasional', 'Frecuente');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plancha_classification_enum') THEN
    CREATE TYPE public.plancha_classification_enum AS ENUM ('<20 seg', '20-40 seg', '40-60 seg', '>60 seg');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_quality_enum') THEN
    CREATE TYPE public.movement_quality_enum AS ENUM ('Bueno', 'Regular', 'Malo');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oscillation_enum') THEN
    CREATE TYPE public.oscillation_enum AS ENUM ('Leve', 'Moderada', 'Severa');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ruffier_classification_enum') THEN
    CREATE TYPE public.ruffier_classification_enum AS ENUM ('Excelente adaptación cardiovascular', 'Buena eficiencia cardiaca', 'Adaptación adecuada', 'Condición física baja', 'Baja tolerancia al esfuerzo');
  END IF;
END $$;

-- 2. Create main physiotherapy_evaluations table
CREATE TABLE IF NOT EXISTS public.physiotherapy_evaluations (
  -- Identification and metadata
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL DEFAULT 'FT-EVAL-DEP-001',
  version TEXT NOT NULL DEFAULT '2026',
  version_number TEXT NOT NULL DEFAULT '001',
  
  -- Evaluation dates and evaluator
  evaluation_date DATE NOT NULL,
  evaluator_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- ============ PLAYER BASIC INFORMATION ============
  player_name TEXT NOT NULL,
  player_age INTEGER,
  player_identification TEXT,
  player_gender public.gender_enum,
  player_occupation TEXT,
  player_civil_status TEXT,
  player_eps TEXT,
  player_birth_date DATE,
  player_education_level TEXT,
  guardian_name TEXT,
  guardian_identification TEXT,
  consultation_reason TEXT,
  medical_diagnosis TEXT,
  
  -- ============ INFORMED CONSENT ============
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date DATE,
  
  -- ============ MEDICAL ANTECEDENTS ============
  pathological_history public.yes_no_enum,
  pathological_history_details TEXT,
  surgical_history public.yes_no_enum,
  surgical_history_details TEXT,
  hospitalization_history public.yes_no_enum,
  hospitalization_history_details TEXT,
  traumatic_history public.yes_no_enum,
  traumatic_history_details TEXT,
  pharmacological_history public.yes_no_enum,
  pharmacological_history_details TEXT,
  allergic_history public.yes_no_enum,
  allergic_history_details TEXT,
  toxic_history public.yes_no_enum,
  toxic_history_details TEXT,
  
  -- ============ HABITS/PSYCHOSOCIAL QUESTIONNAIRE ============
  -- Meals
  meals_per_day INTEGER,
  feeding_perception public.perception_enum,
  daily_water_consumption TEXT,
  
  -- Sleep
  average_sleep_hours DECIMAL(3,1),
  sleep_quality public.sleep_quality_enum,
  nocturnal_awakenings BOOLEAN,
  difficulty_falling_asleep BOOLEAN,
  nighttime_pain BOOLEAN,
  screen_before_sleep BOOLEAN,
  
  -- Stress
  stress_level TEXT,
  
  -- Relationships
  relationship_style public.personality_enum,
  perception_by_others public.perception_others_enum,
  current_support_network public.support_enum,
  
  -- Physical activity
  physical_activity_level public.exercise_enum,
  
  -- Alcohol consumption
  alcohol_consumption public.alcohol_consumption_enum,
  
  -- Tobacco/Nicotine
  tobacco_consumption public.tobacco_consumption_enum,
  tobacco_details TEXT,
  
  -- Psychoactive substances
  spa_consumption public.spa_consumption_enum,
  spa_type TEXT,
  
  -- ============ INITIAL EVALUATION - ANTHROPOMETRIC MEASURES ============
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  imc DECIMAL(6,4),
  systolic_pressure INTEGER,
  diastolic_pressure INTEGER,
  abdominal_perimeter_cm DECIMAL(5,2),
  heart_rate_rest INTEGER,
  oxygen_saturation_percent DECIMAL(5,2),
  previous_sports_injuries TEXT,
  initial_screening_observations TEXT,
  
  -- ============ MUSCULOSKELETAL DOMAIN EVALUATION ============
  -- Range of movement - MMSS (upper limbs)
  rom_mmss_status public.movement_quality_enum,
  rom_mmss_observations TEXT,
  
  -- Gross strength - MMSS
  strength_mmss_status public.movement_quality_enum,
  strength_mmss_observations TEXT,
  
  -- Gross symmetry - MMSS
  symmetry_mmss_status public.movement_quality_enum,
  symmetry_mmss_observations TEXT,
  
  -- Core Plank Evaluation
  plancha_core_classification public.plancha_classification_enum,
  plancha_core_time_seconds INTEGER,
  abdominal_activation TEXT,
  abdominal_protusion BOOLEAN,
  body_alignment TEXT,
  lumbar_alignment TEXT,
  shoulder_alignment TEXT,
  pelvic_alignment TEXT,
  wrist_alignment TEXT,
  neck_alignment TEXT,
  knee_alignment TEXT,
  control_breathing BOOLEAN,
  breathing_retention BOOLEAN,
  unequal_support BOOLEAN,
  postural_adjustments BOOLEAN,
  tremor_present BOOLEAN,
  lumbar_collapse BOOLEAN,
  pain_present BOOLEAN,
  plancha_observations TEXT,
  
  -- ============ BALANCE TEST - ROMBERG ============
  romberg_time_open_eyes_seconds INTEGER,
  romberg_time_closed_eyes_seconds INTEGER,
  romberg_oscillation_open_eyes public.oscillation_enum,
  romberg_oscillation_closed_eyes public.oscillation_enum,
  romberg_arm_usage_open_eyes BOOLEAN,
  romberg_arm_usage_closed_eyes BOOLEAN,
  romberg_compensatory_support_open_eyes BOOLEAN,
  romberg_compensatory_support_closed_eyes BOOLEAN,
  romberg_loss_balance_open_eyes BOOLEAN,
  romberg_loss_balance_closed_eyes BOOLEAN,
  romberg_balance_control_open_eyes public.movement_quality_enum,
  romberg_balance_control_closed_eyes public.movement_quality_enum,
  romberg_observations TEXT,
  
  -- ============ RUFFIER INDEX - CARDIOVASCULAR ADAPTATION ============
  ruffier_fc_rest_p1 INTEGER,
  ruffier_fc_post_effort_p2 INTEGER,
  ruffier_fc_recovery_p3 INTEGER,
  ruffier_index_value DECIMAL(5,2),
  ruffier_classification public.ruffier_classification_enum,
  ruffier_observations TEXT,
  
  -- ============ UNIPODAL SQUAT TEST ============
  squat_knee_alignment public.movement_quality_enum,
  squat_trunk_control public.movement_quality_enum,
  squat_pelvic_stability public.movement_quality_enum,
  squat_movement_quality public.movement_quality_enum,
  squat_observations TEXT,
  squat_classification public.movement_quality_enum,
  
  -- ============ PHYSIOTHERAPIST AND EVOLUTION NOTES ============
  physiotherapist_note TEXT,
  physiotherapist_recommendation TEXT,
  evolution_note TEXT,
  
  -- Indexes and audit
  updated_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_physiotherapy_player_id 
ON public.physiotherapy_evaluations(player_id);

CREATE INDEX IF NOT EXISTS idx_physiotherapy_user_id 
ON public.physiotherapy_evaluations(user_id);

CREATE INDEX IF NOT EXISTS idx_physiotherapy_evaluation_date 
ON public.physiotherapy_evaluations(evaluation_date);

CREATE INDEX IF NOT EXISTS idx_physiotherapy_created_at 
ON public.physiotherapy_evaluations(created_at);

CREATE INDEX IF NOT EXISTS idx_physiotherapy_is_active 
ON public.physiotherapy_evaluations(is_active) 
WHERE is_active = TRUE;

-- 4. Create function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_physiotherapy_evaluations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 5. Create trigger for automatic timestamp update
DROP TRIGGER IF EXISTS physiotherapy_evaluations_updated_at_trigger 
ON public.physiotherapy_evaluations;

CREATE TRIGGER physiotherapy_evaluations_updated_at_trigger
  BEFORE UPDATE ON public.physiotherapy_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_physiotherapy_evaluations_updated_at();

-- 6. Grant necessary permissions
ALTER TABLE public.physiotherapy_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own physiotherapy evaluations" 
  ON public.physiotherapy_evaluations 
  FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Users can insert own physiotherapy evaluations" 
  ON public.physiotherapy_evaluations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Users can update own physiotherapy evaluations" 
  ON public.physiotherapy_evaluations 
  FOR UPDATE 
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

-- 7. Verify table creation
SELECT 
  'Tabla physiotherapy_evaluations' as table_name,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'physiotherapy_evaluations'
GROUP BY table_name;
