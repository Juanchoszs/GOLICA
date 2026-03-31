import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { AchievementsPage } from './components/AchievementsPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { PlayerPortal } from './components/PlayerPortal';
import { Toaster } from './components/ui/sonner';
import { useState, useEffect, lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const CoachPanel = lazy(() => import('./components/coach/CoachPanel'));
const PhysioPanel = lazy(() => import('./components/physio/PhysioPanel'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('golica_page') || 'inicio';
  });

  const { profile, loading, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.setItem('golica_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (isAuthenticated && profile && currentPage === 'login') {
      setCurrentPage('admin');
    }
  }, [isAuthenticated, profile, currentPage]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('golica_page');
    setCurrentPage('inicio');
  };

  const user = profile ? {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    identification: profile.identification,
    assigned_categories: profile.assigned_categories,
  } : null;

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
        if (loading) return <LoadingFallback />;
        return <LoginPage />;
      case 'admin':
        if (loading) return <LoadingFallback />;
        if (!isAuthenticated || !user) return <LoginPage />;
        if (user.role === 'admin') return (
          <Suspense fallback={<LoadingFallback />}>
            <AdminPanel user={user} onLogout={handleLogout} />
          </Suspense>
        );
        if (user.role === 'coach') return (
          <Suspense fallback={<LoadingFallback />}>
            <CoachPanel user={user} onLogout={handleLogout} />
          </Suspense>
        );
        if (user.role === 'physiotherapist') return (
          <Suspense fallback={<LoadingFallback />}>
            <PhysioPanel user={user} onLogout={handleLogout} />
          </Suspense>
        );
        return <PlayerPortal user={user} onLogout={handleLogout} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const showHeader = ['inicio', 'quienes-somos', 'logros', 'contacto', 'login'].includes(currentPage);
  const showFooter = ['inicio', 'quienes-somos', 'logros', 'contacto'].includes(currentPage);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {showHeader && <Header currentPage={currentPage} onNavigate={setCurrentPage} />}
      <main>
        {renderPage()}
      </main>
      {showFooter && <Footer />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
