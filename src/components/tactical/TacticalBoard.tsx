
import { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { Search, Save, RotateCcw, ChevronLeft, UserCog } from 'lucide-react';

import { Player, CallUp } from './types';
import { LINEUPS } from './data';
import { DraggablePlayer } from './DraggablePlayer';
import { DropZone } from './DropZone';
import { SoccerField } from './SoccerField';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface TacticalBoardProps {
  players: Player[];
  categoryName: string; // e.g. "Sub-20"
  onSave: (callup: CallUp) => void;
  onClose: () => void;
}

export function TacticalBoard({ players, categoryName, onSave, onClose }: TacticalBoardProps) {
  const [selectedLineupId, setSelectedLineupId] = useState('4-3-3');
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // posId -> playerId
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const currentLineup = useMemo(() => 
    LINEUPS.find(l => l.id === selectedLineupId) || LINEUPS[0]
  , [selectedLineupId]);

  // Derived state: assigned players
  const assignedPlayerIds = useMemo(() => Object.values(assignments), [assignments]);
  
  // Available players (filter assigned? or just show status)
  // Requirement: "No se puede asignar el mismo jugador dos veces"
  // If assigned, we can disable or hide from list.
  // "Jugadores: Indicador de estado (disponible / asignado)"
  
  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identification.includes(searchTerm)
    );
  }, [players, searchTerm]);

  // Helper to get player by ID
  const getPlayer = (id: string) => players.find(p => p.id === id);

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    const playerId = active.id as string;
    const origin = active.data.current?.origin as 'list' | 'field';

    // 1. If dropped outside any droppable
    if (!over) {
      if (origin === 'field') {
        // Remove from field
        const posId = Object.keys(assignments).find(k => assignments[k] === playerId);
        if (posId) {
            const newAssigns = { ...assignments };
            delete newAssigns[posId];
            setAssignments(newAssigns);
            toast.info('Jugador retirado de la cancha');
        }
      }
      return;
    }

    // 2. If dropped on a DropZone
    const targetPosId = over.id as string;
    
    // Check if target is actually a position in current lineup (sanity check)
    // Actually DndContext valid targets are only mounted droppables.

    // Find previous position of this player (if any)
    const prevPosId = Object.keys(assignments).find(k => assignments[k] === playerId);

    setAssignments(prev => {
      const next = { ...prev };
      
      // If target occupied, replace logic (old player removed)
      // "Se rechaza o se reemplaza de forma controlada" -> Replace
      if (next[targetPosId] && next[targetPosId] !== playerId) {
         // Replaces the player at targetPosId
         // The old player next[targetPosId] simply becomes unassigned (removed from map)
      }

      // If player was elsewhere, remove from there
      if (prevPosId) {
        delete next[prevPosId];
      }

      // Assign to new
      next[targetPosId] = playerId;
      return next;
    });
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de resetear la alineación? Todos los jugadores serán removidos.')) {
      setAssignments({});
      toast.info('Alineación reseteada');
    }
  };

  const handleLineupChange = (val: string) => {
    if (Object.keys(assignments).length > 0) {
        if(!confirm('Cambiar la alineación reseteará las posiciones. ¿Continuar?')) return;
        setAssignments({});
    }
    setSelectedLineupId(val);
  };

  const handleSaveWrapper = () => {
    // Validations
    const gkPos = currentLineup.positions.find(p => p.role === 'Portero');
    if (gkPos && !assignments[gkPos.id]) {
      toast.error('¡Falta el Portero (GK)! 🛡️');
      return;
    }
    
    const assignedCount = Object.keys(assignments).length;
    if (assignedCount < 11) {
      toast.error(`¡Equipo incompleto! Faltan ${11 - assignedCount} jugadores. ⚽`);
      return;
    }

    onSave({
      category: categoryName,
      lineupId: selectedLineupId,
      assignments,
      createdAt: new Date().toISOString()
    });
    toast.success('Convocatoria guardada exitosamente 🏆');
  };

  const draggedPlayer = activeId ? getPlayer(activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden">
        
        {/* Professional Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shadow-sm z-50">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-primary/10 hover:text-primary transition-colors">
               <ChevronLeft />
             </Button>
             <div>
               <h2 className="text-xl font-bold text-foreground">Crear Convocatoria</h2>
               <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{categoryName} • {currentLineup.name}</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
                <div className={`w-2 h-2 rounded-full ${Object.keys(assignments).length === 11 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-[10px] font-bold uppercase">{Object.keys(assignments).length} / 11 JUGADORES</span>
             </div>
             <Button variant="outline" onClick={handleReset} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border-dashed">
               <RotateCcw size={16} className="mr-2" />
               Resetear
             </Button>
             <Button onClick={handleSaveWrapper} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold px-6">
               <Save size={16} className="mr-2" />
               Guardar
             </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Tactics & Config */}
          <aside className="w-72 hidden xl:flex flex-col p-6 border-r border-border bg-card/50 overflow-y-auto">
             <div className="space-y-8">
               <section>
                 <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                   <UserCog size={16} />
                   Sistema Táctico
                 </h3>
                 <Select value={selectedLineupId} onValueChange={handleLineupChange}>
                   <SelectTrigger className="w-full bg-input-background border-border h-11">
                     <SelectValue placeholder="Seleccionar" />
                   </SelectTrigger>
                   <SelectContent>
                     {LINEUPS.map(l => (
                       <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </section>

               <section className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-tighter">Guía de Uso</h4>
                  <ul className="text-[11px] text-muted-foreground space-y-3">
                    <li className="flex gap-2">
                       <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">1</span>
                       Elige la formación táctica ideal.
                    </li>
                    <li className="flex gap-2">
                       <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">2</span>
                       Arrastra jugadores a las posiciones indicadas.
                    </li>
                    <li className="flex gap-2">
                       <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">3</span>
                       Sueltas fuera para remover o sobre otro para cambiar.
                    </li>
                  </ul>
               </section>

               <section>
                  <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Search size={16} />
                    Resumen Visual
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                        <div className="text-2xl font-black text-primary">{assignments[currentLineup.positions.find(p=>p.role === 'Portero')?.id || ''] ? 1 : 0}/1</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Portero</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                        <div className="text-2xl font-black text-foreground">{Object.keys(assignments).length}/11</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Total</div>
                    </div>
                  </div>
               </section>
             </div>
          </aside>

          {/* Center: Vertical Tactical Field */}
          <section className="flex-1 bg-muted/30 p-4 md:p-8 flex items-center justify-center overflow-auto scrollbar-hide">
              <div className="w-full h-full max-h-screen flex items-center justify-center">
                 <SoccerField key={selectedLineupId}>
                   {currentLineup.positions.map((pos) => {
                      const assignedPlayerId = assignments[pos.id];
                      const assignedPlayer = assignedPlayerId ? getPlayer(assignedPlayerId) : undefined;
                      
                      return (
                        <DropZone 
                          key={`${selectedLineupId}_${pos.id}`} 
                          position={pos} 
                          assignedPlayer={assignedPlayer || null} 
                        />
                      );
                   })}
                 </SoccerField>
              </div>
          </section>

          {/* Right Panel: Player Selection */}
          <aside className="w-80 hidden lg:flex flex-col border-l border-border bg-card shadow-2xl z-40">
            <div className="p-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                Plantilla Disponible
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{players.length}</span>
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                    const isAssigned = userIsAssigned(player.id, assignments);
                    
                    return (
                      <div key={player.id} className={`transition-all duration-300 ${isAssigned ? 'opacity-30 grayscale scale-95 pointer-events-none' : ''}`}>
                         <DraggablePlayer 
                           player={player} 
                           variant="list" 
                         />
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
      
      <DragOverlay>
        {activeId && draggedPlayer ? (
           <div className="opacity-90 pointer-events-none shadow-2xl scale-110 rotate-3 transition-transform">
              <div className="bg-primary text-white px-5 py-3 rounded-full font-bold shadow-[0_10px_30px_rgba(var(--primary),0.4)] border-2 border-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                   {draggedPlayer.identification.slice(-2)}
                </div>
                {draggedPlayer.name}
              </div>
           </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}

function userIsAssigned(userId: string, assignments: Record<string, string>) {
  return Object.values(assignments).includes(userId);
}
