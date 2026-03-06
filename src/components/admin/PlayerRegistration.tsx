import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { ArrowLeft, Save, UserPlus, FileText, Check, Copy } from 'lucide-react';
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
    previous_team: '',
    description: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('name').order('name');
      if (error) throw error;
      if (data && data.length > 0) {
        setCategories(data.map(c => c.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const generateSecurePassword = (name: string, id: string) => {
    // 1. First word of name, capitalized
    const cleanName = name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const prefix = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

    // 2. Last 4 digits of ID
    const idSuffix = id.length >= 4 ? id.slice(-4) : id.padEnd(4, '0');

    // 3. Random special char
    const specialChars = ['!', '@', '#', '$', '%', '&'];
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];

    // 4. Random 2-digit number for entropy
    const random = Math.floor(Math.random() * 90 + 10); // 10-99

    // Format: Name + ID_Suffix + Special + Random
    // Ex: Juan4592@88
    return `${prefix}${idSuffix}${special}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.identification || !formData.phone || !formData.category) {
      toast.error('Por favor completa todos los campos obligatorios (nombre, documento, teléfono, categoría)');
      return;
    }

    setIsSubmitting(true);

    const password = generateSecurePassword(formData.name, formData.identification);
    
    // Generate email from identification if not provided
    const emailToUse = formData.email || `jugador.${formData.identification.replace(/\s/g, '')}@golica.local`;

    try {
      // Usar la función de Supabase para crear el usuario de forma segura
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: emailToUse,
          password: password,
          name: formData.name,
          role: 'player',
          identification: formData.identification,
          phone: formData.phone,
          category: formData.category,
          position: formData.position || null,
          birth_date: formData.birthDate || null,
          previous_team: formData.previous_team || null,
          description: formData.description || null,
        }
      });

      if (error) {
        console.error('❌ Error invoking function:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // Handle network/404 errors with better advice
        if (error.message?.includes('Failed to send a request') || error.status === 404) {
          toast.error('Error: La Función Edge no está desplegada o es inalcanzable.', {
            duration: 6000
          });
        } else {
          toast.error('Error al registrar: ' + (error.message || 'Error desconocido'));
        }
        return;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        toast.error('Error del servidor: ' + data.error);
        return;
      }

      toast.success('¡Jugador registrado exitosamente!');

      setCreatedCredentials({
        email: `${formData.name} (Documento: ${formData.identification})`,
        password: password
      });

    } catch (error) {
      console.error('Error registering player:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('¡Copiado al portapapeles!');
  };

  // --- Success View (Credentials) ---
  if (createdCredentials) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 border-primary/20 bg-card shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <Check className="text-green-500 w-8 h-8" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">¡Jugador Creado!</h2>
            <p className="text-muted-foreground mt-1">El jugador ha sido registrado en el sistema.</p>
          </div>

          <div className="bg-muted/40 rounded-xl p-6 space-y-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Credenciales de Acceso
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Datos del Jugador</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground break-all">
                  {createdCredentials.email}
                </code>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdCredentials.email)}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Contraseña Temporal</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-sm font-mono text-foreground break-all">
                  {createdCredentials.password}
                </code>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdCredentials.password)}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mt-4">
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                ℹ️ <strong>Login:</strong> El jugador puede iniciar sesión usando su <strong>número de documento</strong> y esta <strong>contraseña</strong>.
              </p>
            </div>


            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-4">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                ⚠️ <strong>Importante:</strong> Comparte estas credenciales con el jugador. La contraseña es temporal y única.
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              className="w-full bg-primary text-primary-foreground font-bold"
              onClick={onBack}
            >
              Finalizar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Registration Form ---
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
              <p className="text-muted-foreground">Completa la información. Las credenciales se generarán automáticamente.</p>
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
                    Email <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jugador@email.com (si no se proporciona, se generará uno automático)"
                    className="bg-input-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Si dejas vacío, se generará automáticamente</p>
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

                <div>
                  <Label className="text-foreground">Equipo de Procedencia</Label>
                  <Input
                    value={formData.previous_team}
                    onChange={(e) => setFormData({ ...formData, previous_team: e.target.value })}
                    placeholder="Ej: Club Deportivo X"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Descripción</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descripción del jugador"
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
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <label key={cat} className="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-muted/50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-border text-primary"
                            checked={formData.category.includes(cat)}
                            onChange={(e) => {
                              const currentCats = formData.category ? formData.category.split(', ') : [];
                              const newCats = e.target.checked
                                ? (formData.category ? [...currentCats, cat].join(', ') : cat)
                                : currentCats.filter((c: string) => c !== cat).join(', ');
                              setFormData({ ...formData, category: newCats });
                            }}
                          />
                          <span className="text-sm">{cat}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic col-span-2">No hay categorías configuradas</p>
                    )}
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
                  <h4 className="text-foreground font-semibold mb-2">Seguridad</h4>
                  <p className="text-muted-foreground text-sm">
                    La contraseña será <strong>generada automáticamente</strong> basada en los datos del jugador para garantizar seguridad y facilidad de uso.
                  </p>
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
              {isSubmitting ? 'Generando...' : 'Registrar Jugador'}
            </Button>
          </div>
        </form>

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Al registrar un usuario, se te mostrarán sus credenciales de acceso una única vez.
          </p>
        </div>
      </div>
    </div>
  );
}

