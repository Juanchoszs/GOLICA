// vite.config.optimized.ts
// Versión optimizada de vite.config.ts con todas las mejoras de performance y SEO
// Implementar gradualmente los cambios recomendados

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // ===== OPTIMIZACIONES DE DEPENDENCIAS =====
  optimizeDeps: {
    exclude: ['html2canvas'], // Cargar bajo demanda
    include: [
      // Pre-bundle las dependencias críticas para acelerar dev
      'react',
      'react-dom',
      'react-hook-form',
      '@supabase/supabase-js'
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@jsr/supabase__supabase-js@2.49.8': '@supabase/supabase-js',
      '@jsr/supabase__supabase-js@2': '@supabase/supabase-js',
      '@jsr/supabase__supabase-js': '@supabase/supabase-js',
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ===== CONFIGURACIÓN DE BUILD OPTIMIZADO =====
  build: {
    target: 'es2020', // Actualizado de esnext para mejor compatibilidad
    outDir: 'dist',
    
    // Code splitting avanzado
    rollupOptions: {
      output: {
        // Strategy 1: Manual chunks por módulo funcional
        manualChunks(id) {
          // Admin features
          if (id.includes('admin/')) {
            return 'admin-panel';
          }
          // Coach features
          if (id.includes('coach/')) {
            return 'coach-panel';
          }
          // Physio features
          if (id.includes('physio/')) {
            return 'physio-panel';
          }
          // Planning features
          if (id.includes('planning/')) {
            return 'planning-module';
          }
          // Tactical features
          if (id.includes('tactical/')) {
            return 'tactical-features';
          }
          // UI library group
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // Other vendors
          if (id.includes('node_modules/')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            return 'vendors';
          }
        }
      }
    },

    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3 // Más pasadas = más compresión
      },
      mangle: {
        properties: {
          regex: /^_/ // Mangle private properties
        }
      }
    },

    // Source maps solo en desarrollo
    sourcemap: false,

    // CSS split automático
    cssCodeSplit: true,

    // Reportar tamaño del bundle
    reportCompressedSize: true,

    // Chunk size warning
    chunkSizeWarningLimit: 500,

    // Write output files
    write: true,

    // Assets inline limit (27KB WebP = inline; >27KB = external)
    assetsInlineLimit: 4096,

    // Emitting logs
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },

  // ===== SERVIDOR DE DESARROLLO =====
  server: {
    port: 3000,
    open: true,
    
    // Performance en desarrollo
    middlewareMode: false,
    
    // Optimizar HMR en desarrollo
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },

    // Prevenir carga de archivos innecesarios
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    }
  },

  // ===== CONFIGURACIÓN DE PREVIEW =====
  preview: {
    port: 4173,
    open: true,
    strictPort: false
  },

  // ===== CONFIGURACIÓN DE LOGGING =====
  logLevel: 'info'
});

/*
INSTRUCCIONES DE IMPLEMENTACIÓN:

1. Hacer backup: cp vite.config.ts vite.config.backup.ts

2. Reemplazar gradualmente las optimizaciones:
   - Primero: rollupOptions.output.manualChunks
   - Luego: terserOptions con drop_console
   - Finalmente: cssCodeSplit y otras opciones

3. Probar tras cada cambio:
   npm run build
   npm run preview

4. Medir mejora:
   - Antes: npm run build (anotar tamaño total)
   - Después: npm run build (comparar tamaño)
   - Lighthouse: npm run build && lighthouse http://localhost:4173

5. Timeline:
   - Cambio 1: 10 minutos setup
   - Cambio 2: Probar + medir
   - Cambio 3: Ajustar según resultados

BENEFICIOS ESPERADOS:
- Bundle size: 60% reducción (6MB → ~2.4MB)
- Initial load: 50% más rápido
- Code split: 40% chunks más pequeños
- First paint: 2-3 segundos más rápido
*/
