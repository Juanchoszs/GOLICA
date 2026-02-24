import React from 'react';
import { TrainingSession } from './types/session.types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Clock, Calendar, Bookmark, User } from 'lucide-react';

interface PlanningSessionViewProps {
    session: TrainingSession;
    onBack: () => void;
}

export const PlanningSessionView: React.FC<PlanningSessionViewProps> = ({ session, onBack }) => {
    const warmupDuration = session.warmup?.exercises?.reduce((acc, ex) => acc + (ex.duration || 0), 0) || 0;
    // Si guardaste el cálculo al crear, usamos mainExercises * 15 como default para mostrar aprox
    const mainDuration = session.main?.exercises?.length * 15 || 0;
    const totalDuration = warmupDuration + mainDuration;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={16} />
                    Volver a Planificaciones
                </Button>
                <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Modo Lectura
                </div>
            </div>

            {/* Main Title Card */}
            <Card className="p-6 md:p-8 border-l-4 border-l-primary bg-card shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
                            {session.name}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                Categoría: {session.categoryName || 'Sin asignar'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary/70" />
                                <span>{formatDate(session.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary/70" />
                                <span>~{totalDuration} minutos ({totalDuration / 60 >= 1 ? `${Math.floor(totalDuration / 60)}hr ` : ''}{totalDuration % 60}m)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Warmup Section */}
            {session.warmup?.exercises?.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-2">
                        <div className="bg-orange-500/10 p-2 rounded-lg">
                            <Clock size={20} className="text-orange-600" />
                        </div>
                        <h2 className="text-xl font-bold">Fase Inicial / Calentamiento</h2>
                        <span className="ml-auto text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {warmupDuration} minutos
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {session.warmup.exercises.map((ex, i) => (
                            <Card key={ex.id || i} className="p-4 bg-muted/20 border-border/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-orange-600/50">{(i + 1).toString().padStart(2, '0')}</span>
                                        <div>
                                            <h3 className="font-bold mb-1">{ex.name}</h3>
                                            {ex.description && <p className="text-sm text-muted-foreground">{ex.description}</p>}
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold whitespace-nowrap text-orange-600/80 bg-orange-600/10 px-2 py-0.5 rounded">
                                        {ex.duration} min
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Main Exercises Section */}
            {session.main?.exercises?.length > 0 && (
                <section className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 border-b pb-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Bookmark size={20} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold">Fase Principal</h2>
                        <span className="ml-auto text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {session.main.exercises.length} Ejercicios
                        </span>
                    </div>

                    <div className="space-y-6">
                        {session.main.exercises.map((ex, i) => (
                            <Card key={ex.id || i} className="overflow-hidden border-border bg-card">
                                <div className="bg-muted/40 p-4 border-b flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{ex.objective || 'Ejercicio Central'}</h3>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Text Details (Takes up 2 cols if image exists, 3 if not) */}
                                    <div className={`space-y-6 ${ex.tacticBoardImageUrl ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                                        {ex.description && (
                                            <div>
                                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Descripción General</h4>
                                                <p className="text-sm leading-relaxed">{ex.description}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Technical Info */}
                                            <div className="space-y-3 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                                <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                                                    ⚽ Dimensiones Técnicas
                                                </h4>
                                                {ex.technical?.offensive && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block text-xs uppercase text-blue-600 mb-1">Ofensivos</span>
                                                        <p>{ex.technical.offensive}</p>
                                                    </div>
                                                )}
                                                {ex.technical?.defensive && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block text-xs uppercase text-blue-600 mb-1">Defensivos</span>
                                                        <p>{ex.technical.defensive}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tactical Info */}
                                            <div className="space-y-3 p-4 bg-green-500/5 rounded-lg border border-green-500/10">
                                                <h4 className="font-bold text-sm text-green-700 flex items-center gap-2">
                                                    🎯 Dimensiones Tácticas
                                                </h4>
                                                {ex.tactical?.offensive && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block text-xs uppercase text-green-600 mb-1">Ofensivos</span>
                                                        <p>{ex.tactical.offensive}</p>
                                                    </div>
                                                )}
                                                {ex.tactical?.defensive && (
                                                    <div className="text-sm">
                                                        <span className="font-semibold block text-xs uppercase text-green-600 mb-1">Defensivos</span>
                                                        <p>{ex.tactical.defensive}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cognitive/Psychology */}
                                            {ex.psychology && (
                                                <div className="space-y-2 p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                                    <h4 className="font-bold text-sm text-purple-700 flex items-center gap-2">
                                                        🧠 Cognitiva / Psicológica
                                                    </h4>
                                                    <p className="text-sm">{ex.psychology}</p>
                                                </div>
                                            )}

                                            {/* Physical */}
                                            {ex.physical && (
                                                <div className="space-y-2 p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                                                    <h4 className="font-bold text-sm text-red-700 flex items-center gap-2">
                                                        💪 Físico
                                                    </h4>
                                                    <p className="text-sm">{ex.physical}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Board Image (Takes 1 col) */}
                                    {ex.tacticBoardImageUrl && (
                                        <div className="lg:col-span-1">
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Pizarra Táctica</h4>
                                            <div className="rounded-xl overflow-hidden border-2 border-border shadow-md bg-zinc-900 group relative">
                                                {/* We use standard img element. Object-contain to fit it nicely */}
                                                <img
                                                    src={ex.tacticBoardImageUrl}
                                                    alt="Pizarra táctica"
                                                    className="w-full h-auto object-cover transform transition-transform group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                    <span className="text-white font-medium px-3 py-1 bg-black/50 rounded-full text-sm">Pizarra Asociada</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {(!session.warmup?.exercises?.length && !session.main?.exercises?.length) && (
                <Card className="p-12 text-center text-muted-foreground">
                    <p>Esta sesión de entrenamiento no tiene ejercicios registrados todavía.</p>
                </Card>
            )}
        </div>
    );
};

export default PlanningSessionView;
