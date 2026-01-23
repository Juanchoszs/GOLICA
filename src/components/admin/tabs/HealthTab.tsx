import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Heart, Plus, Trash2, Calendar, Activity } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface HealthTabProps {
  editedPlayer: any;
  setEditedPlayer: (player: any) => void;
  playerId: string;
}

export function HealthTab({ editedPlayer, setEditedPlayer, playerId }: HealthTabProps) {
  const [newInjury, setNewInjury] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddInjury = async () => {
    if (!newInjury.type || !newInjury.date) return;
    
    const updatedInjuries = [...(editedPlayer.injuries || []), newInjury];
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ injuries: updatedInjuries })
        .eq('id', playerId);
      
      if (error) throw error;
      
      setEditedPlayer({ ...editedPlayer, injuries: updatedInjuries });
      setNewInjury({
        type: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      toast.success('Lesión agregada correctamente');
    } catch (error) {
      console.error('Error saving injury:', error);
      toast.error('Error al guardar la lesión');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveInjury = async (index: number) => {
    const updatedInjuries = editedPlayer.injuries.filter((_: any, i: number) => i !== index);
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ injuries: updatedInjuries })
        .eq('id', playerId);
      
      if (error) throw error;
      
      setEditedPlayer({ ...editedPlayer, injuries: updatedInjuries });
      toast.success('Lesión eliminada');
    } catch (error) {
      console.error('Error removing injury:', error);
      toast.error('Error al eliminar la lesión');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Injury Card */}
      <Card className="bg-card border-border p-6 shadow-sm">
        <h3 className="text-foreground text-xl font-semibold mb-6 flex items-center gap-2">
          <Activity className="text-primary" size={24} />
          Registrar Nuevo Antecedente / Lesión
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-foreground">Tipo de Lesión / Antecedente</Label>
            <Input 
              value={newInjury.type}
              onChange={(e) => setNewInjury({ ...newInjury, type: e.target.value })}
              placeholder="Ej: Esguince de tobillo, Cirugía..."
              className="bg-input-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Fecha</Label>
            <Input 
              type="date"
              value={newInjury.date}
              onChange={(e) => setNewInjury({ ...newInjury, date: e.target.value })}
              className="bg-input-background border-border"
            />
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <Label className="text-foreground">Descripción y Observaciones</Label>
          <Textarea 
            value={newInjury.description}
            onChange={(e) => setNewInjury({ ...newInjury, description: e.target.value })}
            placeholder="Detalles del tratamiento, tiempo de recuperación..."
            className="bg-input-background border-border"
            rows={3}
          />
        </div>
        <Button 
          onClick={handleAddInjury}
          disabled={!newInjury.type || isSaving}
          className="w-full md:w-auto bg-primary text-primary-foreground font-semibold"
        >
          <Plus size={18} className="mr-2" /> Agregar al Historial
        </Button>
      </Card>

      {/* History List */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-foreground text-xl font-semibold mb-6 flex items-center gap-2">
          <Heart className="text-red-500" size={24} />
          Historial Médico
        </h3>
        
        {editedPlayer.injuries && editedPlayer.injuries.length > 0 ? (
          <div className="space-y-4">
            {editedPlayer.injuries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((injury: any, index: number) => (
              <div key={index} className="bg-muted/30 border border-border rounded-xl p-5 transition-all hover:bg-muted/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h4 className="text-foreground font-bold text-lg">{injury.type}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                      <Calendar size={12} />
                      {formatDate(injury.date)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInjury(index)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                {injury.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-3 mt-3 italic">
                    {injury.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <Heart className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
            <p className="text-muted-foreground font-medium">No hay antecedentes registrados</p>
            <p className="text-xs text-muted-foreground mt-1">Usa el formulario de arriba para añadir lesiones.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
