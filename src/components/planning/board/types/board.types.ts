export type ElementType = 'player' | 'cone' | 'goal' | 'zone' | 'stake' | 'ladder' | 'ball';
export type LineType = 'pass' | 'movement';

export interface BoardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  color?: string;
  name?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TacticalLine {
  id: string;
  points: number[];
  color: string;
  dash?: number[];
  type: LineType;
}

export interface BoardState {
  elements: BoardElement[];
  lines: TacticalLine[];
}

export interface DragEventData {
  x: number;
  y: number;
}

export interface TransformEventData extends DragEventData {
  scaleX: number;
  scaleY: number;
  rotation: number;
}
