# Configuration reCAPTCHA

Ce guide explique comment configurer Google reCAPTCHA v2 pour la création de comptes sur KLYXY.

## Étapes de configuration

### 1. Obtenir les clés reCAPTCHA

1. Allez sur [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Cliquez sur "Créer" pour créer un nouveau site
3. Remplissez le formulaire :
   - **Label** : KLYXY (ou le nom de votre choix)
   - **Type de reCAPTCHA** : reCAPTCHA v2 → "Je ne suis pas un robot"
   - **Domaines** : Ajoutez vos domaines (ex: `localhost`, `klyxy.com`)
4. Acceptez les conditions d'utilisation
5. Cliquez sur "Envoyer"
6. Vous obtiendrez deux clés :
   - **Clé de site** (Site Key) - à utiliser côté frontend
   - **Clé secrète** (Secret Key) - à utiliser côté backend

### 2. Configuration des variables d'environnement

#### Frontend (`.env.local` à la racine du projet)

Ajoutez la clé de site (publique) :

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_de_site_ici
```

#### Backend (`.env.local` à la racine du projet)

Ajoutez la clé secrète :

```env
RECAPTCHA_SECRET_KEY=votre_clé_secrète_ici
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_clé_de_site_ici
```

### 3. Mode développement

Si les clés ne sont pas configurées, le système fonctionnera en mode développement :
- Le CAPTCHA ne s'affichera pas côté frontend
- La validation sera bypassée côté backend
- Un avertissement sera loggé dans la console

⚠️ **Important** : En production, vous DEVEZ configurer les clés pour activer la protection reCAPTCHA.

## Fonctionnement

1. **Frontend** : Le composant `ReCaptcha` charge le script Google et affiche le widget
2. **Utilisateur** : Coche la case "Je ne suis pas un robot"
3. **Frontend** : Récupère le token et l'envoie avec les données d'inscription
4. **Backend** : Valide le token avec l'API Google avant de créer le compte
5. **Résultat** : Si la validation échoue, l'inscription est refusée

## Test

Pour tester en local :
1. Ajoutez `localhost` dans les domaines autorisés sur Google reCAPTCHA
2. Configurez les clés dans `.env.local`
3. Redémarrez les serveurs frontend et backend
4. Essayez de créer un compte - le CAPTCHA devrait apparaître

## Dépannage

### Le CAPTCHA ne s'affiche pas
- Vérifiez que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` est bien configurée
- Vérifiez que `localhost` est dans les domaines autorisés
- Vérifiez la console du navigateur pour les erreurs

### Erreur "Échec de la vérification CAPTCHA"
- Vérifiez que `RECAPTCHA_SECRET_KEY` est bien configurée côté backend
- Vérifiez que les clés correspondent (même projet reCAPTCHA)
- Vérifiez les logs du serveur backend pour plus de détails

## Sécurité

- ⚠️ Ne commitez JAMAIS les clés dans le dépôt Git
- ✅ Utilisez `.env.local` qui est dans `.gitignore`
- ✅ En production, utilisez les variables d'environnement de votre hébergeur
- ✅ La clé secrète ne doit JAMAIS être exposée côté client

