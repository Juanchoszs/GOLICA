
import { Lineup } from './types';

export const LINEUPS: Lineup[] = [
  {
    id: '4-3-3',
    name: '4-3-3 Ofensivo',
    positions: [
      { id: 'gk', label: 'GK', role: 'keeper', x: 50, y: 88 },
      { id: 'lb', label: 'LB', role: 'defense', x: 15, y: 70 },
      { id: 'lcb', label: 'CB', role: 'defense', x: 38, y: 72 },
      { id: 'rcb', label: 'CB', role: 'defense', x: 62, y: 72 },
      { id: 'rb', label: 'RB', role: 'defense', x: 85, y: 70 },
      { id: 'cdm', label: 'CDM', role: 'midfield', x: 50, y: 55 },
      { id: 'lcm', label: 'CM', role: 'midfield', x: 30, y: 45 },
      { id: 'rcm', label: 'CM', role: 'midfield', x: 70, y: 45 },
      { id: 'lw', label: 'LW', role: 'forward', x: 15, y: 25 },
      { id: 'st', label: 'ST', role: 'forward', x: 50, y: 20 },
      { id: 'rw', label: 'RW', role: 'forward', x: 85, y: 25 },
    ],
  },
  {
    id: '4-4-2',
    name: '4-4-2 Clásico',
    positions: [
      { id: 'gk', label: 'GK', role: 'keeper', x: 50, y: 88 },
      { id: 'lb', label: 'LB', role: 'defense', x: 15, y: 70 },
      { id: 'lcb', label: 'CB', role: 'defense', x: 38, y: 72 },
      { id: 'rcb', label: 'CB', role: 'defense', x: 62, y: 72 },
      { id: 'rb', label: 'RB', role: 'defense', x: 85, y: 70 },
      { id: 'lm', label: 'LM', role: 'midfield', x: 15, y: 45 },
      { id: 'lcm', label: 'CM', role: 'midfield', x: 38, y: 45 },
      { id: 'rcm', label: 'CM', role: 'midfield', x: 62, y: 45 },
      { id: 'rm', label: 'RM', role: 'midfield', x: 85, y: 45 },
      { id: 'lst', label: 'ST', role: 'forward', x: 35, y: 20 },
      { id: 'rst', label: 'ST', role: 'forward', x: 65, y: 20 },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    positions: [
      { id: 'gk', label: 'GK', role: 'keeper', x: 50, y: 88 },
      { id: 'lb', label: 'LB', role: 'defense', x: 15, y: 70 },
      { id: 'lcb', label: 'CB', role: 'defense', x: 38, y: 72 },
      { id: 'rcb', label: 'CB', role: 'defense', x: 62, y: 72 },
      { id: 'rb', label: 'RB', role: 'defense', x: 85, y: 70 },
      { id: 'ldm', label: 'CDM', role: 'midfield', x: 35, y: 55 },
      { id: 'rdm', label: 'CDM', role: 'midfield', x: 65, y: 55 },
      { id: 'lam', label: 'LAM', role: 'midfield', x: 20, y: 35 },
      { id: 'cam', label: 'CAM', role: 'midfield', x: 50, y: 35 },
      { id: 'ram', label: 'RAM', role: 'midfield', x: 80, y: 35 },
      { id: 'st', label: 'ST', role: 'forward', x: 50, y: 15 },
    ],
  },
];
