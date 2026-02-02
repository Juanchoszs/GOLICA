import React from 'react';

type SoccerPitchProps = {
  children?: React.ReactNode;
  className?: string;
  mode?: 'half' | 'full';
};

// Media cancha optimizada - Portería en la parte inferior
export function SoccerPitch({ children, className = '', mode = 'half' }: SoccerPitchProps) {
  const viewBox = '0 0 120 85';

  return (
    <div className={`w-full max-w-[900px] mx-auto aspect-[120/85] ${className}`}>
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="w-full h-full block">
          <defs>
            {/* Gradiente de césped realista */}
            <linearGradient id="grassGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a7a3e" />
              <stop offset="40%" stopColor="#22884a" />
              <stop offset="60%" stopColor="#1f7d43" />
              <stop offset="100%" stopColor="#1d6b3c" />
            </linearGradient>

            {/* Patrón de rayas del césped */}
            <pattern id="grassStripes" width="10" height="85" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height="85" fill="rgba(255,255,255,0.04)" />
              <rect x="5" y="0" width="5" height="85" fill="rgba(0,0,0,0.04)" />
            </pattern>

            {/* Sombra suave para las líneas */}
            <filter id="lineShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" />
              <feOffset dx="0" dy="0.3" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradiente radial para las áreas */}
            <radialGradient id="areaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            {/* Patrón de red para la portería */}
            <pattern id="goalNet" width="2" height="2" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="2" y2="2" stroke="rgba(255,255,255,0.25)" strokeWidth="0.2" />
              <line x1="2" y1="0" x2="0" y2="2" stroke="rgba(255,255,255,0.25)" strokeWidth="0.2" />
            </pattern>
          </defs>

          {/* Fondo base del césped */}
          <rect x="0" y="0" width="120" height="85" fill="url(#grassGradient)" />
          
          {/* Rayas del césped - vertical */}
          <rect x="0" y="0" width="120" height="85" fill="url(#grassStripes)" />

          {/* Borde exterior de la cancha */}
          <rect 
            x="3" y="3" 
            width="114" height="79" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.5" 
            rx="1.5" 
            filter="url(#lineShadow)" 
          />

          {/* Línea de medio campo (en la parte superior) */}
          <line 
            x1="3" y1="3" 
            x2="117" y2="3" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.6" 
            filter="url(#lineShadow)" 
          />
          
          {/* Mitad del círculo central (semicírculo pequeño en la parte superior) */}
          <path 
            d="M 48 3 A 12 12 0 0 1 72 3" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.6" 
            filter="url(#lineShadow)" 
          />
          
          {/* Punto central */}
          <circle 
            cx="60" cy="3" 
            r="0.7" 
            fill="rgba(255,255,255,0.95)" 
            filter="url(#lineShadow)" 
          />

          {/* Área grande (inferior - nuestra zona defensiva) */}
          <rect 
            x="30" y="60" 
            width="60" height="22" 
            fill="url(#areaGlow)" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.6" 
            filter="url(#lineShadow)" 
          />
          
          {/* Área pequeña (inferior - área de 6 yardas) */}
          <rect 
            x="45" y="74" 
            width="30" height="8" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.6" 
            filter="url(#lineShadow)" 
          />
          
          {/* Arco del área grande (semicírculo en la parte inferior) */}
          <path 
            d="M 42 60 A 10 10 0 0 1 78 60" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.6" 
            filter="url(#lineShadow)" 
          />

          {/* Punto penal */}
          <circle 
            cx="60" cy="69" 
            r="0.7" 
            fill="rgba(255,255,255,0.95)" 
            filter="url(#lineShadow)" 
          />

          {/* Esquinas inferiores (cuartos de círculo) */}
          <path 
            d="M 3 82 Q 3 80 5 80" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.5" 
          />
          <path 
            d="M 117 82 Q 117 80 115 80" 
            fill="none" 
            stroke="rgba(255,255,255,0.95)" 
            strokeWidth="0.5" 
          />

          {/* Portería con profundidad 3D en la parte inferior */}
          <g>
            {/* Fondo de la portería (profundidad) */}
            <rect 
              x="48" y="82" 
              width="24" height="2.5" 
              fill="rgba(255,255,255,0.12)" 
              stroke="rgba(255,255,255,0.85)" 
              strokeWidth="0.4" 
            />
            
            {/* Postes laterales con perspectiva */}
            <line 
              x1="48" y1="82" 
              x2="46.5" y2="84.5" 
              stroke="rgba(255,255,255,0.75)" 
              strokeWidth="0.4" 
            />
            <line 
              x1="72" y1="82" 
              x2="73.5" y2="84.5" 
              stroke="rgba(255,255,255,0.75)" 
              strokeWidth="0.4" 
            />
            
            {/* Travesaño superior */}
            <line 
              x1="46.5" y1="84.5" 
              x2="73.5" y2="84.5" 
              stroke="rgba(255,255,255,0.8)" 
              strokeWidth="0.5" 
            />
            
            {/* Red de la portería */}
            <rect 
              x="48" y="82" 
              width="24" height="2.5" 
              fill="url(#goalNet)" 
              opacity="0.7" 
            />
            
            {/* Líneas de profundidad de la red */}
            <line 
              x1="48" y1="84.5" 
              x2="46.5" y2="86.5" 
              stroke="rgba(255,255,255,0.6)" 
              strokeWidth="0.3" 
            />
            <line 
              x1="72" y1="84.5" 
              x2="73.5" y2="86.5" 
              stroke="rgba(255,255,255,0.6)" 
              strokeWidth="0.3" 
            />
            
            {/* Línea de la base */}
            <line 
              x1="46.5" y1="86.5" 
              x2="73.5" y2="86.5" 
              stroke="rgba(255,255,255,0.5)" 
              strokeWidth="0.3" 
            />

            {/* Postes verticales de la portería */}
            <rect 
              x="47.7" y="82" 
              width="0.6" height="2.5" 
              fill="rgba(255,255,255,0.9)" 
            />
            <rect 
              x="71.7" y="82" 
              width="0.6" height="2.5" 
              fill="rgba(255,255,255,0.9)" 
            />
          </g>

          {/* Detalles adicionales de textura del césped */}
          <g opacity="0.15">
            <rect x="0" y="0" width="120" height="85" fill="url(#grassStripes)" transform="rotate(90 60 42.5)" />
          </g>
        </svg>

        {/* Contenedor para dropzones */}
        <div className="absolute inset-0 z-20" style={{ pointerEvents: 'auto' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {children}
          </div>
        </div>

        {/* Viñeta y efectos de iluminación mejorados */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 90% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0.35) 100%)',
            mixBlendMode: 'multiply'
          }} 
        />
        
        {/* Brillo central (iluminación de estadio) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30" 
          style={{ 
            background: 'radial-gradient(ellipse 70% 40% at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }} 
        />
        
        {/* Sombra sutil en los bordes */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl" 
          style={{ 
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2), inset 0 2px 4px rgba(0,0,0,0.1)' 
          }} 
        />
      </div>
    </div>
  );
}

export default SoccerPitch;