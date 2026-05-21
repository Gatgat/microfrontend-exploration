# 🧪 Laboratoire Microfrontend & Communication par Custom Events

Ce projet est un Proof of Concept (POC) éducatif conçu pour explorer, comparer et démontrer différentes stratégies de communication au sein d'une architecture **Microfrontend (MFE)**. 

L'application est construite avec **React 19** et **Vite**, et s'articule autour d'une intégration robuste utilisant les **Web Components (Shadow DOM)**.

---

## 🏗️ Architecture Technique

L'architecture repose sur une application hôte principale (le **Shell**) et quatre Microfrontends distincts encapsulés sous forme de Web Components indépendants. Chaque MFE dispose de son propre cycle de vie React (`createRoot`), de ses propres styles isolés et démontre un mode d'intégration d'événements unique.

### 1. Le Shell (Application Hôte)
- **Rôle :** Orchestrer l'affichage, gérer le routage global et observer la télémétrie des communications.
- **Télémétrie intégrée :**
  - **Inspecteur d'Événements (`EventInspector`)** : Journalise en temps réel les Custom Events capturés (source, type, payload JSON).
  - **Visualisateur de Flux SVG** : Un schéma réactif et animé s'illumine dynamiquement en temps réel pour montrer le trajet physique emprunté par l'événement (vague globale, bulle franchissant le Shadow DOM, canal de port isolé, ou boucle réactive).

### 2. MFE Rouge (`<mfe-red>`) : Approche Globale (`window`)
- **Mécanique :** Les événements d'alerte sont diffusés directement sur le contexte global `window` via `window.dispatchEvent(...)`.
- **Analyse :** Très simple à implémenter mais souffre d'un manque critique d'isolation. N'importe quel script sur la page (autre MFE, extension, tracker publicitaire) peut écouter et intercepter ces données.

### 3. MFE Bleu (`<mfe-bleu>`) : Shadow DOM Bubbling
- **Mécanique :** L'événement est émis depuis un bouton au cœur du Shadow DOM. Pour qu'il s'en échappe, il doit être configuré avec `{ bubbles: true, composed: true }`.
- **Analyse :** C'est la méthode de propagation standard du DOM. Le Shell écoute l'événement directement sur le composant hôte `<mfe-bleu>` dans l'arborescence. Le projet propose des interrupteurs interactifs permettant de tester l'impact de l'activation/désactivation de `bubbles` et `composed`.

### 4. MFE Jaune (`<mfe-jaune>`) : Canal Privé Isolé (`MessageChannel`)
- **Mécanique :** Le Shell instancie un `MessageChannel`. Le Shell conserve le premier port (`port1`) et transmet le second port (`port2`) directement à la propriété `messagePort` du Web Component à l'aide d'une référence React (`ref`).
- **Analyse :** La communication s'effectue directement en point-à-point, hors du DOM et de `window`. C'est l'approche la plus sécurisée pour éviter les interceptions globales.

### 5. MFE Violet (`<mfe-violet>`) : Attributs Réactifs & Événements d'Hôte
- **Mécanique :** Approche hybride réactive :
  - **Entrée (In)** : Le Shell met à jour les attributs HTML (`progress` et `theme`) sur la balise `<mfe-violet>`. Le Web Component intercepte réactivement ces changements via `attributeChangedCallback`.
  - **Sortie (Out)** : Lorsque l'utilisateur manipule le curseur du MFE, un Custom Event `progress-change` est dispatché directement sur le nœud hôte du Web Component.
### 6. Cas Pratique : Coexistence & Communication Bidirectionnelle (`<mfe-coexist>`)
- **Mécanique :** Deux instances distinctes du même composant Web (`mfe-coexist` configuré en Peer Alpha et Peer Beta) sont montées sur la même page. L'utilisateur peut basculer dynamiquement entre deux topologies :
  - **MessageChannel P2P Direct** : Le Shell génère un canal bidirectionnel et transmet un port à chaque instance. Les instances communiquent en direct en mémoire sans surcharge du DOM.
  - **Médiateur DOM (Shell)** : Les instances émettent des Custom Events vers le Shell via le DOM, et le Shell les réachemine manuellement vers le destinataire en invoquant son API publique.
- **Analyse :** Démontre comment un unique composant Web réutilisable peut coexister en plusieurs exemplaires et collaborer de manière autonome (P2P) ou gouvernée (Médiation).

---

## 🔬 Concepts Clés Manipulés

### 1. La Barrière du Shadow DOM (`bubbles` vs `composed`)
Dans le Shadow DOM, par mesure d'encapsulation, les événements classiques sont confinés dans le sous-arbre de l'élément.
- **`bubbles: true`** : L'événement monte le long des parents dans l'arbre local. S'il atteint la racine du Shadow DOM, il s'arrête là, sauf si...
- **`composed: true`** : Autorise l'événement à traverser la frontière (Shadow Boundary) pour continuer sa propagation dans le DOM standard de l'application hôte.
- **Reciblage de l'événement (Event Retargeting)** : Lorsqu'un événement traverse le Shadow DOM, le navigateur modifie dynamiquement la propriété `event.target` pour faire croire qu'il provient du Web Component lui-même (ex: `<mfe-bleu>`) et non d'un élément interne masqué (ex: `<button>`). Cela garantit l'étanchéité des composants.

### 2. Le MessageChannel & MessagePort (HTML5)
L'API `MessageChannel` permet de créer un canal de communication bidirectionnel direct composé de deux ports (`MessagePort`). 
- Ces ports sont des objets transférables (`Transferable Objects`) qui peuvent être envoyés via `postMessage`.
- Cette méthode offre un cloisonnement parfait : la messagerie s'exécute dans une sorte de "tunnel privé", totalement à l'abri de l'écoute du DOM et des conflits de nommage sur `window`.

### 3. Cycle de Vie Réactif des Web Components (`attributeChangedCallback`)
- Les Custom Elements disposent de méthodes de cycle de vie natives, notamment `attributeChangedCallback(name, oldValue, newValue)`.
- En déclarant la liste des attributs à surveiller dans `static get observedAttributes()`, on déclenche cette méthode à chaque fois que le Shell modifie l'attribut HTML. Dans ce POC, ce callback met à jour les propriétés passées au sous-arbre React, liant la réactivité HTML native à la réactivité de React.

### 4. React 19 et le Support des Web Components
- **React 19** apporte une amélioration majeure dans l'intégration des Custom Elements. Auparavant (React 18), React transmettait toutes les données aux Web Components sous forme d'attributs (uniquement des chaînes de caractères).
- Dans React 19, le moteur vérifie automatiquement si le nom de la propriété existe sur le prototype de l'élément (ex: `element.progress`). Si oui, React lui assigne directement la propriété typée (nombre, objet, fonction, etc.). Si non, il l'applique comme un attribut HTML classique (`setAttribute`).

---

## 🚀 Lancer le projet en local

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir votre navigateur sur la route indiquée (généralement `http://localhost:5173/` ou `http://localhost:5174/`).
