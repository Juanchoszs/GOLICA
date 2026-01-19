import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Save, Shield, Activity, Heart, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface PlayerDetailsProps {
  player: any;
  onBack: () => void;
  user: any;
}

export function PlayerDetails({ player, onBack, user }: PlayerDetailsProps) {
  const [editedPlayer, setEditedPlayer] = useState({
    ...player,
    description: player.description || '',
    position: player.position || '',
    performance: player.performance || {
      training: 0,
      matchGoals: 0,
      matchAssists: 0,
    },
    injuries: player.injuries || [],
    tests: player.tests || [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        name: editedPlayer.name,
        email: editedPlayer.email,
        phone: editedPlayer.phone,
        identification: editedPlayer.identification,
        category: editedPlayer.category,
        position: editedPlayer.position,
        status: editedPlayer.status,
        description: editedPlayer.description,
        performance: editedPlayer.performance,
        injuries: editedPlayer.injuries,
        tests: editedPlayer.tests,
        updated_at: new Date().toISOString()
      };

      if (editedPlayer.birth_date || editedPlayer.birthDate) {
        updateData.birth_date = editedPlayer.birth_date || editedPlayer.birthDate;
      }

      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Información actualizada correctamente');
      onBack();
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Error al actualizar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-foreground hover:bg-muted"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la lista
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary/20 border-2 border-primary/30 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{player.name}</h1>
              <p className="text-muted-foreground">ID: {player.identification}</p>
              <p className="text-muted-foreground text-sm">
                Registrado el {formatDate(player.registered_at)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-muted/30 mb-6">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Información General
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity size={16} className="mr-2" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Heart size={16} className="mr-2" />
            Fisioterapia
          </TabsTrigger>
          <TabsTrigger value="tests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy size={16} className="mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield size={16} className="mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Información General */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4">Datos Personales</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Nombre Completo</Label>
                  <Input
                    value={editedPlayer.name}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Email</Label>
                  <Input
                    type="email"
                    value={editedPlayer.email}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, email: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Teléfono</Label>
                  <Input
                    value={editedPlayer.phone}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, phone: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Fecha de Nacimiento</Label>
                    <Input
                      type="date"
                      value={editedPlayer.birth_date || ''}
                      onChange={(e) => setEditedPlayer({ ...editedPlayer, birth_date: e.target.value })}
                      className="bg-input-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Edad</Label>
                    <Input
                      value={calculateAge(editedPlayer.birth_date)}
                      disabled
                      className="bg-muted border-border text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4">Datos Deportivos</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Categorías</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23', 'Profesional'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-muted/50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-border text-primary"
                          checked={editedPlayer.category?.includes(cat) || false}
                          onChange={(e) => {
                            const currentCats = editedPlayer.category ? editedPlayer.category.split(', ') : [];
                            const newCats = e.target.checked
                              ? [...currentCats, cat].join(', ')
                              : currentCats.filter((c: string) => c !== cat).join(', ');
                            setEditedPlayer({ ...editedPlayer, category: newCats });
                          }}
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Posición</Label>
                  <Input
                    value={editedPlayer.position}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, position: e.target.value })}
                    placeholder="Ej: Delantero, Mediocampista, Defensa..."
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Estado</Label>
                  <select
                    value={editedPlayer.status}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-input-background border border-border text-foreground"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="injured">Lesionado</option>
                  </select>
                </div>
                <div>
                  <Label className="text-foreground">Descripción del Jugador</Label>
                  <Textarea
                    value={editedPlayer.description}
                    onChange={(e) => setEditedPlayer({ ...editedPlayer, description: e.target.value })}
                    placeholder="Descripción, características del jugador, fortalezas..."
                    rows={4}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Rendimiento */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-primary" size={24} />
                Rendimiento en Entrenamientos
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Nivel de Rendimiento (%)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editedPlayer.performance.training}
                      onChange={(e) =>
                        setEditedPlayer({
                          ...editedPlayer,
                          performance: {
                            ...editedPlayer.performance,
                            training: parseInt(e.target.value),
                          },
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-foreground font-bold text-2xl w-16 text-right">
                      {editedPlayer.performance.training}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${editedPlayer.performance.training}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="text-primary" size={24} />
                Estadísticas en Partidos
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Goles (G)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedPlayer.performance.matchGoals}
                    onChange={(e) =>
                      setEditedPlayer({
                        ...editedPlayer,
                        performance: {
                          ...editedPlayer.performance,
                          matchGoals: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Asistencias (A)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedPlayer.performance.matchAssists}
                    onChange={(e) =>
                      setEditedPlayer({
                        ...editedPlayer,
                        performance: {
                          ...editedPlayer.performance,
                          matchAssists: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                  <p className="text-muted-foreground text-sm mb-2">Resumen de Estadísticas</p>
                  <p className="text-foreground text-3xl font-bold">
                    {editedPlayer.performance.matchGoals}G / {editedPlayer.performance.matchAssists}A
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Total de contribuciones:{' '}
                    {(editedPlayer.performance.matchGoals || 0) + (editedPlayer.performance.matchAssists || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Fisioterapia */}
        <TabsContent value="health">
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              Antecedentes y Lesiones
            </h3>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Esta sección será editada desde el módulo de Fisioterapia. Aquí solo se visualiza la información.
              </p>
            </div>
            {editedPlayer.injuries && editedPlayer.injuries.length > 0 ? (
              <div className="space-y-4">
                {editedPlayer.injuries.map((injury: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-foreground font-semibold">{injury.type}</h4>
                      <span className="text-xs text-muted-foreground">{formatDate(injury.date)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{injury.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="mx-auto text-muted-foreground mb-2" size={48} />
                <p className="text-muted-foreground">No hay antecedentes de lesiones registrados</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tests */}
        <TabsContent value="tests">
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="text-primary" size={24} />
              Tests y Evaluaciones
            </h3>
            {editedPlayer.tests && editedPlayer.tests.length > 0 ? (
              <div className="space-y-4">
                {editedPlayer.tests.map((test: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-foreground font-semibold">{test.name}</h4>
                      <span className="text-xs text-muted-foreground">{formatDate(test.date)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Resultado</p>
                        <p className="text-foreground font-medium">{test.result}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Evaluador</p>
                        <p className="text-foreground font-medium">{test.evaluator || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="mx-auto text-muted-foreground mb-2" size={48} />
                <p className="text-muted-foreground">No hay tests registrados</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="mt-6">
          <Card className="bg-card border-border p-8 text-center">
            <Shield size={48} className="text-primary mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold mb-2 text-foreground">Gestión de Documentos</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              La carga de documentos de identidad es realizada directamente por el jugador desde su portal personal.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Actions */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-border text-foreground hover:bg-muted"
        >
          <ArrowLeft size={20} className="mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save size={20} className="mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
