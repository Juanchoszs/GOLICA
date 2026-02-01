import { Lineup } from './types';

// Formations defined as data-only structures for the tactical board.
export const FORMATIONS: Lineup[] = [
  {
    id: '4-3-3',
    name: '4-3-3 Ofensivo',
    positions: [
      { id: '433_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '433_LB', label: 'LB', role: 'Defensa', x: 15, y: 78 },
      { id: '433_LCB', label: 'CB', role: 'Defensa', x: 38, y: 82 },
      { id: '433_RCB', label: 'CB', role: 'Defensa', x: 62, y: 82 },
      { id: '433_RB', label: 'RB', role: 'Defensa', x: 85, y: 78 },
      { id: '433_CDM', label: 'CDM', role: 'Medio', x: 50, y: 65 },
      { id: '433_LCM', label: 'CM', role: 'Medio', x: 30, y: 52 },
      { id: '433_RCM', label: 'CM', role: 'Medio', x: 70, y: 52 },
      { id: '433_LW', label: 'LW', role: 'Delantero', x: 20, y: 25 },
      { id: '433_ST', label: 'ST', role: 'Delantero', x: 50, y: 18 },
      { id: '433_RW', label: 'RW', role: 'Delantero', x: 80, y: 25 },
    ],
  },
  {
    id: '4-4-2',
    name: '4-4-2 Clásico',
    positions: [
      { id: '442_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '442_LB', label: 'LB', role: 'Defensa', x: 15, y: 78 },
      { id: '442_LCB', label: 'CB', role: 'Defensa', x: 38, y: 82 },
      { id: '442_RCB', label: 'CB', role: 'Defensa', x: 62, y: 82 },
      { id: '442_RB', label: 'RB', role: 'Defensa', x: 85, y: 78 },
      { id: '442_LM', label: 'LM', role: 'Medio', x: 15, y: 56 },
      { id: '442_LCM', label: 'CM', role: 'Medio', x: 38, y: 58 },
      { id: '442_RCM', label: 'CM', role: 'Medio', x: 62, y: 58 },
      { id: '442_RM', label: 'RM', role: 'Medio', x: 85, y: 56 },
      { id: '442_LST', label: 'ST', role: 'Delantero', x: 35, y: 25 },
      { id: '442_RST', label: 'ST', role: 'Delantero', x: 65, y: 25 },
    ],
  },
  {
    id: '3-5-2',
    name: '3-5-2 Balanceado',
    positions: [
      { id: '352_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '352_LCB', label: 'CB', role: 'Defensa', x: 30, y: 82 },
      { id: '352_CB', label: 'CB', role: 'Defensa', x: 50, y: 85 },
      { id: '352_RCB', label: 'CB', role: 'Defensa', x: 70, y: 82 },
      { id: '352_LM', label: 'LM', role: 'Medio', x: 10, y: 50 },
      { id: '352_LDM', label: 'CDM', role: 'Medio', x: 35, y: 65 },
      { id: '352_CAM', label: 'CAM', role: 'Medio', x: 50, y: 35 },
      { id: '352_RDM', label: 'CDM', role: 'Medio', x: 65, y: 65 },
      { id: '352_RM', label: 'RM', role: 'Medio', x: 90, y: 50 },
      { id: '352_LST', label: 'ST', role: 'Delantero', x: 35, y: 18 },
      { id: '352_RST', label: 'ST', role: 'Delantero', x: 65, y: 18 },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1 Moderno',
    positions: [
      { id: '4231_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '4231_LB', label: 'LB', role: 'Defensa', x: 15, y: 78 },
      { id: '4231_LCB', label: 'CB', role: 'Defensa', x: 38, y: 82 },
      { id: '4231_RCB', label: 'CB', role: 'Defensa', x: 62, y: 82 },
      { id: '4231_RB', label: 'RB', role: 'Defensa', x: 85, y: 78 },
      { id: '4231_LDM', label: 'CDM', role: 'Medio', x: 35, y: 65 },
      { id: '4231_RDM', label: 'CDM', role: 'Medio', x: 65, y: 65 },
      { id: '4231_LW', label: 'LW', role: 'Medio', x: 20, y: 40 },
      { id: '4231_CAM', label: 'CAM', role: 'Medio', x: 50, y: 35 },
      { id: '4231_RW', label: 'RW', role: 'Medio', x: 80, y: 40 },
      { id: '4231_ST', label: 'ST', role: 'Delantero', x: 50, y: 15 },
    ],
  },
  {
    id: '4-1-4-1',
    name: '4-1-4-1 Defensivo',
    positions: [
      { id: '4141_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '4141_LB', label: 'LB', role: 'Defensa', x: 12, y: 78 },
      { id: '4141_LCB', label: 'CB', role: 'Defensa', x: 35, y: 82 },
      { id: '4141_RCB', label: 'CB', role: 'Defensa', x: 65, y: 82 },
      { id: '4141_RB', label: 'RB', role: 'Defensa', x: 88, y: 78 },
      { id: '4141_CDM', label: 'CDM', role: 'Medio', x: 50, y: 68 },
      { id: '4141_LCM', label: 'CM', role: 'Medio', x: 25, y: 52 },
      { id: '4141_RCM', label: 'CM', role: 'Medio', x: 75, y: 52 },
      { id: '4141_LW', label: 'LW', role: 'Delantero', x: 20, y: 30 },
      { id: '4141_ST', label: 'ST', role: 'Delantero', x: 50, y: 18 },
      { id: '4141_RW', label: 'RW', role: 'Delantero', x: 80, y: 30 },
    ],
  },
  {
    id: '5-3-2',
    name: '5-3-2 Táctico',
    positions: [
      { id: '532_GK', label: 'GK', role: 'Portero', x: 50, y: 92 },
      { id: '532_LWB', label: 'LWB', role: 'Defensa', x: 8, y: 78 },
      { id: '532_LCB', label: 'CB', role: 'Defensa', x: 30, y: 82 },
      { id: '532_CB', label: 'CB', role: 'Defensa', x: 50, y: 84 },
      { id: '532_RCB', label: 'CB', role: 'Defensa', x: 70, y: 82 },
      { id: '532_RWB', label: 'RWB', role: 'Defensa', x: 92, y: 78 },
      { id: '532_LCM', label: 'CM', role: 'Medio', x: 35, y: 58 },
      { id: '532_CM', label: 'CM', role: 'Medio', x: 50, y: 52 },
      { id: '532_RCM', label: 'CM', role: 'Medio', x: 65, y: 58 },
      { id: '532_LST', label: 'ST', role: 'Delantero', x: 38, y: 20 },
      { id: '532_RST', label: 'ST', role: 'Delantero', x: 62, y: 20 },
    ],
  },
];

// Provide legacy export name `LINEUPS` to remain compatible with any leftover imports
export const LINEUPS = FORMATIONS;

export default FORMATIONS;
