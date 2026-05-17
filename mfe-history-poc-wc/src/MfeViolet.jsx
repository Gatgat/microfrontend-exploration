import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useNavigate, Outlet, useBlocker } from 'react-router-dom';

const styles = `
  .mfe-content { padding: 2rem; color: white; background: #8e44ad; height: 100%; box-sizing: border-box; }
  .question-card { background: white; color: #2c3e50; padding: 2rem; border-radius: 8px; margin-top: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .actions { display: flex; justify-content: space-between; margin-top: 2rem; gap: 1rem; }
  button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem; }
  .btn-back { background: #eee; color: #555; }
  .btn-back:hover { background: #e0e0e0; }
  .btn-next { background: #2c3e50; color: white; flex: 1; }
  .btn-next:hover { background: #1a252f; }
  .anti-pattern-warning { background: #f39c12; color: white; padding: 10px; border-radius: 4px; font-weight: bold; margin-bottom: 1rem; }
  h2, h3 { margin-top: 0; }
`;

const Layout = () => (
  <div className="mfe-content">
    <h2>MFE Violet (useBlocker + Déblocage Shell)</h2>
    <Outlet />
  </div>
);

const Question = ({ id, nextUrl }) => {
  const navigate = useNavigate();

  // Bloque les navigations PUSH (boutons Suivant) et POP (retour arrière)
  const blocker = useBlocker(
    ({ historyAction }) => historyAction === "POP" || historyAction === "PUSH" || historyAction === "REPLACE"
  );
  
  // Écoute de l'événement custom venant du Shell pour débloquer
  useEffect(() => {
    const handleUnlock = () => {
      if (blocker.state === "blocked") {
        blocker.proceed();
      }
    };
    window.addEventListener('unlock-violet-navigation', handleUnlock);
    return () => window.removeEventListener('unlock-violet-navigation', handleUnlock);
  }, [blocker]);

  const handleNextMfe = () => {
    window.dispatchEvent(new CustomEvent('cross-mfe-navigate', { detail: { path: '/app' } }));
  };

  return (
    <div className="question-card">
      {blocker.state === "blocked" && (
        <div className="anti-pattern-warning">
          ⚠️ Navigation bloquée par useBlocker ! Cliquez sur le bouton "Débloquer" dans l'en-tête du Shell pour continuer.
        </div>
      )}
      <h3>Question {id}</h3>
      <p>Essayez de naviguer. La navigation sera interceptée et mise en attente jusqu'à ce que le Shell vous autorise !</p>
      <div className="actions">
        <button onClick={() => navigate(-1)} className="btn-back">Retour (React Router)</button>
        {nextUrl ? (
          <button onClick={() => navigate(`/${nextUrl}`)} className="btn-next">Suivant</button>
        ) : (
          <button onClick={handleNextMfe} className="btn-next">Terminer (Retour au Shell)</button>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const router = React.useMemo(() => createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "q1", element: <Question id={1} nextUrl="q2" /> },
        { path: "q2", element: <Question id={2} nextUrl="q3" /> },
        { path: "q3", element: <Question id={3} nextUrl={null} /> },
        { path: "*", element: <Question id={1} nextUrl="q2" /> }
      ]
    }
  ], { basename: "/app/microfe-violet" }), []);

  return <RouterProvider router={router} />;
};

class MfeVioletElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const mountPoint = document.createElement('div');
      mountPoint.style.height = '100%';
      this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
      
      const style = document.createElement('style');
      style.textContent = styles;
      this.shadowRoot.appendChild(style);

      this.root = createRoot(mountPoint);
    }
    if (this.root) {
      this.root.render(<App />);
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

if (!customElements.get('mfe-violet')) {
  customElements.define('mfe-violet', MfeVioletElement);
}

export default MfeVioletElement;
