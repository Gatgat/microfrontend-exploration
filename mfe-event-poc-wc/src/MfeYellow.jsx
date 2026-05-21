import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const styles = `
  .mfe-content { 
    padding: 2rem; 
    color: #1e293b; 
    background: linear-gradient(135deg, #ffa502 0%, #ffbe0f 100%); 
    height: 100%; 
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
  }
  .card { 
    background: rgba(255, 255, 255, 0.7); 
    backdrop-filter: blur(8px);
    color: #1e293b; 
    padding: 1.5rem; 
    border-radius: 8px; 
    margin-top: 1rem; 
    border: 1px solid rgba(255,255,255,0.4);
    box-shadow: 0 4px 15px rgba(0,0,0,0.06); 
  }
  h2, h3 { margin-top: 0; font-weight: 800; letter-spacing: -0.5px; }
  .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
  label { font-weight: bold; font-size: 0.85rem; opacity: 0.9; }
  
  .chat-box {
    background: white;
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.1);
    height: 120px;
    overflow-y: auto;
    padding: 8px;
    margin-bottom: 1rem;
    font-family: monospace;
    font-size: 0.8rem;
  }
  .chat-msg {
    margin-bottom: 4px;
    padding: 4px 6px;
    border-radius: 4px;
  }
  .chat-msg.sent {
    background: #ffa502;
    color: white;
    text-align: right;
    margin-left: 20%;
  }
  .chat-msg.received {
    background: #f1f5f9;
    color: #334155;
    text-align: left;
    margin-right: 20%;
  }
  
  .input-row {
    display: flex;
    gap: 0.5rem;
  }
  input { 
    flex: 1;
    padding: 10px; 
    border-radius: 6px; 
    border: 1px solid rgba(0,0,0,0.15); 
    background: white; 
    color: #1e293b; 
    font-size: 0.95rem;
    outline: none;
  }
  
  .btn-dispatch { 
    background: #1e293b; 
    color: white; 
    border: none; 
    padding: 10px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-weight: 800; 
    font-size: 0.95rem;
    transition: all 0.2s;
  }
  .btn-dispatch:hover { 
    transform: translateY(-1px);
    background: #0f172a;
  }
  
  .badge-success {
    background: #1e293b;
    color: #ffa502;
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

const App = ({ port, onSendText }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat box
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for messages from Shell on the MessagePort
  useEffect(() => {
    if (!port) return;

    const handleMessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        type: 'received',
        text: event.data.text,
        time: new Date().toLocaleTimeString()
      }]);
    };

    port.addEventListener('message', handleMessage);
    port.start(); // Active le port

    return () => {
      port.removeEventListener('message', handleMessage);
    };
  }, [port]);



  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (port) {
      port.postMessage({
        type: 'from-mfe-yellow',
        text: inputText,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Also notify Shell that port communication is occurring for the logs
      onSendText(inputText);

      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        type: 'sent',
        text: inputText,
        time: new Date().toLocaleTimeString()
      }]);

      setInputText('');
    }
  };

  return (
    <div className="mfe-content">
      <h2>🟨 MFE Jaune : Canal Privé Isolé (MessageChannel)</h2>
      <span className="badge-success">🔒 Sécurisé & Encapsulé</span>
      
      <p className="explanation">
        Ce MFE utilise un port privé <code>MessagePort</code> transmis par le Shell. La communication s'effectue directement
        entre les deux entités, hors du DOM et de <code>window</code>. Aucun autre MFE ne peut intercepter ces données.
      </p>

      <div className="card">
        <h3>Messagerie sécurisée avec le Shell</h3>
        <div className="chat-box">
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.type}`}>
              <strong>{m.type === 'sent' ? 'MFE' : 'Shell'} : </strong>
              {m.text}
              <span style={{ fontSize: '0.6rem', display: 'block', opacity: 0.6 }}>{m.time}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-row">
          <input 
            type="text" 
            placeholder="Écrire un message ultra-sécurisé..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-dispatch">Envoyer</button>
        </form>
      </div>
    </div>
  );
};

class MfeYellowElement extends HTMLElement {
  constructor() {
    super();
    this._port = null;
    this.root = null;
    this.reactProps = {
      port: null,
      onSendText: (txt) => {
        // Triggers logs in Shell through standard bubbling notification
        this.dispatchEvent(new CustomEvent('mfe-port-action', {
          bubbles: true,
          composed: true,
          detail: { text: txt, direction: 'out' }
        }));
      }
    };
  }

  set messagePort(port) {
    this._port = port;
    this.reactProps.port = port;
    this.renderReact();
  }

  get messagePort() {
    return this._port;
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

if (!customElements.get('mfe-jaune')) {
  customElements.define('mfe-jaune', MfeYellowElement);
}

export default MfeYellowElement;
