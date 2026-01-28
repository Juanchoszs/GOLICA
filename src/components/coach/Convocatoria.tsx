
import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SoccerField } from './SoccerField';
import { DndContext, useDraggable, DragOverlay, useDroppable } from '@dnd-kit/core';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Download, Trash2, Users, Shirt, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

// --- Formations (Strict 11 Slots) ---
// Coordinates in % (Left, Top)
const FORMATIONS: any = {
    '4-3-3': [
        { id: 0, x: 50, y: 88, role: 'GK' },    // GK
        { id: 1, x: 15, y: 70, role: 'LB' },    // LB
        { id: 2, x: 38, y: 75, role: 'CB' },    // CB
        { id: 3, x: 62, y: 75, role: 'CB' },    // CB
        { id: 4, x: 85, y: 70, role: 'RB' },    // RB
        { id: 5, x: 30, y: 50, role: 'CM' },    // CM
        { id: 6, x: 50, y: 55, role: 'CDM' },   // CDM
        { id: 7, x: 70, y: 50, role: 'CM' },    // CM
        { id: 8, x: 15, y: 25, role: 'LW' },    // LW
        { id: 9, x: 50, y: 20, role: 'ST' },    // ST
        { id: 10, x: 85, y: 25, role: 'RW' },   // RW
    ],
    '4-4-2': [
        { id: 0, x: 50, y: 88, role: 'GK' },
        { id: 1, x: 15, y: 70, role: 'LB' },
        { id: 2, x: 38, y: 75, role: 'CB' },
        { id: 3, x: 62, y: 75, role: 'CB' },
        { id: 4, x: 85, y: 70, role: 'RB' },
        { id: 5, x: 15, y: 45, role: 'LM' },
        { id: 6, x: 38, y: 50, role: 'CM' },
        { id: 7, x: 62, y: 50, role: 'CM' },
        { id: 8, x: 85, y: 45, role: 'RM' },
        { id: 9, x: 35, y: 20, role: 'ST' },
        { id: 10, x: 65, y: 20, role: 'ST' },
    ],
    '3-4-3': [
        { id: 0, x: 50, y: 88, role: 'GK' },
        { id: 1, x: 20, y: 75, role: 'CB' },
        { id: 2, x: 50, y: 75, role: 'CB' },
        { id: 3, x: 80, y: 75, role: 'CB' },
        { id: 4, x: 10, y: 50, role: 'LM' },
        { id: 5, x: 35, y: 50, role: 'CM' },
        { id: 6, x: 65, y: 50, role: 'CM' },
        { id: 7, x: 90, y: 50, role: 'RM' },
        { id: 8, x: 20, y: 25, role: 'LW' },
        { id: 9, x: 50, y: 20, role: 'ST' },
        { id: 10, x: 80, y: 25, role: 'RW' },
    ],
    '4-1-2-3': [
        { id: 0, x: 50, y: 88, role: 'GK' },
        { id: 1, x: 15, y: 70, role: 'LB' },
        { id: 2, x: 38, y: 75, role: 'CB' },
        { id: 3, x: 62, y: 75, role: 'CB' },
        { id: 4, x: 85, y: 70, role: 'RB' },
        { id: 5, x: 50, y: 60, role: 'CDM' },
        { id: 6, x: 30, y: 40, role: 'CAM' },
        { id: 7, x: 70, y: 40, role: 'CAM' },
        { id: 8, x: 15, y: 25, role: 'LW' },
        { id: 9, x: 50, y: 20, role: 'ST' },
        { id: 10, x: 85, y: 25, role: 'RW' },
    ]
};

// --- Components ---

function DraggablePlayer({ player, sourceId }: { player: any, sourceId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { player, sourceId }
  });
  
  const style = transform ? {
    transform: `translate3d(\${transform.x}px, \${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="opacity-0" />;
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 mb-2 bg-card border border-border rounded-md shadow-sm cursor-move hover:border-primary flex items-center gap-2 touch-none relative group select-none">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border">
        {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
        <p className="text-[10px] text-muted-foreground">{player.position || 'JUG'}</p>
      </div>
    </div>
  );
}

function FieldSlot({ slot, player, onRemove }: { slot: any, player: any, onRemove: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-\${slot.id}`,
    data: { slotId: slot.id }
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: player ? `field-player-\${player.id}` : `empty-slot-\${slot.id}`, // Only draggable if player exists
    data: { player, sourceId: `slot-\${slot.id}`, type: 'field' },
    disabled: !player
  });
  
  // Slot Position
  const slotStyle: any = {
    position: 'absolute',
    left: `\${slot.x}%`,
    top: `\${slot.y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
  };

  // Dragging visuals
  const dragStyle = transform ? {
      transform: `translate3d(\${transform.x}px, \${transform.y}px, 0)`,
      zIndex: 100,
  } : undefined;

  return (
    <div 
        ref={setNodeRef}
        style={slotStyle}
        className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300
            \${isOver ? 'border-primary bg-primary/20 scale-110 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'border-white/30 bg-black/20 hover:border-white/60'}
        `}
    >
        {/* Role Label (Ghost) */}
        {!player && !isOver && (
            <span className="text-white/40 text-[10px] md:text-xs font-bold font-mono">{slot.role}</span>
        )}

        {/* Player Token */}
        {player && (
            <div 
                ref={setDragRef} 
                {...listeners} 
                {...attributes} 
                style={dragStyle}
                className={`flex flex-col items-center cursor-move touch-none \${isDragging ? 'opacity-0' : ''} group`}
            >
                <div className="relative">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white bg-primary shadow-lg relative z-10 transition-transform group-hover:scale-105">
                        {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-sm">👤</div>}
                    </div>
                    {/* Number Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm z-20">
                        {player.number || '#'}
                    </div>
                    {/* Remove Button */}
                    <button 
                         onClick={(e) => { e.stopPropagation(); onRemove(); }}
                         onPointerDown={(e) => e.stopPropagation()} 
                         className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-sm"
                    >
                        ×
                    </button>
                </div>
                {/* Name Tag */}
                <div className="max-w-[80px] md:max-w-[100px] bg-black/80 text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-full mt-1 backdrop-blur-md whitespace-nowrap shadow-md border border-white/10 truncate">
                    {player.name.split(' ')[0]}
                </div>
            </div>
        )}
    </div>
  );
}

function BenchPlayer({ player }: { player: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `bench-player-\${player.id}`,
        data: { player, sourceId: 'bench' }
    });

    const style = transform ? {
        transform: `translate3d(\${transform.x}px, \${transform.y}px, 0)`,
        zIndex: 999
    } : undefined;

    if (isDragging) {
       return <div className="w-8 h-8 rounded-full bg-primary/20 border border-border opacity-50" />;
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="relative group bg-card border border-border rounded-lg p-2 flex items-center gap-2 shadow-sm pr-2 cursor-move hover:border-primary touch-none">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted border border-border">
                {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}
            </div>
            <span className="text-xs font-medium">{player.name.split(' ')[0]}</span>
        </div>
    );
}

// --- Main Component ---
export function Convocatoria({ coach }: { coach: any }) {
  const [players, setPlayers] = useState<any[]>([]);
  
  // State: lineup is now a map of SlotID (0-10) -> PlayerObject
  const [lineup, setLineup] = useState<Record<number, any>>({});
  const [bench, setBench] = useState<any[]>([]);
  
  const [formationName, setFormationName] = useState('4-3-3');
  const [matchInfo, setMatchInfo] = useState({ opponent: '', date: '', category: '' });
  const [draggedPlayer, setDraggedPlayer] = useState<any>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  // Load players
  useEffect(() => {
    async function fetchPlayers() {
        if (!coach?.assigned_categories) return;
        const { data } = await supabase.from('players').select('*').eq('status', 'active');
        if (data) {
            const filtered = data.filter((p: any) => {
                if (!p.category) return false;
                return coach.assigned_categories.some((c: string) => p.category.includes(c));
            });
            setPlayers(filtered);
        }
    }
    fetchPlayers();
  }, [coach]);

  const currentSlots = FORMATIONS[formationName] || FORMATIONS['4-3-3'];

  // Actions
  const clearField = () => { setLineup({}); setBench([]); toast.success('Campo limpiado'); };
  
  const handleDownload = async () => {
    if (!fieldRef.current) return;
    try {
        const canvas = await html2canvas(fieldRef.current, { backgroundColor: '#2d7a36', scale: 2 });
        const link = document.createElement('a');
        link.download = `alineacion-\${matchInfo.opponent || 'partido'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success('Descarga iniciada');
    } catch (e) { toast.error('Error al descargar'); }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setDraggedPlayer(null);
    if (!over) return;

    const player = active.data.current.player;
    const sourceId = active.data.current.sourceId; // 'sidebar', 'bench', 'slot-N'
    const overId = over.id as string; // 'slot-N', 'bench-zone', 'sidebar-trash'

    // Case 1: Dropped on a SLOT (Field)
    if (overId.startsWith('slot-')) {
        const targetSlotId = parseInt(overId.replace('slot-', ''));
        
        // Check if slot is occupied
        const existingPlayerInSlot = lineup[targetSlotId];
        
        // Update Lineup
        const newLineup = { ...lineup };
        
        // If coming from another slot (SWAP)
        if (sourceId.startsWith('slot-')) {
             const sourceSlotId = parseInt(sourceId.replace('slot-', ''));
             
             // Move source player to target
             newLineup[targetSlotId] = player;
             
             // If target had a player, move them to source, otherwise clear source
             if (existingPlayerInSlot) {
                 newLineup[sourceSlotId] = existingPlayerInSlot;
             } else {
                 delete newLineup[sourceSlotId];
             }
        } 
        // Coming from Sidebar or Bench
        else {
             // If target has player, move existing executioner to bench? Or just swap logic?
             // Let's swap: Move existing to bench for now to be safe, or just overwrite?
             // Better user experience: Move existing to bench.
             if (existingPlayerInSlot) {
                 setBench(prev => [...prev, existingPlayerInSlot]);
             }
             
             newLineup[targetSlotId] = player;
             
             // Remove from origin
             if (sourceId === 'bench') {
                 setBench(prev => prev.filter(p => p.id !== player.id));
             }
        }
        setLineup(newLineup);
    }
    
    // Case 2: Dropped on BENCH
    else if (overId === 'bench-zone') {
        if (sourceId.startsWith('slot-')) {
            const sourceSlotId = parseInt(sourceId.replace('slot-', ''));
            const newLineup = { ...lineup };
            delete newLineup[sourceSlotId];
            setLineup(newLineup);
            
            if (!bench.find(p => p.id === player.id)) {
                setBench(prev => [...prev, player]);
            }
        }
    }
  };

  const { setNodeRef: setBenchRef } = useDroppable({ id: 'bench-zone' });

  // Helper to check if player is used
  const isPlayerUsed = (pid: string) => {
      if (bench.find(b => b.id === pid)) return true;
      if (Object.values(lineup).find((l: any) => l.id === pid)) return true;
      return false;
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={(e: any) => setDraggedPlayer(e.active.data.current.player)}>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Left: Field & Controls */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
           {/* Controls Bar */}
           <Card className="p-3 bg-card flex flex-wrap gap-4 items-center justify-between shadow-sm flex-shrink-0">
             <div className="flex gap-2 items-center flex-wrap">
               <div className="flex flex-col gap-1">
                   <Label className="text-[10px] uppercase text-muted-foreground">Rival</Label>
                   <Input value={matchInfo.opponent} onChange={e => setMatchInfo({...matchInfo, opponent: e.target.value})} className="w-32 h-8 text-xs" placeholder="Equipo rival" />
               </div>
               <div className="flex flex-col gap-1">
                   <Label className="text-[10px] uppercase text-muted-foreground">Formación</Label>
                    <Select value={formationName} onValueChange={setFormationName}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(FORMATIONS).map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                        </SelectContent>
                    </Select>
               </div>
             </div>
             
             <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={clearField} className="h-8 w-8 p-0" title="Limpiar"><RotateCcw size={14} /></Button>
                 <Button size="sm" variant="outline" onClick={handleDownload} className="h-8 w-8 p-0" title="Descargar"><Download size={14} /></Button>
                 <Button size="sm" className="h-8 bg-primary text-primary-foreground text-xs px-3">Guardar</Button>
             </div>
           </Card>
           
           {/* Field */}
           <div className="flex-1 relative min-h-0" id="capture-zone" ref={fieldRef}>
             <SoccerField>
               {currentSlots.map((slot: any) => (
                   <FieldSlot 
                      key={slot.id} 
                      slot={slot} 
                      player={lineup[slot.id]} 
                      onRemove={() => {
                          const newLineup = {...lineup};
                          delete newLineup[slot.id];
                          setLineup(newLineup);
                          // Optionally move to bench? No, just clear for now based on 'x' click
                          if (lineup[slot.id]) setBench(prev => [...prev, lineup[slot.id]]);
                      }}
                   />
               ))}
             </SoccerField>
           </div>

           {/* Bench */}
           <div ref={setBenchRef} className="bg-muted/30 border-2 border-dashed border-border p-3 rounded-xl min-h-[80px] flex-shrink-0">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-2 text-muted-foreground"><Users size={14} /> Suplentes / Banquillo</h4>
                <div className="flex flex-wrap gap-2">
                    {bench.map(p => <BenchPlayer key={p.id} player={p} />)}
                    {bench.length === 0 && <span className="text-[10px] text-muted-foreground/50 italic py-1">Arrastra aquí</span>}
                </div>
           </div>
        </div>

        {/* Right: Player List */}
        <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0 h-full">
             <Card className="h-full flex flex-col p-4 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="flex-shrink-0 mb-4">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                        <Shirt size={16} className="text-primary"/> Plantel
                    </h3>
                    <div className="mt-2">
                        <Select onValueChange={(val) => setMatchInfo({...matchInfo, category: val})}>
                            <SelectTrigger className="w-full h-8 text-xs"><SelectValue placeholder="Filtrar Categoría" /></SelectTrigger>
                            <SelectContent>
                                {coach?.assigned_categories?.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1 min-h-0">
                    {players
                        .filter(p => !matchInfo.category || (p.category && p.category.includes(matchInfo.category)))
                        .filter(p => !isPlayerUsed(p.id))
                        .map(player => (
                        <DraggablePlayer key={player.id} player={player} sourceId="sidebar" />
                    ))}
                    {players.length === 0 && <p className="text-center text-muted-foreground text-xs py-10">Cargando...</p>}
                </div>
             </Card>
        </div>

      </div>

      {/* Drag Preview */}
      <DragOverlay>
         {draggedPlayer ? (
            <div className="w-12 h-12 rounded-full border-2 border-white bg-primary shadow-2xl overflow-hidden opacity-90 scale-110 pointer-events-none">
               {draggedPlayer.photo_url ? <img src={draggedPlayer.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white">👤</div>}
            </div>
         ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Icon helper
function RotateCcw({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 5v7h7" /></svg>;
}
