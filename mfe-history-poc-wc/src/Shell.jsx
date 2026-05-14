import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import HistoryLogger from './HistoryLogger';
// Import pour exécuter le customElements.define()
import './MfeBlue';
import './MfeYellow';
import './MfeRed';

const ShellLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Écoute des événements de navigation provenant des Web Components isolés
  useEffect(() => {
    const handleCrossMfeNav = (e) => {
      navigate(e.detail.path);
    };
    window.addEventListener('cross-mfe-navigate', handleCrossMfeNav);
    return () => window.removeEventListener('cross-mfe-navigate', handleCrossMfeNav);
  }, [navigate]);

  return (
    <div className="shell-layout bg-green">
      <div className="logger-panel">
        <HistoryLogger />
      </div>
      <div className="main-panel">
        <div className="shell-header">
          <h1>Application Shell (Hôte des Web Components)</h1>
          <p>Rôle : Monter les balises HTML custom. Route actuelle : <strong>{location.pathname}</strong></p>
          <div className="shell-actions">
            {location.pathname === '/app' && (
                <button onClick={() => navigate('/app/microfe-bleu/q1')} className="btn-primary">
                  Démarrer le flux (MFE Bleu)
                </button>
            )}
          </div>
        </div>
        
        <div className="mfe-container-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const shellRouter = createBrowserRouter([
  {
    path: "/app",
    element: <ShellLayout />,
    children: [
      {
        index: true,
        element: (
          <div className="mfe-empty">
            <h2>Zone de montage MFE</h2>
            <p>Aucun Web Component n'est actuellement monté dans le DOM.</p>
          </div>
        )
      },
      {
        path: "microfe-bleu/*",
        element: <mfe-bleu></mfe-bleu>
      },
      {
        path: "microfe-jaune/*",
        element: <mfe-jaune></mfe-jaune>
      },
      {
        path: "microfe-rouge/*",
        element: <mfe-rouge></mfe-rouge>
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/app" replace />
  }
]);

export default function Shell() {
  return <RouterProvider router={shellRouter} />;
}
