import React, { useEffect, useState, useRef } from 'react';

// Hook pour capturer les événements d'historique et suivre la pile
export function useHistoryLogger() {
  const [logs, setLogs] = useState([]);
  const [stackData, setStackData] = useState({
    stack: [window.location.pathname],
    currentIndex: 0
  });

  // Refs pour garder un accès synchrone
  const stackRef = useRef([window.location.pathname]);
  const indexRef = useRef(0);

  useEffect(() => {
    const syncState = () => {
      setStackData({
        stack: [...stackRef.current],
        currentIndex: indexRef.current
      });
    };

    const addLog = (type, details) => {
      setLogs(prev => {
        const newLogs = [...prev, {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          type,
          details
        }];
        return newLogs.slice(-30);
      });
    };

    // Monkey-patch pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function (state, unused, url) {
      addLog('pushState', `url: ${url}`);
      
      // Mise à jour de la pile
      const urlStr = url ? url.toString() : window.location.pathname;
      indexRef.current += 1;
      stackRef.current = stackRef.current.slice(0, indexRef.current);
      stackRef.current.push(urlStr);
      syncState();

      return originalPushState.apply(this, arguments);
    };

    // Monkey-patch replaceState
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (state, unused, url) {
      addLog('replaceState', `url: ${url}`);
      
      // Mise à jour de la pile
      const urlStr = url ? url.toString() : window.location.pathname;
      stackRef.current[indexRef.current] = urlStr;
      syncState();

      return originalReplaceState.apply(this, arguments);
    };

    // Écoute de popstate (boutons natifs précédent/suivant)
    const handlePopState = (event) => {
      addLog('popstate', `pathname: ${window.location.pathname}`);
      
      // Heuristique pour deviner la direction dans la pile
      const currentUrl = window.location.pathname;
      if (indexRef.current > 0 && stackRef.current[indexRef.current - 1] === currentUrl) {
        indexRef.current -= 1; // Retour arrière
      } else if (indexRef.current < stackRef.current.length - 1 && stackRef.current[indexRef.current + 1] === currentUrl) {
        indexRef.current += 1; // Avance
      } else {
        // Fallback: chercher l'URL la plus proche dans la pile
        const lastIndex = stackRef.current.lastIndexOf(currentUrl);
        if (lastIndex !== -1) {
          indexRef.current = lastIndex;
        }
      }
      syncState();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return { logs, stackData };
}

export default function HistoryLogger() {
  const { logs, stackData } = useHistoryLogger();

  return (
    <div className="logger-container">
      <div className="logs-section">
        <h3>Logs API History</h3>
        <div className="logs-list">
          {logs.map((log) => (
            <div key={log.id} className={`log-item log-${log.type.toLowerCase()}`}>
              <span className="log-time">[{log.time}]</span>
              <span className="log-type">{log.type}</span>
              <span className="log-details">{log.details}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="log-empty">Aucun événement capturé.</p>}
        </div>
      </div>
      
      <div className="stack-section">
        <h3>Pile de Navigation (History Stack)</h3>
        <div className="stack-container">
          {stackData.stack.slice().reverse().map((url, i) => {
            const realIndex = stackData.stack.length - 1 - i;
            const isCurrent = realIndex === stackData.currentIndex;
            return (
              <div key={realIndex} className={`stack-item ${isCurrent ? 'current' : ''}`}>
                <span className="stack-index">#{realIndex}</span>
                <span className="stack-url" title={url}>{url}</span>
                {isCurrent && <span className="stack-indicator">👈</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
