import React from 'react';
import { Group, Line, Rect } from 'react-konva';
import { BoardElement } from '../types/board.types';

interface CoordinationLadderProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const CoordinationLadder: React.FC<CoordinationLadderProps> = ({
  element,
  onDragEnd,
  onSelect,
  onDoubleClick,
}) => {
  const rungs = 6; // Number of ladder rungs
  const rungHeight = 8;
  const spacing = 15;

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      rotation={element.rotation || 0}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Left rail */}
      <Line
        points={[0, -rungHeight * rungs / 2, 0, rungHeight * rungs / 2]}
        stroke={element.color || '#ec4899'}
        strokeWidth={2}
      />

      {/* Right rail */}
      <Line
        points={[spacing, -rungHeight * rungs / 2, spacing, rungHeight * rungs / 2]}
        stroke={element.color || '#ec4899'}
        strokeWidth={2}
      />

      {/* Rungs */}
      {Array.from({ length: rungs }).map((_, i) => {
        const y = -rungHeight * rungs / 2 + i * rungHeight;
        return (
          <Line
            key={`rung_${i}`}
            points={[0, y, spacing, y]}
            stroke={element.color || '#ec4899'}
            strokeWidth={2}
          />
        );
      })}
    </Group>
  );
};
