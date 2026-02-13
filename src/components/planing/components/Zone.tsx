import React, { useEffect, useRef } from 'react';
import { Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { BoardElement } from '../types/board.types';
import type { TransformEventData } from '../types/board.types';

interface ZoneProps {
  element: BoardElement;
  isSelected: boolean;
  onDragEnd: (e: any) => void;
  onSelect: () => void;
  onTransformEnd: (data: TransformEventData) => void;
}

export const Zone: React.FC<ZoneProps> = ({ 
  element, 
  isSelected, 
  onDragEnd, 
  onSelect, 
  onTransformEnd 
}) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = (e: any) => {
    const node = e.target as Konva.Rect;
    onTransformEnd({
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation()
    });
  };

  return (
    <React.Fragment>
      <Rect
        x={element.x}
        y={element.y}
        width={100 * (element.scaleX || 1)}
        height={100 * (element.scaleY || 1)}
        rotation={element.rotation || 0}
        fill={element.color || 'rgba(0, 255, 0, 0.2)'}
        stroke="green"
        strokeWidth={2}
        dash={[5, 5]}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};
