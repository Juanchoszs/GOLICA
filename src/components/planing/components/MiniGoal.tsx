import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { BoardElement } from '../types/board.types';

interface MiniGoalProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;  // Konva event type
  onSelect: () => void;
  onDoubleClick: () => void;
}

export const MiniGoal: React.FC<MiniGoalProps> = ({ element, onDragEnd, onSelect, onDoubleClick }) => {
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
      rotation={element.rotation || 0}
    >
      {/* Front posts */}
      <Rect
        x={-2.5}
        y={-20}
        width={5}
        height={40}
        fill="white"
        stroke="black"
        strokeWidth={1}
      />
      {/* Net structure (back) */}
      <Line
        points={[0, -20, 15, -15, 15, 15, 0, 20]}
        stroke="white"
        strokeWidth={2}
        fill="rgba(255,255,255,0.2)"
        closed
      />
    </Group>
  );
};
