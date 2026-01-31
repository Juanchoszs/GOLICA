import { useState } from 'react';
import { Button } from '../ui/button';
import { Users, Activity, UserCog, Settings, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { CallUpManager } from './CallUpManager';
import { PlayersManagement } from './PlayersManagement';
import { CoachDashboard } from '../coach/CoachDashboard';
import { CoachesManagement } from './CoachesManagement';
import { useTheme } from '../ThemeContext';

interface AdminPanelProps {
  user: any;
  onLogout: () => void;
}

export function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState('jugadores');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'jugadores', label: 'Jugadores', icon: Users, available: true },
    { id: 'entrenador', label: 'Convocatorias', icon: UserCog, available: true }, // Updated label and availability
    { id: 'fisioterapia', label: 'Fisioterapia', icon: Activity, available: false },
<<<<<<< HEAD
    { id: 'entrenador', label: 'Entrenador', icon: UserCog, available: true },
    { id: 'administrativo', label: 'Gestión Entrenadores', icon: Settings, available: true },
=======
    { id: 'administrativo', label: 'Administrativo', icon: Settings, available: false },
>>>>>>> 0da42fe (Backup de convocatorias)
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'jugadores':
        return <PlayersManagement user={user} />;
      case 'entrenador':
        return <CallUpManager />;
      case 'fisioterapia':
        return <div className="p-8"><h2 className="text-2xl text-foreground">Módulo de Fisioterapia - Próximamente</h2></div>;
<<<<<<< HEAD
      case 'entrenador':
        return <CoachDashboard user={user} onLogout={onLogout} />;
=======
>>>>>>> 0da42fe (Backup de convocatorias)
      case 'administrativo':
        return <CoachesManagement />;
      default:
        return <PlayersManagement user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } transition-all duration-300 bg-card border-r border-border flex flex-col`}
      >
        {/* Logo & Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-primary text-xl font-bold">GOL ICA</h1>
                <p className="text-muted-foreground text-xs">Panel Administrativo</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">{user.name?.[0] || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs truncate">{user.identification}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                } ${!item.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => item.available && setActiveSection(item.id)}
                disabled={!item.available}
              >
                <Icon size={20} className={sidebarOpen ? 'mr-3' : ''} />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && !item.available && (
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">Próximamente</span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-foreground hover:bg-muted"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} className={sidebarOpen ? 'mr-3' : ''} /> : <Moon size={20} className={sidebarOpen ? 'mr-3' : ''} />}
            {sidebarOpen && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut size={20} className={sidebarOpen ? 'mr-3' : ''} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </Button>
          <h2 className="text-foreground font-semibold">Panel Administrativo</h2>
          <div className="w-10" />
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
