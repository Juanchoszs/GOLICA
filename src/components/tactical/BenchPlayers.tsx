import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Search, Users, CheckCircle2 } from 'lucide-react';
import { Player } from './types';
import { DraggablePlayer } from './DraggablePlayer';

interface BenchPlayersProps {
  players: Player[];
  filteredPlayers: Player[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  assignedPlayerIds: string[];
}

export function BenchPlayers({
  players,
  filteredPlayers,
  searchTerm,
  onSearchChange,
  assignedPlayerIds,
}: BenchPlayersProps) {
  const availableCount = players.length - assignedPlayerIds.length;

  return (
    <aside className="w-80 lg:w-96 flex flex-col border-l border-border/50 bg-card/30 backdrop-blur-sm">
      {/* Header del Banco */}
      <div className="p-6 pb-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Banco de Jugadores
          </h3>
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary">
              {availableCount} disponibles
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background border-border/50 rounded-xl focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-background/50 rounded-lg p-2 text-center border border-border/30">
            <div className="text-lg font-black text-foreground">{players.length}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Total</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/20">
            <div className="text-lg font-black text-primary">{assignedPlayerIds.length}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Asignados</div>
          </div>
          <div className="bg-emerald-500/5 rounded-lg p-2 text-center border border-emerald-500/20">
            <div className="text-lg font-black text-emerald-500">{availableCount}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Libres</div>
          </div>
        </div>
      </div>

      {/* Lista de Jugadores */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-muted-foreground mb-1">
                No se encontraron jugadores
              </p>
              <p className="text-xs text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <>
              {/* Jugadores disponibles */}
              {filteredPlayers.filter(p => !assignedPlayerIds.includes(p.id)).length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      Disponibles
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  {filteredPlayers
                    .filter(p => !assignedPlayerIds.includes(p.id))
                    .map(player => (
                      <DraggablePlayer
                        key={player.id}
                        player={player}
                        origin="list"
                        isAssigned={false}
                      />
                    ))}
                </div>
              )}

              {/* Jugadores asignados */}
              {filteredPlayers.filter(p => assignedPlayerIds.includes(p.id)).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Asignados
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  {filteredPlayers
                    .filter(p => assignedPlayerIds.includes(p.id))
                    .map(player => (
                      <DraggablePlayer
                        key={player.id}
                        player={player}
                        origin="list"
                        isAssigned={true}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer con tips */}
      <div className="p-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-black text-primary">i</span>
          </div>
          <p className="leading-relaxed">
            <span className="font-bold text-foreground">Tip:</span> Arrastra jugadores desde aquí hacia la cancha para asignarlos a una posición.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default BenchPlayers;