
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { Edit2, Save, X, UserPlus, ArrowLeft, Eye, EyeOff, Check, Copy, FileText } from 'lucide-react';


export function CoachesManagement() {
    const [coaches, setCoaches] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null);

    // Edit state
    const [editedCategories, setEditedCategories] = useState<string[]>([]);
    const [editedIdentification, setEditedIdentification] = useState('');
    const [editedPassword, setEditedPassword] = useState('');

    // Add state
    const [newCoach, setNewCoach] = useState({
        name: '',
        email: '',
        identification: '',
        phone: '',
        password: '',
        categories: [] as string[]
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchCoaches();
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const { data, error } = await supabase.from('categories').select('name').order('name');
            if (error) throw error;
            if (data && data.length > 0) {
                setCategories(data.map(c => c.name));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function fetchCoaches() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('coaches')
                .select('*, profiles(name, email, identification, phone, initial_password)')
                .order('id');

            if (error) throw error;

            // Flatten data for easier use
            const formattedCoaches = data?.map(c => ({
                id: c.id,
                name: c.profiles?.name || 'Sin nombre',
                email: c.profiles?.email || 'Sin email',
                identification: c.profiles?.identification || '',
                phone: c.profiles?.phone || '',
                initial_password: c.profiles?.initial_password,
                assigned_categories: c.assigned_categories || []
            })) || [];

            setCoaches(formattedCoaches);
        } catch (error) {
            console.error('Error fetching coaches:', error);
            toast.error('Error al cargar entrenadores');
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (coach: any) => {
        setEditingCoachId(coach.id);
        setEditedCategories(coach.assigned_categories || []);
        setEditedIdentification(coach.identification || '');
        setEditedPassword('');
    };

    const handleCancel = () => {
        setEditingCoachId(null);
        setEditedCategories([]);
        setEditedIdentification('');
        setEditedPassword('');
    };

    const toggleCategory = (cat: string, isNew: boolean = false) => {
        if (isNew) {
            setNewCoach(prev => ({
                ...prev,
                categories: prev.categories.includes(cat)
                    ? prev.categories.filter(c => c !== cat)
                    : [...prev.categories, cat]
            }));
        } else {
            setEditedCategories(prev =>
                prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
            );
        }
    };

    const handleSaveEdit = async (id: string) => {
        try {
            setIsSubmitting(true);
            // Actualizar perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ identification: editedIdentification })
                .eq('id', id);

            if (profileError) throw profileError;

            // Actualizar coach metadata
            const { error: coachError } = await supabase
                .from('coaches')
                .update({ assigned_categories: editedCategories })
                .eq('id', id);

            if (coachError) throw coachError;

            toast.success('Datos actualizados correctamente');
            fetchCoaches();
            setEditingCoachId(null);
        } catch (error) {
            console.error('Error updating coach:', error);
            toast.error('Error al guardar cambios');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoach.name || !newCoach.email || !newCoach.password) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-create-user', {
                body: {
                    email: newCoach.email,
                    password: newCoach.password,
                    name: newCoach.name,
                    role: 'coach',
                    identification: newCoach.identification,
                    phone: newCoach.phone,
                    assigned_categories: newCoach.categories
                }
            });

            if (error) {
                console.error('❌ Error invoking function:', error);
                if (error.message?.includes('Failed to send a request') || error.status === 404) {
                    toast.error('Error: La Función Edge no está desplegada. Ejecuta "supabase functions deploy admin-create-user" para activarla.', {
                        duration: 6000
                    });
                } else {
                    toast.error('Error al registrar entrenador: ' + error.message);
                }
                return;
            }

            toast.success('Entrenador registrado exitosamente');

            setCreatedCredentials({
                email: newCoach.email,
                password: newCoach.password
            });

            setIsAddingNew(false);
            setNewCoach({
                name: '',
                email: '',
                identification: '',
                phone: '',
                password: '',
                categories: []
            });
            fetchCoaches();
        } catch (error: any) {
            console.error('Error adding coach:', error);
            toast.error(error.message || 'Error al registrar entrenador');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('¡Copiado al portapapeles!');
    };

    if (createdCredentials) {
        return (
            <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full p-8 border-primary/20 bg-card shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-in-center">
                            <Check className="text-green-500 w-8 h-8" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">¡Entrenador Creado!</h2>
                        <p className="text-muted-foreground mt-1">El entrenador ha sido registrado correctamente.</p>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-6 space-y-4 border border-border/50">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText size={16} className="text-primary" /> Credenciales
                        </h3>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Email</label>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground break-all">
                                    {createdCredentials.email}
                                </code>
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdCredentials.email)}>
                                    <Copy size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Contraseña Temporal</label>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground break-all">
                                    {createdCredentials.password}
                                </code>
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdCredentials.password)}>
                                    <Copy size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            setCreatedCredentials(null);
                            fetchCoaches();
                        }}
                        className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Continuar
                    </Button>
                </Card>
            </div>
        );
    }

    if (isAddingNew) {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={() => setIsAddingNew(false)} className="mb-4">
                    <ArrowLeft size={16} className="mr-2" /> Volver
                </Button>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Registrar Nuevo Entrenador</h2>

                <Card className="bg-card border-border p-6 max-w-2xl">
                    <form onSubmit={handleAddNew} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo *</Label>
                                <Input
                                    id="name"
                                    value={newCoach.name}
                                    onChange={e => setNewCoach({ ...newCoach, name: e.target.value })}
                                    placeholder="Ej: Carlos Pérez"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newCoach.email}
                                    onChange={e => setNewCoach({ ...newCoach, email: e.target.value })}
                                    placeholder="carlos@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ident">Identificación</Label>
                                <Input
                                    id="ident"
                                    value={newCoach.identification}
                                    onChange={e => setNewCoach({ ...newCoach, identification: e.target.value })}
                                    placeholder="CC o ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={newCoach.phone}
                                    onChange={e => setNewCoach({ ...newCoach, phone: e.target.value })}
                                    placeholder="+57..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pass">Contraseña *</Label>
                            <div className="relative">
                                <Input
                                    id="pass"
                                    type={showPassword ? "text" : "password"}
                                    value={newCoach.password}
                                    onChange={e => setNewCoach({ ...newCoach, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Categorías Asignadas</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-border rounded-md">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`new-${cat}`}
                                            checked={newCoach.categories.includes(cat)}
                                            onCheckedChange={() => toggleCategory(cat, true)}
                                        />
                                        <label htmlFor={`new-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Registrando...' : 'Registrar Entrenador'}
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Gestión de Entrenadores</h2>
                <Button onClick={() => setIsAddingNew(true)}>
                    <UserPlus size={16} className="mr-2" /> Nuevo Entrenador
                </Button>
            </div>

            <Card className="bg-card border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Nombre</TableHead>
                            <TableHead>Email e Identificación</TableHead>
                            <TableHead>Categorías</TableHead>
                            <TableHead className="text-right w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
                        ) : coaches.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">No hay entrenadores registrados</TableCell></TableRow>
                        ) : coaches.map((coach) => {
                            const isEditing = editingCoachId === coach.id;
                            return (
                                <TableRow key={coach.id}>
                                    <TableCell className="font-medium text-foreground py-4 align-top">{coach.name}</TableCell>
                                    <TableCell className="py-4 align-top">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <Label className="text-xs">Identificación</Label>
                                                <Input
                                                    value={editedIdentification}
                                                    onChange={(e) => setEditedIdentification(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="text-sm text-foreground">{coach.email}</div>
                                                {coach.initial_password && (
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <span className="font-semibold">PASS:</span>
                                                        <code className="bg-muted px-1 rounded">{coach.initial_password}</code>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">ID: {coach.identification || 'N/A'}</div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        {isEditing ? (
                                            <div className="grid grid-cols-2 gap-2 p-2 border border-border rounded-md">
                                                {categories.map(cat => (
                                                    <div key={cat} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`edit-${cat}`}
                                                            checked={editedCategories.includes(cat)}
                                                            onCheckedChange={() => toggleCategory(cat)}
                                                        />
                                                        <label htmlFor={`edit-${cat}`} className="text-xs cursor-pointer">{cat}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {coach.assigned_categories?.length > 0 ? (
                                                    coach.assigned_categories.map((cat: string) => (
                                                        <span key={cat} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] border border-primary/20">
                                                            {cat}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Sin asignar</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-top py-4">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2">
                                                <Button size="sm" onClick={() => handleSaveEdit(coach.id)} disabled={isSubmitting}>
                                                    <Save size={14} className="mr-1" /> OK
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(coach)}>
                                                <Edit2 size={16} />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
