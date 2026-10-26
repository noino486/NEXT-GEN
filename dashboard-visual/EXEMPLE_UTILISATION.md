# Exemple d'utilisation complète

Voici un exemple complet d'intégration des composants du dashboard dans votre projet.

## Structure de base

### 1. Fichier principal (main.jsx)

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import App from './App';
import './styles/style.css'; // Importez les styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 2. Composant App (App.jsx)

```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout page="dashboard" />}>
        <Route index element={<DashboardPage />} />
        {/* Autres routes */}
      </Route>
    </Routes>
  );
}

export default App;
```

### 3. Page Dashboard (pages/DashboardPage.jsx)

```jsx
import React from 'react';
import MetricCard from '../components/UI/MetricCard';
import Chart01 from '../components/Charts/Chart01';
import Chart02 from '../components/Charts/Chart02';
import Chart03 from '../components/Charts/Chart03';

const DashboardPage = () => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Cartes de métriques */}
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Ventes"
          value="1,234"
          change="+12.5%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <MetricCard
          title="Utilisateurs"
          value="5,678"
          change="+8.2%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <MetricCard
          title="Revenus"
          value="€45,678"
          change="-2.1%"
          changeType="negative"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <MetricCard
          title="Commandes"
          value="890"
          change="+15.3%"
          changeType="positive"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#465FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
      </div>

      {/* Graphiques */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <Chart01 
          data={[168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]}
          categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
          title="Ventes mensuelles"
        />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <Chart02 
          value={75.55}
          label="Progression"
        />
      </div>
      <div className="col-span-12">
        <Chart03 
          salesData={[180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235]}
          revenueData={[40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140]}
          categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
```

### 4. Personnalisation du Header avec authentification

Si vous avez un système d'authentification, vous pouvez passer les props au Layout :

```jsx
// Dans votre Layout personnalisé ou App.jsx
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext'; // Votre contexte d'authentification

function App() {
  const { user, logout } = useAuth();
  
  return (
    <Layout 
      page="dashboard"
      user={user}
      onLogout={logout}
    >
      {/* Votre contenu */}
    </Layout>
  );
}
```

Note: Vous devrez peut-être modifier le composant `Layout` pour passer ces props au `Header`.

### 5. Personnalisation du Sidebar

```jsx
import Sidebar from './components/Layout/Sidebar';

const menuItems = [
  {
    id: 'dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Votre icône */}
      </svg>
    ),
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 'products',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Votre icône */}
      </svg>
    ),
    label: 'Produits',
    link: '/products',
  },
  // ... autres items
];

<Sidebar 
  sidebarToggle={sidebarToggle}
  page="dashboard"
  menuItems={menuItems}
/>
```

## Notes importantes

- Assurez-vous que tous les fichiers CSS sont importés
- Vérifiez que toutes les dépendances sont installées
- Adaptez les composants selon vos besoins spécifiques (authentification, routes, etc.)

