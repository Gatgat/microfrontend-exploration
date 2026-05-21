import React, { useEffect, useState } from 'react';

export default function EventInspector({ logs, onClear, lastEvent }) {
  const [activeAnimation, setActiveAnimation] = useState(null);

  useEffect(() => {
    if (lastEvent) {
      setActiveAnimation(lastEvent.badge);
      const timer = setTimeout(() => {
        setActiveAnimation(null);
      }, 2000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  return (
    <div className="logger-container">
      <div className="logger-header">
        <h3>📡 Inspecteur d'Événements</h3>
        <button onClick={onClear} className="btn-clear">Effacer</button>
      </div>

      <div className="logs-section">
        <div className="logs-list">
          {logs.map((log) => (
            <div key={log.id} className={`log-item log-${log.badge}`}>
              <div className="log-meta">
                <span className="log-time">[{log.time}]</span>
                <span className={`log-badge badge-${log.badge}`}>{log.badge}</span>
              </div>
              <div className="log-title">{log.title}</div>
              {log.payload && (
                <pre className="log-payload">
                  {typeof log.payload === 'object' 
                    ? JSON.stringify(log.payload, null, 2) 
                    : log.payload}
                </pre>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="log-empty">Aucun événement capturé pour le moment. Interagissez avec un microfrontend pour déclencher la communication !</p>
          )}
        </div>
      </div>

      <div className="visualizer-section">
        <h4>
          <span>🔬 Visualisateur de Flux</span>
          <span className="visualizer-status">
            {activeAnimation ? `Flux Actif : ${activeAnimation.toUpperCase()}` : 'En attente...'}
          </span>
        </h4>
        
        <div className="visualizer-canvas">
          <svg width="100%" height="100%" viewBox="0 0 420 180" style={{ background: '#0f172a', borderRadius: '6px' }}>
            {/* Definitions for gradients and markers */}
            <defs>
              <linearGradient id="glowRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4757" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff6b81" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="glowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e86de" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#54a0ff" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="glowYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffa502" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffbe0f" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="glowViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b59b6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a29bfe" stopOpacity="0.2" />
              </linearGradient>
              
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#2ecc71" />
              </marker>
              <marker id="arrow-violet" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#9b59b6" />
              </marker>
            </defs>

            {/* Background elements */}
            <rect width="100%" height="100%" fill="#0f172a" />
            
            {/* GRID lines for sci-fi look */}
            <g stroke="#1e293b" strokeWidth="0.5">
              <line x1="0" y1="30" x2="420" y2="30" />
              <line x1="0" y1="60" x2="420" y2="60" />
              <line x1="0" y1="90" x2="420" y2="90" />
              <line x1="0" y1="120" x2="420" y2="120" />
              <line x1="0" y1="150" x2="420" y2="150" />
              <line x1="70" y1="0" x2="70" y2="180" />
              <line x1="140" y1="0" x2="140" y2="180" />
              <line x1="210" y1="0" x2="210" y2="180" />
              <line x1="280" y1="0" x2="280" y2="180" />
              <line x1="350" y1="0" x2="350" y2="180" />
            </g>

            {/* Static Channels / Communication Paths */}
            {/* Global broadcast path (window/dom root) represented as waves */}
            {activeAnimation === 'global' && (
              <g stroke="var(--mfe-red)" fill="none" opacity="0.8">
                <circle cx="50" cy="140" r="25">
                  <animate attributeName="r" values="10;80" dur="1s" repeatCount="2" />
                  <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="2" />
                </circle>
                <circle cx="50" cy="140" r="40">
                  <animate attributeName="r" values="20;120" dur="1s" begin="0.2s" repeatCount="2" />
                  <animate attributeName="opacity" values="1;0" dur="1s" begin="0.2s" repeatCount="2" />
                </circle>
                {/* Visual waves connecting to other MFEs */}
                <path d="M 50 140 Q 210 50 210 25" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="infinite" />
                </path>
                <path d="M 50 140 Q 150 110 250 140" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="infinite" />
                </path>
              </g>
            )}

            {/* Blue Bubble Path (Composed Shadow DOM) */}
            <path id="path-blue" d="M 150 140 C 150 80, 210 80, 210 45" stroke={activeAnimation === 'bubble' ? 'var(--mfe-blue)' : '#334155'} strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
            {activeAnimation === 'bubble' && (
              <circle r="6" fill="#60a5fa">
                <animateMotion dur="1s" repeatCount="2" path="M 150 140 C 150 80, 210 80, 210 45" />
                <animate attributeName="opacity" values="1;0.4;1" dur="0.5s" repeatCount="infinite" />
              </circle>
            )}

            {/* Yellow MessageChannel private pipe */}
            <path id="path-yellow" d="M 270 140 L 210 45" stroke={activeAnimation === 'port' ? 'var(--mfe-yellow)' : '#334155'} strokeWidth="2" strokeDasharray={activeAnimation === 'port' ? '0' : '4 4'} fill="none" />
            {activeAnimation === 'port' && (
              <g>
                {/* Shell to Yellow */}
                <circle r="5" fill="#f59e0b">
                  <animateMotion dur="1.2s" repeatCount="2" path="M 210 45 L 270 140" />
                </circle>
                {/* Yellow to Shell */}
                <circle r="5" fill="#fbbf24">
                  <animateMotion dur="1.2s" begin="0.3s" repeatCount="2" path="M 270 140 L 210 45" />
                </circle>
              </g>
            )}

            {/* Violet reactive attributes loop */}
            {/* Outgoing event: Violet -> Shell */}
            <path d="M 370 140 Q 370 70 210 45" stroke={activeAnimation === 'reactive' ? 'var(--mfe-violet)' : '#334155'} strokeWidth="2" fill="none" markerEnd="url(#arrow-violet)" />
            {/* Incoming attribute: Shell -> Violet */}
            <path d="M 210 45 Q 310 90 370 140" stroke={activeAnimation === 'reactive' ? '#2ecc71' : '#334155'} strokeWidth="2" strokeDasharray="4 4" fill="none" markerEnd="url(#arrow-green)" />
            
            {activeAnimation === 'reactive' && (
              <g>
                {/* Event travelling up */}
                <circle r="5" fill="#c084fc">
                  <animateMotion dur="1.2s" repeatCount="2" path="M 370 140 Q 370 70 210 45" />
                </circle>
                {/* Attribute travelling down */}
                <circle r="5" fill="#4ade80">
                  <animateMotion dur="1.2s" begin="0.4s" repeatCount="2" path="M 210 45 Q 310 90 370 140" />
                </circle>
              </g>
            )}



            {/* NODES DESIGN */}
            {/* Shell Node */}
            <g transform="translate(160, 15)">
              <rect x="0" y="0" width="100" height="30" rx="6" fill="#1e293b" stroke={activeAnimation ? '#2ecc71' : '#475569'} strokeWidth="2" />
              <text x="50" y="19" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">💻 SHELL / HÔTE</text>
              {activeAnimation && (
                <circle cx="90" cy="8" r="4" fill="#2ecc71">
                  <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="infinite" />
                </circle>
              )}
            </g>

            {/* MFE Red (Rouge) Node */}
            <g transform="translate(10, 125)">
              <rect x="0" y="0" width="80" height="30" rx="5" fill={activeAnimation === 'global' ? 'var(--mfe-red)' : '#1e293b'} stroke="var(--mfe-red)" strokeWidth="1.5" />
              <text x="40" y="18" fill={activeAnimation === 'global' ? '#0f172a' : '#f8fafc'} fontSize="9" fontWeight="bold" textAnchor="middle">MFE Rouge</text>
              <text x="40" y="27" fill={activeAnimation === 'global' ? '#0f172a' : '#94a3b8'} fontSize="6" textAnchor="middle">Window Event</text>
            </g>

            {/* MFE Blue (Bleu) Node */}
            <g transform="translate(110, 125)">
              <rect x="0" y="0" width="80" height="30" rx="5" fill={activeAnimation === 'bubble' ? 'var(--mfe-blue)' : '#1e293b'} stroke="var(--mfe-blue)" strokeWidth="1.5" />
              <text x="40" y="18" fill={activeAnimation === 'bubble' ? '#0f172a' : '#f8fafc'} fontSize="9" fontWeight="bold" textAnchor="middle">MFE Bleu</text>
              <text x="40" y="27" fill={activeAnimation === 'bubble' ? '#0f172a' : '#94a3b8'} fontSize="6" textAnchor="middle">Shadow Bubble</text>
            </g>

            {/* MFE Yellow (Jaune) Node */}
            <g transform="translate(230, 125)">
              <rect x="0" y="0" width="80" height="30" rx="5" fill={activeAnimation === 'port' ? 'var(--mfe-yellow)' : '#1e293b'} stroke="var(--mfe-yellow)" strokeWidth="1.5" />
              <text x="40" y="18" fill={activeAnimation === 'port' ? '#0f172a' : '#f8fafc'} fontSize="9" fontWeight="bold" textAnchor="middle">MFE Jaune</text>
              <text x="40" y="27" fill={activeAnimation === 'port' ? '#0f172a' : '#94a3b8'} fontSize="6" textAnchor="middle">MessagePort</text>
            </g>

            {/* MFE Violet (Violet) Node */}
            <g transform="translate(330, 125)">
              <rect x="0" y="0" width="80" height="30" rx="5" fill={activeAnimation === 'reactive' ? 'var(--mfe-violet)' : '#1e293b'} stroke="var(--mfe-violet)" strokeWidth="1.5" />
              <text x="40" y="18" fill={activeAnimation === 'reactive' ? '#0f172a' : '#f8fafc'} fontSize="9" fontWeight="bold" textAnchor="middle">MFE Violet</text>
              <text x="40" y="27" fill={activeAnimation === 'reactive' ? '#0f172a' : '#94a3b8'} fontSize="6" textAnchor="middle">Reactive Attributes</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
