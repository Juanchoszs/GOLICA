
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
import { Search, Save, RotateCcw, ChevronLeft } from 'lucide-react';

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

  const handleSaveWrapper = () => {
    // Validations
    // 1. Must have goalkeeper?
    const gkPos = currentLineup.positions.find(p => p.role === 'keeper');
    if (gkPos && !assignments[gkPos.id]) {
      toast.error('¡Falta el arquero!');
      return;
    }
    
    // 2. All positions full?
    // "No se puede guardar una convocatoria sin... Todas las posiciones completas"
    const missing = currentLineup.positions.filter(p => !assignments[p.id]);
    if (missing.length > 0) {
      toast.error(`Faltan ${missing.length} jugadores por asignar`);
      return;
    }

    onSave({
      category: categoryName,
      lineupId: selectedLineupId,
      assignments,
      createdAt: new Date().toISOString()
    });
    toast.success('Convocatoria guardada exitosamente');
  };

  const draggedPlayer = activeId ? getPlayer(activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-100px)] min-h-[600px] bg-background">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onClose}>
               <ChevronLeft />
             </Button>
             <div>
               <h2 className="text-xl font-bold text-foreground">Convocatoria {categoryName}</h2>
               <p className="text-xs text-muted-foreground">{currentLineup.name} • {assignedPlayerIds.length}/11 asignados</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={handleReset} className="text-muted-foreground hover:text-destructive">
               <RotateCcw size={16} className="mr-2" />
               Resetear
             </Button>
             <Button onClick={handleSaveWrapper} className="bg-primary text-primary-foreground hover:bg-primary/90">
               <Save size={16} className="mr-2" />
               Guardar Convocatoria
             </Button>
          </div>
        </div>

        {/* Main 3 Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left: Configuration (2 cols) */}
          <aside className="hidden lg:flex lg:col-span-2 flex-col p-4 border-r border-border bg-muted/10 overflow-y-auto">
             <div className="space-y-6">
               <div>
                 <label className="text-sm font-medium mb-2 block text-muted-foreground">Táctica</label>
                 <Select value={selectedLineupId} onValueChange={(val) => {
                    if (Object.keys(assignments).length > 0) {
                        if(!confirm('Cambiar la alineación reseteará las posiciones. ¿Continuar?')) return;
                        setAssignments({});
                    }
                    setSelectedLineupId(val);
                 }}>
                   <SelectTrigger className="w-full bg-input-background border-border">
                     <SelectValue placeholder="Seleccionar" />
                   </SelectTrigger>
                   <SelectContent>
                     {LINEUPS.map(l => (
                       <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <Card className="p-4 bg-primary/5 border-primary/20">
                  <h4 className="text-sm font-semibold text-primary mb-2">Instrucciones</h4>
                  <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Selecciona una alineación táctica.</li>
                    <li>Arrastra jugadores desde la lista derecha a las posiciones en la cancha.</li>
                    <li>Para remover, arrastra el jugador fuera de la cancha.</li>
                    <li>Todos los campos son obligatorios para guardar.</li>
                  </ul>
               </Card>

                {/* Mini Stats or Info could go here */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Resumen</h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-card border border-border rounded p-2">
                        <div className="text-xl font-bold">{assignments[currentLineup.positions.find(p=>p.role === 'keeper')?.id || ''] ? 1 : 0}/1</div>
                        <div className="text-[10px] text-muted-foreground">Arqueros</div>
                    </div>
                    <div className="bg-card border border-border rounded p-2">
                        <div className="text-xl font-bold">{Object.keys(assignments).length}/11</div>
                        <div className="text-[10px] text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
             </div>
          </aside>

          {/* Center: Field (7 cols) */}
          <section className="lg:col-span-7 bg-black/5 p-4 flex items-center justify-center overflow-auto relative min-h-[500px]">
             <div className="w-full max-w-[600px] shadow-2xl rounded-lg">
               <SoccerField>
                 {currentLineup.positions.map((pos) => {
                    const assignedPlayerId = assignments[pos.id];
                    const assignedPlayer = assignedPlayerId ? getPlayer(assignedPlayerId) : undefined;
                    
                    return (
                      <DropZone 
                        key={pos.id} 
                        position={pos} 
                        assignedPlayer={assignedPlayer || null} 
                      />
                    );
                 })}
               </SoccerField>
             </div>
          </section>

          {/* Right: Players Panel (3 cols) */}
          <aside className="lg:col-span-3 flex flex-col border-l border-border bg-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3">Jugadores Disponibles</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar jugador..." 
                  className="pl-9 h-9 bg-input-background"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {filteredPlayers.length === 0 && (
                   <p className="text-center text-sm text-muted-foreground py-8">No hay jugadores encontrados</p>
                )}
                {filteredPlayers.map(player => {
                  const isAssigned = userIsAssigned(player.id, assignments);
                  
                  return (
                    <DraggablePlayer 
                      key={player.id} 
                      player={{...player, status: isAssigned ? 'assigned' : player.status}} 
                      variant="list" 
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
      
      <DragOverlay>
        {activeId && draggedPlayer ? (
           <div className="opacity-90 pointer-events-none">
             {/* We visually mimic the Field Variant when dragging from list to field for better UX? 
                 Or stick to source variant? 
                 Actually, transforming from Card to Circle is cool but hard to align.
                 Let's stick to showing the Card if dragging from List, and Circle if dragging from Field.
             */}
             <DraggablePlayer 
               player={draggedPlayer} 
               variant={draggedPlayer.id === activeId /* Check origin via event data? hard to access here without tracking */ ? 'list' : 'field'} 
             />
             {/* 
                Hack: The component DraggablePlayer renders layout based on props.
                We don't know the origin easily here unless we store it in state.
                I'll wrap DraggablePlayer to handle 'drag-overlay' mode or just render a generic clean version.
                
                Actually I can look at active.data.current.origin inside DragOverlay? No, useDndContext?
                No, simple way: 
             */}
              <div className="bg-primary text-white px-3 py-1.5 rounded-full font-bold shadow-xl border-2 border-white">
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
