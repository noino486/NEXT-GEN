# Déploiement en production — Nginx + PM2

Guide pour faire tourner le **backend** et le **frontend** KLYXY en production avec **PM2** (processus toujours actif) et **Nginx** (reverse proxy, SSL possible).

---

## Vue d’ensemble

- **PM2** : lance et garde en vie l’app Node (Next.js + Express via `start-server.js`) ; redémarrage auto en cas de crash.
- **Nginx** : reçoit le trafic sur le port 80 (et 443 si HTTPS), le renvoie vers l’app Node sur `localhost:3000`.

L’app est **unifiée** : un seul processus (`node start-server.js`) écoute sur le port **3000** ; les requêtes `/api/*` sont proxifiées vers Express en interne.

---

## 1. Prérequis sur le serveur (Ubuntu / Debian)

- Node.js 18+ (idéalement 20 LTS)
- PostgreSQL installé et base créée
- Projet cloné/copié, `.env` configuré (voir `README-INSTALL-LINUX.md`)

---

## 2. Installer PM2

```bash
sudo npm install -g pm2
pm2 -v
```

---

## 3. Installer Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Build et variables d’environnement

À la **racine du projet** (klyxy.prod) :

```bash
cd /chemin/vers/klyxy.prod

# Dépendances
npm ci

# Build Next.js (obligatoire avant de lancer en prod)
npm run build
```

Fichier **`.env`** à la racine (adapter les valeurs) :

```env
NODE_ENV=production
PORT=3000
BACKEND_PORT=3002
FRONTEND_URL=https://votredomaine.com

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=klyxy
DB_USER=klyxy_user
DB_PASSWORD=votre_mot_de_passe

# Frontend (URL publique du site pour CORS et redirections)
NEXT_PUBLIC_BACKEND_URL=https://votredomaine.com
```

En prod, `NEXT_PUBLIC_BACKEND_URL` doit être l’URL publique du site (ex. `https://votredomaine.com`), car le front appelle l’API sur le même domaine (Nginx en reverse proxy).  
`BACKEND_PORT=3002` : port interne d’Express dans le processus unifié (évite le conflit avec un éventuel backend séparé sur 3001).

---

## 5. Lancer l’app avec PM2

### Option A : Fichier ecosystem (recommandé)

À la racine du projet il y a un fichier **`ecosystem.config.cjs`**. Pour l’utiliser :

```bash
cd /chemin/vers/klyxy.prod
pm2 start ecosystem.config.cjs
```

### Option B : Commande directe

```bash
cd /chemin/vers/klyxy.prod
pm2 start start-server.js --name klyxy --node-args="--experimental-vm-modules"
```

Vérifier que le processus tourne :

```bash
pm2 status
pm2 logs klyxy
```

L’app écoute sur **http://127.0.0.1:3000**. Nginx va envoyer le trafic dessus.

---

## 6. Configurer Nginx (reverse proxy)

Créer un vhost (remplacer `votredomaine.com` par ton domaine ou l’IP du serveur) :

```bash
sudo nano /etc/nginx/sites-available/klyxy
```

Contenu type :

```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Si tu n’as **pas de domaine** (accès par IP uniquement) :

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site et recharger Nginx :

```bash
sudo ln -sf /etc/nginx/sites-available/klyxy /etc/nginx/sites-enabled/
# Si tu utilises default_server, désactiver l’autre default si besoin :
# sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Tu accèdes au site via **http://votredomaine.com** ou **http://IP_DU_SERVEUR**.

---

## 7. Redémarrage automatique (au boot du serveur)

Pour que PM2 relance l’app après un reboot :

```bash
pm2 save
pm2 startup
```

Exécuter la commande que `pm2 startup` affiche (souvent `sudo env PATH=... pm2 startup systemd -u ...`).

---

## 8. Commandes utiles

| Action              | Commande                    |
|---------------------|-----------------------------|
| Statut des process  | `pm2 status`               |
| Logs en direct      | `pm2 logs klyxy`           |
| Redémarrer l’app    | `pm2 restart klyxy`         |
| Arrêter             | `pm2 stop klyxy`            |
| Supprimer du PM2    | `pm2 delete klyxy`          |
| Recharger Nginx     | `sudo systemctl reload nginx` |

Après un **nouveau déploiement** (nouveau code) :

```bash
cd /chemin/vers/klyxy.prod
git pull
npm ci
npm run build
pm2 restart klyxy
```

---

## 9. HTTPS (optionnel) avec Let’s Encrypt

Une fois le domaine pointé vers le serveur (port 80 ouvert) :

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

Certbot modifie la config Nginx pour servir le site en HTTPS. Penser à mettre à jour `.env` :

- `FRONTEND_URL=https://votredomaine.com`
- `NEXT_PUBLIC_BACKEND_URL=https://votredomaine.com`

Puis redémarrer l’app si besoin :

```bash
pm2 restart klyxy
```

---

## 10. Résumé rapide (push en prod)

```bash
# Sur le serveur
cd /chemin/vers/klyxy.prod
git pull
npm ci
npm run build
pm2 restart klyxy
```

PM2 garde le processus actif en permanence ; Nginx envoie tout le trafic (front + API) vers ce processus.

---

## 11. Le front appelle encore localhost:3001 (CORS / loopback)

Si le navigateur affiche des erreurs du type « Access to fetch at 'http://localhost:3001/api/...' from origin 'http://klyxy.fr' blocked by CORS », le **build servi est ancien**. Il faut déployer le dernier code et refaire un build.

**Sur le VPS, exécuter ce bloc en une fois :**

```bash
cd ~/klyxy.prod && git pull && grep -q 'NEXT_PUBLIC_BACKEND_URL' .env || echo 'NEXT_PUBLIC_BACKEND_URL=http://klyxy.fr' >> .env && rm -rf .next && npm run build && pm2 restart klyxy
```

Puis dans le navigateur : **Ctrl+Shift+R** (ou **Cmd+Shift+R**) pour recharger sans cache, ou ouvrir http://klyxy.fr en **navigation privée**.

Le code actuel utilise en priorité une URL relative (`/api/...`) en navigateur, donc après ce déploiement les appels iront bien vers klyxy.fr.

---

## 12. Erreur 413 (Request Entity Too Large) lors de l'upload

Si l'upload de vidéos échoue avec **413**, Nginx bloque les fichiers trop gros. Modifier la config Nginx sur le VPS :

```bash
sudo nano /etc/nginx/sites-available/klyxy
```

Ajouter dans le bloc `server { }` (juste après la ligne `server_name`) :

```nginx
client_max_body_size 2000M;
```

Sauvegarder, tester et recharger :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Le fichier **nginx-klyxy.conf** du projet a déjà cette directive (limite 2GB).
