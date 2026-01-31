
import { useDroppable } from '@dnd-kit/core';
import { Position, Player } from './types';
import { DraggablePlayer } from './DraggablePlayer';
import { Plus } from 'lucide-react';

interface DropZoneProps {
  position: Position;
  assignedPlayer?: Player | null;
}

export function DropZone({ position, assignedPlayer }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: position.id, 
    data: { position, assignedPlayer },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute w-16 h-16 sm:w-20 sm:h-20
        flex items-center justify-center transition-all duration-300
        ${isOver ? 'scale-110 z-20' : 'z-10'}
      `}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {assignedPlayer ? (
        <div className="relative group animate-in fade-in zoom-in duration-300">
            <DraggablePlayer player={assignedPlayer} variant="field" label={position.label} />
            
            {/* Tooltip on Hover */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20 shadow-xl z-50">
              {assignedPlayer.name}
            </div>
        </div>
      ) : (
        <div className={`
          w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center
          transition-all duration-300 backdrop-blur-md shadow-lg
          ${isOver ? 'border-yellow-400 bg-yellow-400/20 scale-110 ring-4 ring-yellow-400/20' : 'border-white/30 bg-black/30 hover:border-white/60'}
        `}>
            <span className="text-white/90 font-bold text-[10px] sm:text-xs tracking-tighter">{position.label}</span>
            <Plus size={12} className={`text-white/40 mt-0.5 transition-transform ${isOver ? 'rotate-90 scale-125 text-yellow-400' : ''}`} />
            
            <div className="absolute -bottom-6 text-[8px] sm:text-[10px] text-white/60 font-medium uppercase tracking-widest">
              {position.role}
            </div>
        </div>
      )}
    </div>
  );
}
