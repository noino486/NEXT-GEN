# Dashboard Visual Components

Ce dossier contient tous les composants visuels du dashboard que vous pouvez réutiliser dans d'autres projets.

## 📁 Structure

```
dashboard-visual/
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx          # Composant principal de layout
│   │   ├── Header.jsx          # En-tête avec recherche et menu utilisateur
│   │   ├── Sidebar.jsx         # Barre latérale avec navigation
│   │   ├── Preloader.jsx       # Indicateur de chargement
│   │   └── Overlay.jsx         # Overlay pour mobile
│   ├── Charts/
│   │   ├── Chart01.jsx         # Graphique en barres
│   │   ├── Chart02.jsx        # Graphique radial (radialBar)
│   │   └── Chart03.jsx        # Graphique en aires (area)
│   └── UI/
│       └── MetricCard.jsx      # Carte de métrique avec icône
├── contexts/
│   └── DarkModeContext.jsx     # Contexte pour le mode sombre
├── styles/
│   └── style.css               # Styles Tailwind CSS personnalisés
└── config/
    └── postcss.config.js       # Configuration PostCSS
```

## 🚀 Installation

### 1. Dépendances requises

Installez les dépendances suivantes dans votre projet :

```bash
npm install react react-dom react-router-dom
npm install react-apexcharts apexcharts
npm install tailwindcss@^4.0.0 @tailwindcss/postcss@^4.0.0
npm install postcss autoprefixer
```

### 2. Configuration Tailwind CSS

1. Copiez le fichier `styles/style.css` dans votre projet et importez-le dans votre fichier principal (ex: `main.jsx` ou `App.jsx`)

2. Copiez le fichier `config/postcss.config.js` à la racine de votre projet

3. Assurez-vous que votre `vite.config.js` (ou autre bundler) est configuré pour utiliser PostCSS

### 3. Intégration dans votre projet

#### Étape 1 : Copier les fichiers

Copiez le dossier `dashboard-visual` dans votre projet ou copiez les fichiers individuellement.

#### Étape 2 : Configurer le DarkModeProvider

Enveloppez votre application avec le `DarkModeProvider` :

```jsx
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      {/* Votre application */}
    </DarkModeProvider>
  );
}
```

#### Étape 3 : Utiliser le Layout

```jsx
import Layout from './components/Layout/Layout';
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <Layout page="dashboard">
        {/* Votre contenu */}
      </Layout>
    </DarkModeProvider>
  );
}
```

## 📖 Utilisation des composants

### Layout

Le composant `Layout` fournit la structure de base avec sidebar, header et zone de contenu.

```jsx
import Layout from './components/Layout/Layout';

<Layout page="dashboard">
  <div>Votre contenu ici</div>
</Layout>
```

### Header

Le composant `Header` peut recevoir des props pour personnaliser l'authentification :

```jsx
import Header from './components/Layout/Header';

<Header 
  sidebarToggle={sidebarToggle}
  setSidebarToggle={setSidebarToggle}
  user={user} // { name: "John Doe", email: "john@example.com" }
  onLogout={handleLogout}
/>
```

### Sidebar

Le composant `Sidebar` accepte un prop `menuItems` pour personnaliser le menu :

```jsx
import Sidebar from './components/Layout/Sidebar';

const menuItems = [
  {
    id: 'dashboard',
    icon: <svg>...</svg>,
    label: 'Dashboard',
    link: '/dashboard',
  },
  // ... autres items
];

<Sidebar 
  sidebarToggle={sidebarToggle}
  page="dashboard"
  menuItems={menuItems}
/>
```

### Charts

#### Chart01 - Graphique en barres

```jsx
import Chart01 from './components/Charts/Chart01';

<Chart01 
  data={[168, 385, 201, 298, 187, 195]}
  categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  title="Ventes mensuelles"
/>
```

#### Chart02 - Graphique radial

```jsx
import Chart02 from './components/Charts/Chart02';

<Chart02 
  value={75.55}
  label="Progression"
/>
```

#### Chart03 - Graphique en aires

```jsx
import Chart03 from './components/Charts/Chart03';

<Chart03 
  salesData={[180, 190, 170, 160, 175, 165]}
  revenueData={[40, 30, 50, 40, 55, 40]}
  categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
/>
```

### MetricCard

```jsx
import MetricCard from './components/UI/MetricCard';

<MetricCard
  title="Total Ventes"
  value="1,234"
  change="+12.5%"
  changeType="positive"
  icon={
    <svg width="24" height="24" viewBox="0 0 24 24">
      {/* Votre icône SVG */}
    </svg>
  }
/>
```

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `styles/style.css` via les variables CSS. Vous pouvez modifier les couleurs de la marque (brand) en changeant les valeurs `--color-brand-*`.

### Mode sombre

Le mode sombre est géré automatiquement par le `DarkModeContext`. Utilisez la fonction `toggleDarkMode()` pour basculer entre les modes.

```jsx
import { useDarkMode } from './contexts/DarkModeContext';

function MyComponent() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Mode clair' : 'Mode sombre'}
    </button>
  );
}
```

## 📝 Notes importantes

1. **React Router** : Ces composants utilisent `react-router-dom` pour la navigation. Assurez-vous que votre projet utilise React Router.

2. **ApexCharts** : Les graphiques utilisent `react-apexcharts`. Assurez-vous que cette dépendance est installée.

3. **Tailwind CSS v4** : Ce projet utilise Tailwind CSS v4. Si vous utilisez une version antérieure, vous devrez peut-être adapter les styles.

4. **Authentification** : Le composant `Header` a été adapté pour accepter des props `user` et `onLogout` au lieu d'utiliser directement un contexte d'authentification. Adaptez-le selon vos besoins.

## 🔧 Dépannage

### Les styles ne s'appliquent pas

- Vérifiez que `style.css` est importé dans votre fichier principal
- Vérifiez que PostCSS est configuré correctement
- Vérifiez que Tailwind CSS est installé et configuré

### Les graphiques ne s'affichent pas

- Vérifiez que `react-apexcharts` et `apexcharts` sont installés
- Vérifiez que les données sont passées correctement aux composants

### Le mode sombre ne fonctionne pas

- Vérifiez que `DarkModeProvider` enveloppe votre application
- Vérifiez que la classe `dark` est ajoutée à l'élément HTML (géré automatiquement par le contexte)

## 📄 Licence

Ces composants sont fournis tels quels pour être réutilisés dans vos projets.

