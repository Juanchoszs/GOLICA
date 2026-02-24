import React from 'react';
import { Group, Line, Rect } from 'react-konva';
import { BoardElement } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface CoordinationLadderProps {
  element: BoardElement;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onDelete: () => void;
}

export const CoordinationLadder: React.FC<CoordinationLadderProps> = ({
  element,
  onDragEnd,
  onSelect,
  onDelete,
}) => {
  const rungs = 7;
  const rungHeight = 12;
  const spacing = 18;
  const railWidth = 3;

  const longPressProps = useLongPress(() => onDelete?.());

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      rotation={element.rotation || 0}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      {...longPressProps}
    >
      {/* Shadow */}
      <Rect
        x={-2}
        y={-rungHeight * rungs / 2}
        width={spacing + railWidth + 2}
        height={rungHeight * rungs}
        fill="black"
        opacity={0.2}
        offsetX={-3}
        offsetY={3}
        cornerRadius={2}
      />

      {/* Left rail (Yellow/Orange fabric) */}
      <Rect
        x={-railWidth / 2}
        y={-rungHeight * rungs / 2}
        width={railWidth}
        height={rungHeight * rungs}
        fill={element.color || '#eab308'} // realistic yellow/orange
        cornerRadius={1}
      />

      {/* Right rail (Yellow/Orange fabric) */}
      <Rect
        x={spacing - railWidth / 2}
        y={-rungHeight * rungs / 2}
        width={railWidth}
        height={rungHeight * rungs}
        fill={element.color || '#eab308'}
        cornerRadius={1}
      />

      {/* Rungs (Black plastic) */}
      {Array.from({ length: rungs }).map((_, i) => {
        const y = -rungHeight * rungs / 2 + i * rungHeight;
        return (
          <Rect
            key={`rung_${i}`}
            x={0}
            y={y}
            width={spacing}
            height={3}
            fill="#1f2937" // dark gray/black realistic rung
            cornerRadius={1}
          />
        );
      })}
    </Group>
  );
};
