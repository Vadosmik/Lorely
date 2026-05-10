import { LocationProvider, Router, Route } from 'preact-iso';
import EditorPage from './views/editor/EditorPage';
import { ListView } from './views/editor/ListView';

export function App() {
  const base = '/Lorely/frontend';
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