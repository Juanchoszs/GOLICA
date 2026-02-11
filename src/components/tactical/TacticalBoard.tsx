import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { Search, Save, RotateCcw, ChevronLeft, UserCog, Zap, Shield, TrendingUp } from 'lucide-react';

import { Player, CallUp } from './types';
import { FORMATIONS } from './formations';
import { DraggablePlayer } from './DraggablePlayer';
import { SoccerPitch } from './SoccerPitch';
import { LineupSlots } from './LineupSlots';
import { BenchPlayers } from './BenchPlayers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface TacticalBoardProps {
  players: Player[];
  categoryName: string;
  onSave: (callup: CallUp) => void;
  onClose: () => void;
}

export function TacticalBoard({ players, categoryName, onSave, onClose }: TacticalBoardProps) {
  const [selectedLineupId, setSelectedLineupId] = useState('4-3-3');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchInfo, setMatchInfo] = useState({
    opponent: '',
    date: '',
    time: '',
    location: '',
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const currentLineup = useMemo(() =>
    FORMATIONS.find(l => l.id === selectedLineupId) || FORMATIONS[0]
    , [selectedLineupId]);

  const assignedPlayerIds = useMemo(() => Object.values(assignments), [assignments]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identification.includes(searchTerm)
    );
  }, [players, searchTerm]);

  const getPlayer = (id: string) => players.find(p => p.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    const playerId = active.id as string;
    const origin = active.data.current?.origin as 'list' | 'field';

    if (!over) {
      if (origin === 'field') {
        const posId = Object.keys(assignments).find(k => assignments[k] === playerId);
        if (posId) {
          const newAssigns = { ...assignments };
          delete newAssigns[posId];
          setAssignments(newAssigns);
          toast.info('Jugador retirado de la cancha');
        }
      }
      return;
    }

    const targetPosId = over.id as string;
    const prevPosId = Object.keys(assignments).find(k => assignments[k] === playerId);

    setAssignments(prev => {
      const next = { ...prev };

      if (prevPosId) {
        delete next[prevPosId];
      }

      next[targetPosId] = playerId;
      return next;
    });
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de resetear la alineación? Todos los jugadores serán removidos.')) {
      setAssignments({});
      toast.info('Alineación reseteada');
    }
  };

  const handleLineupChange = (val: string) => {
    if (Object.keys(assignments).length > 0) {
      if (!confirm('Cambiar la alineación reseteará las posiciones. ¿Continuar?')) return;
      setAssignments({});
    }
    setSelectedLineupId(val);
  };

  const handleSaveWrapper = () => {
    if (!matchInfo.opponent || !matchInfo.date) {
      toast.error('Por favor ingresa rival y fecha');
      return;
    }

    const gkPos = currentLineup.positions.find(p => p.role === 'Portero');
    if (gkPos && !assignments[gkPos.id]) {
      toast.error('¡Falta el Portero (GK)! 🛡️');
      return;
    }

    const assignedCount = Object.keys(assignments).length;
    if (assignedCount < 11) {
      toast.error(`¡Equipo incompleto! Faltan ${11 - assignedCount} jugadores. ⚽`);
      return;
    }

    onSave({
      category: categoryName,
      lineupId: selectedLineupId,
      assignments,
      createdAt: new Date().toISOString(),
      opponent: matchInfo.opponent,
      date: matchInfo.date,
      time: matchInfo.time,
      location: matchInfo.location,
    });
    toast.success('Convocatoria guardada exitosamente 🏆');
  };

  const draggedPlayer = activeId ? getPlayer(activeId) : null;

  // Calcular estadísticas de formación
  const formationStats = useMemo(() => {
    const defenders = currentLineup.positions.filter(p => p.role === 'Defensa').length;
    const midfielders = currentLineup.positions.filter(p => p.role === 'Mediocampo').length;
    const attackers = currentLineup.positions.filter(p => p.role === 'Delantero').length;

    return { defenders, midfielders, attackers };
  }, [currentLineup]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col min-h-screen lg:h-screen lg:max-h-screen bg-gradient-to-br from-background via-background to-muted/20 lg:overflow-hidden">

        {/* Header Profesional */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-lg z-50">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Crear Convocatoria</h2>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                {categoryName} <span className="text-primary">•</span> {currentLineup.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl border border-border/50 shadow-sm">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${Object.keys(assignments).length === 11
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse'
                : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                }`} />
              <div className="text-center">
                <div className="text-2xl font-black leading-none">{Object.keys(assignments).length}</div>
                <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">/ 11 Jugadores</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleReset}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 border-dashed rounded-xl"
            >
              <RotateCcw size={16} className="mr-2" />
              Resetear
            </Button>

            <Button
              onClick={handleSaveWrapper}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-2.5 rounded-xl"
            >
              <Save size={16} className="mr-2" />
              Guardar Convocatoria
            </Button>
          </div>
        </div>

        {/* Barra de información del partido */}
        <div className="px-8 py-4 border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Rival</Label>
              <Input
                value={matchInfo.opponent}
                onChange={(e) => setMatchInfo({ ...matchInfo, opponent: e.target.value })}
                placeholder="Equipo rival"
                className="h-9 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                value={matchInfo.date}
                onChange={(e) => setMatchInfo({ ...matchInfo, date: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Hora</Label>
              <Input
                type="time"
                value={matchInfo.time}
                onChange={(e) => setMatchInfo({ ...matchInfo, time: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Ubicación</Label>
              <Input
                value={matchInfo.location}
                onChange={(e) => setMatchInfo({ ...matchInfo, location: e.target.value })}
                placeholder="Estadio / Lugar"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">

          {/* Panel Izquierdo: Configuración Táctica */}
          <aside className="w-80 hidden xl:flex flex-col p-8 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
            <div className="space-y-8">

              {/* Selector de Formación */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <UserCog size={18} className="text-primary" />
                  Sistema Táctico
                </h3>
                <Select value={selectedLineupId} onValueChange={handleLineupChange}>
                  <SelectTrigger className="w-full bg-background border-border/50 h-12 rounded-xl hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Seleccionar formación" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {FORMATIONS.map(l => (
                      <SelectItem key={l.id} value={l.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold">{l.name}</span>
                          <span className="text-xs text-muted-foreground">{l.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Descripción de la formación */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentLineup.description}
                  </p>
                </div>
              </section>

              {/* Estadísticas de Formación */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Composición
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-black text-blue-500">{formationStats.defenders}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Defensas</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <UserCog className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    <div className="text-2xl font-black text-emerald-500">{formationStats.midfielders}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Medios</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-black text-red-500">{formationStats.attackers}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Atacantes</div>
                  </div>
                </div>
              </section>

              {/* Guía de Uso */}
              <section className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl">
                <h4 className="text-xs font-black text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px]">?</span>
                  </div>
                  Guía Rápida
                </h4>
                <ul className="space-y-4">
                  {[
                    { num: '1', text: 'Selecciona la formación táctica ideal para tu equipo' },
                    { num: '2', text: 'Arrastra jugadores desde el banco a las posiciones' },
                    { num: '3', text: 'Suelta fuera de la cancha para remover un jugador' },
                    { num: '4', text: 'Asegúrate de incluir un portero antes de guardar' }
                  ].map((step) => (
                    <li key={step.num} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0 mt-0.5">
                        {step.num}
                      </div>
                      <span className="text-xs text-muted-foreground leading-relaxed">{step.text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Resumen Visual */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Resumen
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl font-black text-primary mb-1">
                      {assignments[currentLineup.positions.find(p => p.role === 'Portero')?.id || ''] ? '1' : '0'}/1
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Portero</div>
                  </div>
                  <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl font-black text-foreground mb-1">
                      {Object.keys(assignments).length}/11
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</div>
                  </div>
                </div>
              </section>
            </div>
          </aside>

          {/* Centro: Cancha Táctica */}
          <section className="flex-1 bg-gradient-to-b from-muted/20 to-muted/40 p-6 md:p-12 flex items-center justify-center overflow-auto">
            <div className="w-full h-full max-w-5xl flex items-center justify-center">
              <SoccerPitch key={selectedLineupId}>
                <LineupSlots
                  positions={currentLineup.positions}
                  assignments={assignments}
                  getPlayer={getPlayer}
                />
              </SoccerPitch>
            </div>
          </section>

          {/* Panel Derecho: Selección de Jugadores */}
          <BenchPlayers
            players={players}
            filteredPlayers={filteredPlayers}
            searchTerm={searchTerm}
            onSearchChange={v => setSearchTerm(v)}
            assignedPlayerIds={assignedPlayerIds}
          />
        </div>
      </div>

      {/* Overlay de Arrastre: siempre un token circular con foto y nombre debajo */}
      <DragOverlay>
        {activeId && draggedPlayer ? (
          <div className="pointer-events-none flex flex-col items-center gap-1 opacity-95">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white bg-primary shadow-2xl overflow-hidden">
              {draggedPlayer.photo_url ? (
                <img
                  src={draggedPlayer.photo_url}
                  alt={draggedPlayer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-xs md:text-sm">
                  {draggedPlayer.identification.slice(-2)}
                </div>
              )}
            </div>
            <div className="px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] md:text-xs max-w-[90px] text-center truncate shadow-lg border border-white/20">
              {draggedPlayer.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}