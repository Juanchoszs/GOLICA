import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import { BoardElement } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface PlayerProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;  // Konva event type
  onSelect: () => void;
  onDelete: () => void;
}

export const Player: React.FC<PlayerProps> = ({ element, onDragEnd, onSelect, onDelete }) => {
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
