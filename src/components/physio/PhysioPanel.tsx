import { useState } from 'react';
import { Button } from '../ui/button';
import { Activity, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { PhysiotherapyManagement } from '../admin/PhysiotherapyManagement';
import { useTheme } from '../ThemeContext';

interface PhysioPanelProps {
  user: any;
  onLogout: () => void;
}

export function PhysioPanel({ user, onLogout }: PhysioPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-20'
          } transition-all duration-300 bg-card border-r border-border flex flex-col overflow-hidden`}
      >
        {/* Logo & Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-primary text-xl font-bold">GOL ICA</h1>
                <p className="text-muted-foreground text-xs">Panel Fisioterapia</p>
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
                <span className="text-primary font-semibold">{user.name?.[0] || 'F'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs truncate">Fisioterapeuta</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            variant="default"
            className="w-full justify-start bg-primary text-primary-foreground"
          >
            <Activity size={20} className={sidebarOpen ? 'mr-3' : ''} />
            {sidebarOpen && <span>Gestión Fisioterapia</span>}
          </Button>
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
          <h2 className="text-foreground font-semibold">Panel Fisioterapia</h2>
          <div className="w-10" />
        </div>

        <PhysiotherapyManagement />
      </main>
    </div>
  );
}
