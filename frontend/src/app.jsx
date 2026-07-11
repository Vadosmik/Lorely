import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';
import { LanguageProvider } from './LanguageContext.jsx';

import { NavBar } from './components/NavBar';
import { ThemeBtn } from './components/ThemeBtn.jsx';

import { profileService } from './services/ProfileService.js';

import Home from './pages/HomePage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

import CatalogDashboard from './pages/catalog/CatalogDashboard.jsx';
import CatalogDetails from './pages/catalog/StoryDetails.jsx';
import StoryPlayer from './pages/catalog/ReaderPage.jsx';

import StudioDashboard from './pages/studio/StudioDashboard.jsx'
import StudioStoryDetails from './pages/studio/StudioStoryDetails.jsx'
import StoryFlowCanvas from './pages/studio/StoryFlowCanvas.jsx'

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const userData = await profileService.getMe();
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) return <div>Ładowanie aplikacji...</div>;

  return (
    <LanguageProvider>
      <LocationProvider>
        <NavBar user={user} onLogout={ handleLogout } />
        <ThemeBtn/>

        <Router>

          <Home path="/" />

          {/* SEKCJA KATALOGU / GRACZA */}
          <CatalogDashboard path="/catalog" />
          <CatalogDetails path="/catalog/:story_id/details" />
          <StoryPlayer path="/catalog/:story_id/read" />

          {/* SEKCJA STUDIA / TWÓRCY */}
          <StudioDashboard path="/studio" />
          <StudioStoryDetails path="/studio/:story_id/details" />
          <StoryFlowCanvas path="/studio/:story_id/canvas" />

          <AdminPage path="/admin" />
          <AuthPage path="/login" onLoginSuccess={loadUser} />
          <ProfilePage path="/:username" onProfileUpdate={loadUser} />

        </Router>
      </LocationProvider>
    </LanguageProvider>
  );
}