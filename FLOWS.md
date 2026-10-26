# Klyxy : tous les flows, un par un

Légende : ✅ en place et sécurisé · ⚠️ fonctionne mais à décider · ❌ manquant.
Identité = cookie `klyxy_session` (HttpOnly). Rôles : visiteur (non connecté), utilisateur (rôle `null`), `createur`, `support`, `administrateur`. « Staff » = support + administrateur.

---

## A. Accès et compte

### A1. Code d'accès au site (optionnel) ✅
- Acteur : tout visiteur, si `ACCESS_CODE` est défini sur le back.
- Étapes : le front appelle `GET /api/access/status` → si requis, écran de saisie → `GET /api/access/check` avec `X-Access-Code` → code gardé dans le navigateur et ajouté à tous les appels API.
- Sécurité : 10 mauvais codes / 15 min / IP → 429. `/health` reste ouvert.
- À savoir : le code protège l'API, pas les pages statiques du front.

### A2. Inscription ✅ (⚠️ vérification email)
- Page `/signup` (et `/inscription`) → `POST /api/auth/signup`.
- Serveur : valide pseudo (3–30, `A-Za-z0-9_.-`), email (normalisé en minuscules), mot de passe (8–72 octets) ; **type de compte forcé à `free`**, rôle toujours `null` ; limite 10/h/IP ; cookie de session posé.
- Données : table `users`.
- Ouvert : la page affiche encore un formulaire de carte bancaire pour Premium, mais **ces données ne sont plus envoyées** (paiement non branché). reCAPTCHA désactivé.

### A3. Vérification de l'email ❌
- Aucun envoi d'email ni endpoint de validation. Contournement actuel : `SKIP_EMAIL_VERIFICATION=true` (back) + `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true` (front).
- À faire : choisir un service d'envoi (Resend, SMTP…), jeton à usage unique, page de confirmation.

### A4. Connexion ✅
- Page `/login` → `POST /api/auth/login`.
- Serveur : 5 échecs / 15 min par (IP + email), 30 / 15 min par IP → 429 ; temps de réponse égalisé (pas d'énumération de comptes) ; cookie 7 jours renouvelé automatiquement.

### A5. Session et déconnexion ✅
- Au chargement : le front lit `localStorage.klyxy_user` (affichage seulement) ; `GET /api/auth/me` (session) rafraîchit rôle/plan.
- Toute réponse 401 d'une route protégée → le front efface l'utilisateur et renvoie vers `/login`.
- Déconnexion : `POST /api/auth/logout` efface le cookie.
- Un compte supprimé, rétrogradé ou dont le mot de passe change perd l'accès à la requête suivante.

### A6. Mot de passe oublié ❌
- Page `/forgot-password` existe ; route `password-reset` limitée à 10/h/IP mais **aucun email envoyé** : flow à finir avec A3.

### A7. Changer mot de passe / email / photo ✅
- Page `/profil` (réglages) → `PATCH /api/settings/:id/password | email | profile-picture` (soi-même uniquement).
- Mot de passe actuel exigé, 5 échecs / 15 min, validation ; après changement, session ré-émise (les autres sessions tombent).
- Photo : png/jpeg/webp/gif en base64 ≤ ~1 Mo, SVG refusé.
- Ouvert : stocker les photos en base ne tiendra pas à l'échelle (prévoir un stockage objet).

### A8. Abonnement / plan ⚠️
- `PATCH /api/settings/:id/account-type` : un utilisateur ne peut redevenir que `free` ; Premium/Premium+ → 403 `PAYMENT_REQUIRED` ; le staff peut tout changer.
- ❌ Aucun paiement (Stripe), aucune facture réelle (`/api/settings/:id/invoices` lit une table vide).
- À décider : brancher Stripe (checkout + webhook qui change le plan) avant d'ouvrir Premium.

---

## B. Visiteur / spectateur

### B1. Accueil, hero, catégories ✅
- `/` → `GET /api/hero-trailers` (public), `GET /api/categories` (public), `GET /api/videos` (public).
- Seules les vidéos **publiées** sont visibles ; jamais d'email de créateur.

### B2. Découvrir, séries, shorts ✅
- `/discover`, `/serie`, `/shorts`, `/shorts-page` : même source `GET /api/videos` (filtres côté front).

### B3. Regarder une vidéo `/watch` ⚠️
- `GET /api/videos/:id` (brouillon → 404 pour le public). Lecture via Cloudflare Stream (iframe, code client `okn3tyxjtpfexezs`).
- Ouvert important : **le contenu Premium n'est pas protégé** (n'importe qui qui connaît l'identifiant Cloudflare peut le lire). Correctif : « Require signed URLs » sur Cloudflare Stream + jeton signé généré par l'API selon le plan.
- ❌ Les vues ne sont pas comptées par les spectateurs : `POST /api/video-stats` est réservé au staff. À décider : endpoint de comptage dédié (anonyme, limité).

### B4. Ma liste `/ma-liste` ✅
- `GET/POST/DELETE /api/favorites` : connecté uniquement, sur sa propre liste ; `GET /check/:videoId` renvoie false pour un visiteur.

### B5. Mes téléchargements `/mes-telechargements` ⚠️
- Page présente ; pas de téléchargement réel géré côté serveur. À préciser (droit Premium ? Cloudflare download ?).

### B6. Pages profil `/profile`, `/profil` ⚠️
- `/profil` = réglages du compte (A7). `/profile` = page publique créateur : à vérifier qu'aucune donnée privée (email) n'est affichée.

---

## C. Dashboard (staff / créateurs) `/dashboard`

Accès : le front masque selon le rôle, **mais la vraie protection est dans l'API** (tableau en E).

### C1. Vidéos `/dashboard/videos` ✅ (⚠️ rôle créateur)
- Créer/modifier/supprimer : `POST/PATCH/DELETE /api/videos` ; liste des créateurs `GET /api/videos/creators` (contient des emails → staff).
- Upload < 200 Mo : `POST /api/videos/upload` (contrôle de rôle **avant** la lecture du fichier). Upload gros fichier : `POST /api/videos/upload-tus` (proxy vers Cloudflare, jeton Cloudflare jamais exposé) puis morceaux de 50 Mo avec cookie.
- ⚠️ Le rôle `createur` **ne peut pas** publier (réservé support/admin). À décider : un créateur gère-t-il ses propres vidéos ?

### C2. Hero et bandes-annonces `/dashboard/hero`, `/bandes-annonces` ✅
- `GET/POST/PATCH/DELETE /api/hero-trailers…`, `PUT /active` : administrateur uniquement.

### C3. Catégories `/dashboard/categories` ✅
- `PUT /api/categories/:id/thumbnails` : staff.

### C4. Utilisateurs `/dashboard/users` ✅
- Liste/stats/création/plan : staff ; suppression et changement de rôle : administrateur uniquement.
- Protections : seul un administrateur peut donner un rôle autre que `createur` ; impossible de se supprimer ; impossible de supprimer ou rétrograder le **dernier** administrateur.

### C5. Statistiques `/dashboard/analytics`, `/video-stats`, `/utm` ⚠️
- `GET /api/video-stats/platform` : staff. `/video/:id` et `/creator/:id` : connecté (un créateur ne voit que les siennes, contrôlé dans le contrôleur). UTM/analytics : à relire (collecte côté front).

### C6. Journaux `/dashboard/logs` ✅
- `GET /api/logs` : staff.

---

## D. Infrastructure (hors site)

### D1. Déploiement par `git push` ✅
- GitHub → webhook (signature HMAC) → Infra : clone, build Docker (monorepo : Dockerfile.backend / Dockerfile.frontend), **migrations SQL automatiques au démarrage du back** (échec → l'ancienne version reste en ligne), attente de santé, bascule, rollback possible.
- Un push ne reconstruit que les services dont les fichiers ont changé (watch paths).

### D2. Domaines et SSL ✅
- `klyxy.fr` (+ `www` en redirection) → front ; `api-app.klyxy.fr` → back ; Let's Encrypt automatique ; DNS GoDaddy à jour.

### D3. Base de données ⚠️
- PostgreSQL géré par l'Infra, liée au back (`DATABASE_URL`). Migrations ✅.
- ❌ Pas encore de sauvegarde planifiée. À faire : `pg_dump` quotidien hors du VPS.

### D4. Variables / secrets ⚠️
- À poser sur le back : `SESSION_SECRET` (**obligatoire**), `FRONTEND_URL`, `NODE_ENV=production`, Cloudflare, optionnel `ACCESS_CODE`. Voir `README-INFRA.md`.

---

## E. Matrice des droits (vérifiée par `server/test/security.test.mjs`, 18/18)

| Action | Visiteur | Utilisateur | Créateur | Support | Admin |
|---|---|---|---|---|---|
| Voir vidéos publiées / catégories / hero | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir brouillons, emails créateurs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ma liste, mon profil | ❌ | ✅ | ✅ | ✅ | ✅ |
| Gérer le compte d'un autre | ❌ | ❌ | ❌ | lecture / plan | ✅ |
| Créer / modifier / supprimer vidéos, catégories | ❌ | ❌ | ❌ | ✅ | ✅ |
| Hero et bandes-annonces | ❌ | ❌ | ❌ | ❌ | ✅ |
| Liste utilisateurs, stats, logs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Supprimer un utilisateur / changer un rôle | ❌ | ❌ | ❌ | ❌ | ✅ |
| Passer Premium soi-même | ❌ | ❌ | ❌ | ❌ | ❌ (staff peut l'attribuer) |

---

## F. Décisions à prendre (par ordre d'importance)

1. **Protéger le contenu Premium** (URLs signées Cloudflare).
2. **Paiement** (Stripe) : sans lui, Premium n'est attribuable que par le staff.
3. **Emails** (vérification + mot de passe oublié) : bloque l'ouverture publique.
4. **Rôle créateur** : peut-il publier ses vidéos ?
5. **Comptage des vues** par les spectateurs.
6. **Sauvegardes** de la base.
7. Photos de profil : sortir de la base.
8. Réactiver reCAPTCHA avant l'ouverture publique.
