# Guide de dépannage

## Problème : Erreur ECONNREFUSED PostgreSQL

### Symptômes
```
code: 'ECONNREFUSED',
address: '::1',
port: 5432
```

### Solutions

1. **Utiliser 127.0.0.1 au lieu de localhost**
   - Dans `server/.env`, utilisez `DB_HOST=127.0.0.1` au lieu de `DB_HOST=localhost`
   - Cela force l'utilisation d'IPv4 au lieu d'IPv6

2. **Vérifier que PostgreSQL est lancé**
   ```bash
   # Sur Linux
   sudo systemctl status postgresql
   
   # Sur Windows
   # Vérifiez dans les services Windows
   ```

3. **Vérifier que PostgreSQL écoute sur le bon port**
   - Par défaut : port 5432
   - Vérifiez dans `postgresql.conf` : `port = 5432`

4. **Vérifier les identifiants**
   - Assurez-vous que `DB_USER` et `DB_PASSWORD` dans `server/.env` sont corrects

5. **Vérifier que la base de données existe**
   ```sql
   -- Connectez-vous à PostgreSQL
   psql -U postgres
   
   -- Liste les bases de données
   \l
   
   -- Si klyxy n'existe pas, créez-la
   CREATE DATABASE klyxy;
   ```

---

## Problème : Erreur 401 Unauthorized lors de la connexion

Si vous obtenez une erreur 401 (Unauthorized) lors de la tentative de connexion, voici les étapes de dépannage :

## 1. Vérifier que le serveur backend est lancé

Assurez-vous que le serveur backend tourne sur le port 3001 :

```bash
npm run dev:backend
```

Vous devriez voir :
```
🚀 Backend server running on http://localhost:3001
✅ Connexion PostgreSQL établie
```

## 2. Vérifier la connexion à la base de données

Le serveur backend doit pouvoir se connecter à PostgreSQL. Vérifiez :

- Que PostgreSQL est lancé
- Que le fichier `.env` dans `server/` contient les bonnes informations :
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=klyxy
  DB_USER=postgres
  DB_PASSWORD=votre_mot_de_passe
  ```

## 3. Vérifier que l'utilisateur existe dans la base de données

Connectez-vous à PostgreSQL et vérifiez :

```sql
SELECT id, username, email, account_type FROM users;
```

Si aucun utilisateur n'existe, créez-en un via la page d'inscription (`/signup`).

## 4. Vérifier les logs du serveur backend

Quand vous essayez de vous connecter, vous devriez voir dans la console du serveur backend :

```
📥 POST /api/auth/login { email: '...', password: '...' }
🔐 Tentative de connexion pour: ...
🔍 Recherche de l'utilisateur dans la DB...
```

Ces logs vous indiqueront :
- Si la requête arrive bien au serveur
- Si l'utilisateur est trouvé dans la DB
- Si le mot de passe est valide

## 5. Vérifier les logs du navigateur

Ouvrez la console du navigateur (F12) et vérifiez :

```
📡 Appel API login vers: http://localhost:3001/api/auth/login
📥 Réponse reçue - Status: 401
📥 Données reçues: { error: '...' }
```

## 6. Causes possibles de l'erreur 401

### A. Utilisateur n'existe pas
- **Solution** : Créez un compte via `/signup` ou vérifiez que l'email est correct

### B. Mot de passe incorrect
- **Solution** : Vérifiez que vous utilisez le bon mot de passe. Si vous avez oublié, vous devrez créer un nouveau compte ou réinitialiser le mot de passe.

### C. Problème de connexion à la base de données
- **Solution** : Vérifiez que PostgreSQL est lancé et que les identifiants dans `.env` sont corrects

### D. Problème avec le hashage du mot de passe
- **Solution** : Si vous avez créé un compte avant la séparation backend/frontend, le mot de passe pourrait ne pas être correctement hashé. Créez un nouveau compte.

## 7. Test de l'API directement

Vous pouvez tester l'API directement avec curl ou Postman :

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"votre@email.com","password":"votre_mot_de_passe"}'
```

## 8. Vérifier la configuration CORS

Si vous voyez des erreurs CORS dans la console, vérifiez que `FRONTEND_URL` dans `server/.env` correspond à l'URL de votre frontend.

## 9. Réinitialiser la base de données (si nécessaire)

Si rien ne fonctionne, vous pouvez réinitialiser la table users :

```sql
DROP TABLE IF EXISTS users;
-- Puis recréer la table avec database.sql
```

Ensuite, créez un nouveau compte via `/signup`.

