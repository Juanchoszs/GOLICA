import { Trophy, Award, Medal, Star, Users, Target, TrendingUp, Calendar } from 'lucide-react';
import { Card } from './ui/card';

export function AchievementsPage() {
  const timeline = [
    {
      year: 2023,
      title: 'Fundación y Despegue',
      achievements: [
        { icon: Star, title: 'Fundación Oficial', description: 'Creación del Club Deportivo GOL ICA en Mosquera, Cundinamarca' },
        { icon: Users, title: 'Primeros 50 Jugadores', description: 'Registro de los primeros miembros y formación del equipo base' },
        { icon: Trophy, title: '1er Campeonato Regional', description: 'Victoria en el Torneo Intermunicipal Categoría Sub-15' },
        { icon: Target, title: 'Apertura Cancha F11', description: 'Inauguración de nuestra primera cancha profesional' },
      ],
    },
    {
      year: 2024,
      title: 'Consolidación y Crecimiento',
      achievements: [
        { icon: Trophy, title: '7 Campeonatos Ganados', description: 'Victorias en ligas locales y regionales en múltiples categorías' },
        { icon: Users, title: '200 Jugadores Activos', description: 'Cuadruplicamos nuestra membresía con jugadores de todas las edades' },
        { icon: Medal, title: 'Subcampeón Liga Departamental', description: 'Equipo senior alcanza final del campeonato departamental' },
        { icon: Target, title: 'Expansión de Instalaciones', description: 'Apertura de canchas F9, F7 y F5 completando nuestro complejo deportivo' },
        { icon: Award, title: 'Reconocimiento Municipal', description: 'Premio "Mejor Club Deportivo del Año" por la Alcaldía de Mosquera' },
        { icon: Star, title: 'Programa de Formación Integral', description: 'Lanzamiento de academia con psicología, nutrición y preparación física' },
      ],
    },
    {
      year: 2025,
      title: 'Proyección y Excelencia',
      achievements: [
        { icon: Trophy, title: '8 Nuevos Títulos', description: 'Campeonatos en categorías infantil, juvenil y senior' },
        { icon: Users, title: '300+ Jugadores', description: 'Alcanzamos más de 300 deportistas activos en todas las categorías' },
        { icon: Medal, title: 'Campeón Copa Regional', description: 'Primera Copa Regional para el equipo senior de GOL ICA' },
        { icon: Award, title: '3 Jugadores a Profesional', description: 'Tres de nuestros jugadores firmaron con equipos profesionales' },
        { icon: TrendingUp, title: 'Portal Digital', description: 'Lanzamiento de plataforma web para gestión y reservas online' },
        { icon: Star, title: 'Alianza Académica', description: 'Convenio con institución educativa para programa deportivo-académico' },
      ],
    },
  ];

  const trophyCategories = [
    {
      category: 'Campeonatos Locales',
      count: 6,
      icon: Trophy,
      color: 'text-yellow-500',
      trophies: [
        'Torneo Intermunicipal Sub-15 (2023)',
        'Liga Local Categoría Juvenil (2024)',
        'Copa Mosquera Senior (2024)',
        'Torneo Apertura Sub-17 (2024)',
        'Liga Regional Infantil (2025)',
        'Copa de Oro Senior (2025)',
      ],
    },
    {
      category: 'Campeonatos Regionales',
      count: 5,
      icon: Medal,
      color: 'text-green-500',
      trophies: [
        'Copa Regional Sub-15 (2024)',
        'Torneo Cundinamarca Juvenil (2024)',
        'Liga Departamental Categoría Libre (2025)',
        'Copa Regional Senior (2025)',
        'Torneo Regional Fútbol 7 (2025)',
      ],
    },
    {
      category: 'Reconocimientos Institucionales',
      count: 3,
      icon: Award,
      color: 'text-blue-500',
      trophies: [
        'Mejor Club Deportivo 2024 - Alcaldía Mosquera',
        'Fair Play Award Regional 2024',
        'Reconocimiento Excelencia Formativa 2025',
      ],
    },
    {
      category: 'Logros Individuales',
      count: 2,
      icon: Star,
      color: 'text-purple-500',
      trophies: [
        'Goleador del Año Liga Regional 2024 - Juan Pérez',
        'Mejor Portero Torneo Departamental 2025 - Carlos Gómez',
      ],
    },
  ];

  const stats = [
    { number: '16', label: 'Campeonatos Ganados', icon: Trophy },
    { number: '3', label: 'Años de Historia', icon: Calendar },
    { number: '300+', label: 'Jugadores Formados', icon: Users },
    { number: '4', label: 'Instalaciones Profesionales', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-primary/30 border border-primary/50 rounded-full backdrop-blur-md">
            <span className="text-white text-sm">2023 - 2025</span>
          </div>
          <h1 className="text-white text-5xl md:text-7xl mb-6 drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Nuestros Logros
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
            Tres años de dedicación, esfuerzo y victorias que marcan nuestra historia
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
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

      {/* Timeline Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Línea Temporal</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Nuestro Camino al Éxito
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada año ha sido un escalón hacia la excelencia deportiva
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {timeline.map((yearData, yearIndex) => (
              <div key={yearIndex} className="relative mb-16 last:mb-0">
                {/* Year Badge */}
                <div className="flex items-center mb-8">
                  <div className="bg-primary text-primary-foreground px-8 py-3 rounded-full shadow-lg shadow-primary/30">
                    <span className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{yearData.year}</span>
                  </div>
                  <div className="flex-1 h-1 bg-primary/20 ml-4"></div>
                </div>

                {/* Year Title */}
                <h3 className="text-foreground text-2xl md:text-3xl mb-6 ml-4" style={{ fontFamily: 'var(--font-display)' }}>
                  {yearData.title}
                </h3>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yearData.achievements.map((achievement, achIndex) => {
                    const Icon = achievement.icon;
                    return (
                      <Card
                        key={achIndex}
                        className="bg-card border-border p-6 hover:border-primary/50 transition-all hover:transform hover:scale-105 duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                            <Icon className="text-primary-foreground" size={20} />
                          </div>
                          <div>
                            <h4 className="text-card-foreground text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                              {achievement.title}
                            </h4>
                            <p className="text-muted-foreground text-sm">{achievement.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trophy Categories */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary text-sm">Nuestros Trofeos</span>
            </div>
            <h2 className="text-foreground text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Galería de Éxitos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Cada trofeo representa horas de entrenamiento, sacrificio y pasión
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {trophyCategories.map((category, catIndex) => {
              const Icon = category.icon;
              return (
                <Card
                  key={catIndex}
                  className="bg-card border-border p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                      <Icon className={`${category.color}`} size={28} />
                    </div>
                    <div>
                      <h3 className="text-card-foreground text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                        {category.category}
                      </h3>
                      <p className="text-primary text-sm">{category.count} logros</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {category.trophies.map((trophy, trophyIndex) => (
                      <li key={trophyIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{trophy}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-foreground text-4xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Sé Parte de la Próxima Victoria
            </h2>
            <p className="text-muted-foreground text-xl mb-8">
              Únete a GOL ICA y escribe tu nombre en nuestra historia de éxitos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg transition-colors">
                Inscríbete Ahora
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-4 rounded-lg text-lg transition-colors">
                Conocer Más
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
