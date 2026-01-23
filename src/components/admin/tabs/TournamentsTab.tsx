import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Trophy, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { toast } from 'sonner';

interface TournamentsTabProps {
  editedPlayer: any;
  setEditedPlayer: (player: any) => void;
  playerId: string;
}

export function TournamentsTab({ editedPlayer, setEditedPlayer, playerId }: TournamentsTabProps) {
  const [newTournament, setNewTournament] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTournament = async () => {
    if (!newTournament.trim()) return;
    
    const updatedTournaments = [...(editedPlayer.tournaments || []), newTournament.trim()];
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ tournaments: updatedTournaments })
        .eq('id', playerId);
      
      if (error) throw error;
      
      setEditedPlayer({ ...editedPlayer, tournaments: updatedTournaments });
      setNewTournament('');
      toast.success('Torneo agregado correctamente');
    } catch (error) {
      console.error('Error saving tournament:', error);
      toast.error('Error al guardar el torneo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTournament = async (index: number) => {
    const updatedTournaments = editedPlayer.tournaments.filter((_: any, i: number) => i !== index);
    
    try {
      const { error } = await supabase
        .from('players')
        .update({ tournaments: updatedTournaments })
        .eq('id', playerId);
      
      if (error) throw error;
      
      setEditedPlayer({ ...editedPlayer, tournaments: updatedTournaments });
      toast.success('Torneo eliminado');
    } catch (error) {
      console.error('Error removing tournament:', error);
      toast.error('Error al eliminar el torneo');
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="bg-card border-border p-6 shadow-sm">
        <h3 className="text-foreground text-xl font-semibold mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          Inscribir en Nuevo Torneo
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-foreground">Nombre del Torneo / Liga</Label>
            <Input 
              value={newTournament}
              onChange={(e) => setNewTournament(e.target.value)}
              placeholder="Ej: Liga Local Sub-15, Copa Navideña..."
              className="bg-input-background border-border"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTournament()}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleAddTournament}
              disabled={!newTournament.trim() || isSaving}
              className="bg-primary text-primary-foreground font-semibold h-11 px-6"
            >
              <Plus size={18} className="mr-2" /> Agregar Torneo
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border p-6">
        <h3 className="text-foreground text-xl font-semibold mb-6 flex items-center gap-2">
          <ShieldCheck className="text-primary" size={24} />
          Torneos Actuales del Jugador
        </h3>
        
        {editedPlayer.tournaments && editedPlayer.tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editedPlayer.tournaments.map((tournament: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4 transition-all hover:bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <Trophy size={16} />
                  </div>
                  <span className="text-foreground font-medium">{tournament}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTournament(index)}
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <Trophy className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
            <p className="text-muted-foreground font-medium">No hay torneos registrados</p>
            <p className="text-xs text-muted-foreground mt-1">El jugador aún no está inscrito en ningún torneo.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
