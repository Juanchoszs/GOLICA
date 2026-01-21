import { Card } from '../../ui/card';
import { Activity, Trophy } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ChangeEvent } from 'react';

interface PerformanceTabProps {
  editedPlayer: any;
  setEditedPlayer: (player: any) => void;
}

export function PerformanceTab({ editedPlayer, setEditedPlayer }: PerformanceTabProps) {
  return (
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
  );
}
