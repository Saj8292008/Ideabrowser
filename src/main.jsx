import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './Landing.jsx';
import Workspace from './Workspace.jsx';
import './styles.css';

export function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

function Router() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return path.startsWith('/app') ? <Workspace /> : <Landing />;
}

createRoot(document.getElementById('root')).render(<StrictMode><Router /></StrictMode>);
