import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function MfeCoexistenceWrapper() {
  const [strategy, setStrategy] = useState('p2p'); // 'p2p' or 'mediator'
  const peerARef = useRef(null);
  const peerBRef = useRef(null);

  // Retrieve shared tools from Shell outlet context
  const { addLog } = useOutletContext();

  // 1. Initialize MessageChannel when switching to P2P strategy
  useEffect(() => {
    if (strategy !== 'p2p') return;

    const elA = peerARef.current;
    const elB = peerBRef.current;

    if (!elA || !elB) return;

    // Create a new private MessageChannel
    const channel = new MessageChannel();

    // Assign port1 to Peer A and port2 to Peer B
    elA.peerPort = channel.port1;
    elB.peerPort = channel.port2;

    addLog('peer-p2p', 'Canal MessageChannel P2P créé - Ports transférés aux deux instances');

    return () => {
      // Clean up ports on component unmount or strategy switch
      channel.port1.close();
      channel.port2.close();
    };
  }, [strategy]);

  // 2. Setup DOM Mediator event listeners when in mediator strategy
  useEffect(() => {
    if (strategy !== 'mediator') return;

    const elA = peerARef.current;
    const elB = peerBRef.current;

    if (!elA || !elB) return;

    // Handle mediated message dispatch from any peer
    const handleMediatedDispatch = (e) => {
      const { text, sender } = e.detail;
      const target = sender === 'A' ? 'B' : 'A';
      const targetElement = sender === 'A' ? elB : elA;
      
      addLog('peer-mediator', `Médiation DOM : Message de Peer ${sender} intercepté par le Shell. Redirection vers Peer ${target}`, e.detail);

      // Re-route the message directly to the target component's API method
      if (targetElement && typeof targetElement.receiveMediatedMessage === 'function') {
        // Subtle delay to simulate transmission overhead in mediation visualizer
        setTimeout(() => {
          targetElement.receiveMediatedMessage(text);
        }, 300);
      }
    };

    // Bind event listeners to DOM elements
    elA.addEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);
    elB.addEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);

    addLog('peer-mediator', 'Stratégie Médiateur DOM activée - Shell à l\'écoute des événements remettants');

    return () => {
      elA.removeEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);
      elB.removeEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);
    };
  }, [strategy]);

  // 3. Listen for telemetry log helper from P2P mode
  useEffect(() => {
    const elA = peerARef.current;
    const elB = peerBRef.current;

    if (!elA || !elB) return;

    const handlePeerLog = (e) => {
      const { text, sender, strategy } = e.detail;
      const target = sender === 'A' ? 'Beta' : 'Alpha';
      addLog('peer-p2p', `Canal privé direct : Message envoyé par Peer ${sender} à Peer ${target}`, { text });
    };

    elA.addEventListener('mfe-peer-log', handlePeerLog);
    elB.addEventListener('mfe-peer-log', handlePeerLog);

    return () => {
      elA.removeEventListener('mfe-peer-log', handlePeerLog);
      elB.removeEventListener('mfe-peer-log', handlePeerLog);
    };
  }, [strategy]);

  const handleStrategyChange = (newStrategy) => {
    setStrategy(newStrategy);
  };

  return (
    <div className="coexistence-layout">
      <div className="coexistence-header-bar">
        <div className="coexistence-title-info">
          <h2>🔀 Laboratoire de Coexistence : Communication Bidirectionnelle</h2>
          <p>
            Observez deux instances du même Web Component interagir en temps réel.
          </p>
        </div>

        <div className="coexistence-strategy-selector">
          <button 
            onClick={() => handleStrategyChange('p2p')}
            className={`btn-strategy-option ${strategy === 'p2p' ? 'active' : ''}`}
          >
            🔗 MessageChannel (P2P)
          </button>
          <button 
            onClick={() => handleStrategyChange('mediator')}
            className={`btn-strategy-option ${strategy === 'mediator' ? 'active' : ''}`}
          >
            🏢 Médiateur DOM (Shell)
          </button>
        </div>
      </div>

      <div className="coexistence-panels">
        {/* Render both instances on the same page */}
        <mfe-coexist ref={peerARef} role="A" mode={strategy}></mfe-coexist>
        <mfe-coexist ref={peerBRef} role="B" mode={strategy}></mfe-coexist>
      </div>
    </div>
  );
}
