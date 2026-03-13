import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Edit2, Eye, ArrowLeft, History } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface PhysiotherapyEvaluation {
  id?: string;
  player_id: string;
  player_name: string;
  player_age?: number;
  player_identification?: string;
  player_gender?: string;
  player_eps?: string;
  evaluation_date: string;
  evaluator_name?: string;
  height_cm?: number;
  weight_kg?: number;
  imc?: number;
  heart_rate_rest?: number;
  pathological_history?: string;
  pathological_history_details?: string;
  feeding_perception?: string;
  sleep_quality?: string;
  rom_mmss_status?: string;
  strength_mmss_status?: string;
  plancha_core_time_seconds?: number;
  romberg_time_open_eyes_seconds?: number;
  romberg_time_closed_eyes_seconds?: number;
  ruffier_fc_rest_p1?: number;
  ruffier_fc_post_effort_p2?: number;
  ruffier_fc_recovery_p3?: number;
  ruffier_classification?: string;
  squat_knee_alignment?: string;
  squat_movement_quality?: string;
  physiotherapist_note?: string;
  evolution_note?: string;
  health_status?: string;
}

interface Player {
  id: string;
  name: string;
  identification: string;
  birth_date?: string;
  health_status?: string;
}

type ViewType = 'list' | 'create' | 'edit' | 'view' | 'history';

export function PhysiotherapyManagement() {
  const [viewType, setViewType] = useState<ViewType>('list');
  const [evaluations, setEvaluations] = useState<PhysiotherapyEvaluation[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PhysiotherapyEvaluation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PhysiotherapyEvaluation>>({
    evaluation_date: new Date().toISOString().split('T')[0],
    health_status: 'Perfecto',
  });

  const [historyPlayerId, setHistoryPlayerId] = useState<string | null>(null);
  const [returnToTarget, setReturnToTarget] = useState<ViewType>('list');

  useEffect(() => {
    loadPlayers();
    loadEvaluations();
  }, []);

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return 0;
    const today = new Date();
    const [y, m, d] = birthDate.split('-');
    const birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, identification, birth_date, health_status')
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Error cargando jugadores');
    }
  };

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('physiotherapy_evaluations')
        .select('*')
        .eq('is_active', true)
        .order('evaluation_date', { ascending: false });

      if (error) throw error;
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Error cargando evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!formData.player_id || !formData.evaluation_date) {
      toast.error('Completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const evaluationData = { ...formData };
      
      if (selectedEvaluation?.id) {
        const { error } = await supabase
          .from('physiotherapy_evaluations')
          .update(evaluationData)
          .eq('id', selectedEvaluation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('physiotherapy_evaluations')
          .insert([evaluationData]);

        if (error) throw error;
      }

      if (formData.health_status) {
        const { error: playerError } = await supabase
          .from('players')
          .update({ health_status: formData.health_status })
          .eq('id', formData.player_id);
          
        if (playerError) {
          console.error("Error updating player health status", playerError);
          toast.warning('Evaluación guardada pero el estado de salud del jugador no se actualizó');
        } else {
          toast.success('Evaluación y estado de salud guardados de forma exitosa');
        }
      } else {
        toast.success(selectedEvaluation?.id ? 'Evaluación actualizada' : 'Evaluación creada');
      }

      await loadEvaluations();
      await loadPlayers();
      resetForm();
      setViewType('list');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Error guardando evaluación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ evaluation_date: new Date().toISOString().split('T')[0], health_status: 'Perfecto' });
    setSelectedEvaluation(null);
  };

  const handleEdit = (evaluation: PhysiotherapyEvaluation) => {
    setSelectedEvaluation(evaluation);
    setFormData(evaluation);
    setViewType('edit');
  };

  const handleView = (evaluation: PhysiotherapyEvaluation, returnTo: ViewType = 'list') => {
    setSelectedEvaluation(evaluation);
    setReturnToTarget(returnTo);
    setViewType('view');
  };

  const handleViewHistory = (playerId: string) => {
    setHistoryPlayerId(playerId);
    setViewType('history');
  };

  const filteredEvaluations = evaluations.filter(
    (e) =>
      e.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.player_identification?.includes(searchTerm)
  );

  const selectedPlayer = players.find((p) => p.id === formData.player_id);

  // HISTORY VIEW
  if (viewType === 'history' && historyPlayerId) {
    const playerEvals = evaluations.filter(e => e.player_id === historyPlayerId);
    const histPlayer = players.find(p => p.id === historyPlayerId);

    return (
      <div className="p-6 space-y-6 max-w-4xl">
        <Button variant="outline" onClick={() => setViewType('list')} className="gap-2">
          <ArrowLeft size={16} />
          Volver
        </Button>

        <div>
          <h2 className="text-3xl font-bold text-foreground">Historial Médico</h2>
          <p className="text-muted-foreground mt-1">
            Paciente: <span className="font-semibold text-foreground">{histPlayer?.name}</span> ({histPlayer?.identification})
          </p>
        </div>

        {playerEvals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">No hay registros para este jugador.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {playerEvals.map((evalRecord, idx) => (
              <Card key={evalRecord.id || idx} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-foreground">
                          {new Date(evalRecord.evaluation_date).toLocaleDateString()}
                        </span>
                        {evalRecord.health_status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            evalRecord.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            evalRecord.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            evalRecord.health_status === 'Inhabilitado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-muted text-muted-foreground border-border'
                          }`}>
                            {evalRecord.health_status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Evaluador: {evalRecord.evaluator_name || 'N/A'}</p>
                      {(evalRecord.physiotherapist_note || evalRecord.evolution_note) && (
                        <p className="text-sm text-foreground mt-2 line-clamp-2">
                          <span className="font-semibold text-muted-foreground text-xs uppercase mr-1">Tópico:</span> 
                          {evalRecord.evolution_note || evalRecord.physiotherapist_note}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(evalRecord, 'history')}>
                        <Eye size={16} className="mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  if (viewType === 'list') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Evaluaciones Fisioterapéuticas</h2>
            <p className="text-muted-foreground mt-1">Gestiona las evaluaciones de fisioterapia</p>
          </div>
          <Button onClick={() => { resetForm(); setViewType('create'); }} className="gap-2">
            <Plus size={20} />
            Nueva Evaluación
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Evaluations List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Cargando evaluaciones...</p>
              </CardContent>
            </Card>
          ) : filteredEvaluations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No hay evaluaciones fisioterapéuticas</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Jugador</p>
                      <p className="font-semibold text-foreground truncate">{evaluation.player_name}</p>
                      <p className="text-xs text-muted-foreground">{evaluation.player_identification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-semibold text-foreground">{new Date(evaluation.evaluation_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      {evaluation.health_status && (
                        <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          evaluation.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          evaluation.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          evaluation.health_status === 'Inhabilitado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-muted text-muted-foreground border-border'
                        }`}>
                          {evaluation.health_status}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleViewHistory(evaluation.player_id)} title="Ver Historial Completo">
                        <History size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleView(evaluation, 'list')} title="Ver Detalles">
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(evaluation)} title="Editar Evaluación">
                        <Edit2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewType === 'view') {
    return (
      <div className="p-6 space-y-6 max-w-4xl">
        <Button variant="outline" onClick={() => setViewType(returnToTarget)} className="gap-2">
          <ArrowLeft size={16} />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Evaluación Fisioterapéutica</CardTitle>
            <CardDescription>
              {selectedEvaluation?.player_name} - {new Date(selectedEvaluation?.evaluation_date || '').toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Nombre</Label>
                <p className="font-semibold text-foreground">{selectedEvaluation?.player_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Edad</Label>
                <p className="font-semibold text-foreground">{selectedEvaluation?.player_age || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Documento</Label>
                <p className="font-semibold text-foreground">{selectedEvaluation?.player_identification || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-foreground mb-4">Estado Actual</h3>
              <div>
                <Label className="text-muted-foreground text-xs">Estado de Salud</Label>
                <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedEvaluation?.health_status === 'Perfecto' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  selectedEvaluation?.health_status === 'Con leves restricciones' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  selectedEvaluation?.health_status === 'Inhabilitado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {selectedEvaluation?.health_status || 'Perfecto'}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-foreground mb-4">Medidas Antropométricas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Talla (cm)</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.height_cm || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Peso (kg)</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.weight_kg || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">IMC</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.imc?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">FC en reposo</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.heart_rate_rest || 'N/A'} bpm</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-foreground">Pruebas Funcionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">ROM MMSS</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.rom_mmss_status || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Fuerza MMSS</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.strength_mmss_status || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Plancha Core (seg)</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.plancha_core_time_seconds || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Ruffier</Label>
                  <p className="font-semibold text-foreground">{selectedEvaluation?.ruffier_classification || 'N/A'}</p>
                </div>
              </div>
            </div>

            {(selectedEvaluation?.physiotherapist_note || selectedEvaluation?.evolution_note) && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-foreground">Notas</h3>
                {selectedEvaluation?.physiotherapist_note && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Nota del Fisioterapeuta</Label>
                    <p className="text-foreground whitespace-pre-wrap">{selectedEvaluation.physiotherapist_note}</p>
                  </div>
                )}
                {selectedEvaluation?.evolution_note && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Nota de Evolución</Label>
                    <p className="text-foreground whitespace-pre-wrap">{selectedEvaluation.evolution_note}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={() => handleEdit(selectedEvaluation!)} className="gap-2">
                <Edit2 size={16} />
                Editar
              </Button>
              <Button variant="outline" onClick={() => setViewType(returnToTarget)}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form view (create/edit)
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <Button variant="outline" onClick={() => { setViewType('list'); resetForm(); }} className="gap-2">
        <ArrowLeft size={16} />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{selectedEvaluation ? 'Editar' : 'Nueva'} Evaluación Fisioterapéutica</CardTitle>
          <CardDescription>
            Completa la información de la evaluación del jugador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label htmlFor="player">Jugador *</Label>
            <Select value={formData.player_id || ''} onValueChange={(value) => {
              const player = players.find(p => p.id === value);
              if (player) {
                setFormData({
                  ...formData,
                  player_id: value,
                  player_name: player.name,
                  player_identification: player.identification,
                  player_age: calculateAge(player.birth_date),
                });
              }
            }}>
              <SelectTrigger id="player">
                <SelectValue placeholder="Selecciona un jugador" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} ({player.identification})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          {selectedPlayer && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Jugador seleccionado:</p>
              <p className="font-semibold text-foreground">{selectedPlayer.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedPlayer.identification} | Edad: {calculateAge(selectedPlayer.birth_date)}</p>
            </div>
          )}

          {/* Evaluation Date and Evaluator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Evaluación *</Label>
              <Input
                id="date"
                type="date"
                value={formData.evaluation_date || ''}
                onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evaluator">Nombre del Evaluador</Label>
              <Input
                id="evaluator"
                placeholder="Juan Pérez"
                value={formData.evaluator_name || ''}
                onChange={(e) => setFormData({ ...formData, evaluator_name: e.target.value })}
              />
            </div>
          </div>

          {/* Anthropometric Measures */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Medidas Antropométricas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Talla (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  placeholder="175"
                  value={formData.height_cm || ''}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="65"
                  value={formData.weight_kg || ''}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imc">IMC</Label>
                <Input
                  id="imc"
                  type="number"
                  step="0.01"
                  placeholder="21.2"
                  value={formData.imc || ''}
                  onChange={(e) => setFormData({ ...formData, imc: e.target.value ? parseFloat(e.target.value) : undefined })}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Calculado automáticamente</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fc">FC en Reposo (bpm)</Label>
                <Input
                  id="fc"
                  type="number"
                  placeholder="75"
                  value={formData.heart_rate_rest || ''}
                  onChange={(e) => setFormData({ ...formData, heart_rate_rest: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          {/* Current Health Status */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Estado de Salud Actual</h3>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="health_status">Estado de Salud General *</Label>
              <Select value={formData.health_status || 'Perfecto'} onValueChange={(value) => setFormData({ ...formData, health_status: value })}>
                <SelectTrigger id="health_status" className={
                  formData.health_status === 'Perfecto' ? 'border-green-500/50 text-green-600 font-medium' :
                  formData.health_status === 'Con leves restricciones' ? 'border-amber-500/50 text-amber-600 font-medium' :
                  formData.health_status === 'Inhabilitado' ? 'border-red-500/50 text-red-600 font-medium' : ''
                }>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perfecto" className="text-green-600 font-medium">Perfecto</SelectItem>
                  <SelectItem value="Con leves restricciones" className="text-amber-600 font-medium">Con leves restricciones</SelectItem>
                  <SelectItem value="Inhabilitado" className="text-red-600 font-medium">Inhabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medical History */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Antecedentes Médicos</h3>
            <div className="space-y-2">
              <Label htmlFor="pathological">¿Antecedentes Patológicos?</Label>
              <Select value={formData.pathological_history || ''} onValueChange={(value) => setFormData({ ...formData, pathological_history: value })}>
                <SelectTrigger id="pathological">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SI">SI</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.pathological_history === 'SI' && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="pathological_details">Detalles</Label>
                <Textarea
                  id="pathological_details"
                  placeholder="Describe los antecedentes patológicos..."
                  value={formData.pathological_history_details || ''}
                  onChange={(e) => setFormData({ ...formData, pathological_history_details: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Nutrition & Sleep */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Hábitos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeding">Percepción de Alimentación</Label>
                <Select value={formData.feeding_perception || ''} onValueChange={(value) => setFormData({ ...formData, feeding_perception: value })}>
                  <SelectTrigger id="feeding">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adecuada">Adecuada</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Inadecuada">Inadecuada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep">Calidad del Sueño</Label>
                <Select value={formData.sleep_quality || ''} onValueChange={(value) => setFormData({ ...formData, sleep_quality: value })}>
                  <SelectTrigger id="sleep">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buena">Buena</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Mala">Mala</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Musculoskeletal Tests */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Evaluación Musculoesquelética</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rom">ROM MMSS</Label>
                <Select value={formData.rom_mmss_status || ''} onValueChange={(value) => setFormData({ ...formData, rom_mmss_status: value })}>
                  <SelectTrigger id="rom">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Fuerza MMSS</Label>
                <Select value={formData.strength_mmss_status || ''} onValueChange={(value) => setFormData({ ...formData, strength_mmss_status: value })}>
                  <SelectTrigger id="strength">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plancha">Plancha Core (seg)</Label>
                <Input
                  id="plancha"
                  type="number"
                  placeholder="30"
                  value={formData.plancha_core_time_seconds || ''}
                  onChange={(e) => setFormData({ ...formData, plancha_core_time_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          {/* Balance & Ruffier */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Tests Especiales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="romberg_open">Romberg - Ojos Abiertos (seg)</Label>
                <Input
                  id="romberg_open"
                  type="number"
                  placeholder="30"
                  value={formData.romberg_time_open_eyes_seconds || ''}
                  onChange={(e) => setFormData({ ...formData, romberg_time_open_eyes_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="romberg_closed">Romberg - Ojos Cerrados (seg)</Label>
                <Input
                  id="romberg_closed"
                  type="number"
                  placeholder="20"
                  value={formData.romberg_time_closed_eyes_seconds || ''}
                  onChange={(e) => setFormData({ ...formData, romberg_time_closed_eyes_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruffier">Clasificación Ruffier</Label>
                <Select value={formData.ruffier_classification || ''} onValueChange={(value) => setFormData({ ...formData, ruffier_classification: value })}>
                  <SelectTrigger id="ruffier">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excelente adaptación cardiovascular">Excelente adaptación cardiovascular</SelectItem>
                    <SelectItem value="Buena eficiencia cardiaca">Buena eficiencia cardiaca</SelectItem>
                    <SelectItem value="Adaptación adecuada">Adaptación adecuada</SelectItem>
                    <SelectItem value="Condición física baja">Condición física baja</SelectItem>
                    <SelectItem value="Baja tolerancia al esfuerzo">Baja tolerancia al esfuerzo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Squat Test */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Sentadilla Unipodal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="squat_knee">Alineación de Rodilla</Label>
                <Select value={formData.squat_knee_alignment || ''} onValueChange={(value) => setFormData({ ...formData, squat_knee_alignment: value })}>
                  <SelectTrigger id="squat_knee">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="squat_movement">Calidad del Movimiento</Label>
                <Select value={formData.squat_movement_quality || ''} onValueChange={(value) => setFormData({ ...formData, squat_movement_quality: value })}>
                  <SelectTrigger id="squat_movement">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Notas</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physio_note">Nota del Fisioterapeuta</Label>
                <Textarea
                  id="physio_note"
                  placeholder="Observaciones del fisioterapeuta..."
                  value={formData.physiotherapist_note || ''}
                  onChange={(e) => setFormData({ ...formData, physiotherapist_note: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolution">Nota de Evolución</Label>
                <Textarea
                  id="evolution"
                  placeholder="Evolución y progreso del jugador..."
                  value={formData.evolution_note || ''}
                  onChange={(e) => setFormData({ ...formData, evolution_note: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 flex gap-3">
            <Button onClick={handleSaveEvaluation} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
            <Button variant="outline" onClick={() => { setViewType('list'); resetForm(); }} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
