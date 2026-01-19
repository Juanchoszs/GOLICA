import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';
import { Trophy, Users, Target, Award, Shield, Star, Calendar, MapPin, TrendingUp, Heart } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const stats = [
    { number: '3', label: 'Años de historia', icon: Calendar },
    { number: '300+', label: 'Jugadores activos', icon: Users },
    { number: '16', label: 'Campeonatos ganados', icon: Trophy },
    { number: '4', label: 'Canchas profesionales', icon: MapPin },
  ];

  const programs = [
    {
      title: 'Academia Infantil',
      age: '5-12 años',
      description: 'Desarrollo de habilidades básicas y amor por el deporte',
      icon: Star,
    },
    {
      title: 'Categoría Juvenil',
      age: '13-17 años',
      description: 'Formación técnica y táctica de alto nivel',
      icon: TrendingUp,
    },
    {
      title: 'Equipo Senior',
      age: '18+ años',
      description: 'Competencia profesional en ligas regionales',
      icon: Trophy,
    },
    {
      title: 'Fútbol Recreativo',
      age: 'Todas las edades',
      description: 'Para quienes aman el fútbol sin presión competitiva',
      icon: Heart,
    },
  ];

  const testimonials = [
    {
      name: 'Ricardo Mendoza',
      role: 'Padre de jugador',
      text: 'Mi hijo ha crecido tanto en GOL ICA. No solo como futbolista, sino como persona. Los valores que le enseñan aquí son para toda la vida.',
      rating: 5,
    },
    {
      name: 'María González',
      role: 'Jugadora senior',
      text: 'Llevo 8 años en el club y es mi segunda familia. Las instalaciones son excelentes y el ambiente es increíble.',
      rating: 5,
    },
    {
      name: 'Carlos Huamán',
      role: 'Ex-jugador',
      text: 'GOL ICA me formó como deportista. Gracias a la preparación que recibí, logré jugar profesionalmente. Eternamente agradecido.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1760420925915-c9df8825ebb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjB0ZWFtJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzYxNjQ2MTYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Equipo entrenando"
            className="w-full h-full object-cover"
          />
          {/* Overlay mejorado que funciona en ambos modos */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-primary/30 border border-primary/50 rounded-full backdrop-blur-md">
            <span className="text-white text-sm">GOLICA desde 2023</span>
          </div>
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl mb-6 max-w-5xl mx-auto drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-primary">GOL ICA</span>
            <br />
            Pasión en cada jugada
          </h1>
          <p className="text-white text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Formando campeones con disciplina, valores y excelencia deportiva en el corazón de Mosquera
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate('contacto')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg"
            >
              Únete al Club
            </Button>
            <Button
              onClick={() => onNavigate('login')}
              size="lg"
              variant="outline"
              className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg shadow-lg"
            >
              Portal Jugadores
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                    <Icon className="text-primary-foreground" size={28} />
                  </div>
                  <div className="text-4xl md:text-5xl text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1694378739983-cac757f01c30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBncmFzc3xlbnwxfHx8fDE3NjE1NzEzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Estadio GOL ICA"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div>
              <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
                <span className="text-primary text-sm">Nuestra Historia</span>
              </div>
              <h2 className="text-foreground text-4xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                3 Años Formando Campeones
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Desde 2023, GOLICA ha sido más que una institución deportiva. Somos una familia comprometida con el desarrollo integral de nuestros jugadores, combinando excelencia deportiva con formación en valores.
              </p>
              <p className="text-muted-foreground text-lg mb-6">
                Nuestra visión es clara: ser el referente en la región de Mosquera, Cundinamarca, reconocido por la calidad de nuestros jugadores, nuestras instalaciones de primer nivel y nuestro compromiso con la comunidad.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <Shield className="text-primary mt-1" size={24} />
                  <div>
                    <h4 className="text-foreground mb-1">Valores Sólidos</h4>
                    <p className="text-muted-foreground text-sm">Respeto, disciplina y trabajo en equipo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="text-primary mt-1" size={24} />
                  <div>
                    <h4 className="text-foreground mb-1">Excelencia</h4>
                    <p className="text-muted-foreground text-sm">Formación técnica de alto nivel</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => onNavigate('quienes-somos')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Conocer Más Sobre Nosotros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Nuestros Programas</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Un Programa para Cada Edad
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Desde los más pequeños hasta adultos, tenemos el programa perfecto para tu nivel y objetivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border p-6 hover:border-primary/50 transition-all hover:transform hover:scale-105 duration-300"
                >
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                    <Icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="text-card-foreground text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {program.title}
                  </h3>
                  <p className="text-primary text-sm mb-3">{program.age}</p>
                  <p className="text-muted-foreground">{program.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Trophy className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-card-foreground text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Excelencia Deportiva
              </h3>
              <p className="text-muted-foreground">
                Entrenadores certificados con experiencia profesional que trabajan con metodologías modernas y efectivas
              </p>
            </div>

            <div className="text-center p-8 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Users className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-card-foreground text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Comunidad Unida
              </h3>
              <p className="text-muted-foreground">
                Más que un club, somos una familia donde cada miembro es valorado y apoyado en su crecimiento
              </p>
            </div>

            <div className="text-center p-8 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Target className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-card-foreground text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Instalaciones Modernas
              </h3>
              <p className="text-muted-foreground">
                4 canchas profesionales equipadas con la última tecnología, vestuarios modernos y áreas de entrenamiento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Testimonios</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Lo Que Dicen de Nosotros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card border-border p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 fill-yellow-500" size={18} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-card-foreground">{testimonial.name}</h4>
                  <p className="text-primary text-sm">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Momentos Inolvidables
            </h2>
            <p className="text-muted-foreground text-lg">
              Cada partido, cada entrenamiento, cada celebración es parte de nuestra historia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-64 rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551390415-0de411440ca3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjB0ZWFtJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYxNTc3ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Celebración del equipo"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="h-64 rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1579156411855-3f30873ce450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXJzJTIwdGVhbXxlbnwxfHx8fDE3NjE1ODg3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Jugadores en acción"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="h-64 rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1526495959496-614af90aec86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjB5b3V0aCUyMHBsYXllcnN8ZW58MXx8fHwxNzYxNjY3MzQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Categorías juveniles"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="h-64 rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758535013088-20f84ac4c645?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHRyYWluaW5nJTIwZ3JvdW5kfGVufDF8fHx8MTc2MTY2NzMzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Instalaciones"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-foreground text-4xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Listo para Unirte a GOL ICA?
          </h2>
          <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
            Forma parte de nuestra familia deportiva y descubre todo lo que GOL ICA tiene para ofrecerte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate('contacto')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Contáctanos
            </Button>
            <Button
              onClick={() => onNavigate('login')}
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Portal Jugadores
            </Button>
            <Button
              onClick={() => onNavigate('quienes-somos')}
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              Conocer Más
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
