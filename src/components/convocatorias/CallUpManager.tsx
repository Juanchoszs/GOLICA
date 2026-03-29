import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { TacticalBoard } from '../tactical/TacticalBoard';
import { Player, CallUp } from '../tactical/types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { Users, ChevronRight, Plus, Calendar, Clock, MapPin, Trophy, X } from 'lucide-react';

interface CallUpManagerProps {
  allowedCategories?: string[];
}

export function CallUpManager({ allowedCategories }: CallUpManagerProps) {
  const [view, setView] = useState<'categories' | 'category_matches' | 'board'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Registration Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeScore, setHomeScore] = useState<number | ''>('');
  const [awayScore, setAwayScore] = useState<number | ''>('');
  const [matchEvents, setMatchEvents] = useState<{playerId: string, type: 'goal' | 'assist'}[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;

      const categoryNames = (data || []).map(c => c.name);

      if (allowedCategories) {
        // If categories are restricted, only show those included in the allowed list
        // If the list is empty, show nothing (filter will return empty)
        setCategories(categoryNames.filter(c => allowedCategories.includes(c)));
      } else {
        // If no restriction provided (admin view), show everything
        setCategories(categoryNames);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Error al cargar categorías');
    }
  };

  const loadCategoryMatches = async (category: string) => {
    setIsLoading(true);
    setSelectedCategory(category);
    setView('category_matches');

    try {
      const { data, error } = await supabase
        .from('convocatorias')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar historial de convocatorias');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayersForBoard = async () => {
    setIsLoading(true);
    setView('board');

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, health_status')
        .eq('category', selectedCategory)
        .eq('status', 'active');

      if (error) throw error;

      const formatted: Player[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        identification: p.identification,
        category: p.category,
        position: p.position,
        image: p.image_url,
        photo_url: p.photo_url,
        status: 'available',
        health_status: p.health_status,
      }));

      setPlayers(formatted);
    } catch (err) {
      console.error(err);
      setPlayers([]);
      toast.error('Error al cargar jugadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCallUp = async (callup: CallUp) => {
    try {
      if (!callup.opponent || !callup.date) {
        toast.error('Por favor ingresa rival y fecha');
        return;
      }

      let fullDate = callup.date;
      if (callup.date && callup.time) {
        const [hours, minutes] = callup.time.split(':');
        const dateObj = new Date(callup.date);
        dateObj.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        fullDate = dateObj.toISOString();
      } else if (callup.date) {
        const dateObj = new Date(callup.date);
        dateObj.setHours(12, 0, 0, 0);
        fullDate = dateObj.toISOString();
      }

      const playersList = Object.entries(callup.assignments).map(([posId, playerId]) => {
        const player = players.find(p => p.id === playerId);
        return {
          id: playerId,
          name: player?.name || '',
          position: player?.position,
          positionId: posId,
          isStarter: true,
        };
      });

      // Build payload — try full insert first, then fallback if columns don't exist
      const fullPayload = {
        opponent: callup.opponent,
        date: fullDate,
        time: callup.time || null,
        location: callup.location || null,
        category: callup.category,
        formation: callup.lineupId,
        players: playersList,
        match_status: 'pending',
      };

      let { error } = await supabase.from('convocatorias').insert([fullPayload]);

      // If columns like match_status / formation don't exist, retry without them
      if (error) {
        console.warn('Full insert failed, trying minimal payload:', error.message);
        const minimalPayload = {
          opponent: callup.opponent,
          date: fullDate,
          time: callup.time || null,
          location: callup.location || null,
          category: callup.category,
          players: playersList,
        };
        const fallback = await supabase.from('convocatorias').insert([minimalPayload]);
        if (fallback.error) throw fallback.error;
      }

      toast.success(`✅ Convocatoria guardada para ${callup.category}`);
      loadCategoryMatches(selectedCategory);
    } catch (err: any) {
      console.error('Error al guardar convocatoria:', err);
      toast.error(`Error al guardar: ${err?.message || JSON.stringify(err)}`, { duration: 8000 });
    }
  };

  // ----- MATCH RESULT LOGIC -----
  const openResultModal = (match: any) => {
    setSelectedMatch(match);
    setHomeScore(match.home_score ?? '');
    setAwayScore(match.away_score ?? '');
    setMatchEvents([]);
    setShowResultModal(true);
  };

  const handleSaveMatchResult = async () => {
    if (homeScore === '' || awayScore === '') {
      toast.error('Debes ingresar los goles de ambos equipos');
      return;
    }

    try {
      const toastId = toast.loading('Guardando resultado y actualizando rendimiento...');
      
      // 1. Guardar resultado del partido
      const { error: matchError } = await supabase
        .from('convocatorias')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          match_status: 'completed'
        })
        .eq('id', selectedMatch.id);
        
      if (matchError) throw matchError;

      // 2. Actualizar estadísticas de jugadores en bloque (simplificado)
      if (matchEvents.length > 0) {
        // Agrupar eventos por jugador
        const playerStatsUpdate: Record<string, { goals: number, assists: number }> = {};
        
        matchEvents.forEach(evt => {
            if (!playerStatsUpdate[evt.playerId]) {
                playerStatsUpdate[evt.playerId] = { goals: 0, assists: 0 };
            }
            if (evt.type === 'goal') playerStatsUpdate[evt.playerId].goals += 1;
            if (evt.type === 'assist') playerStatsUpdate[evt.playerId].assists += 1;
        });

        // Hacer la consulta y actualizacion jugador por jugador
        for (const [playerId, statsToAdd] of Object.entries(playerStatsUpdate)) {
            const { data: pData } = await supabase
                .from('players')
                .select('performance')
                .eq('id', playerId)
                .single();
                
            if (pData) {
                const currentPerf = pData.performance || { training: 0, matchGoals: 0, matchAssists: 0 };
                const newPerf = {
                    ...currentPerf,
                    matchGoals: (currentPerf.matchGoals || 0) + statsToAdd.goals,
                    matchAssists: (currentPerf.matchAssists || 0) + statsToAdd.assists
                };
                
                await supabase
                    .from('players')
                    .update({ performance: newPerf })
                    .eq('id', playerId);
            }
        }
      }

      toast.success('Resultado y estadísticas actualizadas', { id: toastId });
      setShowResultModal(false);
      loadCategoryMatches(selectedCategory); // Recargar
      
    } catch (error: any) {
      console.error(error);
      toast.error('Error al registrar resultados');
    }
  };


  // ----- VIEWS RENDER -----
  if (view === 'board') {
    return (
      <TacticalBoard
        players={players}
        categoryName={selectedCategory}
        onSave={handleSaveCallUp}
        onClose={() => setView('category_matches')}
      />
    );
  }

  if (view === 'category_matches') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <Button variant="ghost" className="mb-2 -ml-4" onClick={() => setView('categories')}>← Volver a categorías</Button>
                <h1 className="text-3xl font-bold text-foreground">Convocatorias: {selectedCategory}</h1>
                <p className="text-muted-foreground">Revisa el historial de partidos y registra los resultados.</p>
            </div>
            <Button onClick={loadPlayersForBoard} className="shrink-0">
                <Plus size={18} className="mr-2" /> Nueva Convocatoria
            </Button>
        </div>

        {isLoading ? (
            <div className="p-20 text-center animate-pulse text-muted-foreground">Cargando...</div>
        ) : matches.length === 0 ? (
            <div className="p-20 border-4 border-dashed border-border rounded-3xl text-center">
                <Calendar className="mx-auto mb-4 opacity-20" size={64}/>
                <h3 className="text-xl font-bold">No hay convocatorias</h3>
                <p className="text-muted-foreground mb-6">Crea la primera convocatoria para esta categoría.</p>
                <Button onClick={loadPlayersForBoard}>Crear Convocatoria</Button>
            </div>
        ) : (
            <div className="grid gap-6">
                {matches.map((match) => (
                    <Card key={match.id} className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center font-black text-2xl text-muted-foreground/30">
                                VS
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold uppercase mb-2">{match.opponent}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(match.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={16} /> {match.time} hs</span>
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {match.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                            {match.match_status === 'completed' ? (
                                <div className="text-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resultado Final</span>
                                    <div className="text-4xl font-black italic tracking-tighter">
                                        <span className={match.home_score > match.away_score ? 'text-green-500' : 'text-foreground'}>{match.home_score}</span>
                                        <span className="mx-2 text-muted-foreground">-</span>
                                        <span className={match.home_score < match.away_score ? 'text-red-500' : 'text-foreground'}>{match.away_score}</span>
                                    </div>
                                </div>
                            ) : (
                                <Button className="w-full md:w-auto" variant="outline" onClick={() => openResultModal(match)}>
                                    <Trophy size={18} className="mr-2" /> Registrar Resultado
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        )}

        {/* --- RESULT REGISTRATION MODAL --- */}
        {showResultModal && selectedMatch && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                <Card className="max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="flex justify-between items-center p-6 border-b border-border bg-card">
                        <div>
                            <h2 className="text-xl font-bold">Resultado: VS {selectedMatch.opponent}</h2>
                            <p className="text-sm text-muted-foreground">{new Date(selectedMatch.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)}>
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-8 bg-muted/5">
                        {/* Marcador */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Marcador Final</h3>
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-center space-y-2">
                                    <label className="text-xs font-bold">GOL ICA</label>
                                    <input 
                                        type="number" 
                                        value={homeScore} 
                                        onChange={(e) => setHomeScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className="w-24 h-24 text-center text-4xl font-black bg-card border-2 border-border focus:border-primary rounded-2xl outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="text-3xl font-black text-muted-foreground">-</span>
                                <div className="text-center space-y-2">
                                    <label className="text-xs font-bold uppercase">{selectedMatch.opponent}</label>
                                    <input 
                                        type="number" 
                                        value={awayScore} 
                                        onChange={(e) => setAwayScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className="w-24 h-24 text-center text-4xl font-black bg-card border-2 border-border focus:border-red-500 rounded-2xl outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Eventos (Goles y Asistencias) */}
                        {(typeof homeScore === 'number' && homeScore > 0) && (
                            <div className="space-y-4 pt-6 border-t border-border">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Anotaciones y Asistencias</h3>
                                <p className="text-xs text-muted-foreground mb-4">Selecciona qué jugador anotó o asistió para sumar a sus estadísticas globales de rendimiento.</p>
                                
                                <div className="grid gap-3">
                                    {selectedMatch.players?.map((p: any) => {
                                        const pGoals = matchEvents.filter(e => e.playerId === p.id && e.type === 'goal').length;
                                        const pAssists = matchEvents.filter(e => e.playerId === p.id && e.type === 'assist').length;

                                        return (
                                            <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-card border border-border rounded-xl gap-4">
                                                <div className="flex items-center gap-3 w-full sm:w-1/2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-sm truncate">{p.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">Goles</span>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMatchEvents([...matchEvents, {playerId: p.id, type: 'goal'}])} disabled={(matchEvents.filter(e => e.type === 'goal').length) >= (homeScore as number)}>
                                                            <Plus size={14} />
                                                        </Button>
                                                        <span className="font-bold text-primary w-4 text-center">{pGoals}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase">Asist.</span>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMatchEvents([...matchEvents, {playerId: p.id, type: 'assist'}])}>
                                                            <Plus size={14} />
                                                        </Button>
                                                        <span className="font-bold text-purple-500 w-4 text-center">{pAssists}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-border bg-card flex gap-4">
                        <Button variant="outline" className="flex-1" onClick={() => setShowResultModal(false)}>Cancelar</Button>
                        <Button className="flex-1" onClick={handleSaveMatchResult}>Guardar Resultado</Button>
                    </div>
                </Card>
            </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: Categories List
  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Convocatorias de Jugadores</h1>
        <p className="text-muted-foreground">
          Gestiona las alineaciones y convocatorias por categoría. Selecciona una categoría para comenzar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat} className="p-6 hover:border-primary/50 transition-all cursor-pointer group" onClick={() => loadCategoryMatches(cat)}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="text-primary" size={24} />
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-4">{cat}</h3>
          </Card>
        ))}
        {categories.length === 0 && (
             <div className="col-span-full p-10 text-center border-2 border-dashed rounded-xl">
                 <p className="text-muted-foreground">No tienes categorías asignadas o no hay categorías disponibles.</p>
             </div>
        )}
      </div>
    </div>
  );
}
