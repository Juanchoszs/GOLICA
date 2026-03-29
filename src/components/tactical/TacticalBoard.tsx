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
import { Search, Save, RotateCcw, ChevronLeft, UserCog, Zap, Shield, TrendingUp, LayoutGrid } from 'lucide-react';

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
      activationConstraint: { delay: 150, tolerance: 10 },
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
    // Only allow dropping on valid positions of the current formation
    const isValidPosition = currentLineup.positions.some(p => p.id === targetPosId);
    if (!isValidPosition) return;

    const prevPosId = Object.keys(assignments).find(k => assignments[k] === playerId);

    setAssignments(prev => {
      const next = { ...prev };
      
      // If the player was already assigned elsewhere, clear that position
      if (prevPosId) {
        delete next[prevPosId];
      }

      const existingPlayerId = next[targetPosId];
      
      // If we're dropping onto an occupied slot
      if (existingPlayerId) {
        // SWAP: If moving from another position on the field, swap players
        if (prevPosId) {
          next[prevPosId] = existingPlayerId;
          toast.success('¡Intercambio de posiciones!');
        } else {
          // REPLACE: Moving from bench to an occupied slot
          // The previous player simply returns to the bench
          toast.info('Jugador reemplazado');
        }
      } else {
        // Just moving to an empty slot
        toast.success(prevPosId ? 'Posición ajustada' : 'Jugador asignado');
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

    // Goalkeeper check temporarily disabled for testing
    // const gkPos = currentLineup.positions.find(p => p.role === 'Portero');
    // if (gkPos && !assignments[gkPos.id]) {
    //   toast.error('¡Falta el Portero (GK)! 🛡️');
    //   return;
    // }

    const assignedCount = Object.keys(assignments).length;
    // Minimum player check temporarily disabled for testing
    // if (assignedCount < 11) {
    //   toast.error(`¡Equipo incompleto! Faltan ${11 - assignedCount} jugadores. ⚽`);
    //   return;
    // }

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

  const assignedCount = Object.keys(assignments).length;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col min-h-screen lg:h-screen lg:max-h-screen bg-gradient-to-br from-background via-background to-muted/20 lg:overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-lg z-50">
          <div className="flex items-center gap-3 md:gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Crear Convocatoria</h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium mt-0.5">
                {categoryName} <span className="text-primary">•</span> {currentLineup.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Player count badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl border border-border/50 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${assignedCount === 11
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse'
                : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                }`} />
              <div className="text-center">
                <div className="text-lg md:text-2xl font-black leading-none">{assignedCount}</div>
                <div className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">/ 11</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleReset}
              className="hidden sm:flex text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 border-dashed rounded-xl"
            >
              <RotateCcw size={16} className="mr-2" />
              Resetear
            </Button>

            <Button
              onClick={handleSaveWrapper}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 md:px-8 py-2.5 rounded-xl"
            >
              <Save size={16} className="mr-2" />
              <span className="hidden sm:inline">Guardar</span>
              <span className="sm:hidden">✓</span>
            </Button>
          </div>
        </div>

        {/* ── Formation Selector Bar (ALWAYS VISIBLE) ─────────────────── */}
        <div className="px-4 md:px-8 py-3 border-b border-border/40 bg-card/60 backdrop-blur-sm z-40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Formation select */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 shrink-0">
                <LayoutGrid size={16} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Alineación</span>
              </div>
              <Select value={selectedLineupId} onValueChange={handleLineupChange}>
                <SelectTrigger className="w-full sm:w-56 bg-background border-border/50 h-9 rounded-xl hover:border-primary/50 transition-colors text-sm font-bold">
                  <SelectValue placeholder="Seleccionar formación" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {FORMATIONS.map(l => (
                    <SelectItem key={l.id} value={l.id} className="py-2.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{l.name}</span>
                        <span className="text-xs text-muted-foreground">{l.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Formation composition pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <Shield size={11} />
                <span className="text-xs font-black">{formationStats.defenders}</span>
                <span className="text-[10px] font-semibold hidden sm:inline">DEF</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <UserCog size={11} />
                <span className="text-xs font-black">{formationStats.midfielders}</span>
                <span className="text-[10px] font-semibold hidden sm:inline">MED</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                <Zap size={11} />
                <span className="text-xs font-black">{formationStats.attackers}</span>
                <span className="text-[10px] font-semibold hidden sm:inline">ATA</span>
              </div>
              <div className="hidden md:flex items-center">
                <span className="text-xs text-muted-foreground italic">{currentLineup.description}</span>
              </div>
            </div>

            {/* Mobile reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="sm:hidden ml-auto text-muted-foreground hover:text-destructive"
            >
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>

        {/* ── Match Info Bar ───────────────────────────────────────── */}
        <div className="px-4 md:px-8 py-3 border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Rival</Label>
              <Input
                value={matchInfo.opponent}
                onChange={(e) => setMatchInfo({ ...matchInfo, opponent: e.target.value })}
                placeholder="Equipo rival"
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                value={matchInfo.date}
                onChange={(e) => setMatchInfo({ ...matchInfo, date: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Hora</Label>
              <Input
                type="time"
                value={matchInfo.time}
                onChange={(e) => setMatchInfo({ ...matchInfo, time: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Ubicación</Label>
              <Input
                value={matchInfo.location}
                onChange={(e) => setMatchInfo({ ...matchInfo, location: e.target.value })}
                placeholder="Estadio / Lugar"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">

          {/* Left Aside: visible only on XL — quick guide */}
          <aside className="w-72 hidden xl:flex flex-col p-6 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto gap-6">
            {/* Summary */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Resumen
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-black text-primary mb-1">
                    {assignments[currentLineup.positions.find(p => p.role === 'Portero')?.id || ''] ? '1' : '0'}/1
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Portero</div>
                </div>
                <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4 shadow-sm">
                  <div className={`text-3xl font-black mb-1 ${assignedCount === 11 ? 'text-emerald-500' : 'text-foreground'}`}>
                    {assignedCount}/11
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</div>
                </div>
              </div>
            </section>

            {/* Guide */}
            <section className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl">
              <h4 className="text-xs font-black text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[9px]">?</span>
                </div>
                Guía Rápida
              </h4>
              <ul className="space-y-3">
                {[
                  { num: '1', text: 'Elige la alineación en la barra superior' },
                  { num: '2', text: 'Los dropzones se adaptan automáticamente' },
                  { num: '3', text: 'Arrastra jugadores a las posiciones' },
                  { num: '4', text: 'Incluye portero y completa los 11' },
                ].map((step) => (
                  <li key={step.num} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0 mt-0.5">
                      {step.num}
                    </div>
                    <span className="text-xs text-muted-foreground leading-relaxed">{step.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          {/* Center: Tactical Pitch */}
          <section className="flex-1 bg-gradient-to-b from-muted/20 to-muted/40 p-4 md:p-8 flex items-center justify-center overflow-auto">
            <div className="w-full h-full max-w-4xl flex items-center justify-center">
              <SoccerPitch key={selectedLineupId}>
                <LineupSlots
                  positions={currentLineup.positions}
                  assignments={assignments}
                  getPlayer={getPlayer}
                />
              </SoccerPitch>
            </div>
          </section>

          {/* Right: Bench players */}
          <BenchPlayers
            players={players}
            filteredPlayers={filteredPlayers}
            searchTerm={searchTerm}
            onSearchChange={v => setSearchTerm(v)}
            assignedPlayerIds={assignedPlayerIds}
          />
        </div>
      </div>

      {/* Drag Overlay */}
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