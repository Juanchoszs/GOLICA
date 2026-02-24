import { supabase } from './client';
import type { TrainingSession, MainExercise, WarmupExercise } from '../../components/planning/types/session.types';

/**
 * Training Sessions Service
 * Handles all CRUD operations for training sessions (now in a single table via JSON)
 */

export async function saveFullTrainingSession(
  coachId: string,
  session: TrainingSession
): Promise<{ success: boolean; id: string | null; error: string | null }> {
  try {
    const warmupDuration = session.warmup.exercises.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const mainDuration = session.main.exercises.reduce((acc, curr) => acc + 15, 0); // O from state if exists

    const payload = {
      coach_id: coachId,
      name: session.name || 'Nueva Sesión',
      category_name: session.categoryName || null,
      session_date: session.date || new Date().toISOString(),
      status: 'published',
      warmup_exercises: session.warmup.exercises,
      main_exercises: session.main.exercises,
      warmup_duration_minutes: warmupDuration,
      main_duration_minutes: mainDuration,
      updated_at: new Date().toISOString()
    };

    // Si tiene un ID UUID válido real, hacemos update. De lo contrario insert.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.id);

    if (isUuid) {
      const { error } = await supabase
        .from('training_sessions')
        .update(payload)
        .eq('id', session.id);
      if (error) throw error;
      return { success: true, id: session.id, error: null };
    } else {
      const { data, error } = await supabase
        .from('training_sessions')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw error;
      return { success: true, id: data.id, error: null };
    }
  } catch (error) {
    console.error('Error saving training session:', error);
    return { success: false, id: null, error: String(error) };
  }
}

export async function getTrainingSessions(coachId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*, profiles!coach_id(name, role)')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching training sessions:', error);
    return [];
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

// ============== STORAGE ==============

export async function uploadBoardImage(base64Data: string): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || 'anon';

    // Extract base64 content robustly
    const base64Content = base64Data.split(',')[1];
    if (!base64Content) throw new Error('Invalid image data');

    // Convert to Blob manually to avoid CSP/fetch issues on data uris
    const byteString = atob(base64Content);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });

    const fileName = `${userId}/board_${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('board-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('board-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading board image:', error);
    return null;
  }
}
