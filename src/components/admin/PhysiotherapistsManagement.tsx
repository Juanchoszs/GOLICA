
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { Edit2, Save, X, UserPlus, ArrowLeft, Eye, EyeOff, Check, Copy, FileText, Trash2 } from 'lucide-react';


export function PhysiotherapistsManagement() {
    const [physiotherapists, setPhysiotherapists] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingPhysiotherapistId, setEditingPhysiotherapistId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null);

    // Edit state
    const [editedCategories, setEditedCategories] = useState<string[]>([]);
    const [editedIdentification, setEditedIdentification] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [editedIsChief, setEditedIsChief] = useState(false);
    const [editedReportsTo, setEditedReportsTo] = useState('');

    // Add state
    const [newPhysiotherapist, setNewPhysiotherapist] = useState({
        name: '',
        email: '',
        identification: '',
        phone: '',
        password: '',
        categories: [] as string[],
        is_chief: false,
        reports_to: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchPhysiotherapists();
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

    async function fetchPhysiotherapists() {
        try {
            setLoading(true);
            // Fetch all profiles that have role 'physiotherapist'
            // This ensures we see them even if the 'physiotherapists' table record is missing
            const { data, error } = await supabase.from('profiles')
                .select('*, physiotherapists(*)')
                .eq('role', 'physiotherapist')
                .order('name');

            if (error) throw error;

            // Flatten data
            const formattedPhysiotherapists = data?.map(p => ({
                id: p.id,
                name: p.name || 'Sin nombre',
                email: p.email || 'Sin email',
                identification: p.identification || '',
                phone: p.phone || '',
                initial_password: p.initial_password,
                assigned_categories: p.physiotherapists?.[0]?.assigned_categories || [],
                is_chief: p.physiotherapists?.[0]?.is_chief || false,
                reports_to: p.physiotherapists?.[0]?.reports_to || ''
            })) || [];

            setPhysiotherapists(formattedPhysiotherapists);
        } catch (error) {
            console.error('Error fetching physiotherapists:', error);
            toast.error('Error al cargar fisioterapeutaes');
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (physiotherapist: any) => {
        setEditingPhysiotherapistId(physiotherapist.id);
        setEditedCategories(physiotherapist.assigned_categories || []);
        setEditedIdentification(physiotherapist.identification || '');
        setEditedPassword('');
        setEditedIsChief(physiotherapist.is_chief || false);
        setEditedReportsTo(physiotherapist.reports_to || '');
    };

    const handleCancel = () => {
        setEditingPhysiotherapistId(null);
        setEditedCategories([]);
        setEditedIdentification('');
        setEditedPassword('');
    };

    const toggleCategory = (cat: string, isNew: boolean = false) => {
        if (isNew) {
            setNewPhysiotherapist(prev => ({
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

            // Actualizar physiotherapist metadata
            const { error: physiotherapistError } = await supabase
                .from('physiotherapists')
                .update({ 
                    assigned_categories: categories, // Assign all categories on save/update
                    is_chief: editedIsChief,
                    reports_to: editedReportsTo || null
                })
                .eq('id', id);

            if (physiotherapistError) throw physiotherapistError;

            toast.success('Datos actualizados correctamente');
            fetchPhysiotherapists();
            setEditingPhysiotherapistId(null);
        } catch (error) {
            toast.error('Error al guardar cambios');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePhysiotherapist = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar al fisioterapeuta ${name}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            setIsSubmitting(true);
            const { data, error } = await supabase.functions.invoke('admin-delete-user', {
                body: { userId: id }
            });

            if (error) throw error;

            toast.success('Fisioterapeuta eliminado correctamente');
            fetchPhysiotherapists();
        } catch (error: any) {
            console.error('Error deleting physiotherapist:', error);
            toast.error(error.message || 'Error al eliminar fisioterapeuta');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNew = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhysiotherapist.name || !newPhysiotherapist.email || !newPhysiotherapist.password) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-create-user', {
                body: {
                    email: newPhysiotherapist.email,
                    password: newPhysiotherapist.password,
                    name: newPhysiotherapist.name,
                    role: 'physiotherapist',
                    identification: newPhysiotherapist.identification,
                    phone: newPhysiotherapist.phone,
                    assigned_categories: categories, // Assign all categories by default
                    is_chief: newPhysiotherapist.is_chief,
                    reports_to: newPhysiotherapist.reports_to || null
                }
            });

            if (error) {
                console.error('❌ Error invoking function:', error);
                if (error.message?.includes('Failed to send a request') || error.status === 404) {
                    toast.error('Error: La Función Edge no está desplegada. Ejecuta "supabase functions deploy admin-create-user" para activarla.', {
                        duration: 6000
                    });
                } else {
                    toast.error('Error al registrar fisioterapeuta: ' + error.message);
                }
                return;
            }

            toast.success('Fisioterapeuta registrado exitosamente');

            setCreatedCredentials({
                email: newPhysiotherapist.email,
                password: newPhysiotherapist.password
            });

            setIsAddingNew(false);
            setNewPhysiotherapist({
                name: '',
                email: '',
                identification: '',
                phone: '',
                password: '',
                categories: [],
                is_chief: false,
                reports_to: ''
            });
            fetchPhysiotherapists();
        } catch (error: any) {
            console.error('Error adding physiotherapist:', error);
            toast.error(error.message || 'Error al registrar fisioterapeuta');
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
                        <h2 className="text-2xl font-bold text-foreground">¡Fisioterapeuta Creado!</h2>
                        <p className="text-muted-foreground mt-1">El fisioterapeuta ha sido registrado correctamente.</p>
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
                            fetchPhysiotherapists();
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
                <h2 className="text-2xl font-bold mb-6 text-foreground">Registrar Nuevo Fisioterapeuta</h2>

                <Card className="bg-card border-border p-6 max-w-2xl">
                    <form onSubmit={handleAddNew} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo *</Label>
                                <Input
                                    id="name"
                                    value={newPhysiotherapist.name}
                                    onChange={e => setNewPhysiotherapist({ ...newPhysiotherapist, name: e.target.value })}
                                    placeholder="Ej: Carlos Pérez"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newPhysiotherapist.email}
                                    onChange={e => setNewPhysiotherapist({ ...newPhysiotherapist, email: e.target.value })}
                                    placeholder="carlos@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ident">Identificación</Label>
                                <Input
                                    id="ident"
                                    value={newPhysiotherapist.identification}
                                    onChange={e => setNewPhysiotherapist({ ...newPhysiotherapist, identification: e.target.value })}
                                    placeholder="CC o ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={newPhysiotherapist.phone}
                                    onChange={e => setNewPhysiotherapist({ ...newPhysiotherapist, phone: e.target.value })}
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
                                    value={newPhysiotherapist.password}
                                    onChange={e => setNewPhysiotherapist({ ...newPhysiotherapist, password: e.target.value })}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <Checkbox 
                                    id="is_chief" 
                                    checked={newPhysiotherapist.is_chief}
                                    onCheckedChange={(checked) => setNewPhysiotherapist({...newPhysiotherapist, is_chief: checked as boolean})}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label htmlFor="is_chief" className="text-sm font-medium cursor-pointer">Es Jefe de Area</label>
                                    <p className="text-[10px] text-muted-foreground">Puede supervisar a otros fisioterapeutas</p>
                                </div>
                            </div>

                            {!newPhysiotherapist.is_chief && (
                                <div className="space-y-2">
                                    <Label htmlFor="reports_to">Reporta a (Jefe)</Label>
                                    <select 
                                        id="reports_to"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newPhysiotherapist.reports_to}
                                        onChange={(e) => setNewPhysiotherapist({...newPhysiotherapist, reports_to: e.target.value})}
                                    >
                                        <option value="">Seleccionar Jefe...</option>
                                        {physiotherapists.filter(p => p.is_chief).map(chief => (
                                            <option key={chief.id} value={chief.id}>{chief.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Acceso a Categorías</Label>
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-sm text-primary font-medium">
                                Todos los fisioterapeutas tienen acceso a TODAS las categorías por defecto.
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Registrando...' : 'Registrar Fisioterapeuta'}
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Gestión de Fisioterapeutas</h2>
                <Button onClick={() => setIsAddingNew(true)}>
                    <UserPlus size={16} className="mr-2" /> Nuevo Fisioterapeuta
                </Button>
            </div>

            <Card className="bg-card border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Nombre</TableHead>
                            <TableHead>Email e Identificación</TableHead>
                            <TableHead>Categorías</TableHead>
                            <TableHead>Jerarquía</TableHead>
                            <TableHead className="text-right w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
                        ) : physiotherapists.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8">No hay fisioterapeutaes registrados</TableCell></TableRow>
                        ) : physiotherapists.map((physiotherapist) => {
                            const isEditing = editingPhysiotherapistId === physiotherapist.id;
                            return (
                                <TableRow key={physiotherapist.id}>
                                    <TableCell className="font-medium text-foreground py-4 align-top">{physiotherapist.name}</TableCell>
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
                                                <div className="text-sm text-foreground">{physiotherapist.email}</div>
                                                {physiotherapist.initial_password && (
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <span className="font-semibold">PASS:</span>
                                                        <code className="bg-muted px-1 rounded">{physiotherapist.initial_password}</code>
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">ID: {physiotherapist.identification || 'N/A'}</div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] border border-primary/20 font-semibold italic">
                                                Todas las categorías
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 align-top">
                                        {isEditing ? (
                                            <div className="space-y-3 p-2 bg-muted/30 rounded-md border border-border/50">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id="edit_is_chief" 
                                                        checked={editedIsChief}
                                                        onCheckedChange={(checked) => setEditedIsChief(checked as boolean)}
                                                    />
                                                    <label htmlFor="edit_is_chief" className="text-xs font-medium cursor-pointer">Es Jefe de Area</label>
                                                </div>
                                                {!editedIsChief && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px]">Reporta a</Label>
                                                        <select 
                                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none"
                                                            value={editedReportsTo}
                                                            onChange={(e) => setEditedReportsTo(e.target.value)}
                                                        >
                                                            <option value="">Sin Jefe</option>
                                                            {physiotherapists.filter(p => p.is_chief && p.id !== editingPhysiotherapistId).map(chief => (
                                                                <option key={chief.id} value={chief.id}>{chief.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {physiotherapist.is_chief ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] border border-blue-500/20 font-bold uppercase">
                                                        Jefe de Área
                                                    </span>
                                                ) : (
                                                    <div className="text-[10px]">
                                                        <span className="text-muted-foreground mr-1">Reporta a:</span>
                                                        <span className="text-foreground font-medium">
                                                            {physiotherapists.find(p => p.id === physiotherapist.reports_to)?.name || 'Directo'}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-top py-4">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2">
                                                <Button size="sm" onClick={() => handleSaveEdit(physiotherapist.id)} disabled={isSubmitting}>
                                                    <Save size={14} className="mr-1" /> OK
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(physiotherapist)}>
                                                    <Edit2 size={16} className="text-primary" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDeletePhysiotherapist(physiotherapist.id, physiotherapist.name)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Trash2 size={16} className="text-destructive" />
                                                </Button>
                                            </div>
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
