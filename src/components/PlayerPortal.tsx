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
    Camera,
    Ambulance,
    Plus
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
    const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

    // Data Fetching & Sync
    useEffect(() => {
        const fetchSignedUrls = async (data: any) => {
            const fields = ['id_card_front_url', 'id_card_back_url', 'id_card_url'];
            const newSignedUrls: { [key: string]: string } = {};

            for (const field of fields) {
                const url = data[field];
                if (url && url.includes('player-documents')) {
                    try {
                        const path = url.split('player-documents/')[1]?.split('?')[0];
                        if (path) {
                            const { data: sData } = await supabase.storage
                                .from('player-documents')
                                .createSignedUrl(path, 3600);
                            if (sData?.signedUrl) newSignedUrls[field] = sData.signedUrl;
                        }
                    } catch (err) {
                        console.error(`Error signed URL ${field}:`, err);
                    }
                }
            }
            setSignedUrls(newSignedUrls);
        };

        const fetchAllData = async () => {
            // Player Data
            const { data: pData } = await supabase
                .from('players')
                .select('*, health_status')
                .eq('id', user.id)
                .single();
            if (pData) {
                setPlayerData((prev: any) => ({ ...prev, ...pData }));
                fetchSignedUrls(pData);
            }

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
            const isPhoto = editingImage.field === 'photo_url';
            const bucketName = isPhoto ? 'player-photos' : 'player-documents';
            const folder = isPhoto ? 'fotos de perfil' : 'documents';
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

            setPlayerData((prev: any) => {
                const newData = { ...prev, [editingImage.field]: publicUrl };
                // Refresh signed URLs if it was a document
                if (editingImage.field !== 'photo_url') {
                    // This is a bit tricky because we react to playerData usually, but let's just re-fetch
                    // for the new specific URL
                    const fetchSpecificSignedUrl = async () => {
                        try {
                            const path = publicUrl.split('player-documents/')[1]?.split('?')[0];
                            if (path) {
                                const { data: sData } = await supabase.storage
                                    .from('player-documents')
                                    .createSignedUrl(path, 3600);
                                if (sData?.signedUrl) {
                                    setSignedUrls(prevS => ({ ...prevS, [editingImage.field]: sData.signedUrl }));
                                }
                            }
                        } catch (err) {
                            console.error("Error refresh signed URL:", err);
                        }
                    };
                    fetchSpecificSignedUrl();
                }
                return newData;
            });

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
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Desktop (Fixed width, pushes content) */}
            <aside className="hidden md:flex w-72 h-full flex-col border-r border-border bg-card/50 backdrop-blur-xl shrink-0">
                <div className="p-8 pb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <img src="/logo-white.png" className="w-6 h-6 object-contain invert grayscale brightness-200" alt="Logo" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">GOLICA <span className="text-primary">PRO</span></h1>
                </div>

                {/* User Card */}
                <div className="px-6 py-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5 shrink-0">
                            <img
                                src={playerData.photo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + playerData.name}
                                className="w-full h-full rounded-full object-cover bg-background"
                            />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm truncate">{playerData.name?.split(' ')[0] || 'Jugador'}</h3>
                            <div className={`flex items-center gap-1.5 mt-1 ${playerData.health_status === 'Perfecto' ? 'text-green-500' : 'text-red-500'}`}>
                                {playerData.health_status === 'Inhabilitado' ? <Ambulance size={14} /> : <Plus size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-tight">{playerData.health_status || 'Perfecto'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${activeTab === item.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-border mt-auto space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-medium text-muted-foreground">Tema</span>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
                        </button>
                    </div>
                    <Button variant="outline" onClick={onLogout} className="w-full justify-start text-destructive hover:bg-destructive/10 border-destructive/20">
                        <LogOut size={18} className="mr-3" /> Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Sidebar Mobile (Animated Drawer) */}
            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: isSidebarOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-card z-[70] flex flex-col shadow-2xl md:hidden"
            >
                <div className="p-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <img src="/logo-white.png" className="w-6 h-6 object-contain invert grayscale brightness-200" alt="Logo" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">GOLICA</h1>
                    </div>
                    <button onClick={toggleSidebar} className="p-1 hover:bg-muted rounded-full text-muted-foreground">
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
                                ${activeTab === item.id ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'}
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-border mt-auto space-y-3">
                    <Button variant="outline" onClick={onLogout} className="w-full justify-start text-destructive">
                        <LogOut size={18} className="mr-3" /> Salir
                    </Button>
                </div>
            </motion.aside>

            {/* Main View Area */}
            <main className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden h-16 shrink-0 flex items-center justify-between px-4 bg-card border-b border-border z-30">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-muted rounded-full">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold truncate px-4">{navItems.find(i => i.id === activeTab)?.label}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {playerData?.name?.charAt(0) || 'P'}
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-muted/5">
                    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
                        
                        {/* VIEW: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <>
                                <header className="hidden md:block flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 italic uppercase">Resumen Deportivo</h1>
                                        <p className="text-muted-foreground text-lg">Hola, <span className="text-foreground font-bold">{playerData.name?.split(' ')[0]}</span>. Revisa tu progreso.</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${playerData.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {playerData.health_status === 'Inhabilitado' ? <Ambulance size={18} className="animate-pulse" /> : <Plus size={18} className="animate-pulse" />}
                                        {playerData.health_status || 'Perfecto'}
                                    </div>
                                </header>

                                {/* Metrics Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] flex flex-col justify-end min-h-[160px] relative overflow-hidden group">
                                        <Activity className="absolute -right-4 -top-4 w-32 h-32 text-primary/5 group-hover:text-primary/10 transition-colors" />
                                        <span className="text-xs font-black uppercase tracking-widest text-primary block mb-2">Rendimiento</span>
                                        <p className="text-5xl font-black italic leading-none">{performance.training}%</p>
                                    </div>
                                    <div className="bg-card border border-border p-8 rounded-[2rem] flex flex-col justify-between min-h-[160px] shadow-sm">
                                        <Trophy className="text-green-500/50 mb-4" size={32} />
                                        <div className="mt-auto">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Goles</span>
                                            <p className="text-5xl font-black italic leading-none">{performance.matchGoals}</p>
                                        </div>
                                    </div>
                                    <div className="bg-card border border-border p-8 rounded-[2rem] flex flex-col justify-between min-h-[160px] shadow-sm">
                                        <Users className="text-purple-500/50 mb-4" size={32} />
                                        <div className="mt-auto">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Asistencias</span>
                                            <p className="text-5xl font-black italic leading-none">{performance.matchAssists}</p>
                                        </div>
                                    </div>
                                    <div className="bg-card border border-border p-8 rounded-[2rem] flex flex-col justify-between min-h-[160px] shadow-sm">
                                        <Shirt className="text-orange-500/50 mb-4" size={32} />
                                        <div className="mt-auto">
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Partidos</span>
                                            <p className="text-5xl font-black italic leading-none">{convocatorias.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Section: Next Match */}
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Próximo Desafío</h3>
                                    {convocatorias.length > 0 ? (
                                        <div className="group relative rounded-[3rem] overflow-hidden min-h-[350px] flex items-center border border-border shadow-2xl">
                                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
                                            <img 
                                                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2076&auto=format&fit=crop" 
                                                className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                                            />
                                            
                                            <div className="relative z-20 p-10 md:p-16 w-full md:w-2/3 space-y-6">
                                                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/20 text-primary text-xs font-black tracking-[0.3em] uppercase">
                                                    ⚽ {new Date(convocatorias[0].date).toLocaleDateString()}
                                                </div>
                                                <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-none">
                                                    VS <span className="text-primary">{convocatorias[0].opponent}</span>
                                                </h2>
                                                <div className="flex flex-wrap gap-8 font-bold text-muted-foreground">
                                                    <span className="flex items-center gap-2 italic uppercase tracking-tighter"><Clock className="text-primary" /> {convocatorias[0].time} hs</span>
                                                    <span className="flex items-center gap-2 italic uppercase tracking-tighter"><MapPin className="text-primary" /> {convocatorias[0].location}</span>
                                                </div>
                                                <div className="pt-4">
                                                    <div className={`inline-block px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl transform -skew-x-12 
                                                        ${convocatorias[0].players?.find((p: any) => p.id === user.id)?.isStarter ? 'bg-primary text-primary-foreground' : 'bg-yellow-500 text-black'}`}>
                                                        {convocatorias[0].players?.find((p: any) => p.id === user.id)?.isStarter ? 'TITULAR' : 'SUPLENTE'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-20 border-4 border-dashed border-border rounded-[3rem] text-center bg-card/30">
                                            <Calendar className="mx-auto mb-6 opacity-10" size={80} />
                                            <p className="text-2xl font-black text-muted-foreground uppercase italic pb-2">Sin convocatorias activas</p>
                                            <p className="text-muted-foreground">Mantente preparado para el próximo llamado.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* VIEW: CONVOCATORIAS */}
                        {activeTab === 'convocatorias' && (
                            <div className="space-y-8 animate-in fade-in">
                                <header>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Convocatorias</h2>
                                    <p className="text-muted-foreground text-lg">Lista de partidos y plantilla convocada.</p>
                                </header>
                                <div className="grid gap-8">
                                    {convocatorias.map((conv) => {
                                        const myEntry = conv.players?.find((p: any) => p.id === user.id);
                                        return (
                                            <div key={conv.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                                                {/* Match header */}
                                                <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-xl text-primary/40 italic shrink-0">VS</div>
                                                        <div>
                                                            <h3 className="text-2xl font-black uppercase tracking-tight">{conv.opponent}</h3>
                                                            <div className="flex flex-wrap gap-3 mt-2 text-xs font-bold text-muted-foreground">
                                                                <span className="flex items-center gap-1"><Calendar size={13} className="text-primary" />{new Date(conv.date).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1"><Clock size={13} className="text-primary" />{conv.time} hs</span>
                                                                <span className="flex items-center gap-1"><MapPin size={13} className="text-primary" />{conv.location || 'Por confirmar'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        {myEntry && (
                                                            <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${myEntry.isStarter ? 'border-primary/30 text-primary bg-primary/5' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'}`}>
                                                                {myEntry.isStarter ? 'Titular' : 'Suplente'}
                                                            </span>
                                                        )}
                                                        {conv.match_status === 'completed' && (
                                                            <span className="px-5 py-2 rounded-xl text-sm font-black italic bg-muted border border-border">
                                                                {conv.home_score} – {conv.away_score}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Player roster list */}
                                                {conv.players && conv.players.length > 0 && (
                                                    <div className="p-6 md:p-8">
                                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Plantilla Convocada ({conv.players.length} jugadores)</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {conv.players.map((p: any) => (
                                                                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${p.id === user.id ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'}`}>
                                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                                                        {p.name.charAt(0)}
                                                                    </div>
                                                                    <span className={`text-sm font-bold truncate ${p.id === user.id ? 'text-primary' : 'text-foreground'}`}>{p.name}</span>
                                                                    <span className={`ml-auto text-[10px] font-black uppercase shrink-0 ${p.isStarter ? 'text-primary' : 'text-yellow-500'}`}>
                                                                        {p.isStarter ? 'TIT' : 'SUP'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                        {convocatorias.length === 0 && (
                                            <div className="text-center py-20 border-4 border-dashed border-border rounded-[3rem]">
                                                <p className="text-2xl font-black text-muted-foreground uppercase italic px-4">Sin registros de partidos</p>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        )}

                        {/* VIEW: STATS */}
                        {activeTab === 'stats' && (
                            <div className="space-y-12 animate-in fade-in">
                                <header>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Rendimiento</h2>
                                    <p className="text-muted-foreground text-lg">Análisis detallado de tu evolución física y técnica.</p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="bg-card border border-border p-8 md:p-10 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                                        <Activity className="absolute bottom-0 right-0 w-48 h-48 text-primary/5 -mb-10 -mr-10" />
                                        <div className="flex justify-between items-start mb-8 z-10 relative">
                                            <h3 className="text-2xl font-black uppercase italic">Estado y Forma</h3>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Nacimiento</p>
                                                <p className="text-xl font-black italic">
                                                    {playerData.birth_date ? (() => {
                                                        const [y, m, d] = playerData.birth_date.split('-');
                                                        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
                                                    })() : '--'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-6 relative z-10 w-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${playerData.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    playerData.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${playerData.health_status === 'Perfecto' ? 'bg-green-500' :
                                                        playerData.health_status === 'Con leves restricciones' ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                        }`} />
                                                    {playerData.health_status || 'Perfecto'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                                <span className="text-6xl md:text-7xl font-black text-primary italic leading-none">{performance.training}%</span>
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Evaluación IA</span>
                                            </div>
                                            <div className="h-6 bg-muted rounded-full p-1.5 border border-border">
                                                <motion.div 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${performance.training}%` }} 
                                                    className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-6 sm:p-8 rounded-[2.5rem] flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-green-500 mb-2 truncate">Efectividad Goleadora</p>
                                                <p className="text-4xl sm:text-5xl font-black italic leading-none">{performance.matchGoals} <span className="text-sm sm:text-lg opacity-50 uppercase not-italic">Goles</span></p>
                                            </div>
                                            <Trophy size={48} className="text-green-500 opacity-30 shrink-0 hidden sm:block" />
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-6 sm:p-8 rounded-[2.5rem] flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-purple-500 mb-2 truncate">Capacidad Creativa</p>
                                                <p className="text-4xl sm:text-5xl font-black italic leading-none">{performance.matchAssists} <span className="text-sm sm:text-lg opacity-50 uppercase not-italic">Asist.</span></p>
                                            </div>
                                            <Users size={48} className="text-purple-500 opacity-30 shrink-0 hidden sm:block" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: PROFILE */}
                        {activeTab === 'profile' && (
                            <div className="space-y-12">
                                <h1 className="text-5xl font-black tracking-tighter uppercase italic">Perfil Pro</h1>
                                
                                <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl">
                                    <div className="bg-primary/10 p-12 border-b border-border relative">
                                        <div className="flex flex-col md:flex-row gap-12 items-center">
                                            <div className="w-56 h-56 bg-background rounded-[3.5rem] border-4 border-primary shadow-2xl overflow-hidden flex items-center justify-center -rotate-2 hover:rotate-0 transition-transform duration-500 shrink-0">
                                                {playerData.photo_url ? (
                                                    <img src={playerData.photo_url} className="w-full h-full object-cover" alt="User" />
                                                ) : (
                                                    <User size={100} className="text-primary/20" />
                                                )}
                                            </div>
                                            <div className="text-center md:text-left space-y-4">
                                                <span className="px-6 py-2 bg-primary text-primary-foreground text-xs font-black rounded-full uppercase tracking-[0.3em]">Jugador élite</span>
                                                <h2 className="text-6xl font-black tracking-tighter uppercase italic drop-shadow-lg">{playerData.name}</h2>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-10 pt-4">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-1">Posición</p>
                                                        <p className="text-2xl font-black text-primary italic">{playerData.position || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-1">Categoría</p>
                                                        <p className="text-2xl font-black italic">{playerData.category || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-1 flex items-center gap-2"><Mail size={16} className="text-primary" /> Correo Electrónico</span>
                                                <span className="text-xl font-bold break-all">{playerData.email}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-1 flex items-center gap-2"><Phone size={16} className="text-primary" /> Contacto</span>
                                                <span className="text-xl font-bold">{playerData.phone || 'No registrado'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-1 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Fecha Nacimiento</span>
                                                <span className="text-xl font-bold">
                                                    {playerData.birth_date ? (() => {
                                                        const [y, m, d] = playerData.birth_date.split('-');
                                                        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
                                                    })() : 'No registrada'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-1 flex items-center gap-2"><Shield size={16} className="text-primary" /> Identificación</span>
                                                <span className="text-xl font-bold">{playerData.identification || 'No registrada'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    <h3 className="text-3xl font-black uppercase italic">Documentación</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {['id_card_front_url', 'id_card_back_url'].map((field) => (
                                            <div key={field} className="space-y-4">
                                                <div className="flex items-center justify-between px-4">
                                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{field.includes('front') ? 'Frente Documento' : 'Reverso Documento'}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => handleUploadClick(field as any)} className="h-8 text-primary font-black"><Camera size={14} className="mr-2" /> REEMPLAZAR</Button>
                                                </div>
                                                <div 
                                                    onClick={() => !isUploading && handleUploadClick(field as any)} 
                                                    className="aspect-[1.6/1] bg-card border-4 border-dashed border-border rounded-[3rem] overflow-hidden cursor-pointer hover:border-primary transition-all relative group shadow-inner"
                                                >
                                                    {(playerData as any)[field] ? (
                                                        <img src={signedUrls[field] || (playerData as any)[field]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="ID" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                                            <Upload size={40} className="mb-2" />
                                                            <span className="text-xs font-bold uppercase tracking-widest text-center px-4">Click para subir imagen</span>
                                                        </div>
                                                    )}
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-20">
                                                            <Activity size={40} className="animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
