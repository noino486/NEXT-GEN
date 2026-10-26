# Mise à jour du système de rôles

## Changement important

**Les nouveaux utilisateurs n'ont PLUS automatiquement le rôle "createur".**

Le rôle doit maintenant être **assigné manuellement** par un administrateur.

## Migration

Si vous avez déjà exécuté l'ancien script `database-roles.sql`, vous devez mettre à jour la base de données :

```sql
-- Retirer la valeur par défaut 'createur'
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Les utilisateurs existants gardent leur rôle
-- Les nouveaux utilisateurs auront role = NULL
```

## Assignation des rôles

Pour assigner un rôle à un utilisateur, utilisez SQL :

```sql
-- Assigner le rôle createur
UPDATE users SET role = 'createur' WHERE email = 'user@example.com';

-- Assigner le rôle support
UPDATE users SET role = 'support' WHERE email = 'user@example.com';

-- Assigner le rôle administrateur
UPDATE users SET role = 'administrateur' WHERE email = 'user@example.com';

-- Retirer un rôle (mettre à NULL)
UPDATE users SET role = NULL WHERE email = 'user@example.com';
```

## Vérifier les utilisateurs sans rôle

```sql
-- Liste des utilisateurs sans rôle
SELECT id, username, email, account_type, created_at 
FROM users 
WHERE role IS NULL;
```

## Comportement

- **Nouveaux utilisateurs** : `role = NULL` (aucun rôle)
- **Utilisateurs existants** : Conservent leur rôle actuel
- **Interface** : Les utilisateurs sans rôle verront "Aucun rôle" en mode développement
- **Badges** : Seuls les rôles `support` et `administrateur` affichent un badge coloré

## Prochaines étapes

Créer une interface d'administration pour assigner les rôles via l'interface utilisateur (au lieu de SQL).

