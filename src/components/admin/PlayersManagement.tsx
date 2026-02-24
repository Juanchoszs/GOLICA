import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Plus, Search, User, Edit, Eye, Trash2 } from 'lucide-react';
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
  initial_password?: string;
  birthDate?: string;
  position?: string;
  description?: string;
  previous_team?: string;
  status: string;
  registeredAt: string;
  photo_url?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  performance?: {
    training: number;
    matchGoals: number;
    matchAssists: number;
  };
  weight?: string;
  height?: string;
  tournaments?: any[];
  injuries?: any[];
  tests?: any[];
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>(['Todas']);

  useEffect(() => {
    loadPlayers();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('name').order('name');
      if (error) throw error;
      if (data) {
        setCategories(['Todas', ...data.map(c => c.name)]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  useEffect(() => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (player.identification && player.identification.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (player.email && player.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        (player) => player.category === selectedCategory
      );
    }

    setFilteredPlayers(filtered);
  }, [searchTerm, selectedCategory, players]);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      // Load from profiles first (authoritative for name/email/identification)
      // This prevents an empty list if the `players` row is missing or blocked by RLS.
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, identification, phone, initial_password, role, created_at')
        .eq('role', 'player')
        .order('name');

      if (profilesError) throw profilesError;

      // Try loading `players` extra fields. If it fails (RLS/permissions), we still show profiles.
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, category, position, status, birth_date, photo_url, id_card_front_url, id_card_back_url, performance, previous_team, description, weight, height, tournaments, injuries, tests')
        .order('id');

      if (playersError) {
        console.warn('Warning loading players table (continuing with profiles only):', playersError);
        toast.warning('No se pudo leer la tabla players (posible RLS/permisos). Se mostrará la lista, pero faltarán campos como posición, fecha de nacimiento, procedencia y descripción.');
      }

      const playersById = new Map((playersData || []).map((p: any) => [p.id, p]));

      const safeParse = (val: any, fallback: any) => {
        if (!val) return fallback;
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch (e) {
            return fallback;
          }
        }
        return val;
      };

      const formattedPlayers: Player[] = (profilesData || []).map((profile: any) => {
        const p = playersById.get(profile.id) || {};
        return {
          id: profile.id,
          name: profile.name || 'Sin nombre',
          email: profile.email || 'Sin email',
          identification: profile.identification || '',
          phone: profile.phone || '',
          initial_password: profile.initial_password,
          category: p.category || '',
          position: p.position || '',
          previous_team: p.previous_team || '',
          description: p.description || '',
          status: p.status || 'active',
          registeredAt: profile.created_at || new Date().toISOString(),
          birthDate: p.birth_date || '',
          photo_url: p.photo_url || '',
          id_card_front_url: p.id_card_front_url || '',
          id_card_back_url: p.id_card_back_url || '',
          performance: safeParse(p.performance, { training: 0, matchGoals: 0, matchAssists: 0 }),
          weight: p.weight || '',
          height: p.height || '',
          tournaments: safeParse(p.tournaments, []),
          injuries: safeParse(p.injuries, []),
          tests: safeParse(p.tests, []),
        };
      });

      setPlayers(formattedPlayers);
      setFilteredPlayers(formattedPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Error al cargar la lista de jugadores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${playerName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(playerId);
    const toastId = toast.loading('Eliminando jugador...');

    try {
      // 1. Call Edge Function to delete user from Auth and all related records
      const { data, error: deleteAuthError } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId: playerId
        }
      });

      if (deleteAuthError) {
        console.error('Error invoking delete function:', deleteAuthError);
        // If function not available, fallback to manual deletion
        if (deleteAuthError.message?.includes('Failed to send a request') || deleteAuthError.status === 404) {
          toast.warning('Función de eliminación no disponible. Eliminando solo de la base de datos...', { id: toastId });

          // Fallback: Delete from players table only
          const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', playerId);

          if (error) throw error;
        } else {
          throw deleteAuthError;
        }
      } else if (data?.error) {
        throw new Error(data.error);
      }

      // 2. Cleanup storage (Best Effort - don't block UI on this)
      const cleanupStorage = async () => {
        try {
          const { data: files } = await supabase.storage.from('player-documents').list(`${playerId}/`);
          if (files && files.length > 0) {
            const paths = files.map(f => `${playerId}/${f.name}`);
            await supabase.storage.from('player-documents').remove(paths);
          }
        } catch (e) {
          console.error('Storage cleanup warning:', e);
        }
      };
      cleanupStorage();

      toast.success('Jugador eliminado correctamente', { id: toastId });

      // Update local state
      setPlayers(prev => prev.filter(p => p.id !== playerId));

    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Error al eliminar el jugador', { id: toastId });
    } finally {
      setIsDeleting(null);
    }
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
                  <div className="w-12 h-12 bg-primary/20 border-2 border-primary/30 rounded-full flex items-center justify-center overflow-hidden">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-primary font-bold text-lg ${player.photo_url ? 'hidden' : 'flex'}`}>
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
                  {player.initial_password && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Pass:</span> <code className="bg-muted px-1 rounded">{player.initial_password}</code>
                    </p>
                  )}
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
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-10 px-0 flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleDeletePlayer(player.id, player.name)}
                    disabled={isDeleting === player.id}
                  >
                    <Trash2 size={16} />
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
