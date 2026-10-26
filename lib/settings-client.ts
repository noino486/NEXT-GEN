// Frontend Logic - Client-side settings utilities (TypeScript ONLY)
// This file contains client-side only functions for settings management

import { getUser } from './auth-client';
import { getBackendUrl } from './utils';

/**
 * Fonction utilitaire pour gérer les réponses API
 * Vérifie le Content-Type et gère les erreurs de manière cohérente
 */
async function handleApiResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  // Vérifier le Content-Type avant de parser
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Réponse non-JSON reçue:', text.substring(0, 200));
    return {
      success: false,
      error: `Erreur serveur: Le backend ne répond pas correctement. Vérifiez que le serveur backend est démarré sur ${getBackendUrl() || 'l\'origine actuelle'}`
    };
  }

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'Erreur lors de la requête'
    };
  }

  return {
    success: true,
    data: data as T
  };
}

/**
 * Fonction utilitaire pour gérer les erreurs de manière cohérente
 */
function handleError(error: unknown, defaultMessage: string): { success: false; error: string } {
  console.error(`❌ ${defaultMessage}:`, error);
  
  if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
    return {
      success: false,
      error: `Impossible de se connecter au serveur backend (${getBackendUrl() || 'l\'origine actuelle'}). Vérifiez que le serveur backend est démarré.`
    };
  }
  
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return {
      success: false,
      error: `Le serveur backend ne répond pas correctement. Vérifiez que le serveur est démarré sur ${getBackendUrl() || 'l\'origine actuelle'}`
    };
  }
  
  return {
    success: false,
    error: defaultMessage
  };
}

/**
 * Interface pour les paramètres utilisateur
 */
export interface UserSettings {
  id: number;
  username: string;
  email: string;
  accountType: 'free' | 'premium' | 'premium_plus';
  role: string | null;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour les factures
 */
export interface Invoice {
  id: number;
  user_id: number;
  amount: number;
  status: string;
  created_at: string;
  description: string | null;
}

/**
 * Récupérer les paramètres de l'utilisateur actuel
 */
export async function getCurrentUserSettings(): Promise<{ success: boolean; user?: UserSettings; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const result = await handleApiResponse<{ user: UserSettings }>(response);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la récupération des paramètres'
      };
    }

    return {
      success: true,
      user: result.data?.user
    };
  } catch (error) {
    return handleError(error, 'Erreur de connexion. Veuillez réessayer.');
  }
}

/**
 * Mettre à jour le mot de passe
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const result = await handleApiResponse<{ message: string }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour du mot de passe'
      };
    }

    return {
      success: true,
      message: result.data?.message || 'Mot de passe mis à jour avec succès'
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la mise à jour du mot de passe.');
  }
}

/**
 * Demander la réinitialisation du mot de passe par email
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/settings/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await handleApiResponse<{ message: string }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la demande de réinitialisation'
      };
    }

    return {
      success: true,
      message: result.data?.message || 'Si cet email existe, un lien de réinitialisation a été envoyé'
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la demande de réinitialisation.');
  }
}

/**
 * Mettre à jour la photo de profil
 */
export async function updateProfilePicture(
  profilePicture: string // Base64 string
): Promise<{ success: boolean; message?: string; profilePicture?: string; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}/profile-picture`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify({
        profilePicture
      })
    });

    const result = await handleApiResponse<{ message: string; profilePicture: string }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour de la photo de profil'
      };
    }

    return {
      success: true,
      message: result.data?.message || 'Photo de profil mise à jour avec succès',
      profilePicture: result.data?.profilePicture
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la mise à jour de la photo de profil.');
  }
}

/**
 * Mettre à jour l'email
 */
export async function updateEmail(
  newEmail: string,
  password: string
): Promise<{ success: boolean; message?: string; email?: string; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}/email`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify({
        newEmail,
        password
      })
    });

    const result = await handleApiResponse<{ message: string; email: string }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour de l\'email'
      };
    }

    return {
      success: true,
      message: result.data?.message || 'Email mis à jour avec succès',
      email: result.data?.email
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la mise à jour de l\'email.');
  }
}

/**
 * Mettre à jour le type d'abonnement
 */
export async function updateAccountType(
  accountType: 'free' | 'premium' | 'premium_plus'
): Promise<{ success: boolean; message?: string; accountType?: string; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}/account-type`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify({
        accountType
      })
    });

    const result = await handleApiResponse<{ message: string; accountType: string }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la mise à jour du type de compte'
      };
    }

    return {
      success: true,
      message: result.data?.message || 'Type de compte mis à jour avec succès',
      accountType: result.data?.accountType
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la mise à jour du type de compte.');
  }
}

/**
 * Récupérer les factures de l'utilisateur
 */
export async function getUserInvoices(): Promise<{ success: boolean; invoices?: Invoice[]; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non connecté'
      };
    }

    const response = await fetch(`${getBackendUrl()}/api/settings/${currentUser.id}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const result = await handleApiResponse<{ invoices: Invoice[] }>(response);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la récupération des factures'
      };
    }

    return {
      success: true,
      invoices: result.data?.invoices || []
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération des factures.');
  }
}

