import React, { useState, useEffect } from 'react';
import { TrainingSession } from './types/session.types';
import { CompleteSessionBuilder } from './components/CompleteSessionBuilder';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  saveFullTrainingSession,
  uploadBoardImage,
} from '../../utils/supabase/trainingSessionsService';

interface PlanningBuilderProps {
  coachId?: string;
  initialData?: TrainingSession;
  onSave?: (session: TrainingSession) => void;
  onCancel?: () => void;
}

/**
 * PlanningBuilder Component
 * Handles the complete flow for creating and editing training sessions
 */
export const PlanningBuilder: React.FC<PlanningBuilderProps> = ({
  coachId,
  initialData,
  onSave,
  onCancel,
}) => {
  const [categories, setCategories] = useState<Array<any>>([]);

  useEffect(() => {
    if (coachId) {
      fetchCoachCategories();
    }
  }, [coachId]);

  const fetchCoachCategories = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', coachId)
        .single();

      if (profile?.role === 'admin') {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');
        if (error) throw error;
        setCategories(data.map(c => c.name));
      } else {
        const { data, error } = await supabase
          .from('coaches')
          .select('assigned_categories')
          .eq('id', coachId)
          .single();
        if (data?.assigned_categories && Array.isArray(data.assigned_categories)) {
          setCategories(data.assigned_categories);
        }
      }
    } catch (error) {
      console.error('Exception fetching coach categories:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (session: TrainingSession) => {
    // Validation
    if (!session.name || session.name.trim() === '') {
      toast.error('Por favor, ingresa un nombre para la sesión');
      return;
    }
    if (!session.categoryName || session.categoryName.trim() === '') {
      toast.error('Por favor, selecciona una categoría para la planificación');
      return;
    }

    try {
      setIsSaving(true);
      toast.loading('Guardando sesión...', { id: 'save-session' });

      const targetCoachId = coachId || session.coachId;
      if (!targetCoachId) throw new Error('No coach ID defined');

      // 1. Upload pending board images
      const finalSession = {
        ...session,
        main: {
          ...session.main,
          exercises: [...session.main.exercises]
        }
      };

      const uploadStats = { successful: 0, failed: 0 };
      const exercisesWithImages = finalSession.main.exercises.filter(ex => ex.tacticBoardImageBase64);

      if (exercisesWithImages.length === 0) {
        const hasBoardData = finalSession.main.exercises.some(ex => ex.tacticBoardData);
        if (hasBoardData) {
          toast.warning(
            'No se capturó la imagen de la pizarra. Ve a la pestaña "Pizarra Táctica", vuelve a "Planificación" y luego Guardar.',
            { id: 'save-session', duration: 6000 }
          );
          setIsSaving(false);
          return;
        }
      }

      if (exercisesWithImages.length > 0) {
        for (let i = 0; i < finalSession.main.exercises.length; i++) {
          const ex = finalSession.main.exercises[i];
          if (ex.tacticBoardImageBase64) {
            try {
              toast.loading(
                `Subiendo pizarra ${uploadStats.successful + uploadStats.failed + 1}/${exercisesWithImages.length}...`,
                { id: 'save-session' }
              );

              const url = await uploadBoardImage(ex.tacticBoardImageBase64);
              if (url) {
                ex.tacticBoardImageUrl = url;
                uploadStats.successful++;
                delete ex.tacticBoardImageBase64;
              } else {
                uploadStats.failed++;
              }
            } catch (uploadErr) {
              uploadStats.failed++;
              console.error(`Error uploading board ${i + 1}:`, uploadErr);
              toast.error(
                `Pizarra ${i + 1}: ${uploadErr instanceof Error ? uploadErr.message : 'Error al subir'}`,
                { id: `upload-err-${i}` }
              );
            }
          }
        }

        if (uploadStats.failed > 0) {
          const message = uploadStats.successful > 0
            ? `⚠️ Se subieron ${uploadStats.successful} pizarra(s), pero ${uploadStats.failed} fallaron. Revisa el navegador Console.`
            : `❌ No se pudieron subir las pizarras. Crea el bucket "board-images" en Supabase (Storage) y ejecuta la migración 008_storage_board_images_bucket.sql.`;
          toast.warning(message, { id: 'save-session' });
          // Quitar base64 de los que fallaron para no guardarlo en BD
          finalSession.main.exercises.forEach((ex) => {
            if (ex.tacticBoardImageBase64) delete ex.tacticBoardImageBase64;
          });
          // Si ninguna subió, no guardar sesión hasta que el bucket exista
          if (uploadStats.successful === 0) {
            setIsSaving(false);
            return;
          }
        }
      }

      // 2. Save full session to database
      toast.loading('Guardando sesión en base de datos...', { id: 'save-session' });
      const res = await saveFullTrainingSession(targetCoachId, finalSession);

      if (!res.success) {
        throw new Error(res.error || 'Error saving session');
      }

      toast.success('✓ Sesión guardada correctamente', { id: 'save-session' });

      if (onSave) {
        onSave({ ...finalSession, id: res.id || session.id });
      }
    } catch (error: any) {
      console.error('Error in handleSave:', error);
      toast.error(
        error.message || 'Error al guardar la sesión. Revisa la consola.',
        { id: 'save-session' }
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CompleteSessionBuilder
      initialData={initialData}
      onSave={handleSave}
      onCancel={onCancel}
      userCategories={categories}
    />
  );
};

export default PlanningBuilder;
