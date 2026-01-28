
import { useState } from 'react';
import { Convocatoria } from './Convocatoria';
import { Button } from '../ui/button';
import { ClipboardList, CalendarDays, LogOut } from 'lucide-react';

interface CoachDashboardProps {
  coach: any;
  onLogout: () => void;
}

export function CoachDashboard({ coach, onLogout }: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState<'convocatoria' | 'planning'>('convocatoria');

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col h-auto md:h-screen sticky top-0 z-50">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary tracking-tight">GOL ICA</h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Panel Técnico</p>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
            <div className="px-2 py-3 mb-4 bg-muted/20 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {coach.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{coach.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Entrenador</p>
                </div>
            </div>

            <nav className="space-y-1">
                <Button 
                    variant={activeTab === 'convocatoria' ? 'secondary' : 'ghost'} 
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('convocatoria')}
                >
                    <ClipboardList size={20} />
                    Convocatoria
                </Button>
                <Button 
                    variant={activeTab === 'planning' ? 'secondary' : 'ghost'} 
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('planning')}
                >
                    <CalendarDays size={20} />
                    Planificaciones
                </Button>
            </nav>
        </div>

        <div className="p-4 border-t border-border mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onLogout}>
                <LogOut size={20} />
                Cerrar Sesión
            </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-muted/10">
        {activeTab === 'convocatoria' && (
            <div className="h-full flex flex-col">
                 <header className="px-6 py-4 bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-40 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Convocatoria de Partido</h1>
                    {/* Add global actions here if needed */}
                 </header>
                 <div className="p-4 md:p-6 flex-1">
                    <Convocatoria coach={coach} />
                 </div>
            </div>
        )}
        
        {activeTab === 'planning' && (
            <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
                <CalendarDays size={48} className="opacity-20" />
                <p>Módulo de Planificaciones próximamente</p>
            </div>
        )}
      </main>
    </div>
  );
}
