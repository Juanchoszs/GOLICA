import { Lineup } from './types';

export const FORMATIONS: Lineup[] = [
  // ─────────────── 4-4-2 ───────────────
  {
    id: '4-4-2',
    name: '4-4-2 (Clásico)',
    description: 'Formación equilibrada y versátil',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'lm',  role: 'Mediocampo', label: 'MI',  x: 14, y: 54 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 38, y: 56 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 62, y: 56 },
      { id: 'rm',  role: 'Mediocampo', label: 'MD',  x: 86, y: 54 },
      { id: 'st1', role: 'Delantero',  label: 'DC',  x: 38, y: 23 },
      { id: 'st2', role: 'Delantero',  label: 'DC',  x: 62, y: 23 },
    ],
  },

  // ─────────────── 4-3-3 ───────────────
  {
    id: '4-3-3',
    name: '4-3-3 (Ataque)',
    description: 'Formación ofensiva con extremos abiertos',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 59 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 30, y: 50 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 70, y: 50 },
      { id: 'lw',  role: 'Delantero',  label: 'EI',  x: 14, y: 26 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 21 },
      { id: 'rw',  role: 'Delantero',  label: 'ED',  x: 86, y: 26 },
    ],
  },

  // ─────────────── 3-4-3 ───────────────
  {
    id: '3-4-3',
    name: '3-4-3 (Ultra Ofensivo)',
    description: 'Máxima presión ofensiva con tres delanteros',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 25, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 50, y: 81 },
      { id: 'cb3', role: 'Defensa',     label: 'DFC', x: 75, y: 79 },
      { id: 'lm',  role: 'Mediocampo', label: 'MI',  x: 14, y: 56 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 38, y: 58 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 62, y: 58 },
      { id: 'rm',  role: 'Mediocampo', label: 'MD',  x: 86, y: 56 },
      { id: 'lw',  role: 'Delantero',  label: 'EI',  x: 14, y: 26 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
      { id: 'rw',  role: 'Delantero',  label: 'ED',  x: 86, y: 26 },
    ],
  },

  // ─────────────── 4-2-3-1 ───────────────
  {
    id: '4-2-3-1',
    name: '4-2-3-1 (Moderno)',
    description: 'Doble pivote con mediapunta y un 9',
    positions: [
      { id: 'gk',   role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',   role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1',  role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2',  role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',   role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'cdm1', role: 'Mediocampo', label: 'MCD', x: 38, y: 62 },
      { id: 'cdm2', role: 'Mediocampo', label: 'MCD', x: 62, y: 62 },
      { id: 'lam',  role: 'Mediocampo', label: 'MI',  x: 14, y: 40 },
      { id: 'cam',  role: 'Mediocampo', label: 'MP',  x: 50, y: 41 },
      { id: 'ram',  role: 'Mediocampo', label: 'MD',  x: 86, y: 40 },
      { id: 'st',   role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
    ],
  },

  // ─────────────── 3-5-2 ───────────────
  {
    id: '3-5-2',
    name: '3-5-2 (Control)',
    description: 'Dominio total del mediocampo',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 25, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 50, y: 81 },
      { id: 'cb3', role: 'Defensa',     label: 'DFC', x: 75, y: 79 },
      { id: 'lwb', role: 'Mediocampo', label: 'CAI', x: 10, y: 60 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 32, y: 54 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 50, y: 56 },
      { id: 'cm3', role: 'Mediocampo', label: 'MC',  x: 68, y: 54 },
      { id: 'rwb', role: 'Mediocampo', label: 'CAD', x: 90, y: 60 },
      { id: 'st1', role: 'Delantero',  label: 'DC',  x: 38, y: 23 },
      { id: 'st2', role: 'Delantero',  label: 'DC',  x: 62, y: 23 },
    ],
  },

  // ─────────────── 5-3-2 ───────────────
  {
    id: '5-3-2',
    name: '5-3-2 (Defensivo)',
    description: 'Máxima solidez defensiva con 5 atrás',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lwb', role: 'Defensa',     label: 'LI',  x: 10, y: 73 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 28, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 50, y: 81 },
      { id: 'cb3', role: 'Defensa',     label: 'DFC', x: 72, y: 79 },
      { id: 'rwb', role: 'Defensa',     label: 'LD',  x: 90, y: 73 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 30, y: 52 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 50, y: 54 },
      { id: 'cm3', role: 'Mediocampo', label: 'MC',  x: 70, y: 52 },
      { id: 'st1', role: 'Delantero',  label: 'DC',  x: 38, y: 23 },
      { id: 'st2', role: 'Delantero',  label: 'DC',  x: 62, y: 23 },
    ],
  },

  // ─────────────── 4-3-2-1 ───────────────
  {
    id: '4-3-2-1',
    name: '4-3-2-1 (Árbol Navidad)',
    description: 'Formación compacta con dos engaches',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 62 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 32, y: 51 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 68, y: 51 },
      { id: 'lam', role: 'Mediocampo', label: 'MI',  x: 32, y: 35 },
      { id: 'ram', role: 'Mediocampo', label: 'MD',  x: 68, y: 35 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
    ],
  },

  // ─────────────── 4-1-2-1-2 (Diamante) ───────────────
  {
    id: '4-1-2-1-2',
    name: '4-1-2-1-2 (Diamante)',
    description: 'Control central con enganche y doble punta',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'cdm', role: 'Mediocampo', label: 'MCD', x: 50, y: 64 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 30, y: 50 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 70, y: 50 },
      { id: 'cam', role: 'Mediocampo', label: 'MP',  x: 50, y: 36 },
      { id: 'st1', role: 'Delantero',  label: 'DC',  x: 36, y: 20 },
      { id: 'st2', role: 'Delantero',  label: 'DC',  x: 64, y: 20 },
    ],
  },

  // ─────────────── 4-5-1 ───────────────
  {
    id: '4-5-1',
    name: '4-5-1 (Sólido)',
    description: 'Mediocampo amplio con un solo delantero',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'lm',  role: 'Mediocampo', label: 'MI',  x: 10, y: 54 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 30, y: 58 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 50, y: 60 },
      { id: 'cm3', role: 'Mediocampo', label: 'MC',  x: 70, y: 58 },
      { id: 'rm',  role: 'Mediocampo', label: 'MD',  x: 90, y: 54 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
    ],
  },

  // ─────────────── 3-4-1-2 ───────────────
  {
    id: '3-4-1-2',
    name: '3-4-1-2 (Enganche)',
    description: 'Tres defensores, mediapunta y doble punta',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 25, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 50, y: 81 },
      { id: 'cb3', role: 'Defensa',     label: 'DFC', x: 75, y: 79 },
      { id: 'lwb', role: 'Mediocampo', label: 'CAI', x: 12, y: 60 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 35, y: 57 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 65, y: 57 },
      { id: 'rwb', role: 'Mediocampo', label: 'CAD', x: 88, y: 60 },
      { id: 'cam', role: 'Mediocampo', label: 'MP',  x: 50, y: 38 },
      { id: 'st1', role: 'Delantero',  label: 'DC',  x: 36, y: 22 },
      { id: 'st2', role: 'Delantero',  label: 'DC',  x: 64, y: 22 },
    ],
  },

  // ─────────────── 4-4-1-1 ───────────────
  {
    id: '4-4-1-1',
    name: '4-4-1-1 (Mediapunta)',
    description: 'Mediapunta detrás de un 9 referencia',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lb',  role: 'Defensa',     label: 'LI',  x: 14, y: 76 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 38, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 62, y: 79 },
      { id: 'rb',  role: 'Defensa',     label: 'LD',  x: 86, y: 76 },
      { id: 'lm',  role: 'Mediocampo', label: 'MI',  x: 14, y: 55 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 38, y: 58 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 62, y: 58 },
      { id: 'rm',  role: 'Mediocampo', label: 'MD',  x: 86, y: 55 },
      { id: 'cam', role: 'Mediocampo', label: 'MP',  x: 50, y: 36 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
    ],
  },

  // ─────────────── 5-4-1 ───────────────
  {
    id: '5-4-1',
    name: '5-4-1 (Ultra Defensivo)',
    description: 'Máxima solidez, cinco atrás y cuatro medios',
    positions: [
      { id: 'gk',  role: 'Portero',     label: 'POR', x: 50, y: 92 },
      { id: 'lwb', role: 'Defensa',     label: 'LI',  x: 10, y: 73 },
      { id: 'cb1', role: 'Defensa',     label: 'DFC', x: 28, y: 79 },
      { id: 'cb2', role: 'Defensa',     label: 'DFC', x: 50, y: 81 },
      { id: 'cb3', role: 'Defensa',     label: 'DFC', x: 72, y: 79 },
      { id: 'rwb', role: 'Defensa',     label: 'LD',  x: 90, y: 73 },
      { id: 'lm',  role: 'Mediocampo', label: 'MI',  x: 14, y: 53 },
      { id: 'cm1', role: 'Mediocampo', label: 'MC',  x: 38, y: 55 },
      { id: 'cm2', role: 'Mediocampo', label: 'MC',  x: 62, y: 55 },
      { id: 'rm',  role: 'Mediocampo', label: 'MD',  x: 86, y: 53 },
      { id: 'st',  role: 'Delantero',  label: 'DC',  x: 50, y: 20 },
    ],
  },
];