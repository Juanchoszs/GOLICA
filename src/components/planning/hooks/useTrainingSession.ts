import { useState, useCallback } from 'react';
import { TrainingSession, WarmupExercise, MainExercise } from '../types/session.types';

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTrainingSession = (initialSession?: TrainingSession) => {
  const [session, setSession] = useState<TrainingSession>(
    initialSession || {
      id: generateId(),
      name: 'Nueva Sesión de Entrenamiento',
      date: new Date().toISOString().split('T')[0],
      coachId: '',
      warmup: { exercises: [] },
      main: { exercises: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // ==================== WARMUP OPERATIONS ====================

  const addWarmupExercise = useCallback((name: string, duration: number) => {
    setSession((prev) => ({
      ...prev,
      warmup: {
        exercises: [
          ...prev.warmup.exercises,
          {
            id: generateId(),
            name,
            duration,
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const removeWarmupExercise = useCallback((id: string) => {
    setSession((prev) => ({
      ...prev,
      warmup: {
        exercises: prev.warmup.exercises.filter((ex) => ex.id !== id),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateWarmupExercise = useCallback(
    (id: string, updates: Partial<WarmupExercise>) => {
      setSession((prev) => ({
        ...prev,
        warmup: {
          exercises: prev.warmup.exercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // ==================== MAIN EXERCISE OPERATIONS ====================

  const addMainExercise = useCallback(() => {
    const newExercise: MainExercise = {
      id: generateId(),
      objective: '',
      description: '',
      technical: {
        offensive: '',
        defensive: '',
      },
      tactical: {
        offensive: '',
        defensive: '',
      },
      psychology: '',
      physical: '',
    };

    setSession((prev) => ({
      ...prev,
      main: {
        exercises: [...prev.main.exercises, newExercise],
      },
      updatedAt: new Date().toISOString(),
    }));

    return newExercise.id;
  }, []);

  const removeMainExercise = useCallback((id: string) => {
    setSession((prev) => ({
      ...prev,
      main: {
        exercises: prev.main.exercises.filter((ex) => ex.id !== id),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateMainExercise = useCallback(
    (id: string, updates: Partial<MainExercise>) => {
      setSession((prev) => ({
        ...prev,
        main: {
          exercises: prev.main.exercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const updateSessionBasics = useCallback((updates: Partial<TrainingSession>) => {
    setSession((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return {
    session,
    setSession,
    // Warmup
    addWarmupExercise,
    removeWarmupExercise,
    updateWarmupExercise,
    // Main
    addMainExercise,
    removeMainExercise,
    updateMainExercise,
    // Session
    updateSessionBasics,
  };
};
