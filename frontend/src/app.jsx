import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { NavBar } from './components/NavBar';
import { ThemeBtn } from './components/ThemeBtn.jsx';

import { logoutUser } from './services/apiClient.js';
import { profileService } from './services/ProfileService.js';

import Home from './pages/HomePage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboard from './pages/adminDashboard/AdminDashboard.jsx';

import LibraryPage from './pages/LibraryPage.jsx'

import CatalogDashboard from './pages/catalog/CatalogDashboard.jsx';
import CatalogDetails from './pages/catalog/StoryDetails.jsx';
import StoryPlayer from './pages/catalog/ReaderPage.jsx';

import StudioDashboard from './pages/studio/StudioDashboard.jsx'
import StudioStoryDetails from './pages/studio/StudioStoryDetails.jsx'
import StoryFlowCanvas from './pages/studio/StoryFlowCanvas.jsx'

import { getCachedStaticImage, DEFAULT_AVATAR, DEFAULT_COVER } from './utils/imageCache';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';

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
      console.warn("User not authorized:", err.message);
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
  };

  if (loading) return <div>Ładowanie aplikacji...</div>;

  return (
    <LanguageProvider>
      <ToastProvider>
        <LocationProvider>
          <NavBar user={user} onLogout={handleLogout} />
          <ThemeBtn />

          <main className="app-content">
            <Router>

              <Home path="/" user={user} />

              <LibraryPage path="/library" />

              {/* SEKCJA KATALOGU / GRACZA */}
              <CatalogDashboard path="/catalog" />
              <CatalogDetails path="/catalog/:story_id/details" />
              <StoryPlayer path="/catalog/:story_id/read" />

              {/* SEKCJA STUDIA / TWÓRCY */}
              <StudioDashboard path="/studio" />
              <StudioStoryDetails path="/studio/:story_id/details" />
              <StoryFlowCanvas path="/studio/:story_id/canvas" />

              <AdminDashboard path="/admin" />
              <AuthPage path="/login" onLoginSuccess={loadUser} />
              <ProfilePage path="/:username" currentUser={user} onProfileUpdate={loadUser} onLogout={handleLogout} />

            </Router>
          </main>

        </LocationProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}