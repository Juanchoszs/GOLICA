
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
        absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
        flex items-center justify-center transition-all duration-200
        ${isOver ? 'scale-110 z-30' : 'z-20'}
      `}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto'
      }}
    >
      {assignedPlayer ? (
        <div className="relative group">
          <DraggablePlayer player={assignedPlayer} variant="field" label={position.label} />
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[11px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-lg z-50">
            {assignedPlayer.name}
          </div>
        </div>
      ) : (
        <div className={`
          w-full h-full rounded-full flex flex-col items-center justify-center
          transition-all duration-200 bg-white/6 backdrop-blur-sm
          ${isOver ? 'ring-4 ring-white/20 bg-white/10 shadow-lg' : 'border border-white/20'}
        `}>
          <div className="text-white/90 font-bold text-[14px] sm:text-[16px] tracking-tighter -mb-1">{position.label}</div>
          <Plus size={20} className={`text-white/60 mt-0.5 transition-transform ${isOver ? 'translate-y-0 scale-110 text-white' : 'translate-y-1'}`} />
          <div className="absolute -bottom-6 text-[10px] sm:text-[11px] text-white/70 font-medium uppercase tracking-wider">
            {position.role}
          </div>
        </div>
      )}
    </div>
  );
}
