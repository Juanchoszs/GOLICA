import React from 'react';
import { Group, Line, Circle } from 'react-konva';
import { BoardElement } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface StakeProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDelete: () => void;
}

export const Stake: React.FC<StakeProps> = ({ element, onDragEnd, onSelect, onDelete }) => {
  const longPressProps = useLongPress(() => onDelete?.());

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      {...longPressProps}
    >
      {/* Stake pole */}
      <Line
        points={[0, -15, 0, 15]}
        stroke={element.color || '#f59e0b'}
        strokeWidth={3}
        lineCap="round"
      />
      {/* Top marker */}
      <Circle
        x={0}
        y={-15}
        radius={5}
        fill={element.color || '#f59e0b'}
        stroke="white"
        strokeWidth={1}
      />
      {/* Base */}
      <Circle
        x={0}
        y={15}
        radius={4}
        fill={element.color || '#f59e0b'}
      />
    </Group>
  );
};
