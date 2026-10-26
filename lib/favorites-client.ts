// Frontend Logic - Favorites (Ma Liste) client utilities
import { getUser } from './auth-client';
import type { Video } from './videos-client';
import { getBackendUrl } from './utils';

async function handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    return { success: false, error: text || 'Erreur serveur' };
  }
  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error || 'Erreur' };
  }
  return { success: true, data: data as T };
}

export async function getFavorites(): Promise<{ success: boolean; videos?: Video[]; error?: string }> {
  const user = getUser();
  if (!user) return { success: false, error: 'Connectez-vous pour voir votre liste' };

  try {
    const response = await fetch(`${getBackendUrl()}/api/favorites`, {
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const result = await handleResponse<{ videos: Video[] }>(response);
    if (result.success && result.data) {
      return { success: true, videos: result.data.videos };
    }
    return { success: false, error: result.error };
  } catch (e) {
    console.error('getFavorites:', e);
    return { success: false, error: 'Erreur lors du chargement' };
  }
}

export async function isFavorite(videoId: number): Promise<{ success: boolean; isFavorite?: boolean }> {
  const user = getUser();
  if (!user) return { success: true, isFavorite: false };

  try {
    const response = await fetch(`${getBackendUrl()}/api/favorites/check/${videoId}`, {
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const result = await handleResponse<{ isFavorite: boolean }>(response);
    if (result.success && result.data) return { success: true, isFavorite: result.data.isFavorite };
    return { success: false, isFavorite: false };
  } catch (e) {
    return { success: false, isFavorite: false };
  }
}

export async function addFavorite(videoId: number): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  if (!user) return { success: false, error: 'Connectez-vous pour ajouter à votre liste' };

  try {
    const response = await fetch(`${getBackendUrl()}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify({ videoId }),
    });
    const result = await handleResponse<{ message: string }>(response);
    return { success: !!result.success, error: result.error };
  } catch (e) {
    console.error('addFavorite:', e);
    return { success: false, error: 'Erreur lors de l\'ajout' };
  }
}

export async function removeFavorite(videoId: number): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  if (!user) return { success: false, error: 'Utilisateur non connecté' };

  try {
    const response = await fetch(`${getBackendUrl()}/api/favorites/${videoId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const result = await handleResponse<{ message: string }>(response);
    return { success: !!result.success, error: result.error };
  } catch (e) {
    console.error('removeFavorite:', e);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
