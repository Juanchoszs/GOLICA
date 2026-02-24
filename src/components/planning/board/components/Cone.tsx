import React from 'react';
import { Group, Line, Ellipse } from 'react-konva';
import { BoardElement } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface ConeProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDelete: () => void;
}

export const Cone: React.FC<ConeProps> = ({ element, onDragEnd, onSelect, onDelete }) => {
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
      {/* Base shadow/ellipse */}
      <Ellipse
        x={0}
        y={10}
        radiusX={12}
        radiusY={4}
        fill={element.color || 'orange'}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.3}
        shadowOffset={{ x: 0, y: 2 }}
      />

      {/* Body of the cone */}
      <Line
        points={[-10, 10, 10, 10, 0, -15]}
        closed
        fill={element.color || 'orange'}
      />

      {/* White stripe */}
      <Line
        points={[-6, 0, 6, 0, 8, 4, -8, 4]}
        closed
        fill="white"
        opacity={0.8}
      />
    </Group>
  );
};
