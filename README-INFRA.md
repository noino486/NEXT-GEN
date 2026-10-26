# Déployer Klyxy avec l'Infra : front et back séparés

Le site tourne en **deux services** construits depuis ce même dépôt :

| Service | Dockerfile | Port | Domaine | Contenu |
|---|---|---|---|---|
| `klyxy-back` | `Dockerfile.backend` | `3001` | `api-app.klyxy.fr` | L'API Express (`server/`) |
| `klyxy-front` | `Dockerfile.frontend` | `3000` | `klyxy.fr` (+ `www.klyxy.fr` qui redirige) | Le site Next.js |

Le navigateur appelle l'API directement sur `https://api-app.klyxy.fr` (CORS). En local,
`npm run dev:all` et `npm start` (mode unifié) fonctionnent **comme avant** : sans
`NEXT_PUBLIC_BACKEND_URL`, le front continue d'utiliser le même domaine.

> L'ancien `ecosystem.config.cjs` (PM2) et `start-server.js` ne servent plus en production :
> Docker redémarre les containers tout seul et l'Infra gère les certificats HTTPS.

---

## 1. DNS

Un enregistrement **A** vers l'IP du VPS pour chacun : `@` (klyxy.fr), `www` et `api-app`.

## 2. Base de données (les tables se créent toutes seules)

Dans l'Infra → ton projet → **Databases** → *New PostgreSQL* (ex. `klyxy-db`), puis
*Link a database* sur le service back (étape 3). **C'est tout** : au démarrage, le backend
applique lui-même les fichiers `database*.sql` (`server/migrate.js`).

- À **chaque déploiement**, les migrations pas encore appliquées sont exécutées avant que le
  serveur accepte du trafic. Elles sont suivies dans la table `schema_migrations` : chaque
  fichier ne s'exécute qu'une fois.
- Chaque migration est dans **une transaction** : si l'une échoue, rien n'est à moitié appliqué,
  le démarrage s'arrête, le déploiement apparaît en **Failed** avec l'erreur dans ses logs, et
  **l'ancienne version reste en ligne**.
- Une base **déjà remplie** (reprise de ton ancienne prod) est rattrapée sans perte : les
  fichiers sont rejouables. Pour reprendre tes données, importe d'abord le dump
  (`docker exec -i ka-db-klyxy-db psql -U klyxy -d klyxy_db < dump.sql`), puis déploie.
- Pas de commande à lancer, pas de clone du dépôt sur le VPS.

**Ajouter une migration plus tard :** crée le fichier `database-quelque-chose.sql` à la racine
(avec `IF NOT EXISTS` autant que possible), ajoute son nom **à la fin** de `MIGRATIONS` dans
`server/migrate.js`, puis `git push` : le déploiement l'applique. Ne modifie jamais un fichier
déjà appliqué en production : crée-en un nouveau. Le déploiement avertit si un `database*.sql`
n'est pas dans la liste.

Cas particulier : `AUTO_MIGRATE=false` (variable du service back) désactive ce mécanisme.
`npm run migrate` reste disponible en local.

**Premier administrateur :** crée ton compte sur le site, change l'email dans `set-admin.sql`,
puis exécute-le une fois :
`docker exec -i ka-db-klyxy-db psql -U klyxy -d klyxy_db < set-admin.sql`
(depuis le VPS, avec ce dépôt cloné).

## 3. Service back

Infra → *New service* → dépôt `noino486/newrepo`, branche `main` :

- **Dockerfile** : `Dockerfile.backend` · **Port** : `3001` · **Nom** : `klyxy-back`
- Settings → **domaine principal** : `api-app.klyxy.fr`
- Databases → *Link a database* sur ce service (ajoute `DATABASE_URL`)
- Variables :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | **Obligatoire** : l'API refuse de démarrer sans. Génère-le : `openssl rand -hex 32` (32 caractères minimum, secret, ne le change que pour déconnecter tout le monde) |
| `ACCESS_CODE` | Optionnel : si défini, le site demande ce code avant tout (phase privée) |
| `FRONTEND_URL` | `https://klyxy.fr` (origine autorisée par le CORS, sans `/` final. Plusieurs : séparées par des virgules) |
| `CLOUDFLARE_ACCOUNT_ID` | ton identifiant Cloudflare Stream |
| `CLOUDFLARE_API_TOKEN` | ton token Cloudflare (secret : ne coche **pas** « build time ») |
| `RECAPTCHA_SECRET_KEY` | la clé secrète reCAPTCHA |
| `SKIP_EMAIL_VERIFICATION` | `true` seulement pour un premier test sans envoi d'emails |

### Sécurité (ce que fait l'API)

- Connexion = cookie `klyxy_session` **HttpOnly**, signé, 7 jours : le front ne stocke plus aucun secret et l'API ignore tout rôle/identité annoncé par le client.
- Le rôle est relu en base à chaque requête (un compte rétrogradé ou supprimé perd l'accès tout de suite ; un changement de mot de passe invalide les autres sessions).
- Contrôle d'`Origin` sur les écritures (CSRF), limitation des tentatives (connexion, inscription, mot de passe), corps JSON limité à 2 Mo.
- Les passages en Premium sont réservés au staff tant que le paiement n'est pas branché ; les brouillons et emails de créateurs ne sont jamais publics.
- Tests : `sh server/test/run-docker.sh` (conteneurs jetables, 18 contrôles).

Vérifie : `https://api-app.klyxy.fr/health` répond `{"status":"ok",…}`.

## 4. Service front

Infra → *New service* → même dépôt et même branche :

- **Dockerfile** : `Dockerfile.frontend` · **Port** : `3000` · **Nom** : `klyxy-front`
- Settings → **domaine principal** : `klyxy.fr`, puis *Domains* → ajoute `www.klyxy.fr`
  avec « Redirect to primary »
- Variables, **toutes avec « Also pass it at build time » cochée** (Next.js les grave dans le
  code au build, pas à l'exécution) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api-app.klyxy.fr` |
| `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE` | ton code client Cloudflare Stream |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | la clé publique reCAPTCHA |
| `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION` | `true` seulement avec le même test que ci-dessus |

Ce sont des valeurs **publiques** (elles finissent dans le navigateur). N'y mets jamais de
secret : les valeurs de build restent dans l'historique de l'image.

Déploie le **back d'abord**, puis le front. Si tu changes une variable `NEXT_PUBLIC_*`,
relance un déploiement complet (*Deploy*), pas seulement « Restart ».

## 5. Ne redéployer que ce qui a changé

Pour que chaque `git push` ne reconstruise que le bon service, renseigne dans Settings →
*Also redeploy when these paths change* :

| Service | Chemins surveillés |
|---|---|
| `klyxy-back` | `server, package.json, package-lock.json, Dockerfile.backend` |
| `klyxy-front` | `app, components, hooks, lib, public, styles, package.json, package-lock.json, next.config.mjs, Dockerfile.frontend` |

## 6. Dépannage

| Symptôme | Cause probable |
|---|---|
| Le site appelle `/api/...` sur `klyxy.fr` (erreurs 404) | `NEXT_PUBLIC_BACKEND_URL` absente ou pas cochée « build time » : corrige-la puis *Deploy* |
| Erreur CORS dans la console du navigateur | `FRONTEND_URL` du back différente de l'origine exacte du site |
| Le back répond 500 partout | `DATABASE_URL` absente (la base n'est pas liée au service) |
| Le déploiement du back est en **Failed** | Ouvre-le dans l'onglet Deployments : l'erreur d'une migration SQL (`❌ Migrations SQL en échec : fichier.sql : …`) y apparaît. L'ancienne version continue de tourner |
| Upload de vidéo refusé | `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` manquants sur le **back** |
| Page blanche après changement de variable publique | Il faut *Deploy* (reconstruction), pas *Restart* |
