import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Search, History, Calendar, CheckCircle2, User, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface Exercise {
    id: string;
    name: string;
    reps: string;
    series: string;
}

interface Player {
    id: string;
    name: string;
    identification: string;
    health_status: string;
}

type ViewType = 'search' | 'form' | 'history';

export function PhysioDailyTracking({ user }: { user: any }) {
    const [view, setView] = useState<ViewType>('search');
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    
    // Form state
    const [exercises, setExercises] = useState<Exercise[]>([
        { id: crypto.randomUUID(), name: '', reps: '', series: '' }
    ]);
    const [progressNote, setProgressNote] = useState('');
    const [healthStatus, setHealthStatus] = useState('Con leves restricciones');

    useEffect(() => {
        if (selectedPlayer && view === 'history') {
            fetchPlayerHistory(selectedPlayer.id);
        }
    }, [selectedPlayer, view]);

    const handleSearch = async () => {
        if (!searchId.trim()) {
            toast.error('Ingresa un número de identificación');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('players')
                .select('id, name, identification, health_status')
                .or(`identification.eq.${searchId},identification.eq.CC ${searchId},identification.eq.TI ${searchId}`)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setSelectedPlayer(data);
                setHealthStatus(data.health_status || 'Con leves restricciones');
                setView('form');
            } else {
                toast.error('Jugador no encontrado con esa identificación');
            }
        } catch (error) {
            console.error('Error searching player:', error);
            toast.error('Error al buscar jugador');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlayerHistory = async (playerId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('physio_daily_tracking')
                .select('*')
                .eq('player_id', playerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const addExercise = () => {
        setExercises([...exercises, { id: crypto.randomUUID(), name: '', reps: '', series: '' }]);
    };

    const removeExercise = (id: string) => {
        if (exercises.length > 1) {
            setExercises(exercises.filter(ex => ex.id !== id));
        }
    };

    const updateExercise = (id: string, field: keyof Exercise, value: string) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const handleSubmit = async () => {
        if (!selectedPlayer) return;
        
        const validExercises = exercises.filter(ex => ex.name.trim() !== '');
        if (validExercises.length === 0) {
            toast.error('Agrega al menos un ejercicio');
            return;
        }

        setLoading(true);
        try {
            // 1. Guardar seguimiento diario
            // Nota: Asumimos que la tabla physio_daily_tracking existe o se creará.
            // Si no existe, fallará pero el código es lógicamente correcto para el requerimiento.
            const { error: trackingError } = await supabase
                .from('physio_daily_tracking')
                .insert([{
                    player_id: selectedPlayer.id,
                    physio_id: user.id,
                    exercises: validExercises.map(({name, reps, series}) => ({name, reps, series})),
                    progress_notes: progressNote,
                    health_status: healthStatus,
                    created_at: new Date().toISOString()
                }]);

            if (trackingError) throw trackingError;

            // 2. Actualizar estado de salud en tabla players
            const { error: playerError } = await supabase
                .from('players')
                .update({ health_status: healthStatus })
                .eq('id', selectedPlayer.id);

            if (playerError) console.error('Error updating player health:', playerError);

            toast.success('Seguimiento diario registrado correctamente');
            setView('history');
        } catch (error: any) {
            console.error('Error saving tracking:', error);
            toast.error('Error al guardar: ' + (error.message || 'La tabla de seguimientos no está disponible aún.'));
        } finally {
            setLoading(false);
        }
    };

    if (view === 'search') {
        return (
            <div className="p-6 max-w-2xl mx-auto h-full flex flex-col justify-center">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Seguimiento Diario</h2>
                    <p className="text-muted-foreground mt-2">Busca un jugador por su número de identificación para comenzar.</p>
                </div>
                
                <Card className="border-primary/20 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search-id">Cédula o Tarjeta de Identidad</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="search-id" 
                                        placeholder="Ej: 1005678943" 
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="text-lg py-6"
                                    />
                                    <Button onClick={handleSearch} disabled={loading} size="lg" className="px-8">
                                        {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (view === 'form' && selectedPlayer) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setView('search')} className="gap-2">
                        <ArrowLeft size={16} /> Volver a buscar
                    </Button>
                    <Button variant="outline" onClick={() => setView('history')} className="gap-2">
                        <History size={16} /> Ver historial
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                        {selectedPlayer.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{selectedPlayer.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {selectedPlayer.identification}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" /> Ejercicios del Día
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {exercises.map((ex, index) => (
                                    <div key={ex.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Ejercicio {index + 1}</Label>
                                            <Input 
                                                placeholder="Ej: Sentadilla isométrica"
                                                value={ex.name}
                                                onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-xs">Reps</Label>
                                            <Input 
                                                placeholder="12"
                                                value={ex.reps}
                                                onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-xs">Series</Label>
                                            <Input 
                                                placeholder="4"
                                                value={ex.series}
                                                onChange={(e) => updateExercise(ex.id, 'series', e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => removeExercise(ex.id)}
                                            disabled={exercises.length === 1}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed gap-2 mt-4" onClick={addExercise}>
                                    <Plus size={16} /> Añadir Ejercicio
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg">Notas de Evolución</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Textarea 
                                    placeholder="Describe los avances o problemas detectados hoy..."
                                    className="min-h-[120px]"
                                    value={progressNote}
                                    onChange={(e) => setProgressNote(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg">Estado de Salud</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <Select value={healthStatus} onValueChange={setHealthStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Perfecto">Perfecto</SelectItem>
                                        <SelectItem value="Con leves restricciones">Restricciones Leves</SelectItem>
                                        <SelectItem value="Inhabilitado">Inhabilitado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Este estado se actualizará en la ficha del jugador.</p>
                            </CardContent>
                        </Card>

                        <Button 
                            className="w-full h-16 text-lg font-bold gap-2 shadow-lg" 
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                            Guardar Sesión
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'history' && selectedPlayer) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setView('form')} className="gap-2">
                        <ArrowLeft size={16} /> Volver al formulario
                    </Button>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Historial de Seguimiento</h2>
                </div>

                <div className="flex items-center gap-4 bg-muted p-4 rounded-xl">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                        {selectedPlayer.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold">{selectedPlayer.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {selectedPlayer.identification}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
                ) : history.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-muted-foreground">No hay registros de seguimiento para este jugador.</CardContent></Card>
                ) : (
                    <div className="space-y-4">
                        {history.map((record) => (
                            <Card key={record.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/50 pb-3 py-3 px-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <Calendar size={14} className="text-primary" />
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                            record.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            record.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                            {record.health_status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Ejercicios realizados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {record.exercises?.map((ex: any, i: number) => (
                                                <div key={i} className="bg-background border px-3 py-1 rounded-lg text-sm">
                                                    <span className="font-medium">{ex.name}</span>
                                                    <span className="text-muted-foreground ml-2">{ex.series}x{ex.reps}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {record.progress_notes && (
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Evolución</p>
                                            <p className="text-sm italic text-foreground/80">{record.progress_notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return null;
}

// Helper icons that were missing in main import
const Activity = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
