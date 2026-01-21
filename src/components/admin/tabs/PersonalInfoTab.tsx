import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { ChangeEvent } from 'react';

interface PersonalInfoTabProps {
  editedPlayer: any;
  setEditedPlayer: (player: any) => void;
}

export function PersonalInfoTab({ editedPlayer, setEditedPlayer }: PersonalInfoTabProps) {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border p-6">
        <h3 className="text-foreground text-xl font-semibold mb-4">Datos Personales</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Nombre Completo</Label>
            <Input
              value={editedPlayer.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
              className="bg-input-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              value={editedPlayer.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPlayer({ ...editedPlayer, email: e.target.value })}
              className="bg-input-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Teléfono</Label>
            <Input
              value={editedPlayer.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPlayer({ ...editedPlayer, phone: e.target.value })}
              className="bg-input-background border-border text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={editedPlayer.birth_date || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPlayer({ ...editedPlayer, birth_date: e.target.value })}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPlayer({ ...editedPlayer, position: e.target.value })}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedPlayer({ ...editedPlayer, description: e.target.value })}
              placeholder="Descripción, características del jugador, fortalezas..."
              rows={4}
              className="bg-input-background border-border text-foreground"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
