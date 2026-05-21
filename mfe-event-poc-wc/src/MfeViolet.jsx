import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const styles = `
  .mfe-content { 
    padding: 2rem; 
    color: white; 
    background: linear-gradient(135deg, #9b59b6 0%, #a29bfe 100%); 
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
    transition: all 0.3s ease;
  }
  
  /* Reactive themes passed from Shell */
  .card.theme-dark {
    background: rgba(15, 23, 42, 0.75);
    color: #f1f5f9;
    border-color: rgba(255, 255, 255, 0.1);
  }
  .card.theme-light {
    background: rgba(255, 255, 255, 0.85);
    color: #1e293b;
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  h2, h3 { margin-top: 0; font-weight: 800; letter-spacing: -0.5px; }
  
  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1.5rem 0;
  }
  
  input[type=range] {
    width: 100%;
    cursor: pointer;
  }
  
  .btn-dispatch { 
    background: white; 
    color: #9b59b6; 
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
  
  .badge-violet {
    background: white;
    color: #9b59b6;
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

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 0.8rem;
    font-family: monospace;
    background: rgba(0,0,0,0.1);
    padding: 8px;
    border-radius: 6px;
    margin-top: 1rem;
  }
  .card.theme-light .status-grid {
    background: rgba(0,0,0,0.05);
    color: #334155;
  }
`;

const App = ({ progress, theme, onProgressChange }) => {
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setLocalProgress(val);
    onProgressChange(val); // Dispatches event on host element
  };

  return (
    <div className="mfe-content">
      <h2>🟪 MFE Violet : Attributs Réactifs & Custom Events Hôtes</h2>
      <span className="badge-violet">🎛️ Hybride Réactif Standard</span>
      
      <p className="explanation">
        Ce MFE utilise l'intégration la plus naturelle : 
        les flux entrants (<strong>In</strong>) passent par les attributs HTML du composant (gérant la réactivité native via <code>attributeChangedCallback</code>). 
        Les flux sortants (<strong>Out</strong>) sont des Custom Events émis directement sur le nœud du Web Component.
      </p>

      <div className={`card theme-${theme}`}>
        <h3>Contrôle Réactif Bidirectionnel</h3>
        <p>Theme actuel reçu du Shell : <strong>{theme.toUpperCase()}</strong></p>
        
        <div className="slider-container">
          <div style={{ display: 'flex', justifyContent: 'between', fontWeight: 'bold' }}>
            <span>Ajuster la Progression (MFE)</span>
            <span style={{ marginLeft: 'auto' }}>{localProgress}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={localProgress} 
            onChange={handleChange} 
          />
        </div>

        <div className="status-grid">
          <div>📥 [Attribut In]</div>
          <div>progress = "{progress}"</div>
          <div>📥 [Attribut In]</div>
          <div>theme = "{theme}"</div>
          <div>📤 [Event Out]</div>
          <div>progress-change : {localProgress}%</div>
        </div>
      </div>
    </div>
  );
};

class MfeVioletElement extends HTMLElement {
  static get observedAttributes() {
    return ['progress', 'theme'];
  }

  constructor() {
    super();
    this.root = null;
    this.reactProps = {
      progress: 50,
      theme: 'light',
      onProgressChange: (val) => {
        // Dispatches custom event directly on the Custom Element node
        this.dispatchEvent(new CustomEvent('progress-change', {
          bubbles: false, // Standard react bindings are cleaner without bubbles
          composed: false, // Dispatched on the host directly, no need to bubble/compose
          detail: { value: val, timestamp: new Date().toLocaleTimeString() }
        }));
      }
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'progress') {
      this.reactProps.progress = parseInt(newValue, 10) || 0;
    } else if (name === 'theme') {
      this.reactProps.theme = newValue || 'light';
    }

    this.renderReact();
  }

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

    // Capture current attributes on mounting
    if (this.hasAttribute('progress')) {
      this.reactProps.progress = parseInt(this.getAttribute('progress'), 10) || 0;
    }
    if (this.hasAttribute('theme')) {
      this.reactProps.theme = this.getAttribute('theme');
    }
    
    this.renderReact();
  }

  renderReact() {
    if (this.root) {
      this.root.render(<App {...this.reactProps} />);
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
