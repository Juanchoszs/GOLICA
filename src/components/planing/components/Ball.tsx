import React from 'react';
import { Group, Circle, Line } from 'react-konva';
import { BoardElement } from '../types/board.types';

interface BallProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const Ball: React.FC<BallProps> = ({ element, onDragEnd, onSelect, onDoubleClick }) => {
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
      {/* Ball sphere */}
      <Circle
        radius={8}
        fill={element.color || '#ffffff'}
        stroke="black"
        strokeWidth={1}
        shadowBlur={4}
        shadowOpacity={0.4}
      />

      {/* Ball pattern - curved lines */}
      <Line
        points={[-5, 0, 5, 0]}
        stroke="black"
        strokeWidth={0.5}
      />
      <Line
        points={[0, -5, 0, 5]}
        stroke="black"
        strokeWidth={0.5}
      />
      <Line
        points={[-3, -3, 3, 3]}
        stroke="black"
        strokeWidth={0.5}
      />
      <Line
        points={[-3, 3, 3, -3]}
        stroke="black"
        strokeWidth={0.5}
      />
    </Group>
  );
};
