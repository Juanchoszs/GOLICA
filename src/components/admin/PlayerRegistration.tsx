import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface PlayerRegistrationProps {
  onBack: () => void;
}

export function PlayerRegistration({ onBack }: PlayerRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    email: '',
    phone: '',
    birthDate: '',
    category: '',
    position: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.identification || !formData.email || !formData.phone || !formData.category) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          name: formData.name,
          identification: formData.identification,
          email: formData.email,
          phone: formData.phone,
          birth_date: formData.birthDate || null,
          category: formData.category,
          position: formData.position || null,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya existe un jugador con esta identificación');
        } else {
          throw error;
        }
        return;
      }

      toast.success('¡Jugador registrado exitosamente!');
      onBack();
    } catch (error) {
      console.error('Error registering player:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-foreground hover:bg-muted"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver a la lista
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
              <UserPlus className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Registrar Nuevo Jugador</h1>
              <p className="text-muted-foreground">Completa la información del jugador</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4">Datos Personales</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Juan Pérez González"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">
                    Identificación <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.identification}
                    onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                    required
                    placeholder="1234567890"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="jugador@email.com"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+57 301 234 5678"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
              </div>
            </Card>

            {/* Datos Deportivos */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-foreground text-xl font-semibold mb-4">Datos Deportivos</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">
                    Categorías <span className="text-red-500">*</span> (Selecciona una o varias)
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23', 'Profesional'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-muted/50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-border text-primary"
                          checked={formData.category.includes(cat)}
                          onChange={(e) => {
                            const newCats = e.target.checked
                              ? (formData.category ? `${formData.category}, ${cat}` : cat)
                              : formData.category.split(', ').filter((c: string) => c !== cat).join(', ');
                            setFormData({ ...formData, category: newCats });
                          }}
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Posición</Label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-input-background border border-border text-foreground"
                  >
                    <option value="">Selecciona una posición</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa Central">Defensa Central</option>
                    <option value="Lateral Derecho">Lateral Derecho</option>
                    <option value="Lateral Izquierdo">Lateral Izquierdo</option>
                    <option value="Pivote">Pivote</option>
                    <option value="Mediocampista Central">Mediocampista Central</option>
                    <option value="Mediocampista Ofensivo">Mediocampista Ofensivo</option>
                    <option value="Extremo Derecho">Extremo Derecho</option>
                    <option value="Extremo Izquierdo">Extremo Izquierdo</option>
                    <option value="Delantero Centro">Delantero Centro</option>
                    <option value="Segundo Delantero">Segundo Delantero</option>
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
                  <h4 className="text-foreground font-semibold mb-2">Información Adicional</h4>
                  <p className="text-muted-foreground text-sm">
                    Una vez registrado el jugador, podrás editar:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                    <li>Descripción del jugador</li>
                    <li>Rendimiento en entrenamientos</li>
                    <li>Estadísticas de partidos (Goles/Asistencias)</li>
                    <li>Subir documentos e identificación</li>
                    <li>Registrar tests y evaluaciones</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft size={20} className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save size={20} className="mr-2" />
              {isSubmitting ? 'Registrando...' : 'Registrar Jugador'}
            </Button>
          </div>
        </form>

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            Puedes agregar información adicional después del registro.
          </p>
        </div>
      </div>
    </div>
  );
}
