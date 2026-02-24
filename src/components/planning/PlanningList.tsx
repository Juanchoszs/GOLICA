import React, { useState, useEffect } from 'react';
import { TrainingSession } from './types/session.types';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { getTrainingSessions } from '../../utils/supabase/trainingSessionsService';
import { toast } from 'sonner';

interface PlanningListProps {
  userRole?: 'coach' | 'admin';
  userId?: string;
  onCreateNew?: () => void;
  onEdit?: (session: TrainingSession) => void;
}

export const PlanningList: React.FC<PlanningListProps> = ({
  userRole,
  userId,
  onCreateNew,
  onEdit
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // In Admin/Coach scenarios, we load via user ID.
      // If admin, we could possibly load all, but right now service expects coachId.
      const data = await getTrainingSessions(userId!);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const formatDbToState = (dbSession: any): TrainingSession => {
    return {
      id: dbSession.id,
      name: dbSession.name,
      date: dbSession.session_date,
      coachId: dbSession.coach_id,
      categoryName: dbSession.category_name || '',
      warmup: { exercises: dbSession.warmup_exercises || [] },
      main: { exercises: dbSession.main_exercises || [] },
      createdAt: dbSession.created_at,
      updatedAt: dbSession.updated_at
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📋 Mis Planificaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === 'admin'
              ? 'Gestiona las sesiones de entrenamiento principales'
              : 'Crea y edita tus sesiones de entrenamiento'}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus size={18} />
          Nueva Sesión
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center border rounded-lg border-dashed text-muted-foreground">
          <div className="text-3xl mb-3">📝</div>
          <p className="text-sm font-medium">No hay sesiones creadas.</p>
          <p className="text-xs mt-2">Comienza creando una nueva sesión para tu equipo.</p>
          <Button onClick={handleCreateNew} className="mt-4" variant="outline">
            Crear Primera Sesión
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const coachName = session.profiles?.name || 'Desconocido';
            const coachRole = session.profiles ? (session.profiles.role === 'admin' ? '(Admin)' : '(Coach)') : '';
            const dateObj = new Date(session.created_at);
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString('es-ES');

            return (
              <div
                key={session.id}
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                onClick={() => onEdit?.(formatDbToState(session))}
              >
                <div>
                  <h3 className="font-bold truncate text-lg">{session.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-primary">{session.category_name || 'Sin Categoría'}</span>
                    <span className="text-xs text-muted-foreground">{dateStr} a las {timeStr}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">Autor:</span>
                    <span>{coachName} <span className="text-xs opacity-70">{coachRole}</span></span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Calentamiento: {session.warmup_exercises?.length || 0} ejer.</span>
                    <span>Principal: {session.main_exercises?.length || 0} ejer.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanningList;
