import { LocationProvider, Router, Route } from 'preact-iso';
import EditorPage from './views/editor/EditorPage';

export function App() {
  return (
    <LocationProvider>
      <Router>
        {/* Ścieżka do listy historii oraz do konkretnej historii po ID */}
        <Route path="/editor" component={EditorPage} />
        <Route path="/editor/:id" component={EditorPage} />
      </Router>
    </LocationProvider>
  );
}