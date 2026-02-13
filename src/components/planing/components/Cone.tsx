import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { BoardElement } from '../types/board.types';

interface ConeProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;  // Konva event type
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const Cone: React.FC<ConeProps> = ({ element, onDragEnd, onSelect, onDoubleClick }) => {
  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Visual representation of a cone (triangle shape) */}
      <Line
        points={[-10, 10, 10, 10, 0, -10]}
        closed
        fill={element.color || 'orange'}
        stroke="white"
        strokeWidth={1}
      />
      <Rect
        x={-12}
        y={10}
        width={24}
        height={4}
        fill={element.color || 'orange'}
        stroke="white"
        strokeWidth={1}
      />
    </Group>
  );
};
