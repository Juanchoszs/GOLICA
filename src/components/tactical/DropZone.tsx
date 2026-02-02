import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Position, Player } from './types';
import { DraggablePlayer } from './DraggablePlayer';

interface DropZoneProps {
  position: Position;
  assignedPlayer: Player | null;
}

export function DropZone({ position, assignedPlayer }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: position.id,
  });

  // Colores según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Portero':
        return {
          bg: 'from-yellow-500/20 to-yellow-600/10',
          border: 'border-yellow-500/40',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
          text: 'text-yellow-500',
          hover: 'hover:from-yellow-500/30 hover:to-yellow-600/20'
        };
      case 'Defensa':
        return {
          bg: 'from-blue-500/20 to-blue-600/10',
          border: 'border-blue-500/40',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
          text: 'text-blue-500',
          hover: 'hover:from-blue-500/30 hover:to-blue-600/20'
        };
      case 'Mediocampo':
        return {
          bg: 'from-emerald-500/20 to-emerald-600/10',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          text: 'text-emerald-500',
          hover: 'hover:from-emerald-500/30 hover:to-emerald-600/20'
        };
      case 'Delantero':
        return {
          bg: 'from-red-500/20 to-red-600/10',
          border: 'border-red-500/40',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          text: 'text-red-500',
          hover: 'hover:from-red-500/30 hover:to-red-600/20'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-gray-600/10',
          border: 'border-gray-500/40',
          glow: 'shadow-[0_0_20px_rgba(107,114,128,0.3)]',
          text: 'text-gray-500',
          hover: 'hover:from-gray-500/30 hover:to-gray-600/20'
        };
    }
  };

  const colors = getRoleColor(position.role);

  return (
    <div
      ref={setNodeRef}
      className="absolute transition-all duration-300"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}
    >
      {assignedPlayer ? (
        <DraggablePlayer player={assignedPlayer} origin="field" />
      ) : (
        <div
          className={`
            relative group
            w-16 h-16 md:w-20 md:h-20
            rounded-2xl
            bg-gradient-to-br ${colors.bg}
            border-2 ${colors.border}
            ${isOver ? `${colors.glow} scale-110` : 'scale-100'}
            transition-all duration-300
            cursor-pointer
            flex flex-col items-center justify-center
            backdrop-blur-sm
            ${colors.hover}
          `}
        >
          {/* Indicador de posición */}
          <div className={`text-xs md:text-sm font-black ${colors.text} mb-1 tracking-wider`}>
            {position.label}
          </div>
          
          {/* Texto del rol (solo visible en hover) */}
          <div className="text-[8px] md:text-[9px] font-bold text-white/60 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            {position.role}
          </div>

          {/* Indicador de drop visual */}
          <div 
            className={`
              absolute inset-0 rounded-2xl
              border-2 border-dashed ${colors.border}
              ${isOver ? 'opacity-100 animate-pulse' : 'opacity-0'}
              transition-opacity duration-200
            `}
          />

          {/* Icono de más cuando está vacío */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            opacity-0 group-hover:opacity-50 transition-opacity
          `}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          {/* Pulso animado cuando está vacío */}
          <div 
            className={`
              absolute inset-0 rounded-2xl
              bg-gradient-to-br ${colors.bg}
              animate-ping opacity-20
            `}
            style={{ animationDuration: '3s' }}
          />
        </div>
      )}
    </div>
  );
}

export default DropZone;