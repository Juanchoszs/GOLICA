import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, Mail, CheckCircle2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '../contexts/AuthContext';

export function LoginPage() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const benefits = [
    'Acceso a convocatorias y calendario de partidos',
    'Seguimiento personalizado de tu rendimiento',
    'Visualización de estadísticas y progreso',
    'Prioridad en eventos y torneos del club',
    'Acceso a material de entrenamiento exclusivo',
    'Comunicación directa con el cuerpo técnico',
    'Historial de estadísticas personales',
    'Certificados y diplomas digitales',
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(credential, password);

      if (result.success) {
        toast.success('¡Inicio de sesión exitoso!');
      } else {
        toast.error(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
                <span className="text-primary text-sm">Área Exclusiva</span>
              </div>
              <h1 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Portal
                <br />
                <span className="text-primary">GOL ICA</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Accede a tu espacio personal y disfruta de todos los beneficios de ser parte de nuestra familia deportiva
              </p>
            </div>

            <Card className="bg-card border-border p-8 mb-8">
              <h3 className="text-card-foreground text-2xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Beneficios del Portal
              </h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="text-foreground mb-2">¿Necesitas acceso?</h4>
                  <p className="text-muted-foreground text-sm">
                    Si necesitas acceso al sistema, contacta al administrador del club para que te creen una cuenta.
                  </p>
                  <p className="text-primary text-sm mt-2">
                    📞 <a href="https://wa.me/573012345678" target="_blank" rel="noopener noreferrer" className="hover:text-primary/80">+57 301 234 5678</a> | 📧 golica@gmail.com
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Login Form */}
          <div className="order-1 lg:order-2">
            <Card className="bg-card border-border p-8">
              <div className="mb-6">
                <h2 className="text-foreground text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Iniciar Sesión
                </h2>
                <p className="text-muted-foreground text-sm">
                  Ingresa tu documento o email y tu contraseña
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="login-credential" className="text-foreground flex items-center gap-2">
                    <UserCircle size={16} />
                    Documento o Email
                  </Label>
                  <Input
                    id="login-credential"
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                    placeholder="Tu documento de identidad o email"
                    className="bg-input-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Jugadores: ingresa tu número de documento
                    <br />
                    Administradores: ingresa tu email
                  </p>
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-foreground flex items-center gap-2">
                    <Lock size={16} />
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-input-background border-border text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Card>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Lock size={14} />
                Tus datos están protegidos y encriptados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
