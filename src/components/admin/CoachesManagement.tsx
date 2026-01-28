
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';

const ALL_CATEGORIES = ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23', 'Profesional'];

export function CoachesManagement() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const [editedIdentification, setEditedIdentification] = useState('');
  const [editedPassword, setEditedPassword] = useState('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function fetchCoaches() {
    try {
      const { data, error } = await supabase.from('coaches').select('*').order('name');
      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast.error('Error al cargar entrenadores');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (coach: any) => {
    console.log('Editing coach:', coach);
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

  const toggleCategory = (cat: string) => {
    setEditedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (id: string) => {
    try {
        const updateData: any = { 
            assigned_categories: editedCategories,
            identification: editedIdentification
        };
        if (editedPassword) {
            updateData.password = editedPassword;
        }

        const { error } = await supabase
            .from('coaches')
            .update(updateData)
            .eq('id', id);
        
        if (error) throw error;
        
        toast.success('Datos actualizados correctamente');
        setCoaches(coaches.map(c => c.id === id ? { ...c, ...updateData } : c));
        setEditingCoachId(null);
    } catch (error) {
        console.error('Error updating coach:', error);
        toast.error('Error al guardar cambios');
    }
  };

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Gestión de Entrenadores</h2>
        
        <Card className="bg-card border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Nombre</TableHead>
                        <TableHead>Datos y Categorías</TableHead>
                        <TableHead className="text-right w-[100px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {coaches.map((coach) => {
                        const isEditing = editingCoachId === coach.id;
                        return (
                            <TableRow key={coach.id}>
                                <TableCell className="font-medium text-foreground py-4 align-top">{coach.name}</TableCell>
                                <TableCell className="py-4 align-top">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`ident-${coach.id}`} className="text-xs">Identificación (Usuario)</Label>
                                                    <Input 
                                                        id={`ident-${coach.id}`}
                                                        value={editedIdentification}
                                                        onChange={(e) => setEditedIdentification(e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`pass-${coach.id}`} className="text-xs">Contraseña</Label>
                                                    <Input 
                                                        id={`pass-${coach.id}`}
                                                        value={editedPassword}
                                                        onChange={(e) => setEditedPassword(e.target.value)}
                                                        placeholder="Nueva contraseña"
                                                        className="mt-1"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground mt-1">Dejar vacío para mantener actual</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-muted/10 border border-primary/20 rounded-md p-4 space-y-3">
                                                <p className="text-sm font-semibold mb-2">Seleccionar Categorías:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {ALL_CATEGORIES.map(cat => (
                                                        <div key={cat} className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`${coach.id}-${cat}`}
                                                                checked={editedCategories.includes(cat)}
                                                                onCheckedChange={() => toggleCategory(cat)}
                                                            />
                                                            <label htmlFor={`${coach.id}-${cat}`} className="text-sm font-medium leading-none cursor-pointer">
                                                                {cat}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-sm">
                                                <span className="font-semibold text-xs text-muted-foreground">Usuario:</span> {coach.identification || 'Sin asignación'}
                                            </div>
                                            <div>
                                                <span className="font-semibold text-xs text-muted-foreground block mb-1">Categorías:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {coach.assigned_categories?.length > 0 ? (
                                                        coach.assigned_categories.map((cat: string) => (
                                                            <span key={cat} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                                                {cat}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Sin asignar</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right align-top py-4">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2 justify-end">
                                            <Button size="sm" onClick={() => handleSave(coach.id)} className="bg-primary text-primary-foreground">
                                                <Save size={16} className="mr-1" /> Guardar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleCancel}>
                                                <X size={16} className="mr-1" /> Cancelar
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
