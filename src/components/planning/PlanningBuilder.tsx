import React, { useState, useEffect } from 'react';
import { TrainingSession } from './types/session.types';
import { CompleteSessionBuilder } from './components/CompleteSessionBuilder';
import { supabase } from '../../utils/supabase/client';

interface PlanningBuilderProps {
  coachId?: string;
  initialData?: TrainingSession;
  onSave?: (session: TrainingSession) => void;
  onCancel?: () => void;
}

/**
 * PlanningBuilder Component
 * 
 * Main entry point for creating and editing training sessions
 * Includes:
 * - Warmup section (4 exercise slots with duration)
 * - Main section (multiple exercises with complete details)
 * - Tactical board integration
 * - Category selection for multi-category coaches
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
      console.log('🔄 PlanningBuilder: Fetching categories for coach:', coachId);
      fetchCoachCategories();
    }
  }, [coachId]);

  const fetchCoachCategories = async () => {
    try {
      console.log('📡 Fetching coach categories from DB...');
      const { data, error } = await supabase
        .from('coaches')
        .select('assigned_categories')
        .eq('id', coachId)
        .single();

      if (error) {
        console.error('❌ Error fetching categories:', error);
        return;
      }
      
      console.log('✅ Categories fetched:', data?.assigned_categories);
      if (data?.assigned_categories && Array.isArray(data.assigned_categories)) {
        setCategories(data.assigned_categories);
      }
    } catch (error) {
      console.error('❌ Exception fetching coach categories:', error);
    }
  };

  const handleSave = (session: TrainingSession) => {
    if (coachId && !session.coachId) {
      session.coachId = coachId;
    }
    if (onSave) {
      onSave(session);
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
