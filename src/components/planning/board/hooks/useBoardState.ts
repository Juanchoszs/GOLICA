import { useState, useCallback } from 'react';
import { BoardElement, TacticalLine, BoardState, ElementType } from '../types/board.types';

export const useBoardState = () => {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [lines, setLines] = useState<TacticalLine[]>([]);
  const [history, setHistory] = useState<BoardState[]>([]);

  const addElement = useCallback((type: ElementType, x: number, y: number, color?: string) => {
    const newElement: BoardElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      color: color || '#ff0000',
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    setElements((prev) => [...prev, newElement]);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const addLine = useCallback((line: TacticalLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearBoard = useCallback(() => {
    setElements([]);
    setLines([]);
  }, []);

  const saveBoard = useCallback(() => {
    return JSON.stringify({ elements, lines });
  }, [elements, lines]);

  const loadBoard = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setElements(parsed.elements || []);
      setLines(parsed.lines || []);
    } catch (e) {
      console.error("Failed to load board state", e);
    }
  }, []);

  return {
    elements,
    lines,
    addElement,
    updateElement,
    removeElement,
    addLine,
    removeLine,
    clearBoard,
    saveBoard,
    loadBoard,
  };
};

