import React, { useEffect, useRef } from 'react';
import { Group, Line, Circle, Transformer } from 'react-konva';
import type Konva from 'konva';
import { BoardElement } from '../types/board.types';
import type { TransformEventData } from '../types/board.types';
import { useLongPress } from '../hooks/useLongPress';

interface MiniGoalProps {
  element: BoardElement;
  isSelected?: boolean;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onTransformEnd?: (data: TransformEventData) => void;
  onDoubleClick: () => void;
  onDelete: () => void;
}

export const MiniGoal: React.FC<MiniGoalProps> = ({
  element,
  isSelected,
  onDragEnd,
  onSelect,
  onTransformEnd,
  onDoubleClick,
  onDelete
}) => {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const longPressProps = useLongPress(() => onDelete?.());

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = (e: any) => {
    const node = shapeRef.current;
    if (node && onTransformEnd) {
      onTransformEnd({
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation()
      });
    }
  };

  return (
    <React.Fragment>
      <Group
        ref={shapeRef}
        x={element.x}
        y={element.y}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        rotation={element.rotation || 0}
        draggable
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDoubleClick}
        onDoubleClick={onDoubleClick}
        onTransformEnd={handleTransformEnd}
        {...longPressProps}
      >
        {/* Net area */}
        <Line
          points={[-20, 0, -16, -16, 16, -16, 20, 0]}
          stroke="white"
          strokeWidth={2}
          fill="rgba(255,255,255,0.2)"
          closed
          dash={[4, 2]}
        />

        {/* Crossbar */}
        <Line
          points={[-20, 0, 20, 0]}
          stroke="white"
          strokeWidth={4}
          strokeLineCap="square"
          shadowColor="black"
          shadowBlur={4}
          shadowOpacity={0.3}
          shadowOffset={{ x: 0, y: 2 }}
        />

        {/* Posts */}
        <Circle x={-20} y={0} radius={3} fill="white" stroke="black" strokeWidth={1} />
        <Circle x={20} y={0} radius={3} fill="white" stroke="black" strokeWidth={1} />
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};
