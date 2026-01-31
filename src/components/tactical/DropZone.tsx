
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
        absolute w-14 h-14 sm:w-20 sm:h-20 -translate-x-1/2 -translate-y-1/2
        flex flex-col items-center justify-center transition-all duration-200
        ${isOver && !assignedPlayer ? 'scale-110 ring-4 ring-yellow-400 rounded-full bg-white/20' : ''}
        ${isOver && assignedPlayer ? 'scale-110 ring-4 ring-red-400 rounded-full' : ''}
      `}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%` 
      }}
    >
      {assignedPlayer ? (
        <DraggablePlayer player={assignedPlayer} variant="field" />
      ) : (
        <div className={`
          w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 border-dashed flex items-center justify-center
          transition-colors backdrop-blur-sm
          ${isOver ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/40 bg-black/20 hover:border-white/80'}
        `}>
            <div className="flex flex-col items-center">
                <span className="text-white font-bold text-[10px] sm:text-xs tracking-wider">{position.label}</span>
                {!isOver && <Plus size={10} className="text-white/50 mt-0.5" />}
            </div>
        </div>
      )}
      
      {!assignedPlayer && !isOver && (
         <div className="absolute -bottom-6 text-[10px] text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {position.role}
         </div>
      )}
    </div>
  );
}
