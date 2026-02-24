import React, { useState, useEffect } from 'react';
import { TrainingSession } from './types/session.types';
import { CompleteSessionBuilder } from './components/CompleteSessionBuilder';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  saveFullTrainingSession,
  uploadBoardImage
} from '../../utils/supabase/trainingSessionsService';

interface PlanningBuilderProps {
  coachId?: string;
  initialData?: TrainingSession;
  onSave?: (session: TrainingSession) => void;
  onCancel?: () => void;
}

/**
 * PlanningBuilder Component
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
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (session: TrainingSession) => {
    if (!session.name || session.name.trim() === '') {
      toast.error('Por favor, ingresa un nombre para la sesión');
      return;
    }
    if (!session.categoryName) {
      toast.error('Por favor, selecciona una categoría');
      return;
    }

    try {
      setIsSaving(true);
      toast.loading('Guardando sesión completa...', { id: 'save-session' });

      // Identify coachId
      const targetCoachId = coachId || session.coachId;
      if (!targetCoachId) throw new Error('No se ha definido el coachId localmente');

      // 1. Upload pending board images
      const finalSession = {
        ...session,
        main: {
          ...session.main,
          exercises: [...session.main.exercises]
        }
      };

      let uploadErrors = 0;
      for (let i = 0; i < finalSession.main.exercises.length; i++) {
        const ex = finalSession.main.exercises[i];
        if (ex.tacticBoardImageBase64) {
          toast.loading(`Subiendo pizarra del ejercicio ${i + 1}...`, { id: 'save-session' });
          const url = await uploadBoardImage(ex.tacticBoardImageBase64);
          if (url) {
            ex.tacticBoardImageUrl = url;
          } else {
            uploadErrors++;
            console.error(`Error al subir la imagen del ejercicio ${i + 1}`);
          }
          // Remove base64 to avoid huge payloads to DB
          delete ex.tacticBoardImageBase64;
        }
      }

      if (uploadErrors > 0) {
        toast.error(`Hubo problemas subiendo ${uploadErrors} pizarra(s). La sesión se guardará sin ellas.`, { id: 'save-session' });
      }

      // 2. Save full session
      const res = await saveFullTrainingSession(targetCoachId, finalSession);

      if (!res.success) throw new Error(res.error || 'Error al guardar la sesión');

      toast.success('Sesión guardada correctamente', { id: 'save-session' });

      if (onSave) {
        onSave({ ...finalSession, id: res.id || session.id });
      }
    } catch (error: any) {
      console.error('Error en handleSave:', error);
      toast.error(error.message || 'Error al guardar la sesión', { id: 'save-session' });
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
