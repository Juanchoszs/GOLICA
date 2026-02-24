import React from 'react';
import { Group, Circle, Arc } from 'react-konva';
import { BoardElement } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface BallProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDelete: () => void;
}

export const Ball: React.FC<BallProps> = ({ element, onDragEnd, onSelect, onDelete }) => {
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
      {/* Outer shadow */}
      <Circle
        radius={10}
        fill="black"
        opacity={0.3}
        offsetX={-3}
        offsetY={-3}
      />

      {/* Ball base */}
      <Circle
        radius={10}
        fill={element.color || '#ffffff'}
        stroke="black"
        strokeWidth={1}
      />

      {/* Soccer ball pattern (simplified realistic polygon illusion) */}
      <Circle x={0} y={0} radius={3.5} fill="#1a1a1a" />
      <Arc x={0} y={0} innerRadius={8} outerRadius={10} angle={60} rotation={-30} fill="#1a1a1a" />
      <Arc x={0} y={0} innerRadius={8} outerRadius={10} angle={60} rotation={90} fill="#1a1a1a" />
      <Arc x={0} y={0} innerRadius={8} outerRadius={10} angle={60} rotation={210} fill="#1a1a1a" />

      {/* Lines connecting center pentagon to outer dark edges */}
      <Arc x={0} y={0} innerRadius={3.5} outerRadius={8} angle={2} rotation={-31} fill="#1a1a1a" />
      <Arc x={0} y={0} innerRadius={3.5} outerRadius={8} angle={2} rotation={89} fill="#1a1a1a" />
      <Arc x={0} y={0} innerRadius={3.5} outerRadius={8} angle={2} rotation={209} fill="#1a1a1a" />

      {/* 3D Highlight for depth */}
      <Arc x={-3} y={-3} innerRadius={0} outerRadius={8} angle={120} rotation={120} fill="white" opacity={0.3} />
    </Group>
  );
};
