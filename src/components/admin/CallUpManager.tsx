
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { TacticalBoard } from '../tactical/TacticalBoard';
import { Player, CallUp } from '../tactical/types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Calendar, Users, ChevronRight } from 'lucide-react';

interface CallUpManagerProps {
  allowedCategories?: string[];
}

export function CallUpManager({ allowedCategories }: CallUpManagerProps) {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allCategories = ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23'];
  const categories = allowedCategories 
    ? allCategories.filter(c => allowedCategories.includes(c))
    : allCategories;

  // Load players for the selected category
  const loadPlayers = async (category: string) => {
    setIsLoading(true);
    // Aseguramos que la plantilla táctica siempre se muestre
    // aunque haya problemas al cargar los jugadores.
    setSelectedCategory(category);
    setView('board');

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('category', category)
        .eq('status', 'active'); // Only active players

      if (error) throw error;

      const formatted: Player[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        identification: p.identification,
        category: p.category,
        position: p.position,
        image: p.image_url, // Assuming image_url exists based on prompt "buckets de imágenes"
        photo_url: p.photo_url, // Photo URL from database
        status: 'available',
      }));

      setPlayers(formatted);
    } catch (err) {
      console.error(err);
      setPlayers([]);
      toast.error('Error al cargar jugadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCallUp = async (callup: CallUp) => {
    try {
      if (!callup.opponent || !callup.date) {
        toast.error('Por favor ingresa rival y fecha');
        return;
      }

      // Combinar fecha y hora en un solo datetime (mismo criterio que en Convocatoria de coach)
      let fullDate = callup.date;
      if (callup.date && callup.time) {
        const [hours, minutes] = callup.time.split(':');
        const dateObj = new Date(callup.date);
        dateObj.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        fullDate = dateObj.toISOString();
      } else if (callup.date) {
        const dateObj = new Date(callup.date);
        dateObj.setHours(12, 0, 0, 0);
        fullDate = dateObj.toISOString();
      }

      // Construir lista de jugadores a partir de las asignaciones
      const playersList = Object.entries(callup.assignments).map(([posId, playerId]) => {
        const player = players.find(p => p.id === playerId);
        return {
          id: playerId,
          name: player?.name || '',
          position: player?.position,
          positionId: posId,
          isStarter: true,
        };
      });

      const payload = {
        opponent: callup.opponent,
        date: fullDate,
        time: callup.time || null,
        location: callup.location || null,
        category: callup.category,
        formation: callup.lineupId,
        players: playersList,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('convocatorias').insert([payload]);

      if (error) {
        console.warn('Error al guardar convocatoria:', error);
        throw error;
      }

      toast.success(`Convocatoria ${callup.category} guardada`);
      setView('list');
    } catch {
      toast.error('Error al guardar convocatoria');
    }
  };

  if (view === 'board') {
    return (
      <TacticalBoard 
        players={players} 
        categoryName={selectedCategory}
        onSave={handleSaveCallUp}
        onClose={() => setView('list')}
      />
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Convocatorias de Jugadores</h1>
        <p className="text-muted-foreground">
          Gestiona las alineaciones y convocatorias por categoría. Selecciona una categoría para comenzar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat} className="p-6 hover:border-primary/50 transition-all cursor-pointer group" onClick={() => loadPlayers(cat)}>
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                 <Users className="text-primary" size={24} />
               </div>
               <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-4">{cat}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
