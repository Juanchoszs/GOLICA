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
  const isDisabled = player.health_status === 'Inhabilitado';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { origin },
    disabled: isDisabled,
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
          {/* Fondo con gradiente y borde de estado */}
          <div className={`absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200 border-2 ${
            player.health_status === 'Inhabilitado' ? 'border-red-500' :
            player.health_status === 'Con leves restricciones' ? 'border-amber-500' :
            'border-transparent'
          }`} />
          
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
        w-24 mx-auto
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isAssigned || player.health_status === 'Inhabilitado' ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        transition-all duration-200
      `}
    >
      <div className={`
        relative flex flex-col items-center gap-2 p-2.5 rounded-xl
        bg-card border border-border/50
        hover:border-primary/30 hover:bg-card/80
        transition-all duration-200
        ${isAssigned || player.health_status === 'Inhabilitado' ? 'bg-muted/50' : 'hover:shadow-md'}
      `}>
        {/* Avatar con foto de perfil */}
        <div className={`
          w-12 h-12 rounded-full overflow-hidden flex items-center justify-center
          ${isAssigned 
            ? 'bg-muted border-2 border-muted-foreground/20' 
            : 'bg-gradient-to-br from-primary to-primary/80 border-2 border-primary/30'
          }
          shadow-sm shrink-0
        `}>
          {player.photo_url ? (
            <img 
              src={player.photo_url} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`
            w-full h-full flex items-center justify-center text-white font-black text-xs
            ${player.photo_url ? 'hidden' : ''}
          `}>
            {player.identification.slice(-2)}
          </div>
        </div>

        {/* Info del jugador */}
        <div className="w-full text-center min-w-0">
          <div className={`
            text-[10px] font-bold truncate px-1
            ${isAssigned ? 'text-muted-foreground' : 'text-foreground'}
          `}>
            {player.name.split(' ').slice(0, 2).join(' ')}
          </div>
          {/* Ocultamos el ID para mantener el diseño compacto tipo \"bolita\" */}
        </div>

        {/* Indicador de estado */}
        {isAssigned && (
          <div className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-[9px] font-bold text-primary uppercase">Asignado</span>
          </div>
        )}
        
        {/* Health status indicator */}
        {player.health_status && player.health_status !== 'Perfecto' && (
          <div className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
            player.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
            player.health_status === 'Inhabilitado' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''
          }`}>
            {player.health_status}
          </div>
        )}
        
        {/* Grip icon siempre visible pero discreto */}
        {!isAssigned && (
          <div className="shrink-0 opacity-30 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DraggablePlayer;