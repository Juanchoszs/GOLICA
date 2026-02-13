import React, { useState } from 'react';
import { TrainingSession } from './types/session.types';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface PlanningListProps {
  userRole?: 'coach' | 'admin';
  userId?: string;
  onCreateNew?: () => void;
  onEdit?: (session: TrainingSession) => void;
}

/**
 * PlanningList Component
 * 
 * Displays a list of training sessions
 * Users can create new sessions or edit existing ones
 */
export const PlanningList: React.FC<PlanningListProps> = ({
  userRole,
  userId,
  onCreateNew,
  onEdit
}) => {
  // TODO: Implementar carga de sesiones desde Supabase
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📋 Mis Sesiones de Entrenamiento</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === 'admin'
              ? 'Gestiona las sesiones de entrenamiento del equipo'
              : 'Crea y edita tus sesiones de entrenamiento'}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus size={18} />
          Nueva Sesión
        </Button>
      </div>

      {/* Sessions Grid or Empty State */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center border rounded-lg border-dashed text-muted-foreground">
          <div className="text-3xl mb-3">📝</div>
          <p className="text-sm font-medium">No hay sesiones de entrenamiento creadas.</p>
          <p className="text-xs mt-2">Comienza creando una nueva sesión.</p>
          <Button onClick={handleCreateNew} className="mt-4" variant="outline">
            Crear Primera Sesión
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onEdit?.(session)}
            >
              <h3 className="font-bold truncate">{session.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(session.date).toLocaleDateString('es-ES')}
              </p>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <p>Calentamiento: {session.warmup.exercises.length} ejercicios</p>
                <p>Parte Principal: {session.main.exercises.length} ejercicios</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanningList;
