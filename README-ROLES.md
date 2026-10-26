# Système de Rôles - KLYXY

Ce document explique le système de rôles implémenté dans l'application KLYXY.

## Rôles disponibles

Le système comprend 3 rôles :

1. **Créateur** (`createur`) - Rôle par défaut
   - Niveau de permission : 10
   - Tous les nouveaux utilisateurs ont ce rôle par défaut
   - Accès aux fonctionnalités de base de création de contenu

2. **Support** (`support`)
   - Niveau de permission : 50
   - Accès aux fonctionnalités d'administration limitées
   - Peut gérer les tickets de support, modérer le contenu

3. **Administrateur** (`administrateur`)
   - Niveau de permission : 100
   - Accès complet à toutes les fonctionnalités
   - Peut gérer les utilisateurs, modifier les rôles, accéder à toutes les données

## Installation

### 1. Exécuter le script SQL

Exécutez le script `database-roles.sql` sur votre base de données PostgreSQL :

```bash
psql -U postgres -d klyxy -f database-roles.sql
```

Ou connectez-vous à PostgreSQL et exécutez le contenu du fichier :

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'createur' 
CHECK (role IN ('createur', 'support', 'administrateur'));
```

### 2. Mettre à jour les utilisateurs existants

Les utilisateurs existants auront automatiquement le rôle `createur` grâce à la valeur par défaut.

## Utilisation

### Backend (JavaScript)

```javascript
import { isAdministrator, canAccessAdmin, hasRole } from '../lib/roles.js';

// Vérifier si un utilisateur est administrateur
if (isAdministrator(user)) {
  // Accès administrateur
}

// Vérifier si un utilisateur peut accéder à l'admin (admin ou support)
if (canAccessAdmin(user)) {
  // Accès admin
}

// Vérifier un rôle spécifique
if (hasRole(user, 'support')) {
  // Accès support
}
```

### Frontend (TypeScript)

```typescript
import { isAdministrator, canAccessAdmin, hasRole } from '@/lib/roles-client';
import { getUser } from '@/lib/auth-client';

const user = getUser();

// Vérifier si un utilisateur est administrateur
if (isAdministrator(user)) {
  // Afficher les fonctionnalités admin
}

// Vérifier si un utilisateur peut accéder à l'admin
if (canAccessAdmin(user)) {
  // Afficher le menu admin
}

// Afficher conditionnellement selon le rôle
{hasRole(user, 'administrateur') && (
  <AdminPanel />
)}
```

## Modifier le rôle d'un utilisateur

Pour modifier le rôle d'un utilisateur, vous pouvez utiliser SQL directement :

```sql
-- Promouvoir un utilisateur au rôle support
UPDATE users SET role = 'support' WHERE email = 'user@example.com';

-- Promouvoir un utilisateur au rôle administrateur
UPDATE users SET role = 'administrateur' WHERE email = 'admin@example.com';

-- Rétrograder un utilisateur au rôle créateur
UPDATE users SET role = 'createur' WHERE email = 'user@example.com';
```

## Affichage dans l'interface

Le rôle de l'utilisateur est affiché dans le menu utilisateur de la navigation :
- **Créateur** : Pas de badge (rôle par défaut)
- **Support** : Badge bleu avec "SUPPORT"
- **Administrateur** : Badge rouge avec "ADMINISTRATEUR"

## Niveaux de permission

Les rôles ont des niveaux de permission numériques :
- Créateur : 10
- Support : 50
- Administrateur : 100

Vous pouvez utiliser `getRoleLevel()` et `hasPermissionLevel()` pour vérifier les permissions basées sur les niveaux.

## Exemples d'utilisation

### Middleware de protection de route (Backend)

```javascript
import { isAdministrator } from '../lib/roles.js';

export function requireAdmin(req, res, next) {
  const user = req.user; // Supposons que l'utilisateur est attaché à la requête
  
  if (!isAdministrator(user)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  next();
}
```

### Composant React conditionnel (Frontend)

```typescript
import { canAccessAdmin } from '@/lib/roles-client';
import { getUser } from '@/lib/auth-client';

export function AdminButton() {
  const user = getUser();
  
  if (!canAccessAdmin(user)) {
    return null;
  }
  
  return <button>Panel Admin</button>;
}
```

## Sécurité

⚠️ **Important** : Les vérifications de rôles côté frontend sont uniquement pour l'affichage. Toujours vérifier les permissions côté backend pour la sécurité.

Les rôles sont stockés dans la base de données et vérifiés à chaque requête API importante.

