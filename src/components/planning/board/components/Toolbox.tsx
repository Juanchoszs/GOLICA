import React from 'react';
import { Button } from '../../../ui/button';
import {
  User,
  Flag,
  Goal,
  Square,
  MousePointer2,
  Type,
  Trash2,
  Save,
  Download,
  RotateCcw,
  Pin,
  Layers,
  Dribbble,
  Triangle
} from 'lucide-react';

interface ToolboxProps {
  onAddElement: (type: 'player' | 'cone' | 'goal' | 'zone' | 'stake' | 'ladder' | 'ball', color?: string) => void;
  onUndo?: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: () => void;
  drawingMode: boolean;
  setDrawingMode: (mode: boolean) => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  onAddElement,
  onClear,
  onSave,
  onExport,
  drawingMode,
  setDrawingMode
}) => {
  const players = [
    { color: '#EF4444', label: 'Rojo' },
    { color: '#3B82F6', label: 'Azul' },
    { color: '#EAB308', label: 'Amarillo' },
    { color: '#22C55E', label: 'Verde' }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 bg-muted/30 border-r h-full w-64 overflow-y-auto">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Jugadores</h3>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p) => (
            <Button
              key={p.color}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => onAddElement('player', p.color)}
            >
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-[10px]">{p.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Materiales</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('cone', '#F97316')}
          >
            <Triangle size={18} className="text-orange-500" />
            <span className="text-[10px]">Cono</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('goal', '#FFFFFF')}
          >
            <Goal size={18} className="text-blue-400" />
            <span className="text-[10px]">Portería</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('zone', 'rgba(34, 197, 94, 0.2)')}
          >
            <Square size={18} className="text-green-500" />
            <span className="text-[10px]">Esp. Reducido</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('stake', '#8B4513')}
          >
            <Pin size={18} className="text-amber-700" />
            <span className="text-[10px]">Estaca</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('ladder', '#D97706')}
          >
            <Layers size={18} className="text-amber-600" />
            <span className="text-[10px]">Escalera</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-16 gap-1"
            onClick={() => onAddElement('ball', '#000000')}
          >
            <Dribbble size={18} className="text-black dark:text-white" />
            <span className="text-[10px]">Balón</span>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Herramientas</h3>
        <div className="space-y-2">
          <Button
            variant={drawingMode ? "default" : "outline"}
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setDrawingMode(!drawingMode)}
          >
            <Type size={16} />
            <span>{drawingMode ? "Modo Selección" : "Modo Dibujo"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
            onClick={onClear}
          >
            <RotateCcw size={16} />
            <span>Limpiar Pizarra</span>
          </Button>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t space-y-2">
        <Button
          variant="default"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          onClick={onSave}
        >
          <Save size={16} />
          <span>Guardar Pizarra</span>
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={onExport}
        >
          <Download size={16} />
          <span>Exportar Imagen</span>
        </Button>
      </div>
    </div>
  );
};
