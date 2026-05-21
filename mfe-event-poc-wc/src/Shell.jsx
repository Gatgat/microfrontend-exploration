import React, { useEffect, useState, useRef } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, useNavigate, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import EventInspector from './EventInspector';

// Import for customElements.define() executions
import './MfeRed';
import './MfeBlue';
import './MfeYellow';
import './MfeViolet';
import './MfeCoexist';

import MfeCoexistenceWrapper from './MfeCoexistenceWrapper';

const HomeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="home-dashboard">
      <h2>🏠 Laboratoire Microfrontend & Communication Custom Events</h2>
      <p>Bienvenue dans le POC. Choisissez un mode de communication à explorer :</p>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555', fontSize: '0.95rem' }}>
        <strong>Architecture MFE par Web Components :</strong> L'application Shell orchestre et intègre 4 Microfrontends encapsulés dans le Shadow DOM, chacun mettant en œuvre une stratégie de communication DOM spécifique.
      </div>
      
      <div className="poc-cards">
        <div className="poc-card border-red">
          <h3>🔴 MFE Rouge : Diffusion Globale</h3>
          <p>
            <strong>Stratégie :</strong> Envoi d'événements sur le contexte global <code>window</code>. Simple à implémenter mais souffre d'un manque d'isolation (vulnérable à l'espionnage).
          </p>
          <button onClick={() => navigate('/app/microfe-rouge')} className="btn-primary">Explorer</button>
        </div>
        
        <div className="poc-card border-blue">
          <h3>📘 MFE Bleu : Shadow DOM Bubbling</h3>
          <p>
            <strong>Stratégie :</strong> Propagation standard via les événements du DOM en configurant <code>bubbles: true</code> et <code>composed: true</code> pour franchir la barrière du Shadow DOM.
          </p>
          <button onClick={() => navigate('/app/microfe-bleu')} className="btn-primary">Explorer</button>
        </div>

        <div className="poc-card border-yellow">
          <h3>🟨 MFE Jaune : Canal Privé MessagePort</h3>
          <p>
            <strong>Stratégie :</strong> Communication bidirectionnelle point-à-point via un <code>MessageChannel</code> privé transmis au MFE. Isolation et sécurité optimales.
          </p>
          <button onClick={() => navigate('/app/microfe-jaune')} className="btn-primary">Explorer</button>
        </div>

        <div className="poc-card border-violet">
          <h3>🟪 MFE Violet : Attributs & Host Events</h3>
          <p>
            <strong>Stratégie :</strong> Approche déclarative standard. Les attributs HTML du composant gèrent l'état entrant, et des Custom Events sont émis directement sur le nœud hôte pour l'état sortant.
          </p>
          <button onClick={() => navigate('/app/microfe-violet')} className="btn-primary">Explorer</button>
        </div>

        <div className="poc-card border-coexist">
          <h3>🔀 Coexistence & Communication Bidirectionnelle</h3>
          <p>
            <strong>Stratégie :</strong> Deux instances de Web Components sur la même page communiquant en P2P direct (MessageChannel) ou via médiation (DOM Events).
          </p>
          <button onClick={() => navigate('/app/coexistence')} className="btn-primary">Explorer</button>
        </div>
      </div>
    </div>
  );
};

const ShellLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // App-level state for MFE Violet (Reactive properties)
  const [violetProgress, setVioletProgress] = useState(60);
  const [violetTheme, setVioletTheme] = useState('dark');

  // Logs and animations state for the Event Inspector
  const [logs, setLogs] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  
  // Ref for the Custom Elements
  const yellowRef = useRef(null);
  const violetRef = useRef(null);

  // Helper to add logs to the inspector
  const addLog = (badge, title, payload = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString(),
      badge,
      title,
      payload
    };
    setLogs(prev => [newLog, ...prev].slice(0, 30));
    setLastEvent(newLog);
  };

  // Toast message state for global alerts
  const [toast, setToast] = useState(null);

  // 1. Listen for MFE Red (Global Window alert)
  useEffect(() => {
    const handleGlobalAlert = (e) => {
      addLog('global', `Événement 'global-system-alert' capturé sur window`, e.detail);
      
      // Trigger temporary visual toast in Shell
      setToast({
        message: e.detail.message,
        severity: e.detail.severity,
        time: e.detail.timestamp
      });
      
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('global-system-alert', handleGlobalAlert);
    return () => window.removeEventListener('global-system-alert', handleGlobalAlert);
  }, []);

  // 2. Listen for MFE Blue (Shadow DOM Bubble) on document/DOM level
  useEffect(() => {
    const handleBlueClick = (e) => {
      addLog('bubble', `Événement 'mfe-blue-click' capturé au niveau document (Composed bubble)`, e.detail);
    };

    document.addEventListener('mfe-blue-click', handleBlueClick);
    return () => document.removeEventListener('mfe-blue-click', handleBlueClick);
  }, []);

  // 3. Setup MessageChannel connection for MFE Yellow
  useEffect(() => {
    // We only initialize the channel if the Yellow component is rendered and loaded
    const yellowElement = yellowRef.current;
    if (!yellowElement) return;

    // Create a new private MessageChannel
    const channel = new MessageChannel();
    
    // Pass port2 directly to the custom element's property
    yellowElement.messagePort = channel.port2;
    addLog('port', `MessageChannel initialisé - Canal sécurisé établi avec MFE Jaune`);

    // Listen on port1 (Shell side)
    const handlePortMessage = (event) => {
      addLog('port', `Message chiffré reçu de MFE Jaune sur le canal privé`, event.data);
      
      // Auto-reply to make the secure connection feel alive and bidirectional!
      setTimeout(() => {
        channel.port1.postMessage({
          text: `[Shell] Signal sécurisé reçu 5/5. Payload enregistré à ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }, 800);
    };

    channel.port1.onmessage = handlePortMessage;

    return () => {
      channel.port1.close();
      channel.port2.close();
    };
  }, [location.pathname]); // Re-run when navigation changes (mounting/unmounting Yellow Element)



  // 4. Setup Host Event Listeners for MFE Violet
  useEffect(() => {
    const violetElement = violetRef.current;
    if (!violetElement) return;

    const handleProgressChange = (e) => {
      setVioletProgress(e.detail.value);
      addLog('reactive', `Événement 'progress-change' intercepté sur le nœud hôte <mfe-violet>`, e.detail);
    };

    violetElement.addEventListener('progress-change', handleProgressChange);
    return () => {
      violetElement.removeEventListener('progress-change', handleProgressChange);
    };
  }, [location.pathname]); // Re-run on navigation to re-bind ref when DOM updates

  return (
    <div className="shell-layout">
      {/* Sidebar - Event Inspector */}
      <div className="logger-panel">
        <EventInspector 
          logs={logs} 
          onClear={() => setLogs([])} 
          lastEvent={lastEvent} 
          currentPath={location.pathname}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-panel">
        {/* Toast Notification Container */}
        {toast && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: toast.severity === 'critical' ? '#ff4757' : (toast.severity === 'warning' ? '#ffa502' : '#2ecc71'),
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'slideIn 0.3s ease-out',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '350px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {toast.severity === 'critical' ? '🚨 ALERTE CRITIQUE' : (toast.severity === 'warning' ? '⚠️ AVERTISSEMENT' : 'ℹ️ INFORMATION SYSTEME')}
              <span style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: 'auto', opacity: 0.8 }}>{toast.time}</span>
            </div>
            <div style={{ fontSize: '0.85rem' }}>{toast.message}</div>
          </div>
        )}

        <div className="shell-header">
          <h1>Application Shell (Hôte des Web Components)</h1>
          <p>
            Rôle : Orchestrer l'intégration et observer la télémétrie des événements. Route actuelle : <strong>{location.pathname}</strong>
          </p>
          
          <div className="shell-actions">
            {location.pathname !== '/app' && (
              <button onClick={() => navigate('/app')} className="btn-primary">
                ⬅ Retour au Dashboard
              </button>
            )}
            
            {/* Outgoing controls for MFE Violet */}
            {location.pathname.startsWith('/app/microfe-violet') && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '10px 15px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                border: '1px solid rgba(255,255,255,0.2)',
                marginLeft: 'auto'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🎛️ Contrôle Shell (Vers MFE Violet) :</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label htmlFor="shell-theme" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Thème :</label>
                  <button 
                    id="shell-theme"
                    onClick={() => {
                      const nextTheme = violetTheme === 'dark' ? 'light' : 'dark';
                      setVioletTheme(nextTheme);
                      addLog('reactive', `Mise à jour de l'attribut réactif 'theme' = "${nextTheme}"`);
                    }}
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', margin: 0 }}
                  >
                    {violetTheme === 'dark' ? 'Mode Clair ☀️' : 'Mode Sombre 🌙'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label htmlFor="shell-slider" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Slider ({violetProgress}%) :</label>
                  <input 
                    id="shell-slider"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={violetProgress} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setVioletProgress(val);
                      addLog('reactive', `Mise à jour de l'attribut réactif 'progress' = "${val}"`);
                    }} 
                    style={{ width: '100px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Web Component Rendering Area */}
        <div className="mfe-container-wrapper">
          <Outlet context={{ yellowRef, violetRef, violetProgress, violetTheme, addLog }} />
        </div>
      </div>
    </div>
  );
};

// Wrapper components for Web Components inside the Router to attach appropriate refs
const RedMfeWrapper = () => <mfe-red></mfe-red>;
const BlueMfeWrapper = () => <mfe-bleu></mfe-bleu>;
const YellowMfeWrapper = () => {
  const { yellowRef } = useOutletContext();
  return <mfe-jaune ref={yellowRef}></mfe-jaune>;
};
const VioletMfeWrapper = () => {
  const { violetRef, violetProgress, violetTheme } = useOutletContext();
  // Pass attributes directly, React 19 will map attributes to custom element
  return (
    <mfe-violet 
      ref={violetRef} 
      progress={violetProgress} 
      theme={violetTheme}
    ></mfe-violet>
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
        path: "microfe-rouge",
        element: <RedMfeWrapper />
      },
      {
        path: "microfe-bleu",
        element: <BlueMfeWrapper />
      },
      {
        path: "microfe-jaune",
        element: <YellowMfeWrapper />
      },
      {
        path: "microfe-violet",
        element: <VioletMfeWrapper />
      },
      {
        path: "coexistence",
        element: <MfeCoexistenceWrapper />
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
