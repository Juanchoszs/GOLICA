import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  FileJson,
  Plus,
  Download,
  Calendar,
  User
} from 'lucide-react';
import {
  getTrainingSessions,
  deleteTrainingSession,
  getTemplates,
  deleteTemplate,
  getMainExercises,
  getWarmupExercises
} from '../../utils/supabase/trainingSessionsService';
import { supabase } from '../../utils/supabase/client';

interface Coach {
  id: string;
  name: string;
  assigned_categories?: Array<{ id: string; name: string }>;
}

export const SessionsManagement: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(user?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  // Fetch coaches on mount
  useEffect(() => {
    fetchCoaches();
  }, []);

  // Fetch sessions when coach or category changes
  useEffect(() => {
    if (selectedCoachId) {
      fetchSessions();
    }
  }, [selectedCoachId, selectedCategory]);

  // Fetch templates when coach changes
  useEffect(() => {
    if (selectedCoachId) {
      fetchTemplates();
    }
  }, [selectedCoachId]);

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('id, name, assigned_categories');

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast.error('Error al cargar los entrenadores');
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const allSessions = await getTrainingSessions(selectedCoachId, selectedCategory);
      
      // Filter by search term
      const filtered = allSessions.filter(session =>
        session.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSessions(filtered);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const allTemplates = await getTemplates(selectedCoachId);
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error al cargar las plantillas');
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;

    try {
      const result = await deleteTrainingSession(deleteSessionId);
      if (result.success) {
        toast.success('Sesión eliminada');
        fetchSessions();
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar la sesión');
    } finally {
      setDeleteSessionId(null);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    try {
      const result = await deleteTemplate(deleteTemplateId);
      if (result.success) {
        toast.success('Plantilla eliminada');
        fetchTemplates();
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar la plantilla');
    } finally {
      setDeleteTemplateId(null);
    }
  };

  const handleViewSessionDetails = async (sessionId: string) => {
    try {
      const exercises = await getMainExercises(sessionId);
      const warmups = await getWarmupExercises(sessionId);

      const sessionData = sessions.find(s => s.id === sessionId);
      setSessionDetails({
        ...sessionData,
        mainExercises: exercises,
        warmupExercises: warmups
      });
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Error al cargar los detalles');
    }
  };

  const handleExportSession = (session: any) => {
    const data = JSON.stringify(session, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sesión exportada');
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);
  const coachCategories = selectedCoach?.assigned_categories || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Sesiones de Entrenamiento</h2>
        <p className="text-muted-foreground">Administra sesiones de entrenamiento y plantillas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Entrenador</label>
              <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {coachCategories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {coachCategories.map((cat: any) => {
                      const catId = typeof cat === 'string' ? cat : cat.id;
                      const catName = typeof cat === 'string' ? cat : cat.name;
                      return (
                        <SelectItem key={catId} value={catId}>
                          {catName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Nombre de sesión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">
            Sesiones ({filteredSessions.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Plantillas ({templates.length})
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {selectedSession && sessionDetails ? (
            // Session Detail View
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{sessionDetails.name}</CardTitle>
                    <CardDescription>{sessionDetails.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSession(null)}
                  >
                    Volver
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duración Calentamiento</p>
                    <p className="text-lg font-bold">{sessionDetails.warmup_duration_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duración Principal</p>
                    <p className="text-lg font-bold">{sessionDetails.main_duration_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">
                      {(sessionDetails.warmup_duration_minutes || 0) + (sessionDetails.main_duration_minutes || 0)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className="text-lg font-bold capitalize">{sessionDetails.status}</p>
                  </div>
                </div>

                {/* Warmup Exercises */}
                {sessionDetails.warmupExercises?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Ejercicios de Calentamiento</h4>
                    <div className="space-y-2">
                      {sessionDetails.warmupExercises.map((ex: any, idx: number) => (
                        <Card key={idx} className="bg-muted/50">
                          <CardContent className="pt-4">
                            <p className="font-medium">{ex.name}</p>
                            <p className="text-sm text-muted-foreground">{ex.objective}</p>
                            <p className="text-xs mt-2">Duración: {ex.duration_minutes} min</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Exercises */}
                {sessionDetails.mainExercises?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Ejercicios Principales</h4>
                    <div className="space-y-2">
                      {sessionDetails.mainExercises.map((ex: any, idx: number) => (
                        <Card key={idx} className="bg-muted/50">
                          <CardContent className="pt-4 space-y-2">
                            <p className="font-medium">{ex.name}</p>
                            <p className="text-sm text-muted-foreground">{ex.objective}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>Técnico Of.: {ex.technical_offensive}/10</div>
                              <div>Técnico Def.: {ex.technical_defensive}/10</div>
                              <div>Táctico Of.: {ex.tactical_offensive}/10</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>Táctico Def.: {ex.tactical_defensive}/10</div>
                              <div>Psicológico: {ex.psychological}/10</div>
                              <div>Físico: {ex.physical}/10</div>
                            </div>
                            <p className="text-xs">Duración: {ex.duration_minutes} min</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Sessions Table
            <Card>
              <CardContent className="pt-6">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No hay sesiones para mostrar</p>
                    <Button asChild>
                      <a href="/planning">Crear nueva sesión</a>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Calentamiento</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.map(session => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">{session.name}</TableCell>
                            <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                              {session.category_name || '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(session.session_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{session.warmup_duration_minutes || 0} min</TableCell>
                            <TableCell>{session.main_duration_minutes || 0} min</TableCell>
                            <TableCell>
                              {(session.warmup_duration_minutes || 0) + (session.main_duration_minutes || 0)} min
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                session.status === 'active' ? 'bg-green-100 text-green-700' :
                                session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {session.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewSessionDetails(session.id)}>
                                    <Eye size={14} className="mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExportSession(session)}>
                                    <Download size={14} className="mr-2" />
                                    Exportar JSON
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteSessionId(session.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No hay plantillas para mostrar</p>
                  <Button asChild>
                    <a href="/planning">Crear plantilla</a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Ejercicios Calentamiento</p>
                            <p className="font-bold">{(template.warmup_exercises || []).length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ejercicios Principales</p>
                            <p className="font-bold">{(template.main_exercises || []).length}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleExportSession(template)}
                          >
                            <FileJson size={14} className="mr-1" />
                            Exportar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTemplateId(template.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Session Dialog */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sesión será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
