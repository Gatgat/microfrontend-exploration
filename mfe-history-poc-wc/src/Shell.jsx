import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import HistoryLogger from './HistoryLogger';
import LearningGuide from './LearningGuide';
// Import pour exécuter le customElements.define()
import './MfeBlue';
import './MfeYellow';
import './MfeRed';
import './MfeViolet';

const HomeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="home-dashboard">
      <h2>🏠 Laboratoire Microfrontend & API History</h2>
      <p>Bienvenue dans le POC. Choisissez un cas d'usage à explorer :</p>
      
      <div style={{textAlign: 'center', marginBottom: '1rem', color: '#555'}}>
        <strong>Architecture à Routeurs Imbriqués :</strong> L'application Shell possède son propre routeur global, et chaque Web Component (MFE) possède également son routeur interne indépendant.
      </div>
      <div className="architecture-diagram" style={{display: 'flex', justifyContent: 'center'}}>
         <svg width="640" height="200" viewBox="0 0 640 200" style={{maxWidth: '100%', height: 'auto'}}>
          {/* Shell Node */}
          <rect x="220" y="10" width="200" height="50" rx="10" fill="#2ecc71" stroke="#27ae60" strokeWidth="2" />
          <text x="320" y="40" fill="white" textAnchor="middle" fontWeight="bold" fontSize="16">Application Shell</text>
          
          {/* Connecting Lines */}
          <path d="M320 60 L320 90 M80 90 L560 90 M80 90 L80 120 M240 90 L240 120 M400 90 L400 120 M560 90 L560 120" stroke="#95a5a6" strokeWidth="3" fill="none" strokeLinejoin="round" />

          {/* MFE Nodes */}
          <rect x="20" y="120" width="120" height="60" rx="8" fill="#3498db" />
          <text x="80" y="145" fill="white" textAnchor="middle" fontWeight="bold">MFE Bleu</text>
          <text x="80" y="165" fill="white" textAnchor="middle" fontSize="13">(Isolation)</text>

          <rect x="180" y="120" width="120" height="60" rx="8" fill="#f1c40f" />
          <text x="240" y="145" fill="#333" textAnchor="middle" fontWeight="bold">MFE Jaune</text>
          <text x="240" y="165" fill="#333" textAnchor="middle" fontSize="13">(Transition)</text>

          <rect x="340" y="120" width="120" height="60" rx="8" fill="#e74c3c" />
          <text x="400" y="145" fill="white" textAnchor="middle" fontWeight="bold">MFE Rouge</text>
          <text x="400" y="165" fill="white" textAnchor="middle" fontSize="13">(Anti-pattern)</text>

          <rect x="500" y="120" width="120" height="60" rx="8" fill="#8e44ad" />
          <text x="560" y="145" fill="white" textAnchor="middle" fontWeight="bold">MFE Violet</text>
          <text x="560" y="165" fill="white" textAnchor="middle" fontSize="13">(Events)</text>
        </svg>
      </div>

      <div className="poc-cards">
        <div className="poc-card border-blue">
          <h3>📘 MFE Bleu : Isolation</h3>
          <p>
            <strong>Implémentation :</strong> Le MFE utilise un routeur isolé (<code>createBrowserRouter</code>) pour gérer sa navigation interne. Il modifie l'URL nativement via <code>pushState</code> sans aucune interaction avec le routeur du Shell.
          </p>
          <button onClick={() => navigate('/app/microfe-bleu/q1')} className="btn-primary" style={{backgroundColor: '#3498db', color: 'white'}}>Lancer</button>
        </div>
        
        <div className="poc-card border-yellow">
          <h3>🟨 MFE Jaune : Transition</h3>
          <p>
            <strong>Implémentation :</strong> Le MFE utilise un routeur isolé pour gérer sa navigation interne. Il émet un événement global (<code>cross-mfe-navigate</code>) uniquement à la fin du flux pour confier la redirection au routeur du Shell.
          </p>
          <button onClick={() => navigate('/app/microfe-jaune/q1')} className="btn-primary" style={{backgroundColor: '#f1c40f', color: '#333'}}>Lancer</button>
        </div>

        <div className="poc-card border-red">
          <h3>🟥 MFE Rouge : Anti-pattern</h3>
          <p>
            <strong>Implémentation :</strong> Le MFE utilise le hook <code>useBlocker</code> pour intercepter la navigation native (<code>POP</code>). Il injecte un faux état dans l'historique global pour forcer l'annulation du retour arrière.
          </p>
          <button onClick={() => navigate('/app/microfe-rouge/q1')} className="btn-primary" style={{backgroundColor: '#e74c3c', color: 'white'}}>Lancer</button>
        </div>

        <div className="poc-card border-violet">
          <h3>🟪 MFE Violet : Communication</h3>
          <p>
            <strong>Implémentation :</strong> Le MFE utilise le hook <code>useBlocker</code> pour geler sa propre navigation. Il écoute un événement spécifique (<code>unlock-violet-navigation</code>) pour déléguer l'autorisation de déblocage au routeur du Shell.
          </p>
          <button onClick={() => navigate('/app/microfe-violet/q1')} className="btn-primary" style={{backgroundColor: '#8e44ad', color: 'white'}}>Lancer</button>
        </div>
      </div>
    </div>
  );
};

const ShellLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for sidebar tabs
  const [sidebarTab, setSidebarTab] = useState('telemetry');

  // State for sidebar size/visibility: 'standard', 'expanded', 'hidden'
  const [sidebarState, setSidebarState] = useState('standard');

  // Écoute des événements de navigation provenant des Web Components isolés
  useEffect(() => {
    const handleCrossMfeNav = (e) => {
      navigate(e.detail.path);
    };
    window.addEventListener('cross-mfe-navigate', handleCrossMfeNav);
    return () => window.removeEventListener('cross-mfe-navigate', handleCrossMfeNav);
  }, [navigate]);

  return (
    <div className={`shell-layout sidebar-state-${sidebarState}`}>
      {/* Floating Sidebar Restore Button */}
      {sidebarState === 'hidden' && (
        <button 
          className="floating-panel-trigger pulse-glow" 
          onClick={() => setSidebarState('standard')}
          title="Afficher le panel d'apprentissage et de télémétrie"
        >
          📂 Afficher le Panel
        </button>
      )}

      <div className="logger-panel">
        <div className="panel-control-header">
          <span className="panel-title">
            {sidebarTab === 'telemetry' ? '📡 LOGS HISTORIQUE' : '💡 CENTRE D\'APPRENTISSAGE'}
          </span>
          <div className="panel-actions">
            <button 
              className="panel-action-btn"
              onClick={() => setSidebarState(prev => prev === 'expanded' ? 'standard' : 'expanded')}
              title={sidebarState === 'expanded' ? "Réduire le panel" : "Agrandir le panel"}
            >
              {sidebarState === 'expanded' ? '🗜️ Réduire' : '🔍 Agrandir'}
            </button>
            <button 
              className="panel-action-btn btn-close"
              onClick={() => setSidebarState('hidden')}
              title="Masquer le panel"
            >
              📁 Masquer
            </button>
          </div>
        </div>

        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab-btn ${sidebarTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setSidebarTab('telemetry')}
          >
            📡 Logs Historique
          </button>
          <button 
            className={`sidebar-tab-btn ${sidebarTab === 'guide' ? 'active' : ''}`}
            onClick={() => setSidebarTab('guide')}
          >
            💡 Guide & Code
          </button>
        </div>
        
        {sidebarTab === 'telemetry' ? (
          <HistoryLogger />
        ) : (
          <LearningGuide currentPath={location.pathname} />
        )}
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
            {location.pathname.startsWith('/app/microfe-violet') && (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('unlock-violet-navigation'))} 
                  className="btn-primary" 
                  style={{backgroundColor: '#8e44ad', color: 'white', marginLeft: '10px'}}
                >
                  Débloquer la navigation Violette
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
        element: <HomeDashboard />
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
      },
      {
        path: "microfe-violet/*",
        element: <mfe-violet></mfe-violet>
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
