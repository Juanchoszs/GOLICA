
import React from 'react';

export function SoccerField({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-full aspect-[3/4] bg-emerald-600 rounded-lg overflow-hidden border-4 border-emerald-800 shadow-2xl select-none ${className}`}>
      {/* Grass Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.5) 50%)',
          backgroundSize: '100% 10%', // Stripes
        }}
      />
      
      {/* White Lines Container */}
      <div className="absolute inset-4 border-2 border-white/80 opacity-90 pointer-events-none">
        {/* Halfway Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80 -translate-y-1/2" />
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-[20%] aspect-square border-2 border-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Top Penalty Area (Opponent) */}
        <div className="absolute top-0 left-[20%] right-[20%] h-[15%] border-b-2 border-x-2 border-white/80" />
        <div className="absolute top-0 left-[35%] right-[35%] h-[6%] border-b-2 border-x-2 border-white/80" />
        {/* Top Penalty Arc */}
        <div className="absolute top-[11.5%] left-1/2 w-[18%] aspect-square border-2 border-white/80 rounded-full -translate-x-1/2 clip-path-bottom" 
             style={{ clipPath: 'inset(50% 0 0 0)'}} 
        />
        
        {/* Bottom Penalty Area (Our Goal) */}
        <div className="absolute bottom-0 left-[20%] right-[20%] h-[15%] border-t-2 border-x-2 border-white/80" />
        <div className="absolute bottom-0 left-[35%] right-[35%] h-[6%] border-t-2 border-x-2 border-white/80" />
        {/* Bottom Penalty Arc */}
        <div className="absolute bottom-[11.5%] left-1/2 w-[18%] aspect-square border-2 border-white/80 rounded-full -translate-x-1/2" 
             style={{ clipPath: 'inset(0 0 50% 0)'}}
        />

        {/* Corner Arcs */}
        <div className="absolute top-0 left-0 w-[5%] aspect-square border-b-2 border-r-2 border-white/80 rounded-br-full" />
        <div className="absolute top-0 right-0 w-[5%] aspect-square border-b-2 border-l-2 border-white/80 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-[5%] aspect-square border-t-2 border-r-2 border-white/80 rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-[5%] aspect-square border-t-2 border-l-2 border-white/80 rounded-tl-full" />
      </div>

      {/* Children (Players/Dropzones) */}
      <div className="absolute inset-0 z-10">
        {children}
      </div>
    </div>
  );
}
