export interface Exercise {
  id?: string;
  phase_id?: string;
  title: string;
  objective: string;
  description: string;
  duration: number; // minutes
  players_count: string;
  space_dimensions: string;
  intensity: string;
  materials: string;
  variations: string;
  observations: string;
  order_index: number;
}

export interface Phase {
  id?: string;
  session_id?: string;
  name: string;
  duration: number; // minutes
  observations: string;
  order_index: number;
  exercises: Exercise[];
}

export interface TrainingSession {
  id?: string;
  coach_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category: string;
  general_objective: string;
  observations: string;
  phases: Phase[];
  created_at?: string;
}
