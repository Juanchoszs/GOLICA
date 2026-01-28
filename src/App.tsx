import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { AchievementsPage } from './components/AchievementsPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlayerDashboard } from './components/player/PlayerDashboard';
import { CoachDashboard } from './components/coach/CoachDashboard';
import { Toaster } from 'sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('golica_page') || 'inicio';
  });
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('golica_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.setItem('golica_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('golica_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('golica_user');
    }
  }, [user]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('golica_user');
    setCurrentPage('inicio');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'inicio':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'quienes-somos':
        return <AboutPage />;
      case 'logros':
        return <AchievementsPage />;
      case 'contacto':
        return <ContactPage />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'admin':
        if (!user) return <LoginPage onLogin={handleLogin} />;
        if (user.role === 'admin') return <AdminPanel user={user} onLogout={handleLogout} />;
        if (user.role === 'coach') return <CoachDashboard user={user} onLogout={handleLogout} />;
        return <PlayerPortal user={user} onLogout={handleLogout} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {currentPage !== 'admin' && <Header currentPage={currentPage} onNavigate={setCurrentPage} />}
        <main>
          {user && user.role === 'coach' && currentPage === 'admin' ? (
            <CoachDashboard 
                coach={user} 
                onLogout={() => {
                    setUser(null);
                    toast.success('Sesión cerrada correctamente');
                    setCurrentPage('inicio'); // Redirect to home after logout
                }} 
            />
          ) : (
            renderPage()
          )}
        </main>
        {currentPage !== 'login' && currentPage !== 'contacto' && currentPage !== 'admin' && <Footer />}
        {currentPage === 'contacto' && <Footer />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
