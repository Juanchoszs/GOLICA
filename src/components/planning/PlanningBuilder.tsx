import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Control, useWatch } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, Clock, Users, Layout, Activity, Box, Zap, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { TrainingSession, Phase, Exercise } from './types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface PlanningBuilderProps {
  coachId: string;
  initialData?: TrainingSession;
  onSave: () => void;
  onCancel: () => void;
}

export function PlanningBuilder({ coachId, initialData, onSave, onCancel }: PlanningBuilderProps) {
  const [autoCategory, setAutoCategory] = useState<string>('');
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<TrainingSession>({
    defaultValues: initialData || {
      coach_id: coachId,
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      category: '',
      general_objective: '',
      observations: '',
      phases: [
        {
          name: 'Calentamiento',
          duration: 15,
          observations: '',
          order_index: 0,
          exercises: []
        },
        {
          name: 'Parte Principal',
          duration: 60,
          observations: '',
          order_index: 1,
          exercises: []
        },
        {
          name: 'Vuelta a la Calma',
          duration: 10,
          observations: '',
          order_index: 2,
          exercises: []
        }
      ]
    }
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control,
    name: "phases"
  });

  // Cargar información del coach para obtener su categoría
  useEffect(() => {
    if (!initialData && coachId) {
      const fetchCoachInfo = async () => {
        try {
          // Primero intentar obtener de la tabla coaches
          const { data: coachData, error: coachError } = await supabase
            .from('coaches')
            .select('category')
            .eq('id', coachId)
            .single();

          if (coachData?.category) {
            setValue('category', coachData.category);
            setAutoCategory(coachData.category);
          } else {
            // Si no es coach, podría ser admin
            const { data: adminData } = await supabase
              .from('admins')
              .select('name')
              .eq('id', coachId)
              .single();
            
            if (adminData) {
              setValue('category', 'Administrador');
              setAutoCategory('Administrador');
            }
          }
        } catch (error) {
          console.error('Error al cargar información del coach:', error);
        }
      };

      fetchCoachInfo();
    }
  }, [coachId, initialData, setValue]);

  const onSubmit = async (data: TrainingSession) => {
    try {
      console.log("Saving data:", data);
      
      // 1. Upsert Session
      const sessionData = {
        coach_id: coachId,
        title: data.title,
        date: data.date,
        time: data.time,
        category: data.category,
        general_objective: data.general_objective,
        observations: data.observations,
      };

      let sessionId = initialData?.id;

      if (sessionId) {
        const { error } = await supabase
          .from('training_sessions')
          .update(sessionData)
          .eq('id', sessionId);
        if (error) throw error;
      } else {
        const { data: newSession, error } = await supabase
          .from('training_sessions')
          .insert([sessionData])
          .select()
          .single();
        if (error) throw error;
        sessionId = newSession.id;
      }

      if (!sessionId) throw new Error("No session ID");

      // 2. Handle Phases and Exercises
      // Strategy: Delete existing phases (and cascade exercises) and re-create.
      // This is simpler than diffing for this prototype.
      if (initialData?.id) {
        await supabase.from('session_phases').delete().eq('session_id', sessionId);
      }

      // Insert Phases
      for (const [pIndex, phase] of data.phases.entries()) {
        const { data: newPhase, error: phaseError } = await supabase
          .from('session_phases')
          .insert([{
            session_id: sessionId,
            name: phase.name,
            duration: phase.duration,
            observations: phase.observations,
            order_index: pIndex
          }])
          .select()
          .single();

        if (phaseError) throw phaseError;

        // Insert Exercises for this Phase
        if (phase.exercises && phase.exercises.length > 0) {
          const exercisesToInsert = phase.exercises.map((ex, exIndex) => ({
            phase_id: newPhase.id,
            title: ex.title,
            objective: ex.objective,
            description: ex.description,
            duration: ex.duration,
            players_count: ex.players_count,
            space_dimensions: ex.space_dimensions,
            intensity: ex.intensity,
            materials: ex.materials,
            variations: ex.variations,
            observations: ex.observations,
            order_index: exIndex
          }));

          const { error: exError } = await supabase
            .from('session_exercises')
            .insert(exercisesToInsert);
          
          if (exError) throw exError;
        }
      }

      toast.success('Planificación guardada correctamente');
      onSave();
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast.error(`Error al guardar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {initialData ? 'Editar Planificación' : 'Nueva Planificación'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Título de la Sesión</Label>
              <Input {...register('title', { required: true })} placeholder="Ej: Entrenamiento Táctico Ofensivo" />
              {errors.title && <span className="text-destructive text-sm">Requerido</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" {...register('date', { required: true })} />
                </div>
                <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" {...register('time')} />
                </div>
            </div>

            <div className="space-y-2">
              <Label>Categoría / Equipo</Label>
              <Input 
                {...register('category')} 
                placeholder="Ej: Sub-18" 
                readOnly={!!autoCategory}
                className={autoCategory ? 'bg-muted' : ''}
              />
              {autoCategory && (
                <p className="text-xs text-muted-foreground">
                  Categoría asignada a tu perfil de coach
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Objetivo General</Label>
              <Textarea {...register('general_objective')} placeholder="Objetivo principal de la sesión..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observaciones Generales</Label>
              <Textarea {...register('observations')} placeholder="Notas adicionales..." />
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Fases de la Sesión</h2>
                <Button type="button" onClick={() => appendPhase({ name: 'Nueva Fase', duration: 10, observations: '', order_index: phaseFields.length, exercises: [] })} variant="secondary">
                    <Plus size={16} className="mr-2" /> Agregar Fase
                </Button>
            </div>

            {phaseFields.map((phase, index) => (
                <PhaseEditor 
                    key={phase.id} 
                    control={control} 
                    index={index} 
                    remove={() => removePhase(index)} 
                    register={register}
                />
            ))}
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-6 right-6 z-50">
            <Button type="submit" size="lg" className="shadow-lg" disabled={isSubmitting}>
                <Save size={20} className="mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Planificación'}
            </Button>
        </div>
      </form>
    </div>
  );
}

// Sub-component for Phase to handle nested exercises
function PhaseEditor({ control, index, remove, register }: { control: Control<TrainingSession>, index: number, remove: () => void, register: any }) {
    const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
        control,
        name: `phases.${index}.exercises`
    });

    // Calculate total duration of exercises
    const exercises = useWatch({
        control,
        name: `phases.${index}.exercises`
    });
    
    // Auto-sum logic could go here if we wanted to update phase duration based on exercises
    
    return (
        <Card className="border-l-4 border-l-primary relative">
            <CardHeader className="pb-2 bg-muted/20">
                <div className="flex justify-between items-start">
                    <div className="grid gap-4 flex-1 mr-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">Nombre de la Fase</Label>
                                <Input 
                                    {...register(`phases.${index}.name` as const, { required: true })} 
                                    className="font-bold text-lg border-transparent hover:border-input focus:border-input bg-transparent px-0 h-auto rounded-none focus:ring-0" 
                                    placeholder="Nombre de la fase"
                                />
                            </div>
                            <div className="w-32">
                                <Label className="text-xs text-muted-foreground">Duración (min)</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        {...register(`phases.${index}.duration` as const)} 
                                        className="pl-8"
                                    />
                                    <Clock size={14} className="absolute left-2.5 top-3 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                        <Input 
                            {...register(`phases.${index}.observations` as const)} 
                            placeholder="Observaciones de la fase..." 
                            className="text-sm bg-transparent border-transparent hover:border-input focus:border-input h-8 px-0"
                        />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {exerciseFields.map((exercise, exIndex) => (
                        <ExerciseEditor 
                            key={exercise.id}
                            control={control}
                            phaseIndex={index}
                            exIndex={exIndex}
                            remove={() => removeExercise(exIndex)}
                            register={register}
                        />
                    ))}

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-dashed py-6 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        onClick={() => appendExercise({
                            title: '',
                            objective: '',
                            description: '',
                            duration: 10,
                            players_count: '',
                            space_dimensions: '',
                            intensity: 'Media',
                            materials: '',
                            variations: '',
                            observations: '',
                            order_index: exerciseFields.length
                        })}
                    >
                        <Plus size={20} className="mr-2" /> Agregar Ejercicio
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ExerciseEditor({ control, phaseIndex, exIndex, remove, register }: any) {
    const isExpanded = true; // Could make this collapsible

    return (
        <Card className="bg-card border border-border shadow-sm">
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                        <Label className="sr-only">Nombre del ejercicio</Label>
                        <Input 
                            {...register(`phases.${phaseIndex}.exercises.${exIndex}.title` as const, { required: true })} 
                            className="font-semibold text-base" 
                            placeholder="Nombre del Ejercicio"
                        />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={remove} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Objetivo</Label>
                        <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.objective` as const)} placeholder="Objetivo técnico/táctico" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                         <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1"><Clock size={10} /> Min</Label>
                            <Input type="number" {...register(`phases.${phaseIndex}.exercises.${exIndex}.duration` as const)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1"><Users size={10} /> Jug.</Label>
                            <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.players_count` as const)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1"><Activity size={10} /> Int.</Label>
                            <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.intensity` as const)} placeholder="Alta/Media" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <Label className="text-xs">Descripción / Desarrollo</Label>
                    <Textarea 
                        {...register(`phases.${phaseIndex}.exercises.${exIndex}.description` as const)} 
                        className="min-h-[80px]" 
                        placeholder="Explicación del ejercicio..."
                    />
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-none">
                        <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline hover:text-primary">
                            <span>Más detalles (Espacio, Materiales, Variantes)</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-xs flex items-center gap-1"><Layout size={12}/> Dimensiones</Label>
                                    <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.space_dimensions` as const)} placeholder="Ej: 20x20m" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs flex items-center gap-1"><Box size={12}/> Materiales</Label>
                                    <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.materials` as const)} placeholder="Conos, Balones, Petos..." />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs flex items-center gap-1"><Zap size={12}/> Variantes</Label>
                                    <Textarea {...register(`phases.${phaseIndex}.exercises.${exIndex}.variations` as const)} placeholder="Progresiones o regresiones..." className="h-16" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs">Observaciones</Label>
                                    <Input {...register(`phases.${phaseIndex}.exercises.${exIndex}.observations` as const)} placeholder="Notas para el entrenador..." />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </Card>
    );
}
