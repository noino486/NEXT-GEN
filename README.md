# KLYXY - Plateforme de Contenu Créateurs

Une plateforme moderne de streaming vidéo construite avec Next.js, TypeScript et Tailwind CSS, offrant une expérience similaire à TikTok/YouTube Shorts pour le contenu de créateurs.

## 📋 Table des Matières

- [Technologies Utilisées](#technologies-utilisées)
- [Structure du Projet](#structure-du-projet)
- [Composants Principaux](#composants-principaux)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Guide d'Installation](#guide-dinstallation)

---

## 🛠️ Technologies Utilisées

### Framework et Core
- **Next.js 16.0.10** - Framework React avec App Router
- **React 19.2.0** - Bibliothèque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 4.1.9** - Framework CSS utility-first

### UI Components
- **Radix UI** - Composants UI accessibles et sans style
  - Dialog, Accordion, Tabs, Dropdown, etc.
- **Shadcn/ui** - Composants UI basés sur Radix UI
- **Lucide React** - Bibliothèque d'icônes
- **next-themes** - Gestion du thème sombre/clair

### Bibliothèques Utilitaires
- **class-variance-authority** - Gestion des variantes de classes
- **clsx** & **tailwind-merge** - Gestion conditionnelle de classes CSS
- **zod** - Validation de schémas TypeScript
- **react-hook-form** - Gestion de formulaires

---

## 📁 Structure du Projet

```
klyxy01pv/
├── app/                          # Pages Next.js (App Router)
│   ├── page.tsx                  # Page d'accueil principale
│   ├── layout.tsx                # Layout racine
│   ├── globals.css               # Styles globaux
│   ├── watch/[id]/               # Page de visionnage vidéo
│   ├── serie/[id]/               # Page dédiée aux séries
│   ├── profile/[id]/             # Pages de profil
│   └── shorts/                   # Fonctionnalité Shorts
│       ├── page.tsx              # Page wrapper pour shorts
│       ├── shorts-modal.tsx      # Modal principal des shorts
│       └── video-player-logic.js # Logique backend pour la lecture vidéo
│
├── components/                    # Composants réutilisables
│   ├── navigation.tsx            # Barre de navigation principale
│   ├── video-carousel.tsx        # Carousel de vidéos standard
│   ├── ranked-video-carousel.tsx # Carousel avec classement
│   ├── ranked-video-card.tsx     # Carte vidéo avec rang
│   ├── video-card.tsx            # Carte vidéo standard
│   ├── serie-carousel.tsx        # Carousel de séries
│   ├── serie-card.tsx            # Carte de série
│   ├── serie-modal.tsx           # Modal de détails de série
│   ├── shorts-carousel.tsx       # Carousel de shorts (prévisualisation)
│   ├── artist-carousel.tsx       # Carousel d'artistes
│   ├── artist-card.tsx           # Carte d'artiste
│   ├── signup-modal.tsx          # Modal d'inscription/abonnement
│   ├── theme-provider.tsx        # Provider de thème
│   └── ui/                       # Composants UI Shadcn
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ... (50+ composants)
│
├── lib/                          # Utilitaires
│   └── utils.ts                  # Fonctions utilitaires (cn, etc.)
│
├── hooks/                        # Hooks React personnalisés
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── public/                       # Fichiers statiques
│   ├── shorts/                   # Vidéos shorts (17 fichiers)
│   ├── videos/                   # Vidéos principales
│   ├── miniatures/               # Miniatures vidéo
│   └── ... (images, logos, etc.)
│
├── styles/                       # Styles additionnels
│   └── globals.css
│
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
├── next.config.mjs               # Configuration Next.js
└── tailwind.config.js            # Configuration Tailwind
```

---

## 🎨 Composants Principaux

### Navigation (`components/navigation.tsx`)
- Barre de navigation fixe avec backdrop blur
- Recherche intégrée
- Navigation vers différentes sections
- Bouton pour ouvrir le modal Shorts
- Thème dark/light toggle

### Page d'Accueil (`app/page.tsx`)
Sections principales :
1. **Hero Section** - Vidéo en arrière-plan avec CTA
2. **Contenu en Vedette** - `VideoCarousel`
3. **Populaire Maintenant** - `RankedVideoCarousel` avec classement
4. **Dernières Sorties** - `VideoCarousel`
5. **Notre Sélection** - `RankedVideoCarousel` avec badge "Pour vous"
6. **Nos Shorts** - `ShortsCarousel` (NOUVEAU)
7. **Nos Séries** - `SerieCarousel` avec modals

### Shorts Modal (`app/shorts/shorts-modal.tsx`)
Fonctionnalités principales :
- **Affichage vertical** en format 9:16 (style TikTok)
- **Swipe vertical** pour changer de vidéo (mobile et desktop)
- **Autoplay** avec gestion intelligente du son
- **Play/Pause** au clic sur la vidéo
- **Navigation clavier** (flèches haut/bas)
- **Scroll smooth** avec snap points
- **Fond flouté** avec gradient utilisant les couleurs du thème
- **17 shorts** intégrés

**Props :**
- `open: boolean` - État d'ouverture du modal
- `onOpenChange: (open: boolean) => void` - Callback de changement d'état
- `initialIndex?: number` - Index initial de la vidéo (par défaut 0)

### Video Player Logic (`app/shorts/video-player-logic.js`)
Logique backend séparée pour la gestion des vidéos :
- `playVideo()` - Lance une vidéo
- `pauseAllVideosExcept()` - Met en pause toutes les vidéos sauf une
- `loadAndPlayVideo()` - Charge et lance une vidéo avec gestion d'erreur
- `changeToVideo()` - Change vers une nouvelle vidéo
- `togglePlayPauseLogic()` - Toggle play/pause
- `handleSwipeLogic()` - Gestion du swipe
- `handleWheelLogic()` - Gestion de la molette de la souris

**Pourquoi JavaScript séparé ?**
Séparation des préoccupations : logique métier (JS) vs UI (TSX)

### Shorts Carousel (`components/shorts-carousel.tsx`)
Carousel horizontal de prévisualisation des shorts :
- **Vidéos muettes** avec autoplay
- **Détection de visibilité** - Seule la vidéo visible joue
- **Clic pour ouvrir** le modal complet
- **Navigation par flèches** (gauche/droite)
- **Scroll horizontal** fluide

### Series Components

#### Serie Carousel (`components/serie-carousel.tsx`)
- Carousel horizontal des séries disponibles
- Navigation par flèches

#### Serie Card (`components/serie-card.tsx`)
- Carte cliquable qui ouvre `SerieModal`

#### Serie Modal (`components/serie-modal.tsx`)
- **Image hero** en haut
- **Sélecteur de saison** (tabs)
- **Liste d'épisodes** par saison avec :
  - Miniature
  - Titre
  - Description
  - Durée
  - Lien vers la page de visionnage
- **Scrollbar personnalisée** avec les couleurs du thème
- **Modal responsive** avec max-height

### Video Carousels

#### VideoCarousel (`components/video-carousel.tsx`)
- Carousel horizontal standard
- Navigation par flèches au hover
- Scroll fluide

#### RankedVideoCarousel (`components/ranked-video-carousel.tsx`)
- Carousel avec classement numérique
- Option pour masquer le classement (`showRank`)
- Badge personnalisable (`showBadge`, `badgeText`)

---

## ✨ Fonctionnalités

### 🎬 Système de Shorts
1. **Carousel de prévisualisation** sur la page d'accueil
   - Autoplay muet
   - Scroll horizontal
   - Clic pour ouvrir le modal

2. **Modal de visionnage complet**
   - Format vertical 9:16 (style TikTok)
   - Swipe vertical fluide
   - Autoplay avec son
   - Play/Pause au clic
   - Navigation clavier
   - 17 shorts disponibles

### 📺 Système de Séries
1. **Affichage par carousel** sur la page d'accueil
2. **Modal détaillé** avec :
   - Informations de la série
   - Navigation par saisons
   - Liste complète des épisodes
   - Descriptions et durées

### 🎨 Thème et Design
- **Thème dark/light** avec `next-themes`
- **Couleurs personnalisées** via CSS variables
- **Gradients** avec couleurs du thème
- **Backdrop blur** pour effets modernes
- **Animations fluides** avec Tailwind

### 📱 Responsive Design
- **Mobile-first** approach
- **Breakpoints Tailwind** : sm, md, lg
- **Touch gestures** pour mobile
- **Keyboard navigation** pour desktop

---

## 🏗️ Architecture

### Pattern de Séparation des Préoccupations

#### Frontend (TSX) - UI et Interactivité
- Composants React réactifs
- Gestion d'état avec `useState` et `useRef`
- Hooks personnalisés pour la logique UI
- Gestion des événements utilisateur

#### Backend Logic (JS) - Logique Métier
- `video-player-logic.js` : Gestion pure de la lecture vidéo
- Fonctions réutilisables et testables
- Pas de dépendance à React
- Gestion des erreurs et fallbacks

### Gestion d'État

**Local State** (useState)
- État d'ouverture des modals
- Index courant des vidéos
- État play/pause

**Refs** (useRef)
- Références aux éléments DOM (vidéos, containers)
- Valeurs qui ne nécessitent pas de re-render

### Gestion des Vidéos

**Problème résolu** : Gérer l'autoplay et s'assurer qu'une seule vidéo joue à la fois.

**Solution** :
1. `videoRefs` array pour toutes les vidéos
2. `useEffect` qui surveille `currentIndex`
3. Logique backend pour forcer le play/pause
4. Vérifications périodiques pour maintenir l'état

---

## 🚀 Guide d'Installation

### Prérequis
- Node.js 18+ 
- npm, yarn ou pnpm

### Installation

```bash
# Installer les dépendances
npm install
# ou
yarn install
# ou
pnpm install
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Build de Production

```bash
# Créer le build de production
npm run build

# Lancer le serveur de production
npm run start
```

---

## 📝 Notes Importantes

### Shorts
- Les shorts sont stockés dans `public/shorts/`
- Liste actuelle : **17 shorts**
- Format recommandé : 9:16 (vertical)
- Les shorts du carousel sont muets par défaut

### Vidéos
- Les vidéos principales sont dans `public/videos/`
- Les miniatures sont dans `public/miniatures/`

### Thème
- Couleurs définies dans `app/globals.css`
- Utilisation de CSS variables pour la personnalisation
- Support dark/light mode automatique

### Performance
- **Lazy loading** des vidéos avec `preload="metadata"`
- **Scroll snap** pour une navigation fluide
- **Debouncing** sur les événements de scroll
- **RequestAnimationFrame** pour les animations fluides

---

## 🔧 Configuration

### Tailwind CSS
Les couleurs du thème sont définies dans `app/globals.css` :
- Primary : `#00E5FF` (cyan)
- Background : `#0A0A0F` (dark)
- Foreground : `#FFFFFF` (white)

### Next.js
Configuration dans `next.config.mjs` :
- Support des fichiers vidéo
- Optimisations d'images

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

---

## 🎯 Fonctionnalités Futures Possibles

- Système de recherche avancé
- Favoris et playlists
- Recommandations personnalisées
- Commentaires et likes sur les shorts
- Téléchargement de vidéos
- Streaming en direct
- Profils utilisateurs avancés

---

## 📄 Licence

Projet privé - Tous droits réservés © 2026 klyxy

---

## 👤 Auteur

Développé pour KLYXY - Plateforme de contenu créateurs

---

*Dernière mise à jour : Janvier 2026*

