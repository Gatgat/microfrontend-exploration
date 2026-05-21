import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const styles = `
  .mfe-content { 
    padding: 2rem; 
    color: white; 
    background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); 
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
  .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  label { font-weight: bold; font-size: 0.85rem; opacity: 0.9; }
  input, select { 
    padding: 10px; 
    border-radius: 6px; 
    border: 1px solid rgba(255,255,255,0.3); 
    background: rgba(255,255,255,0.2); 
    color: white; 
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
  }
  input::placeholder { color: rgba(255,255,255,0.6); }
  input:focus, select:focus { background: rgba(255,255,255,0.35); border-color: white; }
  select option { background: #ff4757; color: white; }
  
  .btn-dispatch { 
    background: white; 
    color: #ff4757; 
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
  
  .badge-warning {
    background: #ffa502;
    color: #1a252f;
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
`;

const App = () => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Dispatch global event on window object
    const eventDetail = {
      message: message,
      severity: severity,
      timestamp: new Date().toLocaleTimeString(),
      source: 'MFE_ROUGE_GLOBAL'
    };

    const event = new CustomEvent('global-system-alert', { 
      detail: eventDetail
    });
    
    window.dispatchEvent(event);
    setMessage('');
  };

  return (
    <div className="mfe-content">
      <h2>🔴 MFE Rouge : Diffusion Globale (window-level)</h2>
      <span className="badge-warning">⚠️ Non Isolé & Vulnérable</span>
      
      <p className="explanation">
        Ce MFE démontre le mode de diffusion global. Il distribue des messages sur l'objet <code>window</code> global. 
        Toute l'application, y compris les autres microfrontends ou des scripts tiers malveillants (extensions, pub), peut intercepter ces données.
      </p>

      <div className="card">
        <h3>Diffuser une alerte système globale</h3>
        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label htmlFor="msg">Message d'alerte</label>
            <input 
              id="msg"
              type="text" 
              placeholder="Ex: Maintenance système dans 10 min..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sev">Sévérité</label>
            <select id="sev" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="info">Information ℹ️</option>
              <option value="warning">Avertissement ⚠️</option>
              <option value="critical">Critique 🚨</option>
            </select>
          </div>

          <button type="submit" className="btn-dispatch">Diffuser l'événement global</button>
        </form>
      </div>
    </div>
  );
};

class MfeRedElement extends HTMLElement {
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

if (!customElements.get('mfe-red')) {
  customElements.define('mfe-red', MfeRedElement);
}

export default MfeRedElement;
