
import React from 'react';

export function SoccerField({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`
      relative w-full max-w-[450px] mx-auto 
      aspect-[9/16] bg-emerald-700 rounded-xl overflow-hidden 
      border-4 border-emerald-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
      select-none backdrop-blur-sm animate-in fade-in zoom-in duration-700
      ${className}
    `}
    style={{ minHeight: '600px' }}
    >
      {/* Grass Stripes Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.3) 50%)',
          backgroundSize: '100% 8%', 
        }}
      />
      
      {/* Professional Field Markings */}
      <div className="absolute inset-4 border-2 border-white/60 pointer-events-none">
        {/* Halfway Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 -translate-y-1/2" />
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-[25%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Attack Area (Top) */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[12%] border-b-2 border-x-2 border-white/60" />
        <div className="absolute top-0 left-[35%] right-[35%] h-[5%] border-b-2 border-x-2 border-white/60" />
        <div className="absolute top-[8%] left-1/2 w-[20%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2" 
             style={{ clipPath: 'inset(50% 0 0 0)'}} 
        />
        
        {/* Defense Area (Bottom / Our Goal) */}
        <div className="absolute bottom-0 left-[15%] right-[15%] h-[12%] border-t-2 border-x-2 border-white/60" />
        <div className="absolute bottom-0 left-[35%] right-[35%] h-[5%] border-t-2 border-x-2 border-white/60" />
        <div className="absolute bottom-[8%] left-1/2 w-[20%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2" 
             style={{ clipPath: 'inset(0 0 50% 0)'}}
        />

        {/* Corner Arcs */}
        <div className="absolute top-0 left-0 w-[4%] aspect-square border-b-2 border-r-2 border-white/40 rounded-br-full" />
        <div className="absolute top-0 right-0 w-[4%] aspect-square border-b-2 border-l-2 border-white/40 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-[4%] aspect-square border-t-2 border-r-2 border-white/40 rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-[4%] aspect-square border-t-2 border-l-2 border-white/40 rounded-tl-full" />
      </div>

      {/* DropZones Container */}
      <div className="absolute inset-0 z-10">
        {children}
      </div>
      
      {/* Decorative Shading */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]" />
    </div>
  );
}
