import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Calendar, User, Clipboard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PhysioSupervision({ user }: { user: any }) {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('physio_daily_tracking')
                .select(`
                    *,
                    players!inner(name, identification),
                    physio:profiles!physio_id(name)
                `);

            if (user.role !== 'admin') {
                // For Chief: fetch their subordinates
                const { data: subordinates } = await supabase
                    .from('physiotherapists')
                    .select('id')
                    .eq('reports_to', user.id);

                const subordinateIds = subordinates?.map(s => s.id) || [];
                
                if (subordinateIds.length === 0) {
                    setRecords([]);
                    setLoading(false);
                    return;
                }
                
                query = query.in('physio_id', subordinateIds);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching supervision records:', error);
            toast.error('Error al cargar seguimiento de subordinados');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Cargando reportes de equipo...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Panel de Supervisión</h2>
                    <p className="text-sm text-muted-foreground">Revisión de actividades de fisiocuidados</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading}>
                    Actualizar
                </Button>
            </div>

            {records.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                        <User className="w-12 h-12 text-muted-foreground opacity-20" />
                        <h4 className="font-semibold text-muted-foreground">Sin reportes recientes</h4>
                        <p className="text-xs text-muted-foreground max-w-xs">No se encontraron reportes de los fisioterapeutas a tu cargo en este momento.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {records.map((record) => (
                        <Card key={record.id} className="hover:border-primary/30 transition-all border-l-4 border-l-primary">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Jugador</p>
                                                <p className="font-bold text-foreground">{record.players?.name}</p>
                                                <p className="text-[10px] text-muted-foreground">ID: {record.players?.identification}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Fisioterapeuta</p>
                                                <p className="text-xs font-semibold">{record.physio?.name || 'Desconocido'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Fecha</p>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Calendar size={12} className="text-primary" />
                                                    {new Date(record.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Resumen de Sesión</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {record.exercises?.map((ex: any, i: number) => (
                                                    <span key={i} className="text-[10px] bg-background border border-border px-2 py-0.5 rounded-md font-medium">
                                                        {ex.name} ({ex.series}x{ex.reps})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-64 space-y-3 border-l md:pl-4 border-border/50">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Estado Médico</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                                record.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                record.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {record.health_status}
                                            </span>
                                        </div>
                                        {record.progress_notes && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Clipboard size={10} /> Notas
                                                </p>
                                                <p className="text-xs text-foreground/80 line-clamp-3 italic leading-relaxed">
                                                    "{record.progress_notes}"
                                                </p>
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 gap-1 hover:bg-green-500/10 hover:text-green-600">
                                                <CheckCircle size={10} /> Marcar como revisado
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
