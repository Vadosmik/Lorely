import { LocationProvider, Router, Route } from 'preact-iso';
import EditorPage from './views/editor/EditorPage';
import { ListView } from './views/editor/ListView'; // Changed to named import
// import ProfilePge from './views/profile/ProfilePge';

// Jeśli preact-iso nie obsługuje base path wprost,
// musisz dodać bazę do ścieżek:

export function App() {
  const base = '/Lorely/frontend/dist';
  return (
    <LocationProvider>
      <Router>
        <Route path={`${base}/`} component={ListView} />
        <Route path={`${base}/editor`} component={EditorPage} />
        <Route path={`${base}/editor/:id`} component={EditorPage} />
      </Router>
    </LocationProvider>
  );
}