
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function SoccerField({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'field',
  });

  return (
    <div 
        ref={setNodeRef}
        className="relative w-full aspect-[3/4] rounded-lg border-[3px] border-white/20 overflow-hidden shadow-2xl transition-all"
        style={{
            background: '#1a472a', // Dark tactical green
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)' // Vignette
        }}
    >
        {/* Tactical Board Grid/Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>
        </div>

        {/* --- Markings (Clean White Lines) --- */}
        <div className="absolute inset-4 border-2 border-white/90 border-t-0 pointer-events-none"></div> {/* Touchlines */}
        
        {/* Top (Center Line) */}
        <div className="absolute top-4 left-4 right-4 h-[2px] bg-white/90 pointer-events-none"></div>
        <div className="absolute top-4 left-1/2 w-24 h-24 border-2 border-white/90 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        {/* Bottom (Goal Area) */}
        <div className="absolute bottom-4 left-1/2 w-3/5 h-[18%] border-2 border-b-0 border-white/90 -translate-x-1/2 pointer-events-none"></div> {/* 18-yard box */}
        <div className="absolute bottom-4 left-1/2 w-[28%] h-[8%] border-2 border-b-0 border-white/90 -translate-x-1/2 pointer-events-none"></div> {/* 6-yard box */}
        
        {/* Penalty Spot & Arc */}
        <div className="absolute bottom-[14%] left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-[18%] left-1/2 w-16 h-16 border-2 border-white/90 rounded-full -translate-x-1/2 border-b-0 pointer-events-none" 
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'translate(-50%, 0)' }}>
        </div>

        {/* Corners */}
        <div className="absolute bottom-4 left-4 w-4 h-4 border-t-2 border-r-2 border-white/90 rounded-tr-full pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-t-2 border-l-2 border-white/90 rounded-tl-full pointer-events-none"></div>

        {children}
    </div>
  );
}
