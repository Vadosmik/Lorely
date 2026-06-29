import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';

import { NavBar } from './components/NavBar';

import { profileService } from './services/ProfileServiece.js';

import Home from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage.jsx';
import EditPage from './pages/EditPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

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
    // localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) return <div>Ładowanie aplikacji...</div>;

  return (
    <LocationProvider>
      <NavBar user={user} onLogout={handleLogout} />

      <Router>
        <Home path="/" />
        <CatalogPage path="/catalog" />
        <EditPage path="/editor" />
        <AuthPage path="/login" onLoginSuccess={loadUser} />
        <ProfilePage path="/:username" onProfileUpdate={loadUser} />
      </Router>
    </LocationProvider>
  );
}