
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Player } from './types';
import { User, GripVertical } from 'lucide-react';

interface DraggablePlayerProps {
  player: Player;
  variant?: 'list' | 'field';
  onRemove?: () => void;
}

export function DraggablePlayer({ player, variant = 'list', onRemove }: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { player, origin: variant },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 'auto',
  };

  if (variant === 'field') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative flex flex-col items-center cursor-move group"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg overflow-hidden relative">
           {player.image ? (
            <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
           ) : (
            <span className="text-xs sm:text-sm">{player.identification.slice(-2)}</span> 
           )}
           {/* Remove button on hover (desktop) or long press options? Keep simple for now */}
        </div>
        <div className="mt-1 px-2 py-0.5 bg-black/60 rounded text-[10px] sm:text-xs text-white  truncate max-w-[80px] text-center border border-white/20">
          {player.name.split(' ')[0]}
        </div>
      </div>
    );
  }

  // List Variant
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm 
        hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all
        ${player.status === 'assigned' ? 'opacity-50 grayscale pointer-events-none' : ''}
        ${isDragging ? 'opacity-80 ring-2 ring-primary rotate-2' : ''}
      `}
    >
      <div className="bg-muted p-1.5 rounded-full">
         <GripVertical size={16} className="text-muted-foreground" />
      </div>
      
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-border shrink-0">
        {player.image ? (
            <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
        ) : (
            <User size={20} className="text-primary" />
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{player.name}</p>
        <p className="text-xs text-muted-foreground truncate">{player.position || 'Sin Pos.'}</p>
      </div>
    </div>
  );
}
