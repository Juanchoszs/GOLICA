import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from './ThemeContext';
import {
    User,
    Trophy,
    Activity,
    FileText,
    Heart,
    TrendingUp,
    LogOut,
    Calendar,
    Phone,
    Mail,
    Shield,
    Upload,
    Clock,
    CheckCircle2,
    Users,
    Sun,
    Moon,
    Camera as CameraIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { CameraCapture } from './ui/CameraCapture';

interface PlayerPortalProps {
    user: any;
    onLogout: () => void;
}

export function PlayerPortal({ user, onLogout }: PlayerPortalProps) {
    const [playerData, setPlayerData] = useState<any>(user);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showCamera, setShowCamera] = useState<{ side: 'front' | 'back' } | null>(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const fetchPlayerData = async () => {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setPlayerData(data);
            }
        };
        fetchPlayerData();
    }, [user.id]);

    const handleFileUpload = async (file: File | Blob, side: 'front' | 'back') => {
        console.log(`--- Iniciando subida de archivo (${side}) ---`);
        
        if (!playerData?.id) {
            console.error('Error: ID de jugador no encontrado');
            toast.error('Error interno: No se pudo identificar al jugador');
            return;
        }

        const dbColumn = side === 'front' ? 'id_card_front_url' : 'id_card_back_url';
        const oldUrl = playerData[dbColumn];

        setIsUploading(true);
        try {
            // 1. Delete old image if it exists
            if (oldUrl && oldUrl.includes('player-documents')) {
                try {
                    const pathParts = oldUrl.split('player-documents/')[1];
                    if (pathParts) {
                        const oldFilePath = pathParts.split('?')[0];
                        await supabase.storage
                            .from('player-documents')
                            .remove([oldFilePath]);
                        console.log(`Imagen antigua eliminada: ${oldFilePath}`);
                    }
                } catch (delError) {
                    console.error('Error al eliminar imagen antigua:', delError);
                }
            }

            // 2. Upload new image
            const fileName = file instanceof File ? file.name : `capture_${side}.jpg`;
            const fileExt = fileName.split('.').pop() || 'jpg';
            const filePath = `${playerData.id}/id_card_${side}_${Date.now()}.${fileExt}`;

            console.log(`Subiendo a storage: ${filePath}...`);
            const { error: uploadError } = await supabase.storage
                .from('player-documents')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('player-documents')
                .getPublicUrl(filePath);

            console.log(`Actualizando DB columna ${dbColumn}...`);
            const { error: updateError } = await supabase
                .from('players')
                .update({ [dbColumn]: publicUrl })
                .eq('id', playerData.id);

            if (updateError) throw updateError;

            setPlayerData({ ...playerData, [dbColumn]: publicUrl });
            toast.success(`Tarjeta (${side === 'front' ? 'frente' : 'dorso'}) subida correctamente`);
            setShowCamera(null);
        } catch (error: any) {
            console.error('ERROR EN SUBIDA:', error);
            toast.error(`Error al subir: ${error.message}`);
        } finally {
            setIsUploading(false);
            console.log('--- Proceso terminado ---');
        }
    };

    const performance = playerData.performance || { training: 0, matchGoals: 0, matchAssists: 0 };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Portal */}
            <header className="bg-card border-b border-border sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">G</span>
                        </div>
                        <div>
                            <h1 className="text-foreground font-bold leading-none">Mi Portal GOLICA</h1>
                            <p className="text-muted-foreground text-xs">Hola, {playerData.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            aria-label="Cambiar tema"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-primary" />
                            ) : (
                                <Moon className="w-5 h-5 text-primary" />
                            )}
                        </button>
                        <Button variant="ghost" onClick={onLogout} className="text-destructive hover:bg-destructive/10">
                            <LogOut size={18} className="mr-2" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda - Perfil Rápido */}
                    <div className="space-y-6">
                        <Card className="bg-card border-border p-6 text-center">
                            <div className="w-24 h-24 bg-primary/20 border-2 border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                <User size={48} className="text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-1">{playerData.name}</h2>
                            <p className="text-primary text-sm font-medium mb-4">{playerData.category || 'Categoría no asignada'}</p>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Identificación</p>
                                    <p className="text-foreground font-semibold">{playerData.identification}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Posición</p>
                                    <p className="text-foreground font-semibold">{playerData.position || 'N/A'}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card border-border p-6">
                            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-primary" />
                                Mis Documentos
                            </h3>
                            <p className="text-muted-foreground text-xs mb-4 text-pretty subrayado">Sube ambos lados de tu documento de identidad para completar tu ficha técnica.</p>
                            
                            <div className="space-y-4">
                                {/* Front Side */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>Frente de Identidad</span>
                                        {playerData.id_card_front_url && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Listo</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 group"
                                            onClick={() => setShowCamera({ side: 'front' })}
                                            disabled={isUploading}
                                        >
                                            <CameraIcon size={18} className="mr-2 text-muted-foreground group-hover:text-primary" />
                                            <span className="text-xs">Tomar Foto</span>
                                        </Button>
                                        <label className="flex-1 h-12 border-dashed border-2 rounded-md border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 group">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'front');
                                                }}
                                                disabled={isUploading} 
                                            />
                                            <Upload size={18} className="mr-2 text-muted-foreground group-hover:text-primary" />
                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Elegir Archivo</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>Dorso de Identidad</span>
                                        {playerData.id_card_back_url && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Listo</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 group"
                                            onClick={() => setShowCamera({ side: 'back' })}
                                            disabled={isUploading}
                                        >
                                            <CameraIcon size={18} className="mr-2 text-muted-foreground group-hover:text-primary" />
                                            <span className="text-xs">Tomar Foto</span>
                                        </Button>
                                        <label className="flex-1 h-12 border-dashed border-2 rounded-md border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 group">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'back');
                                                }}
                                                disabled={isUploading} 
                                            />
                                            <Upload size={18} className="mr-2 text-muted-foreground group-hover:text-primary" />
                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Elegir Archivo</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Columna Central/Derecha - Pestañas de Información */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-muted/30 p-1 w-full flex overflow-x-auto h-auto no-scrollbar">
                                <TabsTrigger value="overview" className="flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Trophy size={16} className="mr-2" /> General
                                </TabsTrigger>
                                <TabsTrigger value="rendimiento" className="flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Activity size={16} className="mr-2" /> Rendimiento
                                </TabsTrigger>
                                <TabsTrigger value="salud" className="flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Heart size={16} className="mr-2" /> Salud
                                </TabsTrigger>
                            </TabsList>

                            {/* Vista General */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <Card className="bg-card border-border p-8">
                                    <h3 className="text-foreground text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Ficha Técnica</h3>
                                    <p className="text-muted-foreground mb-6">Esta información es actualizada periódicamente por el cuerpo técnico.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Calendar size={20} className="text-primary mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Fecha de Nacimiento</p>
                                                    <p className="text-foreground font-medium">{playerData.birth_date || 'No registrada'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Phone size={20} className="text-primary mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Contacto</p>
                                                    <p className="text-foreground font-medium">{playerData.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-muted-foreground text-xs">Email</p>
                                                    <p className="text-foreground font-medium break-all">{playerData.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                            <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                                                <Shield size={18} />
                                                Estado actual
                                            </h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-3 h-3 rounded-full ${playerData.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                <span className="text-foreground font-semibold uppercase">{playerData.status || 'Activo'}</span>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                Registrado desde: {new Date(playerData.registered_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Resumen de Estadísticas */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-card border-border p-6 text-center">
                                        <TrendingUp className="text-primary mx-auto mb-2" size={24} />
                                        <p className="text-3xl font-bold text-foreground">{performance.training}%</p>
                                        <p className="text-muted-foreground text-sm">Asistencia Entrenamientos</p>
                                    </Card>
                                    <Card className="bg-card border-border p-6 text-center">
                                        <Trophy className="text-primary mx-auto mb-2" size={24} />
                                        <p className="text-3xl font-bold text-foreground">{performance.matchGoals}</p>
                                        <p className="text-muted-foreground text-sm">Goles Totales</p>
                                    </Card>
                                    <Card className="bg-card border-border p-6 text-center">
                                        <Users className="text-primary mx-auto mb-2" size={24} />
                                        <p className="text-3xl font-bold text-foreground">{performance.matchAssists}</p>
                                        <p className="text-muted-foreground text-sm">Asistencias</p>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Vista Rendimiento */}
                            <TabsContent value="rendimiento" className="mt-6">
                                <Card className="bg-card border-border p-8 text-center py-20">
                                    <TrendingUp size={48} className="text-primary mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold mb-2">Seguimiento Técnico</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Próximamente podrás ver aquí las gráficas de evolución, tests de velocidad y comentarios de tu entrenador.
                                    </p>
                                </Card>
                            </TabsContent>

                            {/* Vista Salud */}
                            <TabsContent value="salud" className="mt-6 space-y-6">
                                <Card className="bg-card border-border p-8">
                                    <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                        <Heart size={20} className="text-red-500" />
                                        Antecedentes y Lesiones
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                                            <Clock className="text-primary flex-shrink-0" size={20} />
                                            <div>
                                                <p className="text-foreground font-medium">Nota del fisioterapeuta</p>
                                                <p className="text-muted-foreground text-sm">Actualmente sin lesiones registradas. Jugador apto para competencia de alta intensidad.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            {/* Camera Modal */}
            {showCamera && (
                <CameraCapture 
                    title={`Capturar ${showCamera.side === 'front' ? 'Frente' : 'Dorso'} de Identificación`}
                    onCapture={(blob) => handleFileUpload(blob, showCamera.side)}
                    onClose={() => setShowCamera(null)}
                />
            )}
        </div>
    );
}
