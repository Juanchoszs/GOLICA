import React from 'react';
import { Position, Player } from './types';
import { DropZone } from './DropZone';

interface LineupSlotsProps {
  positions: Position[];
  assignments: Record<string, string>;
  getPlayer: (id: string) => Player | undefined;
}

export function LineupSlots({ positions, assignments, getPlayer }: LineupSlotsProps) {
  return (
    <>
      {positions.map((pos) => {
        const assignedPlayerId = assignments[pos.id];
        const assignedPlayer = assignedPlayerId ? getPlayer(assignedPlayerId) : null;
        
        return (
          <DropZone 
            key={pos.id} 
            position={pos} 
            assignedPlayer={assignedPlayer || null} 
          />
        );
      })}
    </>
  );
}

export default LineupSlots;