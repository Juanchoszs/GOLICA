import { Lineup } from './types';

export const FORMATIONS: Lineup[] = [
  {
    id: '4-3-3',
    name: '4-3-3 (Ataque)',
    description: 'Formación ofensiva con extremos abiertos',
    positions: [
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      { id: 'lb', role: 'Defensa', label: 'LI', x: 15, y: 75 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 38, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 62, y: 78 },
      { id: 'rb', role: 'Defensa', label: 'LD', x: 85, y: 75 },
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 58 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 30, y: 48 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 70, y: 48 },
      { id: 'lw', role: 'Delantero', label: 'EI', x: 15, y: 25 },
      { id: 'st', role: 'Delantero', label: 'DC', x: 50, y: 20 },
      { id: 'rw', role: 'Delantero', label: 'ED', x: 85, y: 25 },
    ],
  },
  {
    id: '4-4-2',
    name: '4-4-2 (Clásico)',
    description: 'Formación equilibrada y versátil',
    positions: [
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      { id: 'lb', role: 'Defensa', label: 'LI', x: 15, y: 75 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 38, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 62, y: 78 },
      { id: 'rb', role: 'Defensa', label: 'LD', x: 85, y: 75 },
      { id: 'lm', role: 'Mediocampo', label: 'MI', x: 15, y: 52 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 38, y: 55 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 62, y: 55 },
      { id: 'rm', role: 'Mediocampo', label: 'MD', x: 85, y: 52 },
      { id: 'st1', role: 'Delantero', label: 'DC', x: 38, y: 22 },
      { id: 'st2', role: 'Delantero', label: 'DC', x: 62, y: 22 },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1 (Moderno)',
    description: 'Formación moderna con mediapunta',
    positions: [
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      { id: 'lb', role: 'Defensa', label: 'LI', x: 15, y: 75 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 38, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 62, y: 78 },
      { id: 'rb', role: 'Defensa', label: 'LD', x: 85, y: 75 },
      { id: 'cdm1', role: 'Mediocampo', label: 'MCD', x: 38, y: 60 },
      { id: 'cdm2', role: 'Mediocampo', label: 'MCD', x: 62, y: 60 },
      { id: 'lam', role: 'Mediocampo', label: 'MI', x: 15, y: 38 },
      { id: 'cam', role: 'Mediocampo', label: 'MP', x: 50, y: 40 },
      { id: 'ram', role: 'Mediocampo', label: 'MD', x: 85, y: 38 },
      { id: 'st', role: 'Delantero', label: 'DC', x: 50, y: 18 },
    ],
  },
  {
    id: '3-5-2',
    name: '3-5-2 (Control)',
    description: 'Dominio del mediocampo',
    positions: [
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 25, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 50, y: 80 },
      { id: 'cb3', role: 'Defensa', label: 'DFC', x: 75, y: 78 },
      { id: 'lwb', role: 'Mediocampo', label: 'CAI', x: 10, y: 60 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 32, y: 52 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 50, y: 55 },
      { id: 'cm3', role: 'Mediocampo', label: 'MC', x: 68, y: 52 },
      { id: 'rwb', role: 'Mediocampo', label: 'CAD', x: 90, y: 60 },
      { id: 'st1', role: 'Delantero', label: 'DC', x: 38, y: 22 },
      { id: 'st2', role: 'Delantero', label: 'DC', x: 62, y: 22 },
    ],
  },
  {
    id: '4-3-2-1',
    name: '4-3-2-1 (Árbol Navidad)',
    description: 'Formación compacta y defensiva',
    positions: [
      // Portero
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      
      // Defensa (4)
      { id: 'lb', role: 'Defensa', label: 'LI', x: 15, y: 75 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 38, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 62, y: 78 },
      { id: 'rb', role: 'Defensa', label: 'LD', x: 85, y: 75 },
      
      // Mediocampo (3)
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 60 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 32, y: 48 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 68, y: 48 },
      
      // Mediocampo ofensivo (2)
      { id: 'lam', role: 'Mediocampo', label: 'MI', x: 32, y: 32 },
      { id: 'ram', role: 'Mediocampo', label: 'MD', x: 68, y: 32 },
      
      // Delantero (1)
      { id: 'st', role: 'Delantero', label: 'DC', x: 50, y: 18 },
    ],
  },
  {
    id: '3-4-3',
    name: '3-4-3 (Ultra Ofensivo)',
    description: 'Máxima presión ofensiva',
    positions: [
      // Portero
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      
      // Defensa (3)
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 25, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 50, y: 80 },
      { id: 'cb3', role: 'Defensa', label: 'DFC', x: 75, y: 78 },
      
      // Mediocampo (4)
      { id: 'lm', role: 'Mediocampo', label: 'MI', x: 15, y: 55 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 38, y: 58 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 62, y: 58 },
      { id: 'rm', role: 'Mediocampo', label: 'MD', x: 85, y: 55 },
      
      // Delantera (3)
      { id: 'lw', role: 'Delantero', label: 'EI', x: 15, y: 25 },
      { id: 'st', role: 'Delantero', label: 'DC', x: 50, y: 20 },
      { id: 'rw', role: 'Delantero', label: 'ED', x: 85, y: 25 },
    ],
  },
  {
    id: '5-3-2',
    name: '5-3-2 (Defensivo)',
    description: 'Máxima solidez defensiva',
    positions: [
      // Portero
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      
      // Defensa (5)
      { id: 'lwb', role: 'Defensa', label: 'LI', x: 10, y: 72 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 28, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 50, y: 80 },
      { id: 'cb3', role: 'Defensa', label: 'DFC', x: 72, y: 78 },
      { id: 'rwb', role: 'Defensa', label: 'LD', x: 90, y: 72 },
      
      // Mediocampo (3)
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 30, y: 50 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 50, y: 52 },
      { id: 'cm3', role: 'Mediocampo', label: 'MC', x: 70, y: 50 },
      
      // Delantera (2)
      { id: 'st1', role: 'Delantero', label: 'DC', x: 38, y: 22 },
      { id: 'st2', role: 'Delantero', label: 'DC', x: 62, y: 22 },
    ],
  },
  {
    id: '4-1-2-1-2',
    name: '4-1-2-1-2 (Diamante)',
    description: 'Control central con enganche',
    positions: [
      // Portero
      { id: 'gk', role: 'Portero', label: 'POR', x: 50, y: 92 },
      
      // Defensa (4)
      { id: 'lb', role: 'Defensa', label: 'LI', x: 15, y: 75 },
      { id: 'cb1', role: 'Defensa', label: 'DFC', x: 38, y: 78 },
      { id: 'cb2', role: 'Defensa', label: 'DFC', x: 62, y: 78 },
      { id: 'rb', role: 'Defensa', label: 'LD', x: 85, y: 75 },
      
      // Mediocampo (4 - diamante)
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 62 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC', x: 30, y: 48 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC', x: 70, y: 48 },
      { id: 'cam', role: 'Mediocampo', label: 'MP', x: 50, y: 35 },
      
      // Delantera (2)
      { id: 'st1', role: 'Delantero', label: 'DC', x: 38, y: 18 },
      { id: 'st2', role: 'Delantero', label: 'DC', x: 62, y: 18 },
    ],
  },
];