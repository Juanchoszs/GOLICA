import React, { useState, useEffect } from 'react';
import { TrainingSession } from '../types/session.types';
import { useTrainingSession } from '../hooks/useTrainingSession';
import { WarmupSectionComponent } from './WarmupSection';
import { MainSectionComponent } from './MainSection';
import { PlanningBoard } from '../board';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase/client';
import { uploadBoardImage } from '../../../utils/supabase/trainingSessionsService';
import { toast } from 'sonner';
import { Save, X, BookmarkPlus } from 'lucide-react';

interface CompleteSessionBuilderProps {
  initialData?: TrainingSession;
  onSave?: (session: TrainingSession) => void;
  onCancel?: () => void;
  userCategories?: Array<{ id: string; name: string }>;
}

export const CompleteSessionBuilder: React.FC<CompleteSessionBuilderProps> = ({
  initialData,
  onSave,
  onCancel,
  userCategories = [],
}) => {
  const { user } = useAuth();
  const {
    session,
    addWarmupExercise,
    removeWarmupExercise,
    updateWarmupExercise,
    addMainExercise,
    removeMainExercise,
    updateMainExercise,
    updateSessionBasics,
  } = useTrainingSession(initialData);

  const [activeTab, setActiveTab] = useState<'session' | 'tactic'>('session');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<any>>([]);

  // Initialize categories from props or fetch them
  useEffect(() => {
    if (userCategories && userCategories.length > 0) {
      // Categories passed from PlanningBuilder (already array of strings or objects)
      setCategories(userCategories);
    } else if (user?.id) {
      // No categories from props, fetch them
      fetchCoachCategories();
    }
  }, [userCategories, user?.id]);

  const fetchCoachCategories = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role === 'admin') {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        if (error) throw error;
        setCategories(data.map(c => c.name));
      } else {
        const { data, error } = await supabase
          .from('coaches')
          .select('assigned_categories')
          .eq('id', user?.id)
          .single();

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        if (data?.assigned_categories && Array.isArray(data.assigned_categories)) {
          setCategories(data.assigned_categories);
        }
      }
    } catch (error) {
      console.error('Error fetching coach categories:', error);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(session);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    updateSessionBasics({ categoryName });
  };

  const handleOpenTacticBoard = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setActiveTab('tactic');
  };

  const handleBoardChange = (boardData: string, imageUri: string) => {
    if (selectedExerciseId) {
      updateMainExercise(selectedExerciseId, {
        tacticBoardData: boardData,
        tacticBoardImageBase64: imageUri
      });
    }
  };

  // Save as template logic removed because the feature is merged into the general sessions now.

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* HEADER - Category Selection PROMINENT */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b-2 border-amber-200 dark:border-amber-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <label className="text-lg font-bold text-amber-900 dark:text-amber-100 block mb-2">
              🎯 CATEGORÍA DE LA PLANIFICACIÓN <span className="text-red-600">*</span>
            </label>
            {categories.length > 0 ? (
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-600 h-12 text-lg font-semibold">
                  <SelectValue placeholder="⚠️ Selecciona una categoría..." />
                </SelectTrigger>
                <SelectContent className="text-base">
                  {categories.map((cat: any) => {
                    const catId = typeof cat === 'string' ? cat : cat.id;
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    return (
                      <SelectItem key={catId} value={catId} className="text-base py-3">
                        <span className="font-semibold">{catName}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-200 font-semibold">
                ⚠️ No hay categorías asignadas a este entrenador
              </div>
            )}
          </div>
          {selectedCategory && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Categoría seleccionada:</p>
              <p className="text-2xl font-bold text-green-600">{selectedCategory}</p>
            </div>
          )}
        </div>
      </div>

      {/* Header - Session Info */}
      <div className="flex items-center justify-between gap-6 p-6 border-b bg-muted/30">
        <div className="flex-1">
          <input
            type="text"
            value={session.name}
            onChange={(e) => updateSessionBasics({ name: e.target.value })}
            className="text-2xl font-bold bg-transparent outline-none border-b border-transparent hover:border-input focus:border-input transition-colors w-full"
            placeholder="Nombre de la sesión"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {new Date(session.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">

          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X size={16} />
              Cancelar
            </Button>
          )}
          {onSave && (
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} />
              Guardar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b bg-muted/30 p-3 justify-start">
            <TabsTrigger value="session" className="gap-2">
              📋 Planificación
            </TabsTrigger>
            <TabsTrigger value="tactic" className="gap-2">
              📊 Pizarra Táctica
            </TabsTrigger>
          </TabsList>

          {/* Session Tab - Warmup & Main */}
          <TabsContent value="session" className="flex-1 overflow-auto p-6">
            <div className="space-y-12 max-w-5xl">
              {/* Warmup Section */}
              <section className="bg-card p-6 rounded-lg border">
                <WarmupSectionComponent
                  warmup={session.warmup}
                  onAddExercise={addWarmupExercise}
                  onRemoveExercise={removeWarmupExercise}
                  onUpdateExercise={(id, name, duration) =>
                    updateWarmupExercise(id, { name, duration })
                  }
                />
              </section>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Fin Calentamiento
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Main Section */}
              <section className="bg-card p-6 rounded-lg border">
                <MainSectionComponent
                  main={session.main}
                  onAddExercise={addMainExercise}
                  onUpdateExercise={updateMainExercise}
                  onRemoveExercise={removeMainExercise}
                  onOpenTacticBoard={handleOpenTacticBoard}
                />
              </section>

              {/* Summary */}
              {session.warmup.exercises.length > 0 && session.main.exercises.length > 0 && (
                <div className="p-4 border rounded-lg bg-green-500/5 border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <span className="font-bold">✓ Sesión completa:</span> {session.warmup.exercises.length} ejercicio(s) de calentamiento + {session.main.exercises.length} ejercicio(s) principales.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tactic Board Tab */}
          <TabsContent value="tactic" className="flex-1 overflow-auto">
            {selectedExerciseId ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Configurando pizarra para: <span className="font-bold">
                      {
                        session.main.exercises.find(
                          (ex) => ex.id === selectedExerciseId
                        )?.objective || 'Ejercicio sin título'
                      }
                    </span>
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PlanningBoard
                    onSaveBoard={() => { }}
                    onChange={handleBoardChange}
                    initialData={session.main.exercises.find((ex) => ex.id === selectedExerciseId)?.tacticBoardData}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm mb-4">
                    Abre la pizarra táctica desde un ejercicio para configurarla.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('session')}
                  >
                    Volver a Planificación
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
