import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { useBoardState } from './hooks/useBoardState';
import { Field } from './components/Field';
import { Player } from './components/Player';
import { Cone } from './components/Cone';
import { MiniGoal } from './components/MiniGoal';
import { Zone } from './components/Zone';
import { TacticalLine } from './components/TacticalLine';
import { Stake } from './components/Stake';
import { CoordinationLadder } from './components/CoordinationLadder';
import { Ball } from './components/Ball';
import { Toolbox } from './components/Toolbox';
import { downloadImage, exportBoardToJSON } from './utils/exportBoard';
import { toast } from 'sonner';
import { MousePointer2, Trash2 } from 'lucide-react';
import type Konva from 'konva';

export const PlanningBoard: React.FC = () => {
  const {
    elements,
    lines,
    addElement,
    updateElement,
    removeElement,
    addLine,
    clearBoard,
    saveBoard
  } = useBoardState();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions
  const stageWidth = 800;
  const stageHeight = 500;

  const handleMouseDown = useCallback((e: any) => {
    if (!drawingMode) {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      }
      return;
    }

    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setCurrentLine([pos.x, pos.y]);
    }
  }, [drawingMode]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || !drawingMode) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setCurrentLine((prev) => [...prev.slice(0, 2), pos.x, pos.y]);
    }
  }, [isDrawing, drawingMode]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentLine.length >= 4) {
      addLine({
        id: `line_${Date.now()}`,
        points: currentLine,
        color: 'white',
        dash: [10, 5],
        type: 'pass'
      });
    }
    setCurrentLine([]);
  }, [isDrawing, currentLine, addLine]);

  const handleDrawingModeDoubleClick = useCallback(() => {
    if (drawingMode && currentLine.length > 0) {
      setCurrentLine([]);
      toast.success('Línea cancelada');
    }
  }, [drawingMode, currentLine]);

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      downloadImage(uri, `tactical_board_${Date.now()}.png`);
      toast.success("Imagen exportada");
    }
  };

  const handleSaveJSON = () => {
    saveBoard();
    exportBoardToJSON(elements, lines);
    toast.success("JSON exportado");
  };

  return (
    <div className="flex h-[600px] w-full border rounded-xl overflow-hidden bg-background shadow-2xl" ref={containerRef}>
      <Toolbox 
        onAddElement={(type, color) => addElement(type, stageWidth/2, stageHeight/2, color)}
        onClear={clearBoard}
        onSave={handleSaveJSON}
        onExport={handleExport}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
      />
      
      <div className="flex-1 bg-zinc-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border-4 border-zinc-800">
          <Stage
            width={stageWidth}
            height={stageHeight}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDblClick={handleDrawingModeDoubleClick}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              <Field width={stageWidth} height={stageHeight} />
              
              {/* Elements */}
              {elements.map((el) => {
                if (el.type === 'player') {
                  return (
                    <Player 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Jugador eliminado");
                      }}
                    />
                  );
                }
                if (el.type === 'cone') {
                  return (
                    <Cone 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Cono eliminado");
                      }}
                    />
                  );
                }
                if (el.type === 'goal') {
                  return (
                    <MiniGoal 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Portería eliminada");
                      }}
                    />
                  );
                }
                if (el.type === 'zone') {
                  return (
                    <Zone 
                      key={el.id} 
                      element={el}
                      isSelected={selectedId === el.id}
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Rect;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onTransformEnd={(data) => {
                        updateElement(el.id, {
                          x: data.x,
                          y: data.y,
                          scaleX: data.scaleX,
                          scaleY: data.scaleY,
                          rotation: data.rotation
                        });
                      }}
                    />
                  );
                }
                if (el.type === 'stake') {
                  return (
                    <Stake 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Estaca eliminada");
                      }}
                    />
                  );
                }
                if (el.type === 'ladder') {
                  return (
                    <CoordinationLadder 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Escalera coordinativa eliminada");
                      }}
                    />
                  );
                }
                if (el.type === 'ball') {
                  return (
                    <Ball 
                      key={el.id} 
                      element={el} 
                      onSelect={() => setSelectedId(el.id)}
                      onDragEnd={(e) => {
                        const target = e.target as Konva.Group;
                        updateElement(el.id, { x: target.x(), y: target.y() });
                      }}
                      onDoubleClick={() => {
                        removeElement(el.id);
                        toast.success("Balón eliminado");
                      }}
                    />
                  );
                }
                return null;
              })}

              {/* Lines */}
              {lines.map(line => <TacticalLine key={line.id} line={line} />)}
              
              {/* Current Drawing Line */}
              {drawingMode && currentLine.length >= 4 && (
                <TacticalLine 
                  line={{ 
                    id: 'current', 
                    points: currentLine, 
                    color: 'rgba(255,255,255,0.5)', 
                    type: 'pass',
                    dash: [5, 5]
                  }} 
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Instructions Overlay */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <MousePointer2 size={14} className="text-emerald-400" />
            <span className="text-xs text-white font-medium">
              {drawingMode ? "Arrastra: dibujar | Doble-Click: cancelar" : "Drag: mover | Doble-Click: eliminar"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
