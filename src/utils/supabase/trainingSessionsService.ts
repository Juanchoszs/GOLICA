import { supabase } from './client';
import type { TrainingSession, MainExercise, WarmupExercise } from '../../components/planning/types/session.types';
import type { BoardElement } from '../../components/planing/types/board.types';

/**
 * Training Sessions Service
 * Handles all CRUD operations for training sessions and related exercises
 */

// ============== TRAINING SESSIONS ==============

export async function createTrainingSession(
  coachId: string,
  data: {
    name: string;
    description?: string;
    categoryName?: string;
    boardElements?: BoardElement[];
    boardLines?: any[];
  }
): Promise<{ id: string; error: null } | { id: null; error: string }> {
  try {
    const { data: session, error } = await supabase
      .from('training_sessions')
      .insert({
        coach_id: coachId,
        name: data.name,
        description: data.description || '',
        category_name: data.categoryName || null,
        board_elements: data.boardElements || [],
        board_lines: data.boardLines || [],
        status: 'draft',
        warmup_duration_minutes: 0,
        main_duration_minutes: 0
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: session.id, error: null };
  } catch (error) {
    console.error('Error creating training session:', error);
    return { id: null, error: String(error) };
  }
}

export async function getTrainingSessions(
  coachId: string,
  categoryName?: string
): Promise<any[]> {
  try {
    let query = supabase
      .from('training_sessions')
      .select('*')
      .eq('coach_id', coachId)
      .order('session_date', { ascending: false });

    if (categoryName) {
      query = query.eq('category_name', categoryName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching training sessions:', error);
    return [];
  }
}

export async function getTrainingSessionById(sessionId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching training session:', error);
    return null;
  }
}

export async function updateTrainingSession(
  sessionId: string,
  data: {
    name?: string;
    description?: string;
    categoryName?: string;
    status?: string;
    boardElements?: BoardElement[];
    boardLines?: any[];
    warmupDurationMinutes?: number;
    mainDurationMinutes?: number;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryName !== undefined) updateData.category_name = data.categoryName;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.boardElements !== undefined) updateData.board_elements = data.boardElements;
    if (data.boardLines !== undefined) updateData.board_lines = data.boardLines;
    if (data.warmupDurationMinutes !== undefined) updateData.warmup_duration_minutes = data.warmupDurationMinutes;
    if (data.mainDurationMinutes !== undefined) updateData.main_duration_minutes = data.mainDurationMinutes;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('training_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating training session:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteTrainingSession(sessionId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting training session:', error);
    return { success: false, error: String(error) };
  }
}

// ============== WARMUP EXERCISES ==============

export async function addWarmupExercise(
  sessionId: string,
  exercise: WarmupExercise & { orderInSession: number }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_warmup_exercises')
      .insert({
        session_id: sessionId,
        exercise_number: exercise.id.split('_')[1] || '1',
        name: exercise.name,
        description: exercise.description,
        duration_minutes: exercise.duration || 10,
        materials: exercise.description ? [exercise.description] : [],
        order_in_session: exercise.orderInSession
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding warmup exercise:', error);
    return { success: false, error: String(error) };
  }
}

export async function getWarmupExercises(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('session_warmup_exercises')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_in_session', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching warmup exercises:', error);
    return [];
  }
}

export async function updateWarmupExercise(
  exerciseId: string,
  exercise: Partial<WarmupExercise>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updateData: any = {};
    if (exercise.name) updateData.name = exercise.name;
    if (exercise.description) updateData.description = exercise.description;
    if (exercise.duration) updateData.duration_minutes = exercise.duration;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('session_warmup_exercises')
      .update(updateData)
      .eq('id', exerciseId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating warmup exercise:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteWarmupExercise(exerciseId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_warmup_exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting warmup exercise:', error);
    return { success: false, error: String(error) };
  }
}

// ============== MAIN EXERCISES ==============

export async function addMainExercise(
  sessionId: string,
  exercise: MainExercise & { orderInSession: number }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_main_exercises')
      .insert({
        session_id: sessionId,
        exercise_number: exercise.id.split('_')[1] || '1',
        name: exercise.objective,
        objective: exercise.objective,
        description: exercise.description,
        duration_minutes: 15,
        technical_offensive: 5,
        technical_defensive: 5,
        tactical_offensive: 5,
        tactical_defensive: 5,
        psychological: 5,
        physical: 5,
        materials: [],
        variants: [],
        order_in_session: exercise.orderInSession
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding main exercise:', error);
    return { success: false, error: String(error) };
  }
}

export async function getMainExercises(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('session_main_exercises')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_in_session', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching main exercises:', error);
    return [];
  }
}

export async function updateMainExercise(
  exerciseId: string,
  exercise: Partial<MainExercise>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updateData: any = {};
    if (exercise.objective) updateData.objective = exercise.objective;
    if (exercise.description) updateData.description = exercise.description;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('session_main_exercises')
      .update(updateData)
      .eq('id', exerciseId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating main exercise:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteMainExercise(exerciseId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_main_exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting main exercise:', error);
    return { success: false, error: String(error) };
  }
}

// ============== TEMPLATES ==============

export async function saveAsTemplate(
  coachId: string,
  data: {
    name: string;
    description?: string;
    categoryName?: string;
    warmupExercises: WarmupExercise[];
    mainExercises: MainExercise[];
    boardTemplate: BoardElement[];
  }
): Promise<{ success: boolean; templateId: string | null; error: string | null }> {
  try {
    const { data: template, error } = await supabase
      .from('session_templates')
      .insert({
        coach_id: coachId,
        name: data.name,
        description: data.description || '',
        category_name: data.categoryName || null,
        warmup_exercises: data.warmupExercises,
        main_exercises: data.mainExercises,
        board_template: data.boardTemplate,
        is_public: false,
        is_favorite: false,
        usage_count: 0
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, templateId: template.id, error: null };
  } catch (error) {
    console.error('Error saving template:', error);
    return { success: false, templateId: null, error: String(error) };
  }
}

export async function getTemplates(coachId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('session_templates')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: String(error) };
  }
}

// ============== SESSION NOTES ==============

export async function addSessionNote(
  sessionId: string,
  coachId: string,
  content: string,
  noteType: string = 'general'
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_notes')
      .insert({
        session_id: sessionId,
        coach_id: coachId,
        content,
        note_type: noteType
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding session note:', error);
    return { success: false, error: String(error) };
  }
}

export async function getSessionNotes(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching session notes:', error);
    return [];
  }
}

export async function deleteSessionNote(noteId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('session_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting session note:', error);
    return { success: false, error: String(error) };
  }
}
