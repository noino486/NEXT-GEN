// Frontend Logic - Client-side video statistics utilities (TypeScript ONLY)
import { getUser } from './auth-client';
import { getBackendUrl } from './utils';

export interface VideoStats {
  date: string;
  views: number;
  unique_views: number;
  watch_time_seconds: number;
  revenue: number;
  favorites: number;
  comments: number;
  shares: number;
}

export interface TotalStats {
  total_views: number;
  total_unique_views: number;
  total_watch_time: number;
  total_revenue: number;
  total_favorites: number;
  total_comments: number;
  total_shares: number;
  days_tracked: number;
  avg_views_per_day: number;
  avg_revenue_per_day: number;
  avg_watch_time_per_view: number;
}

export interface VideoStatItem {
  id: number;
  title: string;
  thumbnail?: string;
  category: string;
  status: string;
  total_views: number;
  total_unique_views: number;
  total_watch_time: number;
  total_revenue: number;
  total_favorites: number;
  total_comments: number;
  total_shares: number;
  days_tracked: number;
}

export interface PeriodStat {
  date: string;
  views: number;
  revenue: number;
}

export interface CreatorStats {
  globalStats: {
    total_videos: number;
    total_views: number;
    total_unique_views: number;
    total_watch_time: number;
    total_revenue: number;
    total_favorites: number;
    total_comments: number;
    total_shares: number;
  };
  videoStats: VideoStatItem[];
  periodStats: PeriodStat[];
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Réponse non-JSON reçue:', text.substring(0, 200));
    return {
      success: false,
      error: `Erreur serveur: Le backend ne répond pas correctement. Vérifiez que le serveur backend est démarré sur ${getBackendUrl()}`
    };
  }

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'Erreur inconnue'
    };
  }
  return { success: true, data };
}

// Helper function to handle fetch errors
function handleError(error: unknown, defaultMessage: string): { success: false; error: string } {
  console.error('❌ Erreur:', error);
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      error: `Impossible de se connecter au serveur backend (${getBackendUrl()}). Vérifiez que le serveur est démarré.`
    };
  }
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return {
      success: false,
      error: `Erreur de parsing JSON: Le serveur backend ne répond pas avec un format JSON valide. Vérifiez le serveur sur ${getBackendUrl()}.`
    };
  }
  return { success: false, error: defaultMessage };
}

/**
 * Récupérer les statistiques d'une vidéo spécifique
 */
export async function getVideoStats(
  videoId: number,
  period: '7' | '30' | '90' | 'all' = '30'
): Promise<{
  success: boolean;
  video?: { id: number; title: string };
  dailyStats?: VideoStats[];
  totalStats?: TotalStats;
  error?: string;
}> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(
      `${getBackendUrl()}/api/video-stats/video/${videoId}?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUser.id ?? ''),
          'x-user-role': currentUser.role ?? ''
        }
      }
    );

    const { success, data, error } = await handleApiResponse<{
      video: { id: number; title: string };
      dailyStats: VideoStats[];
      totalStats: TotalStats;
    }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la récupération des statistiques' };

    return {
      success: true,
      video: data?.video,
      dailyStats: data?.dailyStats,
      totalStats: data?.totalStats
    };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération des statistiques');
  }
}

/**
 * Récupérer toutes les statistiques d'un créateur
 */
export async function getCreatorVideoStats(
  creatorId: number,
  period: '7' | '30' | '90' | 'all' = '30'
): Promise<{ success: boolean; stats?: CreatorStats; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(
      `${getBackendUrl()}/api/video-stats/creator/${creatorId}?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUser.id ?? ''),
          'x-user-role': currentUser.role ?? ''
        }
      }
    );

    const { success, data, error } = await handleApiResponse<CreatorStats>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la récupération des statistiques' };

    return { success: true, stats: data };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération des statistiques');
  }
}

