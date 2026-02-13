import React, { useState } from 'react';
import { MainExercise } from '../types/session.types';
import { Button } from '../../ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface MainExerciseComponentProps {
  exercise: MainExercise;
  index: number;
  onUpdate: (updates: Partial<MainExercise>) => void;
  onRemove: () => void;
  onOpenTacticBoard: () => void;
}

export const MainExerciseComponent: React.FC<MainExerciseComponentProps> = ({
  exercise,
  index,
  onUpdate,
  onRemove,
  onOpenTacticBoard,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={exercise.objective}
              onChange={(e) => onUpdate({ objective: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Objetivo General (ej: Mejorar pase corto)"
              className="w-full text-sm font-bold text-foreground bg-transparent outline-none border-b border-transparent hover:border-input focus:border-input transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {exercise.objective || 'Sin objetivo definido'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Descripción Amplia */}
          <div>
            <label className="block font-medium text-sm mb-2">
              Descripción del Ejercicio
            </label>
            <textarea
              value={exercise.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe el ejercicio en detalle..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Grid de Dimensiones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TÉCNICOS */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
              <h4 className="font-bold text-sm text-blue-600">⚽ Técnicos</h4>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Técnicos Ofensivos
                </label>
                <textarea
                  value={exercise.technical.offensive}
                  onChange={(e) =>
                    onUpdate({
                      technical: { ...exercise.technical, offensive: e.target.value },
                    })
                  }
                  placeholder="Ej: Pase corto, control, remate..."
                  rows={2}
                  className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Técnicos Defensivos
                </label>
                <textarea
                  value={exercise.technical.defensive}
                  onChange={(e) =>
                    onUpdate({
                      technical: { ...exercise.technical, defensive: e.target.value },
                    })
                  }
                  placeholder="Ej: Marcaje, entrada, despeje..."
                  rows={2}
                  className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>

            {/* TÁCTICOS */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
              <h4 className="font-bold text-sm text-green-600">🎯 Tácticos</h4>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tácticos Ofensivos
                </label>
                <textarea
                  value={exercise.tactical.offensive}
                  onChange={(e) =>
                    onUpdate({
                      tactical: { ...exercise.tactical, offensive: e.target.value },
                    })
                  }
                  placeholder="Ej: Presión alta, juego directo..."
                  rows={2}
                  className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tácticos Defensivos
                </label>
                <textarea
                  value={exercise.tactical.defensive}
                  onChange={(e) =>
                    onUpdate({
                      tactical: { ...exercise.tactical, defensive: e.target.value },
                    })
                  }
                  placeholder="Ej: Repliegue, bloque defensivo..."
                  rows={2}
                  className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Grid de Psicología y Físico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PSICOLOGÍA */}
            <div className="space-y-2 p-4 border rounded-lg bg-purple-500/5">
              <label className="block font-bold text-sm text-purple-600">
                🧠 Psicología/Cognitiva
              </label>
              <textarea
                value={exercise.psychology}
                onChange={(e) => onUpdate({ psychology: e.target.value })}
                placeholder="Ej: Concentración, decisiones rápidas..."
                rows={3}
                className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* FÍSICO */}
            <div className="space-y-2 p-4 border rounded-lg bg-red-500/5">
              <label className="block font-bold text-sm text-red-600">
                💪 Físico
              </label>
              <textarea
                value={exercise.physical}
                onChange={(e) => onUpdate({ physical: e.target.value })}
                placeholder="Ej: Resistencia, velocidad, fuerza..."
                rows={3}
                className="w-full px-2 py-1.5 border rounded text-sm bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
          </div>

          {/* Tactical Board Section */}
          <div className="p-4 border rounded-lg bg-slate-500/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">📊 Representación Gráfica</h4>
              <Button
                onClick={onOpenTacticBoard}
                variant="default"
                size="sm"
              >
                Abrir Pizarra Táctica
              </Button>
            </div>
            {exercise.tacticBoardData && (
              <p className="text-xs text-muted-foreground">
                ✓ Pizarra táctica configurada
              </p>
            )}
            {!exercise.tacticBoardData && (
              <p className="text-xs text-muted-foreground italic">
                Abre la pizarra táctica para configurar la representación gráfica
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer - Delete Button */}
      <div className="p-4 border-t bg-muted/5 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="gap-2"
        >
          <Trash2 size={16} />
          Eliminar Ejercicio
        </Button>
      </div>
    </div>
  );
};
