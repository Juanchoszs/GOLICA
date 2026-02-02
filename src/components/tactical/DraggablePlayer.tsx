import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player } from './types';
import { GripVertical } from 'lucide-react';

interface DraggablePlayerProps {
  player: Player;
  origin: 'list' | 'field';
  isAssigned?: boolean;
}

export function DraggablePlayer({ player, origin, isAssigned = false }: DraggablePlayerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { origin },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  // Diseño para jugador en la cancha
  if (origin === 'field') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          group relative
          w-16 h-16 md:w-20 md:h-20
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          transition-all duration-200
          cursor-grab active:cursor-grabbing
        `}
      >
        {/* Contenedor principal */}
        <div className="relative w-full h-full">
          {/* Fondo con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200" />
          
          {/* Borde superior colorido */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-t-2xl" />
          
          {/* Contenido */}
          <div className="relative h-full flex flex-col items-center justify-center p-2">
            {/* Avatar con número */}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-md mb-1">
              {player.identification.slice(-2)}
            </div>
            
            {/* Nombre del jugador */}
            <div className="text-[9px] md:text-[10px] font-bold text-gray-800 text-center leading-tight line-clamp-2 w-full">
              {player.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </div>

          {/* Indicador de arrastre */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-white" />
          </div>

          {/* Efecto hover */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/40 transition-colors duration-200" />
        </div>
      </div>
    );
  }

  // Diseño para jugador en la lista del banco
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative
        w-full
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        transition-all duration-200
      `}
    >
      <div className={`
        relative flex items-center gap-3 p-3 rounded-xl
        bg-card border border-border/50
        hover:border-primary/30 hover:bg-card/80
        transition-all duration-200
        ${isAssigned ? 'bg-muted/50' : 'hover:shadow-md'}
      `}>
        {/* Avatar */}
        <div className={`
          w-11 h-11 rounded-xl flex items-center justify-center
          ${isAssigned 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-gradient-to-br from-primary to-primary/80 text-white'
          }
          font-black text-sm shadow-sm shrink-0
        `}>
          {player.identification.slice(-2)}
        </div>

        {/* Info del jugador */}
        <div className="flex-1 min-w-0">
          <div className={`
            text-sm font-bold truncate
            ${isAssigned ? 'text-muted-foreground' : 'text-foreground'}
          `}>
            {player.name}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            ID: {player.identification}
          </div>
        </div>

        {/* Indicador de estado */}
        {isAssigned ? (
          <div className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-[10px] font-bold text-primary uppercase">Asignado</span>
          </div>
        ) : (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DraggablePlayer;