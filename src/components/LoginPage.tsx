import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserCircle, Lock, Mail, User, Phone, Calendar, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ identification: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    identification: '',
    email: '',
    phone: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Try Admin Login
      console.log('Attempting Admin login with:', loginData.identification);
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('identification', loginData.identification)
        .eq('password', loginData.password)
        .maybeSingle(); // Use maybeSingle to avoid 406 errors on 0 rows

<<<<<<< HEAD
      if (adminError) console.error('Admin login error:', adminError);

      if (admin) {
        toast.success('¡Inicio de sesión exitoso! Bienvenido al panel de administración.');
        const { password: _, ...adminSafedata } = admin;
        if (onLogin) onLogin({ ...adminSafedata, role: 'admin' });
        return;
=======
      if (error || !admin) {
        toast.error('Credenciales incorrectas');
      } else if (onLogin) {
        toast.success(`¡Inicio de sesión exitoso! Bienvenido ${admin.name}.`);
        const { password: _, ...adminSafedata } = admin;
        onLogin({
          ...adminSafedata,
          role: admin.role || 'admin'
        });
>>>>>>> 0da42fe (Backup de convocatorias)
      }

      // 2. Try Coach Login (Primary Fallback)
      console.log('Admin not found, trying Coach login...');
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('*')
        .eq('identification', loginData.identification)
        .eq('password', loginData.password)
        .maybeSingle();
      
      if (coachError) console.error('Coach login error:', coachError);

      if (coach) {
        toast.success(`¡Bienvenido Profe ${coach.name}!`);
        if (onLogin) onLogin({ ...coach, role: 'coach' });
        return;
      }

      // If neither found
      toast.error('Credenciales incorrectas');
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (registerData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          name: registerData.name,
          identification: registerData.identification,
          email: registerData.email,
          phone: registerData.phone,
          birth_date: registerData.birthdate || null,
          password: registerData.password,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          toast.error('Ya existe un registro con este email o identificación');
        } else {
          toast.error(`Error: ${error.message}`);
        }
        return;
      }

      toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
      setRegisterData({ name: '', identification: '', email: '', phone: '', birthdate: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error al registrarse. Inténtalo de nuevo.');
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
                Portal de Jugadores
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
                  <h4 className="text-foreground mb-2">¿Nuevo en GOL ICA?</h4>
                  <p className="text-muted-foreground text-sm">
                    Si aún no eres jugador del club, primero visita nuestras instalaciones o contáctanos para conocer nuestros programas de formación.
                  </p>
                  <p className="text-primary text-sm mt-2">
                    📞 <a href="https://wa.me/573012345678" target="_blank" rel="noopener noreferrer" className="hover:text-primary/80">+57 301 234 5678</a> | 📧 golica@gmail.com
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Forms */}
          <div className="order-1 lg:order-2">
            <Card className="bg-card border-border p-8">
              <Tabs defaultValue="player" className="w-full">
                  <TabsList className="flex w-full mb-8 bg-muted/30 p-1">
                    <TabsTrigger
                      value="player"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-all text-xs sm:text-sm"
                    >
                      Jugador
                    </TabsTrigger>

                    <TabsTrigger
                      value="admin"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-all text-xs sm:text-sm"
                    >
                      <Shield size={14} className="mr-1 hidden sm:inline" />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/50 transition-all text-xs sm:text-sm"
                    >
                      Registro
                    </TabsTrigger>
                  </TabsList>

                {/* Player Login Form */}
                <TabsContent value="player">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    try {
                      const email = (document.getElementById('player-email') as HTMLInputElement).value;
                      const password = (document.getElementById('player-password') as HTMLInputElement).value;

                      const { data: player, error } = await supabase
                        .from('players')
                        .select('*')
                        .eq('email', email)
                        .eq('password', password)
                        .single();

                      if (error || !player) {
                        toast.error('Credenciales incorrectas');
                      } else if (onLogin) {
                        toast.success(`¡Bienvenido de nuevo, ${player.name}!`);
                        const { password: _, ...playerSafedata } = player;
                        onLogin({
                          ...playerSafedata,
                          role: 'player'
                        });
                      }
                    } catch (err) {
                      console.error('Error logging in player:', err);
                      toast.error('Error al iniciar sesión');
                    } finally {
                      setIsLoading(false);
                    }
                  }} className="space-y-6">
                    <div>
                      <Label htmlFor="player-email" className="text-foreground flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </Label>
                      <Input
                        id="player-email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="player-password" className="text-foreground flex items-center gap-2">
                        <Lock size={16} />
                        Contraseña
                      </Label>
                      <Input
                        id="player-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-muted-foreground text-sm">Recordarme</span>
                      </label>
                      <a href="#" className="text-primary hover:text-primary/80 text-sm">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>



                {/* Admin Login Form */}
                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield size={18} />
                        <span className="text-sm font-medium">Acceso Restringido</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Solo personal administrativo autorizado
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="admin-id" className="text-foreground flex items-center gap-2">
                        <User size={16} />
                        Identificación
                      </Label>
                      <Input
                        id="admin-id"
                        type="text"
                        value={loginData.identification}
                        onChange={(e) => setLoginData({ ...loginData, identification: e.target.value })}
                        required
                        placeholder="Tu identificación"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="admin-password" className="text-foreground flex items-center gap-2">
                        <Lock size={16} />
                        Contraseña
                      </Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                      {isLoading ? 'Verificando...' : 'Acceder al Panel'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <Label htmlFor="register-name" className="text-foreground flex items-center gap-2">
                        <User size={16} />
                        Nombre Completo *
                      </Label>
                      <Input
                        id="register-name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        placeholder="Juan Pérez"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-identification" className="text-foreground flex items-center gap-2">
                        <Shield size={16} />
                        Identificación *
                      </Label>
                      <Input
                        id="register-identification"
                        value={registerData.identification}
                        onChange={(e) => setRegisterData({ ...registerData, identification: e.target.value })}
                        required
                        placeholder="123456789"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-email" className="text-foreground flex items-center gap-2">
                        <Mail size={16} />
                        Email *
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        placeholder="tu@email.com"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-phone" className="text-foreground flex items-center gap-2">
                          <Phone size={16} />
                          Teléfono *
                        </Label>
                        <Input
                          id="register-phone"
                          type="tel"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          required
                          placeholder="+57 301 234 5678"
                          className="bg-input-background border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-birthdate" className="text-foreground flex items-center gap-2">
                          <Calendar size={16} />
                          Fecha Nacimiento
                        </Label>
                        <Input
                          id="register-birthdate"
                          type="date"
                          value={registerData.birthdate}
                          onChange={(e) => setRegisterData({ ...registerData, birthdate: e.target.value })}
                          className="bg-input-background border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-password" className="text-foreground flex items-center gap-2">
                        <Lock size={16} />
                        Contraseña *
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        placeholder="Mínimo 8 caracteres"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-confirm-password" className="text-foreground flex items-center gap-2">
                        <Lock size={16} />
                        Confirmar Contraseña *
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        placeholder="Repite tu contraseña"
                        className="bg-input-background border-border text-foreground"
                      />
                    </div>

                    <div className="flex items-start gap-2">
                      <input type="checkbox" required className="rounded border-border mt-1" />
                      <span className="text-muted-foreground text-sm">
                        Acepto los{' '}
                        <a href="#" className="text-primary hover:text-primary/80">
                          términos y condiciones
                        </a>{' '}
                        y la{' '}
                        <a href="#" className="text-primary hover:text-primary/80">
                          política de privacidad
                        </a>
                      </span>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Crear Cuenta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
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
