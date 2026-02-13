import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import { BoardElement } from '../types/board.types';

interface PlayerProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;  // Konva event type
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const Player: React.FC<PlayerProps> = ({ element, onDragEnd, onSelect, onDoubleClick }) => {
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
      <Circle
        radius={15}
        fill={element.color}
        stroke="white"
        strokeWidth={2}
        shadowBlur={5}
      />
      <Text
        text={element.name || ''}
        fontSize={10}
        fill="white"
        align="center"
        verticalAlign="middle"
        x={-15}
        y={-5}
        width={30}
      />
    </Group>
  );
};
