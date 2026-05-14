import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useNavigate, Outlet, useOutletContext } from 'react-router-dom';

const styles = `
  .mfe-content { padding: 2rem; color: white; background: #3498db; height: 100%; box-sizing: border-box; }
  .question-card { background: white; color: #2c3e50; padding: 2rem; border-radius: 8px; margin-top: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .actions { display: flex; justify-content: space-between; margin-top: 2rem; gap: 1rem; }
  button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem; }
  .btn-back { background: #eee; color: #555; }
  .btn-back:hover { background: #e0e0e0; }
  .btn-next { background: #2c3e50; color: white; flex: 1; border: 2px solid transparent; transition: all 0.2s; }
  .btn-next:hover { background: #1a252f; }
  .btn-next.selected { background: #27ae60; border-color: #2ecc71; box-shadow: 0 0 10px rgba(46, 204, 113, 0.5); }
  h2, h3 { margin-top: 0; }
`;

const Layout = () => {
  // Stockage des réponses au niveau du Layout pour les conserver lors des navigations (retour arrière)
  const [answers, setAnswers] = React.useState({});
  
  return (
    <div className="mfe-content">
      <h2>MFE Bleu (Web Component - Shadow DOM)</h2>
      <Outlet context={[answers, setAnswers]} />
    </div>
  );
};

const Question = ({ id, nextUrl }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useOutletContext();
  
  const currentAnswer = answers[`q${id}`];

  const handleChoice = (choice) => {
    // On sauvegarde le choix dans le state du Layout
    setAnswers(prev => ({ ...prev, [`q${id}`]: choice }));
    // Puis on navigue vers l'URL suivante
    navigate(`/${nextUrl}`);
  };

  const handleNextMfe = () => {
    window.dispatchEvent(new CustomEvent('cross-mfe-navigate', { detail: { path: '/app/microfe-jaune/q1' } }));
  };

  return (
    <div className="question-card">
      <h3>Question {id}</h3>
      <p>Ceci est la question {id} gérée par le routeur du MFE Bleu au sein du Shadow DOM.</p>
      {currentAnswer && <p><em>Vous aviez sélectionné le choix {currentAnswer}.</em></p>}
      <div className="actions">
        <button onClick={() => navigate(-1)} className="btn-back">Retour</button>
        {nextUrl ? (
          <>
            <button 
              onClick={() => handleChoice(1)} 
              className={`btn-next ${currentAnswer === 1 ? 'selected' : ''}`}
            >Choix 1</button>
            <button 
              onClick={() => handleChoice(2)} 
              className={`btn-next ${currentAnswer === 2 ? 'selected' : ''}`}
            >Choix 2</button>
          </>
        ) : (
          <button onClick={handleNextMfe} className="btn-next">Passer au MFE Jaune</button>
        )}
      </div>
    </div>
  );
};

const App = () => {
  // On recrée le routeur à chaque montage du Web Component pour éviter les conflits d'état
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
  ], { basename: "/app/microfe-bleu" }), []);

  return <RouterProvider router={router} />;
};

class MfeBlueElement extends HTMLElement {
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
    // Render on connect
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

if (!customElements.get('mfe-bleu')) {
  customElements.define('mfe-bleu', MfeBlueElement);
}

export default MfeBlueElement;
