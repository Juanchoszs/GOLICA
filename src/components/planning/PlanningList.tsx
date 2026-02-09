import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, Calendar, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { TrainingSession } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlanningListProps {
  userRole: 'admin' | 'coach';
  userId: string; // Coach ID or Admin ID (though Admin sees all)
  onCreateNew: () => void;
  onEdit: (session: TrainingSession) => void;
}

export function PlanningList({ userRole, userId, onCreateNew, onEdit }: PlanningListProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [userId, userRole]);

  async function fetchSessions() {
    try {
      setLoading(true);
      let query = supabase
        .from('training_sessions')
        .select(`
          *,
          session_phases (
            *,
            session_exercises (*)
          )
        `)
        .order('date', { ascending: false });

      if (userRole === 'coach') {
        query = query.eq('coach_id', userId);
      }
      
      // If admin, we might want to join with coaches/admins table to get coach name, 
      // but for now let's just show the raw data or fetch coach names separately if needed.
      // Since we don't have a reliable 'coaches' table relation setup in the type system yet,
      // we will just list the sessions.

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedSessions: TrainingSession[] = (data || []).map((s: any) => ({
        ...s,
        phases: (s.session_phases || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((p: any) => ({
                ...p,
                exercises: (p.session_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index)
            }))
      }));

      setSessions(mappedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error al cargar las planificaciones');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta planificación?')) return;

    try {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Planificación eliminada');
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Error al eliminar la planificación');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando planificaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Planificaciones de Entrenamiento</h2>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus size={16} />
          Nueva Planificación
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-start">
                <span className="text-lg font-bold truncate pr-2">{session.title}</span>
                {/* <Badge variant="outline">{session.category}</Badge> */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{format(new Date(session.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{session.time}</span>
                </div>
                <div className="line-clamp-2 italic">
                  {session.general_objective}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                 <Button variant="outline" size="sm" onClick={() => onEdit(session)}>
                    {userRole === 'admin' ? <Eye size={14} className="mr-1"/> : <Edit size={14} className="mr-1"/>}
                    {userRole === 'admin' ? 'Ver/Editar' : 'Editar'}
                 </Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => session.id && handleDelete(session.id)}>
                    <Trash2 size={14} />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No hay planificaciones registradas.
          </div>
        )}
      </div>
    </div>
  );
}
