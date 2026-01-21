import { Card } from '../../ui/card';
import { Heart } from 'lucide-react';

interface HealthTabProps {
  editedPlayer: any;
}

export function HealthTab({ editedPlayer }: HealthTabProps) {
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
  );
}
