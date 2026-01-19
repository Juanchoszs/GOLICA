import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Plus, Search, User, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { PlayerDetails } from './PlayerDetails';
import { PlayerRegistration } from './PlayerRegistration';

interface Player {
  id: string;
  name: string;
  identification: string;
  email: string;
  phone: string;
  category: string;
  birthDate?: string;
  position?: string;
  description?: string;
  status: string;
  registeredAt: string;
  performance?: {
    training: number;
    matchGoals: number;
    matchAssists: number;
  };
}

interface PlayersManagementProps {
  user: any;
}

export function PlayersManagement({ user }: PlayersManagementProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const categories = ['Todas', 'Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Sub-23', 'Profesional'];

  useEffect(() => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        (player) => player.category?.includes(selectedCategory)
      );
    }

    setFilteredPlayers(filtered);
  }, [searchTerm, selectedCategory, players]);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;

      const formattedPlayers = (data || []).map(p => ({
        ...p,
        birthDate: p.birth_date, // Mapping database snake_case to component camelCase
        registeredAt: p.registered_at
      }));

      setPlayers(formattedPlayers);
      setFilteredPlayers(formattedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (selectedPlayer) {
    return (
      <PlayerDetails
        player={selectedPlayer}
        onBack={() => {
          setSelectedPlayer(null);
          loadPlayers();
        }}
        user={user}
      />
    );
  }

  if (showRegistration) {
    return (
      <PlayerRegistration
        onBack={() => {
          setShowRegistration(false);
          loadPlayers();
        }}
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Jugadores</h1>
        <p className="text-muted-foreground">
          Administra los jugadores del club GOL ICA
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar por nombre, ID o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-md bg-input-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <Button
            onClick={() => setShowRegistration(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus size={20} className="mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Jugadores</p>
              <p className="text-foreground text-3xl font-bold">{players.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Activos</p>
              <p className="text-foreground text-3xl font-bold">
                {players.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <User className="text-green-500" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Resultados</p>
              <p className="text-foreground text-3xl font-bold">{filteredPlayers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Search className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Players List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando jugadores...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <User className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-foreground text-xl font-semibold mb-2">
            {searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores registrados'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza registrando tu primer jugador'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowRegistration(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus size={20} className="mr-2" />
              Registrar Primer Jugador
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const age = player.birthDate ? calculateAge(player.birthDate) : null;
            return (
              <Card
                key={player.id}
                className="bg-card border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${player.status === 'active'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {player.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="text-foreground font-semibold text-lg mb-2">{player.name}</h3>

                <div className="space-y-1 text-sm mb-4">
                  <p className="text-muted-foreground">
                    <span className="font-medium">ID:</span> {player.identification}
                  </p>
                  <p className="text-muted-foreground break-all">
                    <span className="font-medium">Email:</span> {player.email}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Categoría:</span> {player.category}
                  </p>
                  {age && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Edad:</span> {age} años
                    </p>
                  )}
                  {player.position && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Posición:</span> {player.position}
                    </p>
                  )}
                </div>

                {player.performance && (
                  <div className="bg-muted/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Rendimiento</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">
                        <span className="font-medium">Entren:</span> {player.performance.training}%
                      </span>
                      <span className="text-foreground">
                        <span className="font-medium">Goles:</span> {player.performance.matchGoals}
                      </span>
                      <span className="text-foreground">
                        <span className="font-medium">Asist:</span> {player.performance.matchAssists}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <Eye size={16} className="mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <Edit size={16} className="mr-1" />
                    Editar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
