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
    const mainDuration = 0; // Main exercises don't have individual durations

    // Build board_images metadata from main exercises that have an associated board image
    const boardImages =
      Array.isArray(session.main?.exercises)
        ? session.main.exercises
            .filter((ex: MainExercise) => !!ex.tacticBoardImageUrl)
            .map((ex: MainExercise) => ({
              exerciseId: ex.id,
              url: ex.tacticBoardImageUrl,
              title: ex.objective || ex.description || '',
              created_at: new Date().toISOString(),
            }))
        : [];

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
      board_images: boardImages,
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

export async function getTrainingSessions(coachId: string): Promise<TrainingSession[]> {
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

/**
 * Get all training sessions by category
 */
export async function getTrainingSessionsByCategory(
  category: string,
  coachId?: string
): Promise<TrainingSession[]> {
  try {
    let query = supabase
      .from('training_sessions')
      .select('*, profiles!coach_id(name, role)')
      .eq('category_name', category)
      .order('created_at', { ascending: false });

    if (coachId) {
      query = query.eq('coach_id', coachId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching training sessions by category:', error);
    return [];
  }
}

/**
 * Get all training sessions (for admin users)
 */
export async function getAllTrainingSessions(): Promise<TrainingSession[]> {
  try {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*, profiles!coach_id(name, role, id)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all training sessions:', error);
    return [];
  }
}

/**
 * Get all categories with their session counts
 */
export async function getCategoriesWithSessionCount(): Promise<Array<{ name: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('category_name')
      .not('category_name', 'is', null);

    if (error) throw error;

    const grouped: { [key: string]: number } = {};
    data?.forEach((session) => {
      const cat = session.category_name || 'Sin Categoría';
      grouped[cat] = (grouped[cat] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching categories with session count:', error);
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
    if (!base64Data || base64Data.trim() === '') {
      throw new Error('No image data provided');
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || 'anon';

    // Extract base64 content robustly
    let base64Content = base64Data;
    if (base64Data.includes(',')) {
      base64Content = base64Data.split(',')[1];
    }
    
    if (!base64Content || base64Content.trim() === '') {
      throw new Error('Invalid image data format');
    }

    // Convert base64 to Blob
    const byteString = atob(base64Content);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });

    // Ensure blob has content
    if (blob.size === 0) {
      throw new Error('Image blob is empty');
    }

    const fileName = `${userId}/board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;

    // Comprobar si el bucket existe (listBuckets puede devolver [] por RLS; en ese caso intentamos subir igual)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (!bucketsError && buckets && buckets.length > 0) {
      const boardBucketExists = buckets.some(
        (b) => (b as { id?: string; name?: string }).name === 'board-images' || (b as { id?: string; name?: string }).id === 'board-images'
      );
      if (!boardBucketExists) {
        throw new Error('Board images bucket does not exist. Please create it in Supabase Dashboard.');
      }
    }

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('board-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error('No data returned from upload');
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('board-images')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Could not generate public URL');
    }

    console.log('Board image uploaded successfully:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading board image:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`No se pudo subir la imagen de la pizarra: ${message}`);
  }
}

export async function getTemplates(coachId: string): Promise<TrainingSession[]> {
  // TODO: Implement templates fetching if there is a table for it
  return [];
}

export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error: string | null }> {
  // TODO: Implement template deletion
  return { success: false, error: 'Not implemented' };
}
