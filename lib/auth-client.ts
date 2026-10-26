// Frontend Logic - Client-side authentication utilities (TypeScript ONLY)
// This file contains client-side only functions for authentication
// DO NOT import this in server components or API routes

/**
 * Rôles disponibles dans le système
 */
export type UserRole = 'createur' | 'support' | 'administrateur';

/**
 * Interface pour les données utilisateur
 */
export interface User {
  id: number;
  username: string;
  email: string;
  accountType: 'free' | 'premium' | 'premium_plus';
  role: UserRole | null; // null si aucun rôle assigné
  emailVerified?: boolean; // Indique si l'email a été vérifié
}

/**
 * Stocker les informations de l'utilisateur dans localStorage
 * @param {User} user - Données utilisateur
 */
export function setUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('klyxy_user', JSON.stringify(user));
  }
}

/**
 * Récupérer les informations de l'utilisateur depuis localStorage
 * En mode dev, emailVerified est forcé à true (pas de vérification email requise).
 */
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('klyxy_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        const skipVerification = process.env.NODE_ENV === 'development'
          || process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === '1'
          || process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true';
        if (skipVerification && user) {
          return { ...user, emailVerified: true };
        }
        return user;
      } catch (e) {
        console.error('Erreur lors de la lecture des données utilisateur:', e);
        return null;
      }
    }
  }
  return null;
}

/**
 * Supprimer les informations de l'utilisateur (déconnexion)
 */
export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('klyxy_user');
    // Invalide aussi le cookie de session côté serveur (HttpOnly : seul le serveur peut l'effacer)
    void fetch(`${getBackendUrl()}/api/auth/logout`, { method: 'POST' }).catch(() => {});
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 * @returns {boolean} - true si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

import { getBackendUrl } from './utils';

/**
 * Appel API pour se connecter
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const url = `${getBackendUrl()}/api/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw jsonError;
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la connexion',
      };
    }

    // Le rôle peut être null si non assigné
    const userData: User = {
      ...data.user,
      role: data.user?.role || null,
      emailVerified: data.user?.emailVerified ?? data.user?.email_verified ?? false
    };

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return {
      success: false,
      error: 'Erreur de connexion. Veuillez réessayer.',
    };
  }
}

/**
 * Appel API pour créer un compte
 * @param {Object} signupData - Données d'inscription
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function signupUser(signupData: {
  username: string;
  email: string;
  password: string;
  accountType: 'free' | 'premium' | 'premium_plus';
  paymentData?: any;
  recaptchaToken?: string | null;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la création du compte',
      };
    }

    // Le rôle sera null pour les nouveaux utilisateurs (assigné manuellement plus tard)
    const userData: User = {
      ...data.user,
      role: data.user?.role || null,
      emailVerified: data.user?.emailVerified ?? data.user?.email_verified ?? false
    };

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return {
      success: false,
      error: 'Erreur de connexion. Veuillez réessayer.',
    };
  }
}

/**
 * Appel API pour vérifier la session (à implémenter si nécessaire)
 * @returns {Promise<{success: boolean, user?: User}>}
 */
export async function checkSession(): Promise<{ success: boolean; user?: User }> {
  // TODO: Implémenter une route API pour vérifier la session
  // Pour l'instant, on utilise uniquement localStorage
  const user = getUser();
  return {
    success: user !== null,
    user: user || undefined,
  };
}

/**
 * Forcer la mise à jour de l'utilisateur depuis le backend
 * Utile pour récupérer le rôle mis à jour sans se déconnecter
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function refreshUser(): Promise<{ success: boolean; user?: User; error?: string }> {
  const currentUser = getUser();
  if (!currentUser) {
    return {
      success: false,
      error: 'Aucun utilisateur connecté',
    };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour',
      };
    }

    if (data.user) {
      setUser(data.user);
      return {
        success: true,
        user: data.user,
      };
    }

    return {
      success: false,
      error: 'Données utilisateur non trouvées',
    };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    return {
      success: false,
      error: 'Erreur lors de la mise à jour',
    };
  }
}
