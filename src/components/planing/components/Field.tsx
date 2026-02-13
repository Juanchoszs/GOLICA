import React from 'react';
import { Group, Rect, Line, Circle, Arc } from 'react-konva';

interface FieldProps {
  width: number;
  height: number;
}

const LINE_COLOR = 'white';
const LINE_WIDTH = 2;
const PADDING = 20;
const GRASS_COLOR = '#2d5a27';

export const Field: React.FC<FieldProps> = ({ width, height }) => {
  const fieldW = width - PADDING * 2;
  const fieldH = height - PADDING * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <Group>
      {/* Grass */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={GRASS_COLOR}
      />
      
      {/* Outer Boundary */}
      <Rect
        x={PADDING}
        y={PADDING}
        width={fieldW}
        height={fieldH}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Center Line */}
      <Line
        points={[centerX, PADDING, centerX, height - PADDING]}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Center Circle */}
      <Circle
        x={centerX}
        y={centerY}
        radius={fieldH * 0.15}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      <Circle
        x={centerX}
        y={centerY}
        radius={2}
        fill={LINE_COLOR}
      />

      {/* Penalty Areas */}
      {/* Left */}
      <Rect
        x={PADDING}
        y={centerY - fieldH * 0.25}
        width={fieldW * 0.15}
        height={fieldH * 0.5}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      {/* Goal Area Left */}
      <Rect
        x={PADDING}
        y={centerY - fieldH * 0.1}
        width={fieldW * 0.05}
        height={fieldH * 0.2}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Right */}
      <Rect
        x={width - PADDING - fieldW * 0.15}
        y={centerY - fieldH * 0.25}
        width={fieldW * 0.15}
        height={fieldH * 0.5}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      {/* Goal Area Right */}
      <Rect
        x={width - PADDING - fieldW * 0.05}
        y={centerY - fieldH * 0.1}
        width={fieldW * 0.05}
        height={fieldH * 0.2}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />

      {/* Penalty Arcs */}
      <Arc
        x={PADDING + fieldW * 0.12}
        y={centerY}
        innerRadius={fieldH * 0.1}
        outerRadius={fieldH * 0.1}
        angle={100}
        rotation={-50}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
      <Arc
        x={width - PADDING - fieldW * 0.12}
        y={centerY}
        innerRadius={fieldH * 0.1}
        outerRadius={fieldH * 0.1}
        angle={100}
        rotation={130}
        stroke={LINE_COLOR}
        strokeWidth={LINE_WIDTH}
      />
    </Group>
  );
};
