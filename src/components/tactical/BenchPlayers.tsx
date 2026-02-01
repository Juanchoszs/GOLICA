import React from 'react';
import { Player } from './types';
import { DraggablePlayer } from './DraggablePlayer';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Search } from 'lucide-react';

interface BenchPlayersProps {
  players: Player[];
  filteredPlayers: Player[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  assignedPlayerIds: string[];
}

export function BenchPlayers({ players, filteredPlayers, searchTerm, onSearchChange, assignedPlayerIds }: BenchPlayersProps) {
  return (
    <aside className="w-80 flex flex-col border-l border-border bg-card shadow-2xl z-40">
      <div className="p-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          Plantilla Disponible
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{players.length}</span>
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Filtrar por nombre..." 
            className="pl-9 h-11 bg-input-background border-border rounded-xl focus:ring-primary/20"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm italic">No se encontraron jugadores</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {filteredPlayers.map(player => {
              const isAssigned = assignedPlayerIds.includes(player.id);

              return (
                <div key={player.id} className={`transition-all duration-300 ${isAssigned ? 'opacity-30 grayscale scale-95 pointer-events-none' : ''}`}>
                  <DraggablePlayer player={player} variant="list" />
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

export default BenchPlayers;
