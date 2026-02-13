import React, { useState } from 'react';
import { WarmupSection } from '../types/session.types';
import { Button } from '../../ui/button';
import { Trash2, Plus, Clock } from 'lucide-react';

interface WarmupSectionProps {
  warmup: WarmupSection;
  onAddExercise: (name: string, duration: number) => void;
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, name: string, duration: number) => void;
}

export const WarmupSectionComponent: React.FC<WarmupSectionProps> = ({
  warmup,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}) => {
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState(10);

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      onAddExercise(newExerciseName, newExerciseDuration);
      setNewExerciseName('');
      setNewExerciseDuration(10);
    }
  };

  const totalDuration = warmup.exercises.reduce((sum, ex) => sum + ex.duration, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">🔥 Calentamiento</h3>
          <p className="text-sm text-muted-foreground">
            {warmup.exercises.length} ejercicio(s) • {totalDuration} minutos
          </p>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {warmup.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center font-bold">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) =>
                  onUpdateExercise(exercise.id, e.target.value, exercise.duration)
                }
                className="w-full bg-transparent font-medium text-foreground outline-none border-b border-transparent hover:border-input focus:border-input transition-colors"
                placeholder="Nombre del ejercicio"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 bg-background px-3 py-1 rounded border">
                <Clock size={14} className="text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={exercise.duration}
                  onChange={(e) =>
                    onUpdateExercise(
                      exercise.id,
                      exercise.name,
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-12 bg-transparent outline-none text-sm font-bold text-center"
                />
                <span className="text-xs text-muted-foreground">M</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveExercise(exercise.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Exercise */}
      <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
        <h4 className="font-medium text-sm">Agregar Exercise de Calentamiento</h4>
        
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ej: Movilidad articular y activación"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddExercise()}
            className="w-full px-3 py-2 border rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Duración (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={newExerciseDuration}
                onChange={(e) => setNewExerciseDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim()}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {warmup.exercises.length === 0 && (
        <div className="p-6 text-center border rounded-lg border-dashed text-muted-foreground">
          <p className="text-sm">No hay ejercicios de calentamiento.</p>
          <p className="text-xs mt-1">Agrega al menos uno para comenzar.</p>
        </div>
      )}
    </div>
  );
};
