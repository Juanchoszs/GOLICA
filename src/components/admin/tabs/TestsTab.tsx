import { Card } from '../../ui/card';
import { Trophy } from 'lucide-react';

interface TestsTabProps {
  editedPlayer: any;
}

export function TestsTab({ editedPlayer }: TestsTabProps) {
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

  return (
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
  );
}
