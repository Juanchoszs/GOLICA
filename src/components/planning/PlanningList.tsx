import React, { useState, useEffect } from 'react';
import { TrainingSession } from './types/session.types';
import { Button } from '../ui/button';
import { Plus, Edit2, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getTrainingSessions, deleteTrainingSession } from '../../utils/supabase/trainingSessionsService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface PlanningListProps {
  userRole?: 'coach' | 'admin';
  userId?: string;
  onCreateNew?: () => void;
  onEdit?: (session: TrainingSession) => void;
  onRefresh?: () => void;
}

interface GroupedSessions {
  [categoryName: string]: any[];
}

export const PlanningList: React.FC<PlanningListProps> = ({
  userRole,
  userId,
  onCreateNew,
  onEdit,
  onRefresh
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [allSessionsRole, setAllSessionsRole] = useState(userRole);
  const [allCoachSessions, setAllCoachSessions] = useState<any[]>([]);
  const [showAllSessions, setShowAllSessions] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const currentRole = userProfile?.role || userRole;
      setAllSessionsRole(currentRole);

      // Load user's own sessions
      const ownData = await getTrainingSessions(userId!);
      setSessions(ownData);
      groupByCategory(ownData);

      // If admin, also load all coach sessions for review
      if (currentRole === 'admin') {
        const { data: allCoaches } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'coach');

        if (allCoaches && allCoaches.length > 0) {
          const coachSessions = await Promise.all(
            allCoaches.map((coach) => getTrainingSessions(coach.id))
          );
          const flattened = coachSessions.flat();
          setAllCoachSessions(flattened);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (sessionsList: any[]) => {
    const grouped: GroupedSessions = {};

    sessionsList.forEach((session) => {
      const category = session.category_name || 'Sin Categoría';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(session);
    });

    // Sort by category name
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    setGroupedSessions(grouped);
    
    // Auto-expand first category
    const categories = Object.keys(grouped);
    if (categories.length > 0 && !expandedCategories[categories[0]]) {
      setExpandedCategories((prev) => ({ ...prev, [categories[0]]: true }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDelete = async (sessionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      try {
        const result = await deleteTrainingSession(sessionId);
        if (result.success) {
          toast.success('Sesión eliminada exitosamente');
          loadSessions();
          onRefresh?.();
        } else {
          toast.error(result.error || 'Error al eliminar la sesión');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error('Error al eliminar la sesión');
      }
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

  const renderSessionCard = (session: any, isCoachView: boolean = false) => {
    const coachName = session.profiles?.name || 'Desconocido';
    const dateObj = new Date(session.created_at);
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('es-ES');
    const hasImages = session.main_exercises?.some((ex: any) => ex.tacticBoardImageUrl || ex.tacticBoardData);

    return (
      <div
        key={session.id}
        className="p-4 border rounded-lg bg-card hover:shadow-md transition-all hover:border-primary/50 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{session.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{dateStr} - {timeStr}</p>
          </div>
          <div className="flex gap-2 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(formatDbToState(session));
              }}
            >
              <Edit2 size={16} />
            </Button>
            {!isCoachView && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(session.id);
                }}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Entrenador:</span>
            <span className="text-muted-foreground">{coachName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Ejercicios:</span>
            <span className="text-muted-foreground">
              {session.warmup_exercises?.length || 0} calent. + {session.main_exercises?.length || 0} princ.
            </span>
          </div>
          {hasImages && (
            <div className="flex items-center text-sm text-green-600 font-medium">
              <Eye size={14} className="mr-1" />
              Pizarras incluidas
            </div>
          )}
          {session.is_reviewed && (
            <div className="flex items-center text-sm text-blue-600 font-medium">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Revisado
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categoriesToShow = showAllSessions ? Object.keys(groupedSessions) : Object.keys(groupedSessions);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">📋 Planificaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {allSessionsRole === 'admin'
              ? 'Gestiona y supervisa las sesiones de entrenamiento'
              : 'Crea y edita tus sesiones de entrenamiento'}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2 w-full sm:w-auto">
          <Plus size={18} />
          Nueva Sesión
        </Button>
      </div>

      {/* Main Content */}
      {Object.keys(groupedSessions).length === 0 ? (
        <div className="p-12 text-center border rounded-lg border-dashed text-muted-foreground bg-muted/30">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-sm font-medium">No hay planificaciones creadas</p>
          <p className="text-xs mt-2">Comienza creando una nueva sesión de entrenamiento</p>
          <Button onClick={handleCreateNew} className="mt-4" variant="outline">
            Crear Primera Sesión
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categoriesToShow.map((category) => (
            <div key={category} className="border rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between font-semibold text-lg"
              >
                <span className="flex items-center gap-2">
                  ⚽ {category}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({groupedSessions[category].length})
                  </span>
                </span>
                {expandedCategories[category] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {/* Sessions Grid */}
              {expandedCategories[category] && (
                <div className="p-4 bg-background grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedSessions[category].map((session) =>
                    renderSessionCard(session, false)
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin: Show Other Coaches Sessions */}
      {allSessionsRole === 'admin' && allCoachSessions.length > 0 && (
        <div className="mt-8 pt-8 border-t space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold">👨‍🏫 Sesiones de Entrenadores</h3>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowAllSessions(!showAllSessions)}
            >
              {showAllSessions ? 'Ocultar' : 'Ver Todas'}
            </Button>
          </div>

          {showAllSessions && (
            <p className="text-sm text-muted-foreground">
              Revisa y supervisa las sesiones creadas por tus entrenadores
            </p>
          )}

          {showAllSessions && allCoachSessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCoachSessions.map((session) => renderSessionCard(session, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanningList;
