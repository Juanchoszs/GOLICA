import { useState } from 'react';
import { Button } from '../ui/button';
import { Activity, LogOut, Menu, X, Moon, Sun, ClipboardList, Users, ShieldCheck } from 'lucide-react';
import { PhysiotherapyManagement } from '../admin/PhysiotherapyManagement';
import { PhysioDailyTracking } from './PhysioDailyTracking';
import { PhysioSupervision } from './PhysioSupervision';
import { useTheme } from '../ThemeContext';
import { supabase } from '../../utils/supabase/client';

interface PhysioPanelProps {
  user: any;
  onLogout: () => void;
}

export function PhysioPanel({ user, onLogout }: PhysioPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'evaluations' | 'tracking' | 'supervision'>('tracking');
  const { theme, toggleTheme } = useTheme();

  const isChief = user.is_chief || user.role === 'admin';

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
                <p className="text-muted-foreground text-xs truncate">
                  {user.is_chief ? 'Jefe de Fisioterapia' : 'Fisioterapeuta'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            variant={activeTab === 'tracking' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'tracking' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
            onClick={() => setActiveTab('tracking')}
          >
            <Activity size={20} className={sidebarOpen ? 'mr-3' : ''} />
            {sidebarOpen && <span>Seguimiento Diario</span>}
          </Button>

          <Button
            variant={activeTab === 'evaluations' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'evaluations' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
            onClick={() => setActiveTab('evaluations')}
          >
            <ClipboardList size={20} className={sidebarOpen ? 'mr-3' : ''} />
            {sidebarOpen && <span>Valoraciones</span>}
          </Button>

          {isChief && (
            <Button
              variant={activeTab === 'supervision' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'supervision' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
              onClick={() => setActiveTab('supervision')}
            >
              <ShieldCheck size={20} className={sidebarOpen ? 'mr-3' : ''} />
              {sidebarOpen && <span>Supervisión</span>}
            </Button>
          )}
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
          <h2 className="text-foreground font-semibold">
            {activeTab === 'tracking' ? 'Seguimiento Diario' : 
             activeTab === 'evaluations' ? 'Valoraciones' : 'Supervisión'}
          </h2>
          <div className="w-10" />
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'tracking' && <PhysioDailyTracking user={user} />}
          {activeTab === 'evaluations' && <PhysiotherapyManagement />}
          {activeTab === 'supervision' && <PhysioSupervision user={user} />}
        </div>
      </main>
    </div>
  );
}
