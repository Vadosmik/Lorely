import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, useLocation } from 'preact-iso';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { NavBar } from './components/NavBar';
import { ThemeBtn } from './components/ThemeBtn.jsx';

import { logoutUser } from './services/apiClient.js';
import { profileService } from './services/ProfileService.js';

import Home from './pages/HomePage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import AuthPage from './pages/AuthPage.jsx'; // Będziemy go używać jako Modala!
import AdminDashboard from './pages/adminDashboard/AdminDashboard.jsx';
import LibraryPage from './pages/LibraryPage.jsx';

import CatalogDashboard from './pages/catalog/CatalogDashboard.jsx';
import CatalogDetails from './pages/catalog/StoryDetails.jsx';
import StoryPlayer from './pages/catalog/ReaderPage.jsx';

import StudioDashboard from './pages/studio/StudioDashboard.jsx';
import StudioStoryDetails from './pages/studio/StudioStoryDetails.jsx';
import StoryFlowCanvas from './pages/studio/StoryFlowCanvas.jsx';

import { getCachedStaticImage, DEFAULT_AVATAR, DEFAULT_COVER } from './utils/imageCache';

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await profileService.getMe();
      setUser(userData);
    } catch (err) {
      console.warn("User not authorized: ", err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCachedStaticImage(DEFAULT_AVATAR);
    getCachedStaticImage(DEFAULT_COVER);
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (loading) return <div>Ładowanie aplikacji...</div>;

  return (
    <LanguageProvider>
      <ToastProvider>
        <LocationProvider>
          <AppContent user={user} loadUser={loadUser} handleLogout={handleLogout} />
        </LocationProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

function AppContent({ user, loadUser, handleLogout }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { path } = useLocation();

  useEffect(() => {
    const checkHash = () => {
      setIsLoginOpen(window.location.hash === '#login');
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const closeLoginModal = () => {
    if (window.location.hash === '#login') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsLoginOpen(false);
    }
  };

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <ThemeBtn />

      <main className="app-content">
        <div key={path} className="page-transition">
          <Router>
            <Home path="/" user={user} />
            <LibraryPage path="/library" />

            {/* SEKCJA KATALOGU */}
            <CatalogDashboard path="/catalog" />
            <CatalogDetails path="/catalog/:story_id/details" />
            <StoryPlayer path="/catalog/:story_id/read" />

            {/* SEKCJA STUDIA */}
            <StudioDashboard path="/studio" />
            <StudioStoryDetails path="/studio/:story_id/details" />
            <StoryFlowCanvas path="/studio/:story_id/canvas" />

            <AdminDashboard path="/admin" />

            <ProfilePage path="/:username" currentUser={user} onProfileUpdate={loadUser} onLogout={handleLogout} />
          </Router>
        </div>
      </main>

      {isLoginOpen && (
        <AuthPage
          onClose={closeLoginModal}
          onLoginSuccess={() => {
            closeLoginModal();
            loadUser();
          }}
        />
      )}
    </>
  );
}