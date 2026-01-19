import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'quienes-somos', label: 'Quiénes Somos' },
    { id: 'logros', label: 'Logros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('inicio')}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/50">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary-foreground" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.3"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-primary text-2xl tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>GOL</span>
              <span className="text-foreground text-2xl tracking-wider ml-1" style={{ fontFamily: 'var(--font-display)' }}>ICA</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => onNavigate('login')}
              className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Portal Jugadores
            </Button>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="ml-2 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center transition-all"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              Portal Jugadores
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
