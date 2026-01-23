import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { User, Camera, Upload, Heart, Trophy, AlertCircle } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';

interface PersonalInfoTabProps {
  editedPlayer: any;
  setEditedPlayer: (player: any) => void;
  setEditingImage: (state: { url: string; field: string } | null) => void;
}

export function PersonalInfoTab({ editedPlayer, setEditedPlayer, setEditingImage }: PersonalInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingImage({
          url: event.target?.result as string,
          field: 'photo_url'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const recentInjuries = editedPlayer.injuries 
    ? [...editedPlayer.injuries].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2)
    : [];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative group overflow-hidden">
            <div className="w-40 h-40 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300 group-hover:border-primary/40">
              {editedPlayer.photo_url ? (
                <img 
                  src={editedPlayer.photo_url} 
                  alt={editedPlayer.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={80} className="text-primary/40" />
              )}
            </div>
            <Button
              onClick={handlePhotoClick}
              size="icon"
              className="absolute bottom-2 right-2 rounded-full w-10 h-10 shadow-lg border-2 border-background"
            >
              <Camera size={18} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Foto de Jugador</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Esta foto se utilizará para la ficha técnica y el carnet del jugador. 
              Sube una foto clara del rostro.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePhotoClick}
                className="text-xs h-9 border-border hover:bg-muted"
              >
                <Upload size={14} className="mr-2" /> Subir Nueva Foto
              </Button>
              {editedPlayer.photo_url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingImage({ url: editedPlayer.photo_url, field: 'photo_url' })}
                  className="text-xs h-9 text-primary hover:bg-primary/5"
                >
                  Recortar Actual
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

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

      {/* Resumen de Ficha Técnica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antecedentes Médicos Recientes */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground text-lg font-semibold flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              Historial Médico
            </h3>
            <span className="text-xs text-muted-foreground">
              {editedPlayer.injuries?.length || 0} registro(s)
            </span>
          </div>
          {recentInjuries.length > 0 ? (
            <div className="space-y-3">
              {recentInjuries.map((injury: any, index: number) => (
                <div key={index} className="bg-muted/30 border border-border/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-foreground font-semibold text-sm">{injury.type}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(injury.date)}</span>
                  </div>
                  {injury.description && (
                    <p className="text-muted-foreground text-xs line-clamp-2">{injury.description}</p>
                  )}
                </div>
              ))}
              {editedPlayer.injuries?.length > 2 && (
                <p className="text-xs text-primary text-center pt-2">
                  Ver {editedPlayer.injuries.length - 2} más en pestaña Fisioterapia →
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <Heart className="mx-auto text-muted-foreground mb-2 opacity-20" size={32} />
              <p className="text-xs text-muted-foreground">Sin antecedentes registrados</p>
            </div>
          )}
        </Card>

        {/* Torneos Activos */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground text-lg font-semibold flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Torneos Actuales
            </h3>
            <span className="text-xs text-muted-foreground">
              {editedPlayer.tournaments?.length || 0} torneo(s)
            </span>
          </div>
          {editedPlayer.tournaments && editedPlayer.tournaments.length > 0 ? (
            <div className="space-y-2">
              {editedPlayer.tournaments.slice(0, 4).map((tournament: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                  <div className="bg-primary/20 p-1.5 rounded text-primary">
                    <Trophy size={12} />
                  </div>
                  <span className="text-foreground text-sm font-medium flex-1 line-clamp-1">{tournament}</span>
                </div>
              ))}
              {editedPlayer.tournaments.length > 4 && (
                <p className="text-xs text-primary text-center pt-2">
                  Ver {editedPlayer.tournaments.length - 4} más en pestaña Torneos →
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <Trophy className="mx-auto text-muted-foreground mb-2 opacity-20" size={32} />
              <p className="text-xs text-muted-foreground">Sin torneos asignados</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
