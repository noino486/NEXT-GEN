// Frontend Logic - Role management utilities (TypeScript ONLY)

import { User, UserRole } from './auth-client';

/**
 * Rôles disponibles dans le système
 */
export const ROLES = {
  CREATEUR: 'createur' as const,
  SUPPORT: 'support' as const,
  ADMINISTRATEUR: 'administrateur' as const,
} as const;

/**
 * Vérifier si un utilisateur a un rôle spécifique
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @param {UserRole} role - Rôle à vérifier
 * @returns {boolean} - true si l'utilisateur a le rôle
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role === role;
}

/**
 * Vérifier si un utilisateur a un rôle assigné
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur a un rôle assigné
 */
export function hasAnyRoleAssigned(user: User | null): boolean {
  return user !== null && user.role !== null;
}

/**
 * Vérifier si un utilisateur a l'un des rôles spécifiés
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @param {UserRole[]} roles - Tableau de rôles à vérifier
 * @returns {boolean} - true si l'utilisateur a l'un des rôles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.role) {
    return false;
  }
  return roles.includes(user.role);
}

/**
 * Vérifier si un utilisateur est administrateur
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur est administrateur
 */
export function isAdministrator(user: User | null): boolean {
  return hasRole(user, ROLES.ADMINISTRATEUR);
}

/**
 * Vérifier si un utilisateur est support
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur est support
 */
export function isSupport(user: User | null): boolean {
  return hasRole(user, ROLES.SUPPORT);
}

/**
 * Vérifier si un utilisateur est créateur
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur est créateur
 */
export function isCreateur(user: User | null): boolean {
  return hasRole(user, ROLES.CREATEUR);
}

/**
 * Vérifier si un utilisateur peut accéder aux fonctionnalités d'administration
 * (administrateur ou support)
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur peut accéder
 */
export function canAccessAdmin(user: User | null): boolean {
  return hasAnyRole(user, [ROLES.ADMINISTRATEUR, ROLES.SUPPORT]);
}

/**
 * Vérifier si un utilisateur peut accéder au dashboard principal
 * (uniquement administrateur)
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur peut accéder
 */
export function canAccessDashboard(user: User | null): boolean {
  return isAdministrator(user);
}

/**
 * Vérifier si un utilisateur peut gérer les utilisateurs
 * (administrateur ou support)
 * @param {User | null} user - Objet utilisateur avec la propriété role
 * @returns {boolean} - true si l'utilisateur peut gérer les utilisateurs
 */
export function canManageUsers(user: User | null): boolean {
  return hasAnyRole(user, [ROLES.ADMINISTRATEUR, ROLES.SUPPORT]);
}

/**
 * Obtenir le niveau de permission d'un rôle (plus le nombre est élevé, plus les permissions sont importantes)
 * @param {UserRole} role - Rôle à évaluer
 * @returns {number} - Niveau de permission (0-100)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    [ROLES.CREATEUR]: 10,
    [ROLES.SUPPORT]: 50,
    [ROLES.ADMINISTRATEUR]: 100,
  };
  return levels[role] || 0;
}

/**
 * Obtenir le nom d'affichage d'un rôle
 * @param {UserRole} role - Rôle à afficher
 * @returns {string} - Nom d'affichage du rôle
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    [ROLES.CREATEUR]: 'Créateur',
    [ROLES.SUPPORT]: 'Support',
    [ROLES.ADMINISTRATEUR]: 'Administrateur',
  };
  return names[role] || role;
}

