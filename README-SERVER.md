# Guide de démarrage - Backend et Frontend séparés

Ce projet est maintenant divisé en deux applications distinctes :
- **Backend** : Serveur Express.js (port 3001)
- **Frontend** : Application Next.js (port 3000)

## Structure

```
klyxy01pv/
├── server/              # Backend Express.js
│   ├── index.js         # Point d'entrée du serveur
│   ├── routes/          # Routes API
│   ├── controllers/     # Contrôleurs
│   └── lib/             # Utilitaires backend
├── app/                 # Frontend Next.js
├── components/          # Composants React
└── lib/                 # Utilitaires frontend
```

## Configuration

### Backend et Frontend — un seul `.env` à la racine

Le backend lit `.env` à la **racine du projet** (pas dans `server/`).

```env
PORT=3001
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000

# Obligatoire pour le backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Le **frontend** appelle **toujours** le backend via une URL explicite :
- En dev : défaut `http://localhost:3001` (aucune variable requise).
- En prod / VPS : définir **obligatoirement** dans `.env` ou `.env.local` :

```env
NEXT_PUBLIC_BACKEND_URL=http://VOTRE_IP_OU_DOMAINE:3001
```

Exemple VPS : `NEXT_PUBLIC_BACKEND_URL=http://213.32.18.181:3001`

## Schéma de la base (première fois)

Si la base est vide (erreur « relation "videos" does not exist »), exécuter une fois à la racine :

```bash
npm run migrate
```

Cela crée les tables dans le bon ordre (users, videos, categories, etc.).

## Démarrage

### Option 1 : Lancer les deux serveurs séparément

**Terminal 1 - Backend :**
```bash
npm install   # à la racine si besoin
npm run server
# ou : npm run backend
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Option 2 : Lancer les deux serveurs en même temps

```bash
npm run dev:all
```

Cette commande lance automatiquement le backend et le frontend en parallèle.

## Scripts disponibles

### Frontend (Next.js)
- `npm run dev` — frontend seul (port 3000), appelle le backend à `NEXT_PUBLIC_BACKEND_URL` ou `http://localhost:3001`
- `npm run dev:frontend` — idem
- `npm run build` + `npm run start` — prod (mode unifié si tu utilises `start`)

### Backend (Express)
- `npm run server` ou `npm run backend` — **backend seul** (port 3001), pour l’app iOS ou le frontend en mode séparé
- `npm run dev:backend` — idem
- `npm run dev:all` — backend + frontend en parallèle (2 processus)

## Ports

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001

## API Endpoints

Le backend expose les endpoints suivants :

- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription
- `GET /health` - Vérification de santé du serveur

## Notes importantes

1. **Backend et frontend sont séparés** : le frontend appelle toujours l’URL du backend (`getBackendUrl()` = `NEXT_PUBLIC_BACKEND_URL` ou `http://localhost:3001`). Il n’y a plus de “même origine” : deux processus distincts.
2. **Le backend doit être lancé** avant d’ouvrir le frontend (ou en parallèle avec `npm run dev:all`).
3. **CORS** : le backend autorise `FRONTEND_URL` (défaut `http://localhost:3000`). Pour l’app iOS, mettre `FRONTEND_URL=*` dans `.env` si besoin.
4. **App iOS** : lancer uniquement le backend sur le VPS (`npm run server`), ouvrir le port 3001, et configurer l’app avec l’URL du backend (ex. `http://VPS_IP:3001`).

