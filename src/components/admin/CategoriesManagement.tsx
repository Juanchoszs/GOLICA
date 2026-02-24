import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Tag, Save, X, Loader2 } from 'lucide-react';

export function CategoriesManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('categories')
                .insert([{ name: newName.trim(), description: newDesc.trim() }]);

            if (error) throw error;

            toast.success('Categoría creada');
            setNewName('');
            setNewDesc('');
            setIsAdding(false);
            fetchCategories();
        } catch (error: any) {
            console.error('Error adding category:', error);
            toast.error(error.message || 'Error al crear categoría');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string, name: string) {
        if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Categoría eliminada');
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error('Error: ' + error.message);
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestión de Categorías</h2>
                    <p className="text-sm text-muted-foreground">Administra las categorías disponibles para jugadores y entrenadores</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)}>
                        <Plus size={16} className="mr-2" /> Nueva Categoría
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-card border-border p-6 mb-6">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat-name">Nombre de la Categoría *</Label>
                                <Input
                                    id="cat-name"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Ej: Sub-15,  Sub-17..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cat-desc">Descripción (Opcional)</Label>
                                <Input
                                    id="cat-desc"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Breve descripción de la categoría"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                Guardar Categoría
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="bg-card border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                    No hay categorías registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell><Tag size={16} className="text-primary/60" /></TableCell>
                                    <TableCell className="font-semibold text-foreground">{cat.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{cat.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
