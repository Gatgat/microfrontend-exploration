import React, { useState } from 'react';

// Custom, robust lexical tokenizer for syntax highlighting
export function SyntaxHighlighter({ code, language = 'javascript' }) {
  const highlightJS = (txt) => {
    if (!txt) return '';
    
    // Lexical regex matching comments, strings, words, symbols, and whitespaces
    const regex = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(["'`](?:\\.|[^\\])*?["'`])|([a-zA-Z0-9_$]+)|([^\sa-zA-Z0-9_$]+)|(\s+)/gm;
    
    let html = '';
    let m;
    while ((m = regex.exec(txt)) !== null) {
      const [lexeme, comment, string, word, symbol, whitespace] = m;
      
      const escape = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      if (comment) {
        html += `<span class="token comment">${escape(lexeme)}</span>`;
      } else if (string) {
        html += `<span class="token string">${escape(lexeme)}</span>`;
      } else if (word) {
        const keywords = /^(const|let|var|function|return|class|new|export|default|import|from|if|else|for|while|extends|super)$/;
        const builtins = /^(window|document|CustomEvent|MessageChannel|HTMLElement|customElements|console|React|useState|useEffect|useRef|useMemo|useNavigate|createBrowserRouter|RouterProvider|useBlocker)$/;
        
        if (keywords.test(word)) {
          html += `<span class="token keyword">${word}</span>`;
        } else if (builtins.test(word)) {
          html += `<span class="token builtin">${word}</span>`;
        } else {
          html += word;
        }
      } else if (symbol) {
        html += escape(symbol);
      } else if (whitespace) {
        html += whitespace;
      }
    }
    
    return html;
  };

  return (
    <pre className="syntax-highlight">
      <code dangerouslySetInnerHTML={{ __html: highlightJS(code.trim()) }} />
    </pre>
  );
}

const guideData = {
  '/app': {
    title: '🔬 Architecture Microfrontend & Web Components',
    intro: 'Comprenez comment découper une application monolithique en briques applicatives autonomes et isolées grâce aux standards des Web Components (Custom Elements, Shadow DOM), tout en orchestrant leur cycle de vie et leurs canaux d\'intégration.',
    details: [
      {
        title: 'Shadow DOM & Isolation Hermétique',
        desc: 'Chaque Microfrontend (MFE) est encapsulé dans son propre Shadow DOM en mode "open". Cette frontière virtuelle garantit que le CSS global de l\'hôte ou des autres MFE ne pénètre pas dans le composant, et que les styles internes du MFE ne polluent pas le document global (Light DOM).'
      },
      {
        title: 'Interopérabilité & Cycle de Vie W3C',
        desc: 'L\'encapsulation sous forme de Custom Element standardise l\'intégration : les frameworks hôtes (ex. React) interagissent avec le MFE comme s\'il s\'agissait d\'une simple balise HTML native (ex: <mfe-red>). Le cycle de vie est orchestré par les hooks natifs comme connectedCallback et disconnectedCallback.'
      }
    ],
    pros: [
      'Isolation stylistique et DOM stricte : Grâce au Shadow DOM (mode "open"), l\'arbre de rendu est protégé par un Shadow Root hermétique. Les sélecteurs CSS globaux (y compris les frameworks utilitaires comme Tailwind ou Bootstrap appliqués sur le document parent) ne franchissent pas la frontière (Shadow Boundary). Les styles déclarés dans l\'arbre du Web Component sont également séquestrés localement, empêchant toute régression visuelle ou collision de spécificité (CSS specificity leakage) dans l\'application hôte.',
      'Indépendance technologique et agnosticisme total du framework : Les microfrontends exposent une interface uniforme au travers du standard W3C des Custom Elements. Pour l\'hôte, le MFE est manipulé comme un simple élément HTML natif (balise XML standardisée), permettant aux équipes d\'utiliser la stack technique optimale (React 19, Vue 3, Svelte 5, Vanilla JS) sans créer de dépendance circulaire ou de couplage fort avec le Shell.',
      'Cycle de vie standardisé par la plateforme Web (W3C) : L\'orchestration de l\'initialisation, du montage et du démontage s\'appuie sur les callbacks natifs de la spécification HTML (connectedCallback et disconnectedCallback). Cela permet au wrapper de libérer proprement les ressources sous-jacentes (ex: destruction de l\'instance React via root.unmount(), désabonnements de sockets ou d\'observateurs) afin de garantir une étanchéité mémoire absolue.'
    ],
    cons: [
      'Coût de sérialisation et goulot d\'étranglement CPU : Le standard HTML contraint le passage de données par attributs aux seules chaînes de caractères. Pour transmettre des états complexes ou imbriqués, l\'utilisation de JSON.stringify et JSON.parse induit un coût de calcul important en sérialisation/désérialisation sur le thread principal (UI thread), dégradant les performances à haute fréquence ou sur de larges jeux de données.',
      'Transversalité complexe et duplication des assets : L\'hermétisme du Shadow DOM empêche la cascade naturelle des feuilles de styles et l\'accès direct aux polices Web importées globalement (Web Fonts). De plus, l\'isolation empêche la mutualisation immédiate des librairies communes (React, standard components libraries), forçant des configurations complexes de partage via des import maps ou des bundlers configurés en Module Federation, ou à défaut, augmentant le poids des bundles par duplication.',
      'Asynchronisme asymétrique et surcoût de boilerplate : Les cycles de rendu déclaratifs et asynchrones des frameworks (comme le virtual DOM réactif de React ou les planificateurs de micro-tâches de Vue) doivent être synchronisés avec le cycle impératif et synchrone du DOM natif. Cela nécessite la création et la maintenance de wrappers complexes pour gérer le montage (createRoot), la mise à jour des propriétés et le nettoyage.'
    ],
    codeShell: `
// 1. Déclarer et importer les Web Components personnalisés
import './MfeRed';
import './MfeBlue';
import './MfeYellow';
import './MfeViolet';

// 2. Définir les routes et monter les composants au sein du Shell
const shellRouter = createBrowserRouter([
  {
    path: "/app",
    element: <ShellLayout />,
    children: [
      { index: true, element: <HomeDashboard /> },
      { path: "microfe-rouge", element: <RedMfeWrapper /> }, // Rendu de <mfe-red></mfe-red>
      { path: "microfe-bleu", element: <BlueMfeWrapper /> }   // Rendu de <mfe-bleu></mfe-bleu>
    ]
  }
]);
    `,
    codeMfe: `
import React from 'react';
import { createRoot } from 'react-dom/client';

class MfeRedElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      // 1. Isolation : Attacher le Shadow DOM en mode 'open'
      const mountPoint = document.createElement('div');
      mountPoint.style.height = '100%';
      this.attachShadow({ mode: 'open' }).appendChild(mountPoint);
      
      // 2. Encapsulation : Injecter les styles isolés
      const style = document.createElement('style');
      style.textContent = \`.mfe-content { padding: 2rem; color: white; }\`;
      this.shadowRoot.appendChild(style);

      // 3. Montage de l'application React interne
      this.root = createRoot(mountPoint);
    }
    
    if (this.root) {
      this.root.render(<App />);
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount(); // Nettoyage propre de l'arbre React à la destruction du DOM
    }
  }
}

if (!customElements.get('mfe-red')) {
  customElements.define('mfe-red', MfeRedElement);
}
    `
  },
  '/app/microfe-rouge': {
    title: '🔴 Diffusion Globale (Window-Level Events)',
    intro: 'Une approche de communication simpliste consistant à émettre des événements personnalisés directement sur le contexte global `window`. Si son implémentation est immédiate, elle expose l\'application à des failles de sécurité et à des collisions de noms.',
    details: [
      {
        title: 'Couplage Spatial Nul',
        desc: 'L\'émetteur (MFE Rouge) et le récepteur (Shell) n\'ont pas besoin d\'avoir de relation parent-enfant dans l\'arbre DOM. La communication s\'affranchit des barrières du DOM en utilisant l\'objet global window comme bus d\'événements central.'
      },
      {
        title: 'Vulnérabilité & Espace de Nommage',
        desc: 'Étant donné que l\'objet window est partagé par l\'ensemble de l\'arborescence d\'exécution, n\'importe quel script exécuté sur la page (y compris les extensions de navigateur ou scripts publicitaires tiers) a un accès en lecture/écriture complet sur ces signaux.'
      }
    ],
    pros: [
      'Simplicité technique et légèreté absolue de mise en œuvre : L\'implémentation repose à 100% sur des API natives du navigateur (window.dispatchEvent et CustomEvent), évitant toute intégration de bibliothèque tierce ou de surcoût d\'architecture. La courbe d\'apprentissage est quasi nulle.',
      'Découplage topologique complet dans l\'arbre DOM : Nulle obligation d\'aligner l\'émetteur et le récepteur dans une structure parent-enfant ou d\'établir des connexions physiques dans l\'arbre HTML. La communication s\'affranchit des barrières du DOM, permettant à deux composants situés dans des branches totalement distinctes de s\'échanger des messages.',
      'Efficacité éprouvée pour la diffusion d\'événements système non sensibles : Idéal pour distribuer des signaux de bas niveau à large spectre et sans valeur critique, comme la télémétrie, des événements d\'interruption réseau (offline/online), ou l\'apparition de toasts visuels temporaires non sécurisés.'
    ],
    cons: [
      'Absence totale d\'isolation et vulnérabilités de sécurité critiques (XSS) : L\'objet window est partagé par l\'ensemble des scripts exécutés au sein du document. N\'importe quel script publicitaire tiers, extension de navigateur suspecte ou vulnérabilité XSS exploitée permet la capture d\'informations sensibles (interception de payloads ou injection d\'événements frauduleux).',
      'Pollution de l\'espace de nommage global et collisions d\'événements : L\'utilisation d\'une chaîne de caractères globale comme identifiant d\'événement (ex: \'global-system-alert\') expose l\'application à des conflits d\'écrasement ou d\'interférences de signaux au sein de projets multi-équipes massifs où le partage de l\'espace de nommage n\'est pas rigoureusement gouverné.',
      'Risques majeurs de fuites de mémoire (Memory Leaks) : Les écouteurs d\'événements attachés à window ne sont pas nettoyés automatiquement lors de la destruction ou du démontage des composants du DOM. Si window.removeEventListener n\'est pas invoqué de manière systématique au démontage du composant, la référence au callback et à son contexte lexical (closure) persiste indéfiniment en mémoire, bloquant le garbage collector.'
    ],
    codeShell: `
// Écoute de l'événement global sur window au sein du Shell
useEffect(() => {
  const handleGlobalAlert = (e) => {
    // e.detail contient le message, la sévérité et l'horodatage
    addLog('global', "Événement 'global-system-alert' capturé sur window", e.detail);
    
    // Déclenchement d'un indicateur de toast visuel temporaire
    setToast({
      message: e.detail.message,
      severity: e.detail.severity,
      time: e.detail.timestamp
    });
  };

  window.addEventListener('global-system-alert', handleGlobalAlert);
  return () => window.removeEventListener('global-system-alert', handleGlobalAlert);
}, []);
    `,
    codeMfe: `
// Émission de l'événement système global depuis le MFE Rouge
const handleBroadcast = (e) => {
  e.preventDefault();
  if (!message.trim()) return;

  const eventDetail = {
    message: message,
    severity: severity,
    timestamp: new Date().toLocaleTimeString(),
    source: 'MFE_ROUGE_GLOBAL'
  };

  // Dispatch de l'événement personnalisé global sur window
  const event = new CustomEvent('global-system-alert', { 
    detail: eventDetail
  });
  
  window.dispatchEvent(event);
  setMessage('');
};
    `
  },
  '/app/microfe-bleu': {
    title: '📘 Shadow DOM Bubbling (Composed DOM Events)',
    intro: 'Traversez la frontière hermétique du Shadow DOM en exploitant la propagation d\'événements DOM standard configurés avec les indicateurs `bubbles` et `composed`. Cette méthode respecte l\'arbre DOM sans polluer window.',
    details: [
      {
        title: 'Le drapeau composed: true',
        desc: 'Par défaut, les événements DOM s\'arrêtent à la frontière virtuelle du Shadow DOM. L\'indicateur "composed: true" force l\'événement à traverser cette barrière pour poursuivre son bouillonnement dans le Light DOM.'
      },
      {
        title: 'Le drapeau bubbles: true',
        desc: 'Indispensable pour permettre à l\'événement de remonter l\'arbre de descendance DOM, de nœud en nœud parent, jusqu\'au document global, permettant une écoute centralisée.'
      }
    ],
    pros: [
      'Respect rigoureux du flux sémantique du DOM : La transmission utilise le mécanisme de bouillonnement (bubbling) natif de la plateforme Web, alignant la communication inter-MFE avec la façon dont le navigateur traite les interactions utilisateur standards (clics, inputs).',
      'Zéro pollution de l\'objet global window : Les signaux restent confinés au périmètre de l\'arbre du document DOM. Les risques de collisions d\'espace de nommage hors de portée sont drastiquement réduits en comparaison avec un bus d\'événements monté sur le global scope.',
      'Écoute localisée et ciblée dans l\'arbre parent : Le Shell ou un conteneur intermédiaire n\'est pas contraint d\'écouter au niveau global. Il peut attacher son listener directement sur la balise parente du microfrontend (<mfe-bleu>), limitant la propagation spatiale des événements à la seule sous-arborescence requise.'
    ],
    cons: [
      'Exposition publique le long de l\'arbre ancestral : Bien que l\'événement ne soit pas propagé directement sur window, il escalade chaque nœud du DOM parent jusqu\'au document global. Tout composant parent ou script tiers écoutant un nœud parent intermédiaire peut lire et manipuler le payload en clair.',
      'Complexité du mécanisme de retargeting natif (Event Retargeting) : Pour préserver l\'encapsulation du Shadow DOM, le navigateur réécrit dynamiquement la propriété event.target (le nœud émetteur d\'origine) pour la remplacer par le Shadow Host (le Custom Element lui-même) dès que l\'événement franchit la frontière du Shadow Root. Déterminer précisément quel élément interne profond a initié le signal requiert d\'analyser la méthode event.composedPath().',
      'Sensibilité extrême aux indicateurs de propagation : L\'acheminement à travers la frontière hermétique repose entièrement sur la configuration conjointe et stricte de bubbles: true et composed: true. L\'oubli de l\'un de ces deux drapeaux intercepte et étouffe l\'événement de manière totalement silencieuse à la frontière interne du Shadow DOM, rendant le débogage complexe.'
    ],
    codeShell: `
// Écoute de l'événement qui a bullé à travers le Shadow DOM
useEffect(() => {
  const handleBlueClick = (e) => {
    addLog('bubble', "Événement 'mfe-blue-click' capturé au niveau document (Composed bubble)", e.detail);
  };

  document.addEventListener('mfe-blue-click', handleBlueClick);
  return () => document.removeEventListener('mfe-blue-click', handleBlueClick);
}, []);
    `,
    codeMfe: `
// Déclenchement au cœur du Shadow DOM sur un élément profond
const handleEmit = () => {
  const nextCount = clickCount + 1;
  setClickCount(nextCount);

  if (innerButtonRef.current) {
    const event = new CustomEvent('mfe-blue-click', {
      bubbles: true,   // Autorise la remontée de l'arbre DOM
      composed: true,  // Force le franchissement de la frontière Shadow DOM -> Light DOM
      detail: { 
        count: nextCount,
        bubbles: true,
        composed: true,
        timestamp: new Date().toLocaleTimeString(),
        message: 'Événement généré au cœur du Shadow DOM'
      }
    });
    
    innerButtonRef.current.dispatchEvent(event);
  }
};
    `
  },
  '/app/microfe-jaune': {
    title: '🟨 MessageChannel & Canal Privé Sécurisé',
    intro: 'Établissez une ligne de communication directe, asynchrone et exclusive de type point-à-point entre le Shell et le MFE grâce à l\'API standard `MessageChannel`. Aucune donnée ne transite par le DOM ou window.',
    details: [
      {
        title: 'Communication Point-à-Point',
        desc: 'Un MessageChannel instancie deux ports connectés (port1 et port2). Le Shell conserve port1 pour écouter et envoyer, et transfère le port2 au Web Component via une propriété JS directe.'
      },
      {
        title: 'Sécurité Maximale',
        desc: 'Le canal contourne entièrement le bus d\'événements du DOM et l\'objet global window. Les données sont échangées directement au niveau de la boucle d\'événements JS, rendant les interceptions impossibles.'
      }
    ],
    pros: [
      'Sécurité et confidentialité absolues par isolation de canal (Air-gapped) : L\'API MessageChannel établit un tuyau asynchrone bidirectionnel direct (point à point) scellé entre deux entités. Les messages contournent intégralement l\'arbre DOM et l\'objet global window. Aucun script externe, extension de navigateur ou listener tiers ne peut écouter, intercepter ou injecter des données sur ce canal, garantissant une protection maximale pour les flux sensibles.',
      'Communication bidirectionnelle asynchrone native : Une fois le MessagePort partagé, les deux microfrontends peuvent dialoguer dans les deux sens de manière totalement autonome en s\'envoyant des messages structurés sans passer par la lourdeur du bus d\'événements du Shell.',
      'Performances optimales de la boucle d\'événements (Task Queue) : La transmission s\'exécute directement via la file d\'attente de messages (task queue) de la boucle d\'événements du navigateur. Elle court-circuite tout le mécanisme lourd de création, de propagation (capture, target, bubble) et de retargeting des événements du DOM, offrant une latence de communication minimale.'
    ],
    cons: [
      'Complexité de câblage au démarrage et couplage physique : Le Shell doit impérativement obtenir une référence DOM physique (React ref) du Custom Element pour injecter le MessagePort (ex. port2) via une mutation de propriété JavaScript. Cela impose un couplage temporel fort, le port ne pouvant être transmis qu\'après le montage effectif du nœud dans le DOM.',
      'Gestion drastique du cycle de vie sous peine de fuites système : Les instances de MessagePort allouent des ressources système bas niveau dans le navigateur. Il est impératif de nettoyer explicitement les liaisons via .close() sur les deux ports lors du démontage de l\'une ou l\'autre des applications, sous peine de bloquer la libération de la mémoire et d\'induire des fuites.',
      'Rigidité du protocole d\'échange et absence de sémantique DOM : L\'absence de structure sémantique native impose de concevoir et documenter un contrat ou schéma strict de messages (ex. interfaces TypeScript ou schémas JSON) partagé entre les équipes du Shell et du MFE pour éviter les désynchronisations de format lors des évolutions.'
    ],
    codeShell: `
// Initialisation du MessageChannel privé et transfert du port2 au MFE
useEffect(() => {
  const yellowElement = yellowRef.current;
  if (!yellowElement) return;

  // 1. Instanciation du canal bidirectionnel sécurisé
  const channel = new MessageChannel();
  
  // 2. Transfert du port2 directement sur la propriété JS du Web Component
  yellowElement.messagePort = channel.port2;
  addLog('port', 'MessageChannel initialisé - Canal sécurisé établi avec MFE Jaune');

  // 3. Écoute sur port1 (côté Shell)
  const handlePortMessage = (event) => {
    addLog('port', 'Message chiffré reçu de MFE Jaune sur le canal privé', event.data);
    
    // Réponse automatique bidirectionnelle directe sur le port1
    setTimeout(() => {
      channel.port1.postMessage({
        text: \`[Shell] Signal sécurisé reçu 5/5. Payload enregistré à \${new Date().toLocaleTimeString()}\`,
        timestamp: new Date().toLocaleTimeString()
      });
    }, 800);
  };

  channel.port1.onmessage = handlePortMessage;

  return () => {
    // Nettoyage impératif des ports à la destruction
    channel.port1.close();
    channel.port2.close();
  };
}, [location.pathname]);
    `,
    codeMfe: `
// 1. Réception et stockage du MessagePort dans le Web Component
class MfeYellowElement extends HTMLElement {
  set messagePort(port) {
    this._port = port;
    this.reactProps.port = port; // Transfert aux props React internes
    this.renderReact();
  }
}

// 2. Écoute et émission asynchrone au sein de l'application React du MFE
const App = ({ port, onSendText }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!port) return;

    const handleMessage = (event) => {
      // Réception et stockage des messages du Shell
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'received',
        text: event.data.text,
        time: new Date().toLocaleTimeString()
      }]);
    };

    // Enregistrement de l'écouteur d'événements et activation du port
    port.addEventListener('message', handleMessage);
    port.start();

    return () => {
      port.removeEventListener('message', handleMessage);
    };
  }, [port]);

  const handleSend = (inputText) => {
    if (port) {
      // Émission sécurisée point-à-point vers le Shell
      port.postMessage({
        type: 'from-mfe-yellow',
        text: inputText,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };
};
    `
  },
  '/app/microfe-violet': {
    title: '🟪 Attributs Réactifs & Custom Events Hôtes',
    intro: 'La stratégie de référence préconisée par le standard W3C. Elle implémente le paradigme fondamental des composants du Web : les flux de données entrants transitent par des attributs HTML réactifs, et les flux sortants sont portés par des événements émis sur le nœud hôte.',
    details: [
      {
        title: 'Props In (Attributs Réactifs)',
        desc: 'Le Shell modifie les attributs standard de la balise HTML. Le Web Component observe ces changements via "attributeChangedCallback" pour recalculer de manière réactive son état interne.'
      },
      {
        title: 'Events Out (Événements sur Hôte)',
        desc: 'Le MFE n\'essaye pas de faire buller ses événements vers le document global ou window. Il les émet directement sur son propre nœud conteneur (this), que le Shell écoute de manière ciblée.'
      }
    ],
    pros: [
      'Standardisation complète W3C : S\'aligne à 100% sur le modèle architectural natif des éléments HTML standards de la plateforme Web. Garantit la durabilité de la solution indépendamment des évolutions des frameworks commerciaux.',
      'Interopérabilité et portabilité optimales : S\'intègre de manière transparente avec tous les frameworks Web modernes. Par exemple, React 19 prend désormais en charge nativement les Custom Elements en mappant directement les propriétés JavaScript et les listeners d\'événements (ex: onProgressChange), éliminant les anciennes couches de wrappers.',
      'Contrat d\'API formel, propre et auto-documenté : La déclaration statique observedAttributes et les signatures d\'événements émis sur le nœud hôte établissent une frontière d\'API propre, lisible et facile à documenter pour les équipes transversales.'
    ],
    cons: [
      'Limitation inhérente du passage d\'objets par attributs DOM : Les attributs HTML natifs ne supportent intrinsèquement que les chaînes de caractères. Le passage de structures de données complexes (tableaux d\'objets, configurations imbriquées) impose une sérialisation JSON coûteuse ou oblige à court-circuiter le flux via des propriétés JS directes.',
      'Verbosité du boilerplate de réactivité natif : La mise en œuvre réclame l\'écriture de observedAttributes et la gestion impérative de attributeChangedCallback au sein de la classe HTMLElement pour synchroniser le cycle réactif interne de l\'application encapsulée (ex: forcer un re-rendu React).'
    ],
    codeShell: `
// 1. Passage d'attributs réactifs & Écoute directe sur le nœud hôte
useEffect(() => {
  const violetElement = violetRef.current;
  if (!violetElement) return;

  const handleProgressChange = (e) => {
    // Capture de l'événement émis directement par le nœud hôte
    setVioletProgress(e.detail.value);
    addLog('reactive', "Événement 'progress-change' intercepté sur le nœud hôte <mfe-violet>", e.detail);
  };

  violetElement.addEventListener('progress-change', handleProgressChange);
  return () => {
    violetElement.removeEventListener('progress-change', handleProgressChange);
  };
}, [location.pathname]);

// 2. Rendu déclaratif du Web Component avec passage réactif d'attributs (React 19)
return (
  <mfe-violet 
    ref={violetRef} 
    progress={violetProgress} 
    theme={violetTheme}
  />
);
    `,
    codeMfe: `
// 1. Déclarer les attributs surveillés et intercepter les changements
class MfeVioletElement extends HTMLElement {
  static get observedAttributes() {
    return ['progress', 'theme'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    // Mise à jour de l'état interne réactif transmis à l'arbre React
    if (name === 'progress') {
      this.reactProps.progress = parseInt(newValue, 10) || 0;
    } else if (name === 'theme') {
      this.reactProps.theme = newValue || 'light';
    }

    this.renderReact(); // Déclenche le re-rendu de l'application React
  }

  constructor() {
    super();
    this.reactProps = {
      progress: 50,
      theme: 'light',
      onProgressChange: (val) => {
        // 2. Émission d'un CustomEvent directement sur le nœud hôte (this)
        this.dispatchEvent(new CustomEvent('progress-change', {
          bubbles: false,  // Inutile de faire buller, le Shell écoute directement sur le nœud conteneur
          composed: false, // L'événement reste confiné à la frontière du nœud hôte
          detail: { value: val, timestamp: new Date().toLocaleTimeString() }
        }));
      }
    };
  }
}
    `
  },
  '/app/coexistence': {
    title: '🔀 Coexistence & Médiation de Communication',
    intro: 'Découvrez comment orchestrer le dialogue entre deux instances de Web Components cohabitant sur le même écran : soit en établissant un canal de communication direct P2P (MessageChannel), soit en déléguant le contrôle au Shell agissant comme un Médiateur centralisé.',
    details: [
      {
        title: 'Mode Matchmaker (P2P messagePort)',
        desc: 'Le Shell instancie un MessageChannel unique, extrait port1 et port2, puis les transmet respectivement à chaque instance. Les deux MFE discutent en direct avec une latence nulle, sans aucune interférence du Shell.'
      },
      {
        title: 'Mode Médiateur (DOM Event Routing)',
        desc: 'Chaque MFE émet un CustomEvent composed vers l\'hôte. Le Shell intercepte l\'événement, analyse le destinataire et appelle une méthode publique (API) directement sur le Web Component cible.'
      }
    ],
    pros: [
      'Modularité et flexibilité architecturale : Offre la flexibilité totale d\'alterner entre une architecture P2P hautement autonome et une architecture médiée selon le degré de couplage souhaité et les contraintes de sécurité métiers.',
      'Souveraineté et traçabilité du mode Médiateur : Le Shell fait office d\'unique routeur et de pare-feu applicatif. Il centralise, valide les schémas de données échangés et logue l\'intégralité de la télémétrie des flux, assurant un débogage centralisé optimal.',
      'Haute performance et faible latence du mode P2P : En distribuant directement les ports MessageChannel, les deux microfrontends s\'échangent des messages à haute fréquence avec une latence réseau-locale nulle, évitant de surcharger le thread principal (UI thread) avec des cascades de proxies d\'événements DOM.'
    ],
    cons: [
      'Opacité totale du P2P pour le Shell : En mode Matchmaker, le Shell perd complètement le contrôle et la visibilité des données échangées, rendant impossible la journalisation de sécurité centralisée ou l\'application de politiques de validation globales.',
      'Désynchronisation et Race Conditions liées au cycle de vie : Si l\'une des deux instances de MFE coexistant est démontée puis remontée (navigation interne, changement d\'onglet), le canal MessageChannel établi est brisé. La gestion asynchrone de la ré-initialisation croisée des ports est un exercice hautement sujet aux Race Conditions.'
    ],
    codeShell: `
// Coexistence : Initialisation de la stratégie par le Wrapper du Shell
useEffect(() => {
  const elA = peerARef.current;
  const elB = peerBRef.current;
  if (!elA || !elB) return;

  if (strategy === 'p2p') {
    // Mode P2P : Création d'un canal direct et distribution croisée des ports
    const channel = new MessageChannel();
    elA.peerPort = channel.port1;
    elB.peerPort = channel.port2;
    addLog('peer-p2p', 'MessageChannel P2P créé - Ports transférés aux instances');
  } else if (strategy === 'mediator') {
    // Mode Médiateur : Le Shell écoute les requêtes de médiation DOM
    const handleMediatedDispatch = (e) => {
      const { text, sender } = e.detail;
      const targetElement = sender === 'A' ? elB : elA;
      
      // Transmission ciblée vers la méthode publique exposée par le Web Component cible
      if (targetElement && typeof targetElement.receiveMediatedMessage === 'function') {
        setTimeout(() => {
          targetElement.receiveMediatedMessage(text);
        }, 300);
      }
    };
    elA.addEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);
    elB.addEventListener('mfe-peer-mediated-dispatch', handleMediatedDispatch);
  }
}, [strategy]);
    `,
    codeMfe: `
// Implémentation hybride (P2P / Médiateur) côté Web Component
class MfeCoexistElement extends HTMLElement {
  // 1. Propriété pour la communication directe (P2P)
  set peerPort(port) {
    this._port = port;
    this._port.onmessage = (e) => {
      // Réception directe sans interférence du Shell !
      this.receiveMediatedMessage(e.data.text);
    };
    this._port.start();
  }

  // 2. API Publique exposée sur le DOM pour la communication médiée
  receiveMediatedMessage(text) {
    // Méthode appelée directement par le Shell en mode Médiateur
    // ou par l'écouteur MessagePort en mode P2P
    this.setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'received',
      text: text,
      time: new Date().toLocaleTimeString()
    }]);
  }

  sendMessage(text) {
    if (this._mode === 'p2p' && this._port) {
      this._port.postMessage({ text }); // Envoi direct P2P
    } else if (this._mode === 'mediator') {
      // Émission d'un CustomEvent qui bulle vers le Shell pour médiation
      this.dispatchEvent(new CustomEvent('mfe-peer-mediated-dispatch', {
        bubbles: true,
        composed: true,
        detail: { text, sender: this._role }
      }));
    }
  }
}
    `
  }
};

export default function LearningGuide({ currentPath }) {
  const [activeTab, setActiveTab] = useState('shell'); // 'shell' or 'mfe'
  const [copied, setCopied] = useState(false);

  const guide = guideData[currentPath] || guideData['/app'];

  const codeToCopy = activeTab === 'shell' ? guide.codeShell : guide.codeMfe;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToCopy.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="guide-container">
      <div className="guide-scrollable">
        <h3 className="guide-title">{guide.title}</h3>
        <p className="guide-intro">{guide.intro}</p>

        <div className="guide-section">
          <h4>💡 Concepts Clés</h4>
          <div className="guide-cards">
            {guide.details.map((detail, idx) => (
              <div key={idx} className="guide-card">
                <h5>{detail.title}</h5>
                <p>{detail.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="guide-comparison">
          <div className="comparison-column pros">
            <h5>✅ Avantages</h5>
            <ul>
              {guide.pros.map((pro, idx) => <li key={idx}>{pro}</li>)}
            </ul>
          </div>
          <div className="comparison-column cons">
            <h5>⚠️ Inconvénients</h5>
            <ul>
              {guide.cons.map((con, idx) => <li key={idx}>{con}</li>)}
            </ul>
          </div>
        </div>

        <div className="guide-code-section">
          <div className="code-header">
            <h4>💻 Code Associé</h4>
            <div className="code-tabs">
              <button 
                className={`code-tab ${activeTab === 'shell' ? 'active' : ''}`}
                onClick={() => setActiveTab('shell')}
              >
                Hôte (Shell)
              </button>
              <button 
                className={`code-tab ${activeTab === 'mfe' ? 'active' : ''}`}
                onClick={() => setActiveTab('mfe')}
              >
                Microfrontend
              </button>
            </div>
            <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? 'Copié ! ✅' : 'Copier 📋'}
            </button>
          </div>
          
          <div className="code-viewport">
            <SyntaxHighlighter code={codeToCopy} />
          </div>
        </div>
      </div>
    </div>
  );
}
