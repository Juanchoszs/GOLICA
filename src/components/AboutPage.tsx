import { Trophy, Target, Heart, Award, Users, Shield, Star, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';

export function AboutPage() {
  const values = [
    {
      icon: Trophy,
      title: 'Excelencia',
      description: 'Buscamos constantemente mejorar nuestro nivel técnico y táctico, formando jugadores de alto rendimiento.',
    },
    {
      icon: Heart,
      title: 'Pasión',
      description: 'El amor por el fútbol es nuestra motivación. Transmitimos este sentimiento a cada jugador y entrenamiento.',
    },
    {
      icon: Shield,
      title: 'Disciplina',
      description: 'La constancia y el compromiso son fundamentales para alcanzar nuestras metas deportivas y personales.',
    },
    {
      icon: Users,
      title: 'Trabajo en Equipo',
      description: 'Fomentamos la colaboración y el compañerismo, creando un ambiente de apoyo mutuo y respeto.',
    },
    {
      icon: Award,
      title: 'Integridad',
      description: 'Actuamos con honestidad y transparencia en todas nuestras acciones, dentro y fuera del campo.',
    },
    {
      icon: Star,
      title: 'Respeto',
      description: 'Valoramos a cada persona, promoviendo un ambiente inclusivo donde todos son bienvenidos.',
    },
  ];

  const team = [
    {
      name: 'Carlos Rodríguez',
      role: 'Director Técnico',
      experience: '15 años de experiencia',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    },
    {
      name: 'María González',
      role: 'Preparadora Física',
      experience: 'Especialista en alto rendimiento',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
    {
      name: 'José Martínez',
      role: 'Entrenador Categoría Infantil',
      experience: 'Certificado UEFA C',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400',
    },
    {
      name: 'Ana Pérez',
      role: 'Entrenadora Categoría Juvenil',
      experience: 'Ex jugadora profesional',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    },
    {
      name: 'Luis Fernández',
      role: 'Coordinador Deportivo',
      experience: 'Master en Gestión Deportiva',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=400',
    },
    {
      name: 'Patricia Silva',
      role: 'Psicóloga Deportiva',
      experience: 'Especialista en deporte juvenil',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400',
    },
    {
      name: 'Roberto Campos',
      role: 'Entrenador de Porteros',
      experience: 'Ex portero profesional',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    {
      name: 'Diana Torres',
      role: 'Nutricionista Deportiva',
      experience: 'Especialista en nutrición atlética',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    },
    {
      name: 'Miguel Ángel Ruiz',
      role: 'Entrenador Equipo Senior',
      experience: 'Licencia CONMEBOL Pro',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
    {
      name: 'Carolina Morales',
      role: 'Coordinadora Administrativa',
      experience: '8 años en gestión deportiva',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    },
    {
      name: 'Jorge Ramírez',
      role: 'Fisioterapeuta',
      experience: 'Especialista en lesiones deportivas',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    },
    {
      name: 'Sofía Mendoza',
      role: 'Asistente Técnico',
      experience: 'Certificación en metodología infantil',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1551958219-acbc608c6377?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
            alt="Club GOL ICA"
            className="w-full h-full object-cover"
          />
          {/* Overlay oscuro consistente para ambos modos */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-primary/30 border border-primary/50 rounded-full backdrop-blur-md">
            <span className="text-white text-sm">Nuestra Historia</span>
          </div>
          <h1 className="text-white text-5xl md:text-7xl mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Quiénes Somos
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
            Tres años construyendo sueños, formando campeones y fortaleciendo comunidad
          </p>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Fundado en 2023</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>
              Nuestra Historia: Tres Años de Pasión y Crecimiento
            </h2>

            <div className="space-y-6 text-muted-foreground text-lg">
              <p>
                En 2023, nació <strong className="text-primary">GOLICA</strong> con una visión clara: crear un espacio donde el fútbol fuera más que un deporte. Queríamos formar personas íntegras, desarrollar talento deportivo y fortalecer los lazos comunitarios en Mosquera, Cundinamarca.
              </p>

              <p>
                Lo que comenzó como un sueño compartido por un grupo de apasionados del fútbol se transformó rápidamente en una realidad vibrante. Durante nuestro primer año, establecimos las bases de lo que somos hoy: valores sólidos, metodologías de entrenamiento profesionales y un compromiso inquebrantable con cada jugador.
              </p>

              <p>
                En estos <strong className="text-primary">tres años</strong> hemos crecido exponencialmente. De un puñado de jugadores entusiastas a más de 300 deportistas activos en todas las categorías. De una cancha prestada a cuatro instalaciones profesionales (F11, F9, F7, F5) equipadas con la última tecnología.
              </p>

              <p>
                Pero nuestro mayor orgullo no está en las cifras, sino en las vidas transformadas. Hemos visto niños tímidos convertirse en líderes dentro y fuera del campo. Hemos celebrado victorias deportivas y, más importante aún, victorias personales de superación, disciplina y trabajo en equipo.
              </p>

              <p>
                Hoy, GOL ICA es reconocido en la región no solo por nuestros logros deportivos -16 campeonatos ganados- sino por nuestro modelo integral de formación. Somos una familia unida por la pasión del fútbol y el compromiso con la excelencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border-border p-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                <Target className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-card-foreground text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Nuestra Misión
              </h3>
              <p className="text-muted-foreground text-lg">
                Formar deportistas integrales a través del fútbol, promoviendo valores como el respeto, la disciplina y el trabajo en equipo. Brindar oportunidades de desarrollo deportivo de alto nivel mientras fortalecemos el tejido social de nuestra comunidad en Mosquera, Cundinamarca.
              </p>
            </Card>

            <Card className="bg-card border-border p-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                <TrendingUp className="text-primary-foreground" size={32} />
              </div>
              <h3 className="text-card-foreground text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Nuestra Visión
              </h3>
              <p className="text-muted-foreground text-lg">
                Ser el referente de GOLICA en la región, reconocido por la calidad de nuestros jugadores, la excelencia de nuestras instalaciones y nuestro impacto positivo en la comunidad. Aspiramos a convertirnos en un semillero de talento que trascienda fronteras.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Nuestros Pilares</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Valores que nos Definen
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada acción en GOL ICA está guiada por principios sólidos que nos hacen más que un club deportivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border p-6 hover:border-primary/50 transition-all hover:transform hover:scale-105 duration-300"
                >
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                    <Icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="text-card-foreground text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Staff Técnico */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Nuestro Equipo</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Staff Técnico Profesional
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Profesionales comprometidos con tu desarrollo deportivo y personal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card
                key={index}
                className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all hover:transform hover:scale-105 duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-card-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.experience}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instalaciones */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Instalaciones de Primer Nivel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cuatro canchas profesionales equipadas con tecnología moderna para tu mejor experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="relative h-80 rounded-xl overflow-hidden group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800"
                alt="Cancha F11"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Cancha F11
                </h3>
                <p className="text-gray-300">Cancha reglamentaria con césped sintético de última generación</p>
              </div>
            </div>

            <div className="relative h-80 rounded-xl overflow-hidden group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800"
                alt="Cancha F9"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Cancha F9
                </h3>
                <p className="text-gray-300">Perfecta para torneos juveniles y entrenamientos tácticos</p>
              </div>
            </div>

            <div className="relative h-80 rounded-xl overflow-hidden group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1592656094267-764a45160876?w=800"
                alt="Cancha F7"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Cancha F7
                </h3>
                <p className="text-gray-300">Ideal para categorías infantiles y fútbol recreativo</p>
              </div>
            </div>

            <div className="relative h-80 rounded-xl overflow-hidden group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800"
                alt="Cancha F5"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Cancha F5
                </h3>
                <p className="text-gray-300">Espacio dinámico para entrenamientos de técnica individual</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
