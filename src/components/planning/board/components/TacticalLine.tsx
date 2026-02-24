import React from 'react';
import { Line, Arrow } from 'react-konva';
import { TacticalLine as ITacticalLine } from '../types/board.types';

interface TacticalLineProps {
  line: ITacticalLine;
}

export const TacticalLine: React.FC<TacticalLineProps> = ({ line }) => {
  const isArrow = line.type === 'pass' || line.type === 'movement';
  
  if (isArrow) {
    return (
      <Arrow
        id={line.id}
        points={line.points}
        stroke={line.color}
        fill={line.color}
        strokeWidth={3}
        dash={line.dash}
        pointerLength={10}
        pointerWidth={10}
      />
    );
  }

  return (
    <Line
      id={line.id}
      points={line.points}
      stroke={line.color}
      strokeWidth={3}
      dash={line.dash}
      lineCap="round"
      lineJoin="round"
    />
  );
};
