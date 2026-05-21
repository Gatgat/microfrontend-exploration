import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const styles = `
  .mfe-content { 
    padding: 2rem; 
    color: white; 
    background: linear-gradient(135deg, #2e86de 0%, #54a0ff 100%); 
    height: 100%; 
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
  }
  .card { 
    background: rgba(255, 255, 255, 0.15); 
    backdrop-filter: blur(8px);
    color: white; 
    padding: 1.5rem; 
    border-radius: 8px; 
    margin-top: 1rem; 
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
  }
  h2, h3 { margin-top: 0; font-weight: 800; letter-spacing: -0.5px; }
  .form-group-checkbox { 
    margin-bottom: 0.75rem; 
    display: flex; 
    align-items: center; 
    gap: 0.5rem; 
    cursor: pointer;
    font-size: 0.9rem;
  }
  .form-group-checkbox input {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }
  
  .btn-dispatch { 
    background: white; 
    color: #2e86de; 
    border: none; 
    padding: 12px 20px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-weight: 800; 
    font-size: 0.95rem;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    width: 100%;
    margin-top: 0.5rem;
  }
  .btn-dispatch:hover { 
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    background: #fdfdfd;
  }
  .btn-dispatch:active { transform: translateY(1px); }
  
  .badge-info {
    background: white;
    color: #2e86de;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    display: inline-block;
    margin-bottom: 1rem;
  }
  
  .explanation {
    font-size: 0.85rem;
    line-height: 1.5;
    opacity: 0.9;
    margin-top: 1rem;
  }

  .status-box {
    margin-top: 1rem;
    background: rgba(0, 0, 0, 0.15);
    padding: 10px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.8rem;
  }
`;

const App = () => {
  const [bubbles, setBubbles] = useState(true);
  const [composed, setComposed] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const innerButtonRef = useRef(null);

  const handleEmit = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (innerButtonRef.current) {
      // Create and dispatch the custom event on the deep node inside Shadow DOM
      const event = new CustomEvent('mfe-blue-click', {
        bubbles: bubbles,
        composed: composed,
        detail: {
          count: nextCount,
          bubbles: bubbles,
          composed: composed,
          timestamp: new Date().toLocaleTimeString(),
          message: 'Événement généré au cœur du Shadow DOM'
        }
      });
      
      innerButtonRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="mfe-content">
      <h2>📘 MFE Bleu : Propagation DOM Standard (Bubbling & Composed)</h2>
      <span className="badge-info">🛡️ Respectueux du Shadow DOM</span>
      
      <p className="explanation">
        Ce MFE montre comment les Custom Events peuvent traverser la barrière hermétique du <strong>Shadow DOM</strong>. 
        Pour s'échapper, l'événement doit être configuré avec <code>composed: true</code> et <code>bubbles: true</code>.
      </p>

      <div className="card">
        <h3>Configuration de la propagation</h3>
        
        <label className="form-group-checkbox">
          <input 
            type="checkbox" 
            checked={bubbles} 
            onChange={(e) => setBubbles(e.target.checked)} 
          />
          <span> bubbles: true (Se propage vers le haut dans l'arborescence)</span>
        </label>

        <label className="form-group-checkbox">
          <input 
            type="checkbox" 
            checked={composed} 
            onChange={(e) => setComposed(e.target.checked)} 
          />
          <span> composed: true (Traverse la frontière du Shadow DOM)</span>
        </label>

        <button 
          ref={innerButtonRef}
          onClick={handleEmit} 
          className="btn-dispatch"
        >
          Déclencher l'événement (Clic #{clickCount})
        </button>

        <div className="status-box">
          Détail de l'envoi :<br />
          new CustomEvent('mfe-blue-click', &#123;<br />
          &nbsp;&nbsp;bubbles: {bubbles ? 'true' : 'false'},<br />
          &nbsp;&nbsp;composed: {composed ? 'true' : 'false'},<br />
          &nbsp;&nbsp;detail: &#123; count: {clickCount} &#125;<br />
          &#125;)
        </div>
      </div>
    </div>
  );
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
