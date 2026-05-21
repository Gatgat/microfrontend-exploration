import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const styles = `
  .mfe-coexist-content { 
    padding: 1.5rem; 
    color: white; 
    height: 100%; 
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
  }
  .mfe-coexist-content.role-a {
    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); 
  }
  .mfe-coexist-content.role-b {
    background: linear-gradient(135deg, #0097a7 0%, #006064 100%); 
  }
  
  .card { 
    background: rgba(255, 255, 255, 0.15); 
    backdrop-filter: blur(10px);
    color: white; 
    padding: 1.25rem; 
    border-radius: 8px; 
    margin-top: 0.75rem; 
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  h3 { margin-top: 0; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.5rem; }
  
  .chat-box {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 0.75rem;
    font-family: monospace;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .chat-msg {
    margin-bottom: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    max-width: 80%;
    animation: bubbleIn 0.2s ease-out;
  }
  
  .chat-msg.sent {
    background: #2ecc71;
    color: white;
    align-self: flex-end;
    text-align: right;
  }
  
  .chat-msg.received {
    background: rgba(255, 255, 255, 0.9);
    color: #1e293b;
    align-self: flex-start;
    text-align: left;
  }
  
  .input-row {
    display: flex;
    gap: 0.5rem;
  }
  
  input { 
    flex: 1;
    padding: 8px 12px; 
    border-radius: 6px; 
    border: 1px solid rgba(255,255,255,0.25); 
    background: rgba(255, 255, 255, 0.9); 
    color: #1e293b; 
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;
  }
  input:focus {
    background: white;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
  }
  
  .btn-send { 
    background: #1e293b; 
    color: white; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-weight: 800; 
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .btn-send:hover { 
    transform: translateY(-1px);
    background: #0f172a;
  }
  
  .badge-mode {
    background: rgba(0, 0, 0, 0.3);
    color: #2ecc71;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: bold;
    display: inline-block;
    align-self: flex-start;
    border: 1px solid rgba(46, 204, 113, 0.3);
  }
  
  .badge-mode.mediator {
    color: #e67e22;
    border-color: rgba(230, 126, 34, 0.3);
  }
  
  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(5px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const App = ({ role, mode, port, onSendMessage, messages, setMessages }) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for peer messages on MessagePort in P2P mode
  useEffect(() => {
    if (mode !== 'p2p' || !port) return;

    const handleMessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        type: 'received',
        text: event.data.text,
        time: new Date().toLocaleTimeString()
      }]);
    };

    port.addEventListener('message', handleMessage);
    port.start();

    return () => {
      port.removeEventListener('message', handleMessage);
    };
  }, [port, mode]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Delegate message dispatch to parent component logic
    onSendMessage(inputText);

    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'sent',
      text: inputText,
      time: new Date().toLocaleTimeString()
    }]);

    setInputText('');
  };

  const isP2P = mode === 'p2p';
  const roleName = role === 'A' ? 'Peer Alpha (Vert d\'eau)' : 'Peer Beta (Cyan)';

  return (
    <div className={`mfe-coexist-content role-${role.toLowerCase()}`}>
      <h3>🔀 MFE Coexistence : {roleName}</h3>
      <span className={`badge-mode ${!isP2P ? 'mediator' : ''}`}>
        {isP2P ? '🔗 Mode P2P (MessagePort Direct)' : '🏢 Mode Médiateur (DOM Events)'}
      </span>

      <div className="card">
        <div className="chat-box">
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.type}`}>
              {m.text}
              <span style={{ fontSize: '0.55rem', display: 'block', opacity: 0.5, marginTop: '2px' }}>
                {m.time}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-row">
          <input 
            type="text" 
            placeholder={`Écrire à Peer ${role === 'A' ? 'Beta' : 'Alpha'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-send">Envoyer</button>
        </form>
      </div>
    </div>
  );
};

class MfeCoexistElement extends HTMLElement {
  static get observedAttributes() {
    return ['role', 'mode'];
  }

  constructor() {
    super();
    this._role = 'A';
    this._mode = 'p2p';
    this._port = null;
    this.root = null;
    
    // Shared state between React render cycles to persist message history
    this.messages = [];
    this.setMessagesCallback = null;
  }

  // React-compatible setMessages state binding
  setMessages = (updater) => {
    if (typeof updater === 'function') {
      this.messages = updater(this.messages);
    } else {
      this.messages = updater;
    }
    if (this.setMessagesCallback) {
      this.setMessagesCallback(this.messages);
    }
  };

  set peerPort(port) {
    this._port = port;
    this.renderReact();
  }

  get peerPort() {
    return this._port;
  }

  // Public API exposed by the Custom Element for Mediated communication
  receiveMediatedMessage(text) {
    this.setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'received',
      text: text,
      time: new Date().toLocaleTimeString()
    }]);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'role') this._role = newValue || 'A';
    if (name === 'mode') this._mode = newValue || 'p2p';
    this.renderReact();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const mountPoint = document.createElement('div');
      mountPoint.style.height = '100%';
      mountPoint.style.width = '100%';
      this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
      
      const style = document.createElement('style');
      style.textContent = styles;
      this.shadowRoot.appendChild(style);

      this.root = createRoot(mountPoint);
    }
    
    this.renderReact();
  }

  renderReact() {
    if (!this.root) return;

    const handleSendMessage = (text) => {
      if (this._mode === 'p2p' && this._port) {
        // Send directly to the other port
        this._port.postMessage({
          type: 'peer-message',
          text: text,
          sender: this._role
        });
        
        // Notify Shell for logs only
        this.dispatchEvent(new CustomEvent('mfe-peer-log', {
          bubbles: true,
          composed: true,
          detail: {
            text: text,
            sender: this._role,
            strategy: 'p2p'
          }
        }));
      } else if (this._mode === 'mediator') {
        // Dispatch CustomEvent through DOM to reach mediator Shell
        this.dispatchEvent(new CustomEvent('mfe-peer-mediated-dispatch', {
          bubbles: true,
          composed: true,
          detail: {
            text: text,
            sender: this._role
          }
        }));
      }
    };

    // State Wrapper inside React to hook message state
    const StateWrapper = () => {
      const [messages, setMessages] = useState(this.messages);
      
      useEffect(() => {
        this.setMessagesCallback = setMessages;
        return () => {
          this.setMessagesCallback = null;
        };
      }, []);

      return (
        <App 
          role={this._role}
          mode={this._mode}
          port={this._port}
          onSendMessage={handleSendMessage}
          messages={messages}
          setMessages={this.setMessages}
        />
      );
    };

    this.root.render(<StateWrapper />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

if (!customElements.get('mfe-coexist')) {
  customElements.define('mfe-coexist', MfeCoexistElement);
}

export default MfeCoexistElement;
