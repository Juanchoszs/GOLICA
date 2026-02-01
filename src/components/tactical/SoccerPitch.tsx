import React from 'react';

type SoccerPitchProps = {
  children?: React.ReactNode;
  className?: string;
  mode?: 'half' | 'full';
};

// Use an SVG pitch for crisp lines, scalable and responsive. Default to half pitch.
export function SoccerPitch({ children, className = '', mode = 'half' }: SoccerPitchProps) {
  // SVG viewBox represents full pitch; we can clip to half when needed via viewBox or mask.
  const viewBox = '0 0 120 80'; // width x height (ratio 3:2) — common pitch proportions

  // If mode is 'half', we'll show top half (attacking) by translating children positioning accordingly.
  return (
    <div className={`w-full max-w-[900px] mx-auto aspect-[3/2] ${className}`}>
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="w-full h-full block bg-emerald-700">
          <defs>
            <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2f8a4b" />
              <stop offset="100%" stopColor="#25703a" />
            </linearGradient>
            <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="rgba(255,255,255,0.02)" />
              <rect width="6" height="3" fill="rgba(255,255,255,0.03)" />
            </pattern>
          </defs>

          {/* Base grass */}
          <rect x="0" y="0" width="120" height="80" fill="url(#grass)" />
          <rect x="0" y="0" width="120" height="80" fill="url(#stripes)" opacity="0.18" />

          {/* Pitch boundaries */}
          <rect x="4" y="4" width="112" height="72" fill="none" stroke="white" strokeWidth="0.8" rx="2" />

          {/* Halfway line and circle (we'll show half circle if mode=half by clipping) */}
          <line x1="60" y1="4" x2="60" y2="76" stroke="white" strokeWidth="0.6" />
          <circle cx="60" cy="40" r="10" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="60" cy="40" r="0.6" fill="white" />

          {/* Penalty areas (top and bottom) */}
          <rect x="10" y="4" width="100" height="16" fill="none" stroke="white" strokeWidth="0.6" />
          <rect x="26" y="4" width="68" height="6" fill="none" stroke="white" strokeWidth="0.6" />
          <rect x="10" y="60" width="100" height="16" fill="none" stroke="white" strokeWidth="0.6" />
          <rect x="26" y="70" width="68" height="6" fill="none" stroke="white" strokeWidth="0.6" />

          {/* Penalty spots */}
          <circle cx="60" cy="16" r="0.5" fill="white" />
          <circle cx="60" cy="64" r="0.5" fill="white" />

          {/* Goals */}
          <rect x="52" y="76" width="16" height="2" fill="white" />
          <rect x="52" y="2" width="16" height="2" fill="white" />
        </svg>

        {/* Overlay container for dropzones: use an HTML absolute container so children
            keep normal CSS sizing (prevents SVG scaling of fonts and elements). */}
        <div className="absolute inset-0 z-20" style={{ pointerEvents: 'auto' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {children}
          </div>
        </div>

        {/* soft vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.25)' }} />
      </div>
    </div>
  );
}

export default SoccerPitch;
