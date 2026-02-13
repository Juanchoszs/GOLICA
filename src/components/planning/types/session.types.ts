/**
 * Planning Module Types
 * Complete type definitions for training sessions
 */

// ==================== WARMUP SECTION ====================
export interface WarmupExercise {
  id: string;
  name: string;
  duration: number; // in minutes
  description?: string;
}

export interface WarmupSection {
  exercises: WarmupExercise[];
}

// ==================== MAIN SECTION ====================

export interface TechnicalDimensions {
  offensive: string;  // Técnicos Ofensivos
  defensive: string;  // Técnicos Defensivos
}

export interface TacticalDimensions {
  offensive: string;  // Tácticos Ofensivos
  defensive: string;  // Tácticos Defensivos
}

export interface MainExercise {
  id: string;
  objective: string;                    // Objetivo General (corto)
  description: string;                  // Descripción amplia
  technical: TechnicalDimensions;       // Técnicos
  tactical: TacticalDimensions;         // Tácticos
  psychology: string;                   // Psicología/Cognitiva
  physical: string;                     // Físico
  tacticBoardData?: string;             // JSON de la pizarra táctica
}

export interface MainSection {
  exercises: MainExercise[];
}

// ==================== COMPLETE SESSION ====================
export interface TrainingSession {
  id: string;
  name: string;
  date: string;
  coachId: string;
  teamId?: string;
  categoryName?: string;
  
  warmup: WarmupSection;
  main: MainSection;
  
  createdAt: string;
  updatedAt: string;
}

// ==================== FORM STATE ====================
export interface PlanningFormState {
  session: TrainingSession;
  currentExerciseId: string | null;  // For editing main exercise
  isDirty: boolean;
}
