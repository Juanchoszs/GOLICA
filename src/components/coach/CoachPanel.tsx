
import { useState } from 'react';
import { Button } from '../ui/button';
import { UserCog, LogOut, Menu, X, Moon, Sun, ClipboardList, CalendarDays } from 'lucide-react';
import { Convocatoria } from './Convocatoria';
import { PlanningList } from '../planning/PlanningList';
import { PlanningBuilder } from '../planning/PlanningBuilder';
import { useTheme } from '../ThemeContext';

interface CoachPanelProps {
  user: any;
  onLogout: () => void;
}

export function CoachPanel({ user, onLogout }: CoachPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'convocatoria' | 'planning'>('convocatoria');
  const [planningView, setPlanningView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

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
                <p className="text-muted-foreground text-xs">Panel Entrenador</p>
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
                <span className="text-primary font-semibold">{user.name?.[0] || 'C'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs truncate">Entrenador</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Button
              variant={activeTab === 'convocatoria' ? 'secondary' : 'ghost'}
              className={`w-full justify-start`}
              onClick={() => setActiveTab('convocatoria')}
            >
              <ClipboardList size={20} className={sidebarOpen ? 'mr-3' : ''} />
              {sidebarOpen && <span>Convocatorias</span>}
            </Button>
            <Button
              variant={activeTab === 'planning' ? 'secondary' : 'ghost'}
              className={`w-full justify-start`}
              onClick={() => setActiveTab('planning')}
            >
              <CalendarDays size={20} className={sidebarOpen ? 'mr-3' : ''} />
              {sidebarOpen && <span>Planificaciones</span>}
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
      <main className="flex-1 overflow-auto bg-muted/10 flex flex-col">
        <div className="md:hidden sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
             <Menu size={20} />
           </Button>
           <h2 className="text-foreground font-semibold">Panel Entrenador</h2>
           <div className="w-10"/>
        </div>

        {activeTab === 'convocatoria' && (
            <div className="h-full flex flex-col flex-1">
                <header className="px-6 py-4 bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-40 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Convocatoria de Partido</h1>
                </header>
                <div className="p-4 md:p-6 flex-1 overflow-auto">
                    <Convocatoria coach={user} />
                </div>
            </div>
        )}
        
        {activeTab === 'planning' && (
            <div className="h-full flex flex-col flex-1">
                <header className="px-6 py-4 bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-40 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Planificaciones de Entrenamiento</h1>
                </header>
                <div className="p-4 md:p-6 flex-1 overflow-auto">
                    {planningView === 'list' && (
                        <PlanningList 
                            userRole="coach" 
                            userId={user.id} 
                            onCreateNew={() => { setSelectedSession(null); setPlanningView('create'); }}
                            onEdit={(session) => { setSelectedSession(session); setPlanningView('edit'); }}
                        />
                    )}
                    {(planningView === 'create' || planningView === 'edit') && (
                        <PlanningBuilder 
                            coachId={user.id}
                            initialData={selectedSession}
                            onSave={() => setPlanningView('list')}
                            onCancel={() => setPlanningView('list')}
                        />
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
