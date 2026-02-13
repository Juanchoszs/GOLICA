import React, { useState } from 'react';
import { MainSection, MainExercise } from '../types/session.types';
import { MainExerciseComponent } from './MainExercise';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

interface MainSectionProps {
  main: MainSection;
  onAddExercise: () => void;
  onUpdateExercise: (id: string, updates: Partial<MainExercise>) => void;
  onRemoveExercise: (id: string) => void;
  onOpenTacticBoard: (exerciseId: string) => void;
}

export const MainSectionComponent: React.FC<MainSectionProps> = ({
  main,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onOpenTacticBoard,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">📋 Parte Principal</h3>
          <p className="text-sm text-muted-foreground">
            {main.exercises.length} ejercicio(s) configurado(s)
          </p>
        </div>
        <Button onClick={onAddExercise} className="gap-2">
          <Plus size={18} />
          Agregar Ejercicio
        </Button>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {main.exercises.length === 0 ? (
          <div className="p-8 text-center border rounded-lg border-dashed text-muted-foreground">
            <p className="text-sm">No hay ejercicios en la parte principal.</p>
            <p className="text-xs mt-2">Haz clic en "Agregar Ejercicio" para comenzar.</p>
          </div>
        ) : (
          main.exercises.map((exercise, index) => (
            <MainExerciseComponent
              key={exercise.id}
              exercise={exercise}
              index={index}
              onUpdate={(updates) => onUpdateExercise(exercise.id, updates)}
              onRemove={() => onRemoveExercise(exercise.id)}
              onOpenTacticBoard={() => onOpenTacticBoard(exercise.id)}
            />
          ))
        )}
      </div>

      {/* Info Box */}
      {main.exercises.length > 0 && (
        <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-bold">💡 Tip:</span> Cada ejercicio puede incluir una representación gráfica en la pizarra táctica. Abre la pizarra para configurar posiciones, movimientos y formaciones.
          </p>
        </div>
      )}
    </div>
  );
};
