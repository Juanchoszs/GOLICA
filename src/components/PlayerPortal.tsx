import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useTheme } from './ThemeContext';
import {
    User,
    Users,
    Trophy,
    Activity,
    LogOut,
    Calendar,
    Phone,
    Mail,
    Shield,
    Clock,
    Sun,
    Moon,
    Menu,
    X,
    ChevronRight,
    MapPin,
    Shirt,
    Upload,
    Scissors,
    Camera
} from 'lucide-react';
import { ImageEditor } from './ui/ImageEditor';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerPortalProps {
    user: any;
    onLogout: () => void;
}

export function PlayerPortal({ user, onLogout }: PlayerPortalProps) {
    const [playerData, setPlayerData] = useState<any>(user);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isUploading, setIsUploading] = useState(false);
    const [editingImage, setEditingImage] = useState<{ url: string, field: string } | null>(null);
    const { theme, toggleTheme } = useTheme();
    const [convocatorias, setConvocatorias] = useState<any[]>([]);

    // Data Fetching & Sync
    useEffect(() => {
        const fetchAllData = async () => {
            // Player Data
            const { data: pData } = await supabase
                .from('players')
                .select('*')
                .eq('id', user.id)
                .single();
            if (pData) setPlayerData((prev: any) => ({ ...prev, ...pData }));

            // Convocatorias - Filtrar por categoría del jugador
            const { data: cData } = await supabase
                .from('convocatorias')
                .select('*')
                .order('date', { ascending: false });

            if (cData && pData) {
                const playerCategory = pData.category || '';
                const myConvs = cData.filter((c: any) => {
                    // Verificar si el jugador está en la lista de jugadores de la convocatoria
                    const isInPlayers = Array.isArray(c.players) && c.players.some((p: any) => p.id === user.id);
                    // Verificar si la categoría de la convocatoria coincide con la del jugador
                    const categoryMatch = !c.category || !playerCategory ||
                        (typeof c.category === 'string' && playerCategory.includes(c.category)) ||
                        (typeof playerCategory === 'string' && c.category.includes(playerCategory));
                    return isInPlayers && categoryMatch;
                });
                setConvocatorias(myConvs);
            }
        };

        fetchAllData();

        // Focus Revalidation
        const handleFocus = () => {
            console.log('Refreshing data...');
            fetchAllData();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user.id]);

    const performance = playerData.performance || { training: 0, matchGoals: 0, matchAssists: 0 };

    // Navigation Items
    const navItems = [
        { id: 'overview', label: 'Resumen', icon: Activity },
        { id: 'convocatorias', label: 'Convocatorias', icon: Calendar },
        { id: 'stats', label: 'Rendimiento', icon: Trophy },
        { id: 'profile', label: 'Mi Perfil', icon: User },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleUploadClick = (field: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setEditingImage({
                        url: event.target?.result as string,
                        field
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleUpdateImage = async (blob: Blob) => {
        if (!editingImage) return;

        const toastId = toast.loading('Subiendo imagen...');
        setIsUploading(true);
        try {
            const bucketName = 'player-documents';
            const folder = editingImage.field === 'photo_url' ? 'fotos de perfil' : 'documents';
            const fileName = `${playerData.id}/${folder}/${editingImage.field}_${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            // Actualizar en la base de datos inmediatamente
            const { error: dbError, data: updateData } = await supabase
                .from('players')
                .update({ [editingImage.field]: publicUrl })
                .eq('id', playerData.id)
                .select('*');

            if (dbError) {
                console.error("Error saving URL to DB:", dbError);
                throw new Error(`Fallo en BD: ${dbError.message}`);
            } else if (!updateData || updateData.length === 0) {
                throw new Error(`Permiso denegado por RLS en Supabase (El jugador no tiene permiso para actualizar su perfil).`);
            }

            setPlayerData((prev: any) => ({
                ...prev,
                [editingImage.field]: publicUrl
            }));

            setEditingImage(null);
            toast.success('¡Documento subido y guardado exitosamente!', { id: toastId });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error(error.message || 'Error al subir la imagen.', { id: toastId, duration: 10000 });
        } finally {
            setIsUploading(false);
        }
    };

    if (editingImage) {
        return (
            <ImageEditor
                image={editingImage.url}
                onSave={handleUpdateImage}
                onCancel={() => setEditingImage(null)}
                aspect={editingImage.field === 'photo_url' ? 1 / 1 : 1.6 / 1}
            />
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop & Mobile) */}
            <motion.aside
                className={`
                    fixed md:relative z-50 h-full w-72 bg-card/95 backdrop-blur-xl border-r border-border flex flex-col shadow-2xl
                    md:translate-x-0 transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Brand */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <img src="/logo-white.png" className="w-6 h-6 object-contain invert grayscale brightness-200" alt="Logo" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">GOLICA <span className="text-primary">PRO</span></h1>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden p-1 hover:bg-muted rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* User Card */}
                <div className="px-6 py-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5">
                            <img
                                src={playerData.photo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + playerData.name}
                                className="w-full h-full rounded-full object-cover bg-background"
                            />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm truncate">{(playerData.name || '').split(' ')[0] || 'Jugador'}</h3>
                            <p className="text-xs text-muted-foreground truncate">{playerData.position || 'Jugador'}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${activeTab === item.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                            {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                        </button>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border mt-auto space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-medium text-muted-foreground">Tema</span>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
                        </button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onLogout}
                        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    >
                        <LogOut size={18} className="mr-3" />
                        Cerrar Sesión
                    </Button>
                </div>
            </motion.aside>


            {/* Main Content */}
            <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-muted/5">
                {/* Mobile Header */}
                <div className="md:hidden p-4 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="p-2 -ml-2 hover:bg-muted rounded-full">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-lg">{navItems.find(i => i.id === activeTab)?.label}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {playerData?.name?.charAt(0) || user?.name?.charAt(0) || 'P'}
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* VIEW: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <>
                                <header className="mb-8 hidden md:block">
                                    <h1 className="text-3xl font-bold tracking-tight mb-2">Hola, {(playerData.name || '').split(' ')[0] || 'Jugador'} 👋</h1>
                                    <p className="text-muted-foreground">Aquí tienes el resumen de tu actividad deportiva.</p>
                                </header>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Activity size={80} />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Rendimiento General</p>
                                        <h3 className="text-4xl font-bold text-blue-500">{performance.training}%</h3>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-card border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Trophy size={20} /></div>
                                            <span className="text-sm font-medium text-muted-foreground">Goles</span>
                                        </div>
                                        <p className="text-3xl font-bold">{performance.matchGoals}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-card border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Users size={20} /></div>
                                            <span className="text-sm font-medium text-muted-foreground">Asistencias</span>
                                        </div>
                                        <p className="text-3xl font-bold">{performance.matchAssists}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-card border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Shirt size={20} /></div>
                                            <span className="text-sm font-medium text-muted-foreground">Convocatorias</span>
                                        </div>
                                        <p className="text-3xl font-bold">{convocatorias.length}</p>
                                    </div>
                                </div>

                                {/* Next Match Card */}
                                <h3 className="text-xl font-bold mt-8 mb-4">Próximo Partido</h3>
                                {convocatorias.length > 0 ? (
                                    <div className="relative rounded-3xl overflow-hidden min-h-[200px] flex items-center bg-black">
                                        {/* Background Image/Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                                        <img src="https://images.unsplash.com/photo-1522778119026-d647f0565c6d?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50" />

                                        <div className="relative z-20 p-8 w-full md:w-2/3">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                                                <Calendar size={12} />
                                                {new Date(convocatorias[0].date).toLocaleDateString()}
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-2">VS {convocatorias[0].opponent}</h2>
                                            <div className="flex items-center gap-6 text-white/80">
                                                <span className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    {convocatorias[0].time || new Date(convocatorias[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {convocatorias[0].location && (
                                                    <span className="flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        {convocatorias[0].location}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-6">
                                                <span className={`px-4 py-2 rounded-lg font-bold text-sm ${convocatorias[0].players?.find((p: any) => p.id === user.id)?.isStarter
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-yellow-500 text-black'
                                                    }`}>
                                                    {convocatorias[0].players?.find((p: any) => p.id === user.id)?.isStarter ? 'TITULAR' : 'SUPLENTE'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center text-muted-foreground">
                                        <Calendar size={48} className="mb-4 opacity-20" />
                                        <p>No tienes partidos programados próximamente.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* VIEW: CONVOCATORIAS */}
                        {activeTab === 'convocatorias' && (
                            <div className="space-y-6">
                                <header>
                                    <h2 className="text-2xl font-bold mb-2">Historial de Convocatorias</h2>
                                    <p className="text-muted-foreground">Todos los partidos donde has sido seleccionado.</p>
                                </header>
                                <div className="grid gap-4">
                                    {convocatorias.map((conv) => {
                                        const isStarter = conv.players?.find((p: any) => p.id === user.id)?.isStarter;
                                        return (
                                            <div key={conv.id} className="group p-5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center font-black text-2xl text-muted-foreground/30">
                                                        VS
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{conv.opponent}</h3>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {new Date(conv.date).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                {conv.time || new Date(conv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {conv.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin size={14} />
                                                                    {conv.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${isStarter ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                        {isStarter ? 'Titular' : 'Suplente'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {convocatorias.length === 0 && (
                                        <div className="text-center py-20 text-muted-foreground">
                                            No se encontraron registros.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VIEW: STATS */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <header>
                                    <h2 className="text-2xl font-bold mb-2">Rendimiento</h2>
                                    <p className="text-muted-foreground">Tu rendimiento general y estadísticas.</p>
                                </header>

                                {/* Card de Rendimiento General */}
                                <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-card border-border p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Activity className="text-primary" size={24} />
                                        <h3 className="text-xl font-semibold">Rendimiento General</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-muted-foreground">Nivel de Rendimiento (%)</span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {performance.training}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${performance.training}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas en Partidos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-card border-border p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Trophy className="text-primary" size={24} />
                                            <h3 className="text-xl font-semibold">Estadísticas</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                                <p className="text-muted-foreground text-sm mb-2">Resumen de Estadísticas</p>
                                                <p className="text-foreground text-3xl font-bold">
                                                    {performance.matchGoals}G / {performance.matchAssists}A
                                                </p>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    Total de contribuciones:{' '}
                                                    {(performance.matchGoals || 0) + (performance.matchAssists || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: PROFILE */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <header>
                                    <h2 className="text-2xl font-bold mb-2">Mi Perfil</h2>
                                    <p className="text-muted-foreground">Información personal y de contacto.</p>
                                </header>

                                {/* Card de FICHA TÉCNICA */}
                                <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-card border-border p-6">
                                    <h3 className="text-xl font-semibold mb-4">FICHA TÉCNICA</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Foto y datos principales */}
                                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                            <div className="relative group overflow-hidden shrink-0">
                                                <div className="w-32 h-32 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                                                    {playerData.photo_url ? (
                                                        <img
                                                            src={playerData.photo_url}
                                                            alt={playerData.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={64} className="text-primary/40" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 w-full md:w-auto">
                                                <h4 className="text-lg font-bold text-foreground mb-2 break-words">
                                                    {playerData.name || 'N/A'}
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">ID:</span> {playerData.identification || 'N/A'}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">Posición:</span> {playerData.position || 'N/A'}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        <span className="font-medium">Categoría:</span> {playerData.category || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información de contacto */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground mb-1 block">Email</Label>
                                                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                                    <Mail size={16} className="text-muted-foreground shrink-0" />
                                                    <p className="text-sm text-foreground break-all min-w-0">
                                                        {playerData.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground mb-1 block">Teléfono</Label>
                                                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                                    <Phone size={16} className="text-muted-foreground shrink-0" />
                                                    <p className="text-sm text-foreground">
                                                        {playerData.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {playerData.birth_date && (
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Fecha de Nacimiento</Label>
                                                    <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg">
                                                        <Calendar size={16} className="text-muted-foreground shrink-0" />
                                                        <p className="text-sm text-foreground">
                                                            {new Date(playerData.birth_date).toLocaleDateString('es-CO')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Documentación */}
                                <div className="text-card-foreground flex flex-col gap-6 rounded-xl border bg-card border-border p-6 mt-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Shield size={20} className="text-primary" />
                                        Documentación de Identidad
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        Sube fotos claras de ambos lados de tu tarjeta de identidad.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Lado Frontal */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lado Frontal</p>
                                                {playerData.id_card_front_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-primary hover:bg-primary/5"
                                                        onClick={() => handleUploadClick('id_card_front_url')}
                                                    >
                                                        <Scissors size={12} className="mr-1" /> Editar
                                                    </Button>
                                                )}
                                            </div>
                                            <div
                                                onClick={() => !isUploading && handleUploadClick('id_card_front_url')}
                                                className="aspect-[1.6/1] relative group overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
                                            >
                                                {playerData.id_card_front_url ? (
                                                    <img
                                                        src={playerData.id_card_front_url}
                                                        alt="ID Front"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <>
                                                        <Upload size={24} className="text-muted-foreground mb-2" />
                                                        <p className="text-muted-foreground text-xs">Subir frontal</p>
                                                    </>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                        <Activity size={24} className="animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lado Posterior */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lado Posterior</p>
                                                {playerData.id_card_back_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-primary hover:bg-primary/5"
                                                        onClick={() => handleUploadClick('id_card_back_url')}
                                                    >
                                                        <Scissors size={12} className="mr-1" /> Editar
                                                    </Button>
                                                )}
                                            </div>
                                            <div
                                                onClick={() => !isUploading && handleUploadClick('id_card_back_url')}
                                                className="aspect-[1.6/1] relative group overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
                                            >
                                                {playerData.id_card_back_url ? (
                                                    <img
                                                        src={playerData.id_card_back_url}
                                                        alt="ID Back"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <>
                                                        <Upload size={24} className="text-muted-foreground mb-2" />
                                                        <p className="text-muted-foreground text-xs">Subir posterior</p>
                                                    </>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                        <Activity size={24} className="animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
