// Clases de tema reutilizables para mantener consistencia

export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-background',
  bgGradientDark: 'light:bg-gradient-to-b light:from-white light:via-green-50 light:to-white bg-gradient-to-b from-black via-zinc-950 to-black',
  bgCard: 'light:bg-white/80 light:border-green-600/20 bg-gradient-to-b from-green-950/20 to-transparent border-green-900/30',
  bgCardAlt: 'light:bg-green-50/50 light:border-green-600/30 bg-gradient-to-b from-green-950/30 to-transparent border-green-900/30',
  
  // Text colors
  textPrimary: 'text-foreground',
  textSecondary: 'light:text-gray-600 text-gray-400',
  textAccent: 'light:text-green-600 text-green-400',
  textTitle: 'light:text-gray-900 text-white',
  
  // Borders
  borderPrimary: 'light:border-green-600/20 border-green-900/30',
  borderAccent: 'light:border-green-600/40 border-green-600/30',
  
  // Buttons
  btnPrimary: 'bg-green-600 hover:bg-green-700 text-white',
  btnOutline: 'light:border-green-600 light:text-green-600 light:hover:bg-green-50 border-green-600 text-green-400 hover:bg-green-600/10',
  
  // Gradients
  gradientOverlay: 'light:bg-gradient-to-t light:from-white/90 light:via-white/60 bg-gradient-to-t from-black/80 to-transparent',
  gradientRadial: 'light:bg-gradient-radial light:from-green-100/40 bg-gradient-radial from-green-900/20 to-transparent',
  
  // Hover states
  hoverCard: 'light:hover:border-green-600/50 hover:border-green-600/50 transition-colors',
  hoverScale: 'transition-all hover:transform hover:scale-105',
  
  // Shadows
  shadowGreen: 'shadow-lg shadow-green-500/30',
};

// Función helper para combinar clases
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
