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
    title: '🌐 Routage Imbriqué & Gestion d\'Historique',
    intro: 'Comprenez comment s\'organise la navigation au sein d\'une architecture Microfrontend multi-routeurs : comment le Shell et les routeurs autonomes des Web Components peuvent coexister ou interférer sur la pile d\'historique partagée du navigateur.',
    details: [
      {
        title: 'Le Défi des Routeurs Concurrents',
        desc: 'Chaque Web Component autonome instancie son propre routeur (ex: createBrowserRouter de React Router). Sans coordination, le Shell hôte n\'a pas conscience des transitions internes du MFE, provoquant des ruptures d\'état de l\'URL globale.'
      },
      {
        title: 'Partage de la Pile d\'Historique (Shared Stack)',
        desc: 'L\'objet window.history et la barre d\'adresse du navigateur constituent une ressource globale unique et partagée. Des écritures concurrentes non coordonnées provoquent une corruption de la pile de navigation, piégeant l\'utilisateur.'
      }
    ],
    pros: [
      'Autonomie fonctionnelle et technologique absolue de chaque sous-système : Chaque équipe métier gère son plan de routage interne, ses règles de validation de transition et ses composants associés de manière 100% isolée. L\'ajout de sous-pages n\'impose aucun rechargement ni aucune mise à jour des configurations du Shell.',
      'Résilience et isolation contre les régressions de navigation : La modification ou la restructuration profonde du graphe de routage au sein d\'un MFE n\'a aucun impact sur l\'hôte ou sur les autres microfrontends, évitant les effets de cascade et les cycles de régression complexes lors des déploiements.',
      'Expérience Single Page Application (SPA) native et fluide : Les boutons système du navigateur (Suivant/Précédent) fonctionnent harmonieusement si les routeurs sont configurés correctement avec un basename synchronisé, préservant l\'expérience utilisateur naturelle.'
    ],
    cons: [
      'Risques critiques de corruption et de collisions sur l\'objet History partagé : L\'objet window.history et la barre d\'adresse constituent une ressource globale unique partagée. Si plusieurs instances de routeurs s\'octroient le droit d\'y écrire de manière asynchrone et concurrente sans coordination fine, la pile d\'historique globale se retrouve corrompue (tokens de navigation incohérents, blocages), dégradant l\'expérience utilisateur.',
      'Divergence immédiate de l\'état de navigation globale (Url Desynchronization) : En l\'absence de synchronisation active, les routeurs secondaires font évoluer leur état interne en silence. L\'URL affichée par la barre d\'adresse et l\'état visuel global géré par l\'hôte (tels que le fil d\'Ariane, les barres d\'onglets ou le menu de navigation principal) se désynchronisent complètement de la vue interne affichée par le microfrontend.',
      'Rupture inhérente du deep-linking et du rafraîchissement au chargement initial : Si l\'utilisateur rafraîchit la page (touche F5) ou tente de partager une URL pointant vers une route profonde d\'un microfrontend (ex: /app/microfe-bleu/q2), l\'application hôte ne sait pas comment résoudre ou acheminer la navigation initiale vers l\'état interne profond du Web Component sans configuration de délégation explicite.'
    ],
    codeShell: `
// 1. Configuration du routeur global du Shell
const shellRouter = createBrowserRouter([
  {
    path: "/app",
    element: <ShellLayout />,
    children: [
      { index: true, element: <HomeDashboard /> },
      // Route joker (wildcard) pour déléguer les sous-routes au Web Component
      { path: "microfe-bleu/*", element: <mfe-bleu></mfe-bleu> },
      { path: "microfe-jaune/*", element: <mfe-jaune></mfe-jaune> }
    ]
  }
]);

// 2. Rendu de la mise en page dans le Shell
const ShellLayout = () => {
  return (
    <div className="shell-layout">
      {/* Les Web Components sont montés dynamiquement ici selon la sous-route active */}
      <div className="mfe-container-wrapper">
        <Outlet />
      </div>
    </div>
  );
};
    `,
    codeMfe: `
// Déclaration d'un routeur isolé au sein du Web Component
const App = () => {
  const router = React.useMemo(() => createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "q1", element: <Question id={1} nextUrl="q2" /> },
        { path: "q2", element: <Question id={2} nextUrl="q3" /> },
        { path: "q3", element: <Question id={3} nextUrl={null} /> }
      ]
    }
  ], { 
    // Spécifier le basename correspondant exactement à la route parent allouée par le Shell !
    basename: "/app/microfe-bleu" 
  }), []);

  return <RouterProvider router={router} />;
};
    `
  },
  '/app/microfe-bleu': {
    title: '📘 MFE Bleu : Stratégie de l\'Isolation Complète',
    intro: 'Découvrez la stratégie d\'isolation absolue : le MFE gère sa navigation interne en toute autonomie en modifiant localement l\'adresse de l\'historique sans orchestrer aucune communication directe avec le Shell.',
    details: [
      {
        title: 'Navigation Silencieuse (Basename-driven)',
        desc: 'Le sous-routeur utilise pushState nativement sous un préfixe (basename) alloué par le Shell. L\'adresse URL change dans la barre d\'adresse, mais le routeur parent du Shell ignore ces modifications.'
      },
      {
        title: 'Confinement du Flux Métier',
        desc: 'Idéal pour des flux complexes et autonomes (ex: questionnaires multi-étapes) s\'exécutant entièrement au sein d\'un écran parent dédié du Shell.'
      }
    ],
    pros: [
      'Zéro couplage de routage et simplicité d\'intégration absolue : Nulle communication, événement système ou coordination directe n\'est requise entre le Shell et le MFE. Le composant est projeté dans l\'écran hôte et fonctionne de manière autonome sous son basename sans perturber les modules adjacents.',
      'Intégration immédiate d\'applications tierces ou existantes (Legacy wrappers) : Permet d\'encapsuler instantanément des sous-applications complexes pré-existantes ou des progiciels packagés qui disposent déjà de leur propre plan de routage complet, sans exiger de lourdes réécritures ou adaptations d\'architecture.',
      'Résilience globale de la navigation de l\'hôte : Le Shell est entièrement immunisé contre d\'éventuels dysfonctionnements, blocages ou erreurs fatales survenant au sein du système de routage interne du Web Component.'
    ],
    cons: [
      'Cécité totale du Shell vis-à-vis de l\'état de navigation interne : L\'application hôte est incapable de savoir précisément sur quelle sous-route se trouve l\'utilisateur. Cela empêche la conception de barres de navigation dynamiques, la sauvegarde globale de l\'état de session, ou l\'application de filtres de sécurité centralisés sur les sous-pages.',
      'Dysfonctionnement du deep-linking et du rafraîchissement natif (F5) : Si l\'utilisateur effectue un rechargement de page ou tente d\'accéder à une sous-route isolée par une URL partagée, l\'hôte ne sait pas comment résoudre le chemin. Le routeur du Shell renvoie une erreur ou réinitialise le Web Component à son point d\'entrée d\'origine, brisant l\'expérience utilisateur.'
    ],
    codeShell: `
// Le Shell déclare la route dans sa table et monte l'Outlet
// Aucune configuration d'écoute ou de synchronisation d'historique n'est faite
const shellRouter = createBrowserRouter([
  {
    path: "/app",
    element: <ShellLayout />,
    children: [
      { path: "microfe-bleu/*", element: <mfe-bleu></mfe-bleu> }
    ]
  }
]);

const ShellLayout = () => {
  return (
    <div className="shell-layout">
      <div className="mfe-container-wrapper">
        <Outlet /> {/* Le MFE Bleu est injecté ici */}
      </div>
    </div>
  );
};
    `,
    codeMfe: `
// Navigation autonome au sein du MFE Bleu
const Question = ({ id, nextUrl }) => {
  const navigate = useNavigate();

  return (
    <div className="question-card">
      <h3>Question {id}</h3>
      <div className="actions">
        {/* Navigation interne isolée via l'historique pushState */}
        <button onClick={() => navigate(-1)} className="btn-back">Retour</button>
        <button onClick={() => navigate(\`/\${nextUrl}\`)} className="btn-next">Suivant</button>
      </div>
    </div>
  );
};
    `
  },
  '/app/microfe-jaune': {
    title: '🟨 MFE Jaune : Stratégie de Transition Orchestrée',
    intro: 'Une approche équilibrée : le Web Component s\'occupe de sa navigation interne en isolation, mais délègue le changement de contexte ou la redirection finale au Shell via un événement personnalisé.',
    details: [
      {
        title: 'Délégation de Contrôle',
        desc: 'À l\'achèvement de son flux interne, le MFE n\'écrit pas de route globale de manière arbitraire. Il émet un événement "cross-mfe-navigate" transportant la route cible.'
      },
      {
        title: 'Médiation Souveraine du Shell',
        desc: 'Le Shell intercepte le signal et exploite son instance unique de navigation (navigate) pour effectuer la redirection inter-MFE, maintenant une cohérence parfaite.'
      }
    ],
    pros: [
      'Expérience utilisateur fluide et sans rechargement visuel : Les transitions inter-microfrontends sont nettes, synchrones et orchestrées de manière centralisée par le conteneur applicatif, évitant les clignotements ou les pertes de contexte brutales.',
      'Souveraineté et contrôle centralisé du Shell : Le Shell reste l\'unique responsable des redirections majeures, de la barre d\'adresse globale et de l\'historique principal. Cela garantit une traçabilité parfaite des transitions à l\'échelle de la plateforme.',
      'Couplage lâche et contrat d\'API de sortie robuste : La dépendance se limite à un événement personnalisé (ex: CustomEvent("cross-mfe-navigate")). Le microfrontend n\'a pas besoin de connaître la technologie sous-jacente du Shell pour demander sa redirection, ce qui facilite sa réutilisation.'
    ],
    cons: [
      'Dépendance envers l\'environnement d\'exécution de l\'hôte : Le Web Component nécessite la présence du Shell ou d\'un système d\'émulation (mock) pendant les phases de développement local ou de tests automatisés pour valider les étapes finales de redirection.'
    ],
    codeShell: `
// Écoute globale et interception de l'événement de fin de flux par le Shell
useEffect(() => {
  const handleCrossMfeNav = (e) => {
    // Utilisation de la méthode navigate du routeur global pour changer de route proprement
    navigate(e.detail.path); 
  };
  
  window.addEventListener('cross-mfe-navigate', handleCrossMfeNav);
  return () => window.removeEventListener('cross-mfe-navigate', handleCrossMfeNav);
}, [navigate]);
    `,
    codeMfe: `
// Émission du signal de redirection vers la route externe
const Question = ({ id, nextUrl }) => {
  const navigate = useNavigate();

  const handleNextMfe = () => {
    // À la fin du questionnaire interne, on n'essaye pas de poser une URL brute,
    // on émet un CustomEvent pour laisser le Shell gérer la transition
    window.dispatchEvent(new CustomEvent('cross-mfe-navigate', { 
      detail: { 
        path: '/app/microfe-rouge/q1' // Prochaine étape globale
      } 
    }));
  };

  return (
    <button onClick={handleNextMfe} className="btn-next">
      Terminer (Retour au Shell)
    </button>
  );
};
    `
  },
  '/app/microfe-rouge': {
    title: '🟥 MFE Rouge : Anti-pattern de Détournement d\'Historique',
    intro: 'Découvrez pourquoi l\'utilisation agressive et non coordonnée du hook `useBlocker` pour bloquer la navigation native (actions POP) constitue un anti-pattern dangereux dans les architectures distribuées.',
    details: [
      {
        title: 'Hijacking de la pile d\'historique (POP)',
        desc: 'Le MFE intercepte unilatéralement l\'action de retour arrière (POP) et injecte un état fictif dans l\'historique global pour forcer l\'annulation native.'
      },
      {
        title: 'Catastrophe UX & Corruption',
        desc: 'Cette pratique piège l\'utilisateur dans une boucle infinie de retour arrière inefficace et désynchronise immédiatement le routeur du Shell et les autres MFE de la page.'
      }
    ],
    pros: [
      'Préservation locale agressive contre la perte de saisie (Cas théorique uniquement) : Permet théoriquement d\'empêcher un utilisateur de fermer accidentellement un formulaire en cours de saisie complexe, mais au prix d\'une dégradation inacceptable de l\'architecture système globale.'
    ],
    cons: [
      'Détournement (Hijacking) destructeur de la pile globale d\'historique : L\'utilisation unilatérale de mécanismes de blocage (useBlocker) intercepte les événements de navigation natifs (POP). Pour forcer l\'annulation, le sous-routeur ré-injecte des états factices dans l\'historique global, corrompant définitivement l\'ordre chronologique et piégeant le navigateur.',
      'Expérience utilisateur catastrophique et captive : L\'utilisateur se retrouve bloqué au sein du microfrontend. Le clic sur le bouton "Précédent" du navigateur ne produit aucun effet visuel ou le ré-achemine en boucle sur la même page, provoquant une frustration extrême et une dégradation de l\'image de l\'application.',
      'Rupture fondamentale des principes de microservices frontends : En s\'octroyant un droit de veto unilatéral et exclusif sur les actions de navigation globales du navigateur, un unique microfrontend isolé brise l\'isolation architecturale et paralyse l\'ensemble de l\'application hôte et des autres MFE co-présents.'
    ],
    codeShell: `
// Le Shell subit passivement le détournement de l'historique initié par le MFE Rouge.
// Il n'y a aucun moyen simple pour le Shell d'annuler ou de contourner cette interception
// car le routeur interne du Web Component capture l'événement POP en amont.
const RedMfeWrapper = () => <mfe-rouge></mfe-rouge>;
    `,
    codeMfe: `
// Blocage unilatéral et agressif de l'action de retour arrière (POP)
const Question = () => {
  // Interception unilatérale des actions POP (bouton Précédent natif)
  const blocker = useBlocker(
    ({ historyAction }) => historyAction === "POP"
  );

  return (
    <div className="question-card">
      {blocker.state === "blocked" && (
        <div className="anti-pattern-warning">
          ⚠️ Action bloquée de force par le sous-routeur !
          <button onClick={() => blocker.proceed()}>Continuer (Proceed)</button>
          <button onClick={() => blocker.reset()}>Rester (Reset)</button>
        </div>
      )}
    </div>
  );
};
    `
  },
  '/app/microfe-violet': {
    title: '🟪 MFE Violet : Stratégie du Blocker Coordonné',
    intro: 'La bonne méthode pour sécuriser les données : le MFE gèle sa propre navigation locale à l\'aide de `useBlocker`, mais délègue la décision de déblocage finale au Shell via un mécanisme de coordination événementiel.',
    details: [
      {
        title: 'Mise en attente (Pending Transition)',
        desc: 'Le sous-routeur suspend le changement de page et se place dans un état "blocked", restant en attente d\'instructions externes.'
      },
      {
        title: 'Autorisation Événementielle',
        desc: 'Le Shell prend en charge l\'affichage de la modale de confirmation globale ou du bouton de libération, puis transmet le signal "unlock-violet-navigation". Le MFE appelle alors "blocker.proceed()".'
      }
    ],
    pros: [
      'Coordination parfaite et respect de la hiérarchie applicative : Le MFE détecte et suspend localement les transitions à risque (perte de saisie), mais délègue humblement la décision finale de déblocage au Shell via une orchestration d\'événements.',
      'Harmonisation visuelle et cohérence d\'interface (UI) absolue : La modale ou le dialogue de confirmation de sortie est affiché par l\'application hôte (Shell), garantissant que l\'aspect visuel, le design system (couleurs, boutons) et les textes de confirmation restent parfaitement uniformes à l\'échelle de toute la plateforme Web.',
      'Intégrité de la pile d\'historique préservée : Le déblocage final s\'effectue de manière propre et standardisée en invoquant blocker.proceed() à la réception du signal du Shell, évitant l\'injection d\'états corrompus dans la pile de navigation globale.'
    ],
    cons: [
      'Complexité technique d\'implémentation et de synchronisation élevée : Exige la mise en place d\'un protocole d\'échange précis et bidirectionnel (suspension locale, notification à l\'hôte, attente du signal d\'autorisation, libération du blocker).',
      'Risque d\'accroissement du boilerplate et fuite de listeners : Le Web Component doit écouter un signal global sur window de manière synchrone, imposant d\'implémenter un nettoyage rigoureux (removeEventListener) au démontage pour prévenir les fuites de mémoire.'
    ],
    codeShell: `
// Coordination : Le Shell détient la clé de déblocage de la navigation
const handleUnlockClick = () => {
  // Émission d'un événement global pour autoriser le MFE à finaliser sa navigation
  window.dispatchEvent(
    new CustomEvent('unlock-violet-navigation')
  );
};

return (
  <button onClick={handleUnlockClick} className="btn-unlock">
    Débloquer la navigation Violette (Shell)
  </button>
);
    `,
    codeMfe: `
// Blocage coordonné : Le MFE s'enregistre et attend le feu vert du Shell
const Question = () => {
  // Gèle les transitions PUSH, POP et REPLACE
  const blocker = useBlocker(
    ({ historyAction }) => historyAction === "POP" || historyAction === "PUSH" || historyAction === "REPLACE"
  );
  
  useEffect(() => {
    const handleUnlock = () => {
      if (blocker.state === "blocked") {
        // Validation : Le Shell nous autorise à libérer le routeur interne
        blocker.proceed();
      }
    };

    window.addEventListener('unlock-violet-navigation', handleUnlock);
    return () => window.removeEventListener('unlock-violet-navigation', handleUnlock);
  }, [blocker]);
};
    `
  }
};

export default function LearningGuide({ currentPath }) {
  const [activeTab, setActiveTab] = useState('shell'); // 'shell' or 'mfe'
  const [copied, setCopied] = useState(false);

  // Match nested sub-routes correctly (e.g., '/app/microfe-bleu/q1' matches '/app/microfe-bleu')
  let matchedPath = '/app';
  if (currentPath.startsWith('/app/microfe-bleu')) matchedPath = '/app/microfe-bleu';
  else if (currentPath.startsWith('/app/microfe-jaune')) matchedPath = '/app/microfe-jaune';
  else if (currentPath.startsWith('/app/microfe-rouge')) matchedPath = '/app/microfe-rouge';
  else if (currentPath.startsWith('/app/microfe-violet')) matchedPath = '/app/microfe-violet';

  const guide = guideData[matchedPath] || guideData['/app'];

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
