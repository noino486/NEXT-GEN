# Installation KLYXY sur Ubuntu Linux

Guide d'installation complet pour le **backend** (Express.js) et le **frontend** (Next.js) sur une machine Ubuntu.

---

## Prérequis

- **Ubuntu** 20.04 LTS ou supérieur (testé sur 22.04 / 24.04)
- Accès **sudo** pour installer les paquets
- Connexion internet

---

## 1. Installer Node.js (LTS)

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20.x LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v   # v20.x.x
npm -v    # 10.x.x ou supérieur
```

> **Alternative** : Si vous préférez **nvm** (Node Version Manager) :
> ```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
> source ~/.bashrc
> nvm install 20
> nvm use 20
> ```

---

## 2. Installer PostgreSQL

```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier le statut
sudo systemctl status postgresql
```

### Créer la base de données et l'utilisateur

```bash
# Passer en utilisateur postgres
sudo -u postgres psql

# Dans le shell psql, exécuter :
CREATE USER klyxy_user WITH PASSWORD 'votre_mot_de_passe_fort';
CREATE DATABASE klyxy OWNER klyxy_user;
GRANT ALL PRIVILEGES ON DATABASE klyxy TO klyxy_user;
\c klyxy
GRANT ALL ON SCHEMA public TO klyxy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO klyxy_user;
\q
```

> Remplacez `votre_mot_de_passe_fort` par un mot de passe sécurisé.

---

## 3. Récupérer le projet

```bash
# Option A : cloner depuis Git
git clone https://github.com/votre-repo/klyxy.git
cd klyxy

# Option B : copier le dossier du projet
# Si vous avez déjà le dossier "klyxy save", placez-le où vous voulez
cd /chemin/vers/klyxy\ save
```

---

## 4. Configuration des variables d'environnement

```bash
# Copier le fichier exemple
cp env.example.txt .env.local

# Éditer le fichier .env.local
nano .env.local
```

Remplissez les valeurs suivantes (minimum requis) :

```env
# URL du backend (frontend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Port du backend
BACKEND_PORT=3001

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:3000

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=klyxy
DB_USER=klyxy_user
DB_PASSWORD=votre_mot_de_passe_fort

# reCAPTCHA (optionnel en dev - laisser vide si pas configuré)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

> **Note** : Sur une machine distante (VPS, autre poste), remplacez `localhost` par l’IP ou le domaine du serveur.

---

## 5. Initialiser la base de données

Exécuter les scripts SQL **dans cet ordre** :

```bash
# S'assurer que .env.local est configuré
node run-sql.js database.sql
node run-sql.js database-videos.sql
node run-sql.js database-roles.sql
node run-sql.js database-user-favorites.sql
node run-sql.js database-hero-trailers.sql
node run-sql.js database-hero-trailers-cloudflare.sql
node run-sql.js database-hero-content.sql
node run-sql.js database-categories.sql
node run-sql.js database-categories-rap-lifestyle-sport.sql
node run-sql.js database-videos-thumbnail-top10.sql
node run-sql.js database-video-stats.sql
node run-sql.js database-videos-index-status-created.sql
node run-sql.js database-premium-plus-update.sql
node run-sql.js database-email-verification.sql
node run-sql.js database-logs.sql
node run-sql.js database-settings-update.sql
```

Ou en une seule commande :

```bash
for f in database.sql database-videos.sql database-roles.sql database-user-favorites.sql database-hero-trailers.sql database-hero-trailers-cloudflare.sql database-hero-content.sql database-categories.sql database-categories-rap-lifestyle-sport.sql database-videos-thumbnail-top10.sql database-video-stats.sql database-videos-index-status-created.sql database-premium-plus-update.sql database-email-verification.sql database-logs.sql database-settings-update.sql; do
  node run-sql.js "$f"
done
```

---

## 6. Installer les dépendances

```bash
# Depuis la racine du projet (klyxy save)
npm install
```

---

## 7. Lancer l'application

### Mode développement (backend + frontend ensemble)

```bash
npm run dev:all
```

- **Frontend** : http://localhost:3000  
- **Backend API** : http://localhost:3001  

### Ou lancer séparément

```bash
# Terminal 1 : Backend
npm run dev:backend

# Terminal 2 : Frontend
npm run dev:frontend
```

---

## 8. Build et production

```bash
# Build du frontend
npm run build

# Lancer en production
npm start
```

> Pour la production, utilisez un gestionnaire de processus (PM2, systemd) et un reverse proxy (Nginx) devant le serveur Node.

---

## Dépannage

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL écoute sur localhost
sudo ss -tlnp | grep 5432

# Tester la connexion
psql -h localhost -U klyxy_user -d klyxy -c "SELECT 1"
```

### Port 3000 ou 3001 déjà utilisé

```bash
# Trouver le processus
sudo lsof -i :3000
sudo lsof -i :3001

# Tuer le processus (remplacer PID par le numéro affiché)
kill -9 PID
```

### Erreur EACCES ou permissions

```bash
# S'assurer que vous avez les droits sur le dossier
chmod -R u+rwx .
```

### Node / npm introuvable après installation

```bash
# Recharger le shell
source ~/.bashrc
# ou
source ~/.profile
```

---

## Structure des ports

| Service      | Port   |
|-------------|--------|
| Frontend    | 3000   |
| Backend API | 3001   |
| PostgreSQL  | 5432   |

---

## Lignes de commande utiles

### Connexion à PostgreSQL

```bash
# Se connecter avec l'utilisateur klyxy_user (demande le mot de passe)
psql -h localhost -U klyxy_user -d klyxy

# Se connecter sans demander le mot de passe (variable d'environnement)
PGPASSWORD=votre_mot_de_passe psql -h localhost -U klyxy_user -d klyxy

# Se connecter en tant que super-utilisateur postgres
sudo -u postgres psql

# Se connecter et passer directement à la base klyxy
sudo -u postgres psql -d klyxy
```

### Commandes dans le shell psql

```bash
# Une fois connecté (psql>) :
\l                    # Lister toutes les bases
\c klyxy              # Se connecter à la base klyxy
\dt                   # Lister les tables
\d users              # Décrire la table users
\q                    # Quitter psql

# Exécuter une requête SQL directement
psql -h localhost -U klyxy_user -d klyxy -c "SELECT COUNT(*) FROM users;"
```

### Vérifier les services

```bash
# PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql

# Tester que PostgreSQL écoute sur le port 5432
sudo ss -tlnp | grep 5432
# ou
netstat -tlnp | grep 5432
```

### Tester le backend et le frontend

```bash
# Tester le backend (API health)
curl http://localhost:3001/health

# Tester le frontend
curl -I http://localhost:3000
```

### Aller dans le projet et lancer

```bash
# Se placer dans le dossier du projet
cd /chemin/vers/klyxy\ save
# ou si le dossier s'appelle "klyxy save" :
cd "/chemin/vers/klyxy save"

# Lancer tout (backend + frontend)
npm run dev:all

# Ou en arrière-plan (avec nohup)
nohup npm run dev:all > klyxy.log 2>&1 &
```

### Exécuter un script SQL manuellement

```bash
# Depuis la ligne de commande (sans psql interactif)
psql -h localhost -U klyxy_user -d klyxy -f database.sql

# Via le script Node du projet
node run-sql.js database.sql
```

---

## Résumé des commandes

```bash
# 1. Prérequis
sudo apt update && sudo apt install -y nodejs postgresql

# 2. Base de données
sudo -u postgres psql -c "CREATE USER klyxy_user WITH PASSWORD 'MOT_DE_PASSE';"
sudo -u postgres psql -c "CREATE DATABASE klyxy OWNER klyxy_user;"

# 3. Projet
cd /chemin/vers/klyxy\ save
cp env.example.txt .env.local
# Éditer .env.local avec vos valeurs

# 4. Base de données (scripts SQL)
node run-sql.js database.sql
node run-sql.js database-videos.sql
# ... (voir section 5)

# 5. Installation et démarrage
npm install
npm run dev:all
```

---

*Dernière mise à jour : Février 2026*
