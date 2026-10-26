// Client pour les analytiques dashboard (stats utilisateurs + plateforme)
import { getUser } from './auth-client';
import { getBackendUrl } from './utils';

export interface UsersStats {
  total: number;
  premium: number;
  free: number;
  withRole: number;
  monthlyUsers: number[];
  monthlyLabels: string[];
}

export interface PlatformStats {
  totalVideos: number;
  publishedVideos: number;
  totalViews: number;
  totalRevenue: number;
  monthlyViews: number[];
  monthlyRevenue: number[];
  monthlyLabels: string[];
}

function authHeaders(): Record<string, string> {
  const user = getUser();
  return {
    'Content-Type': 'application/json',
    ...(user
      ? {
          'x-user-id': user.id.toString(),
          'x-user-role': user.role || '',
        }
      : {}),
  };
}

export async function getUsersStats(): Promise<{
  success: boolean;
  stats?: UsersStats;
  error?: string;
}> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/users/stats`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Erreur' };
    return {
      success: true,
      stats: {
        total: data.stats?.total ?? 0,
        premium: data.stats?.premium ?? 0,
        free: data.stats?.free ?? 0,
        withRole: data.stats?.withRole ?? 0,
        monthlyUsers: data.stats?.monthlyUsers ?? [],
        monthlyLabels: data.stats?.monthlyLabels ?? [],
      },
    };
  } catch (e) {
    console.error('getUsersStats', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erreur réseau',
    };
  }
}

export async function getPlatformStats(): Promise<{
  success: boolean;
  stats?: PlatformStats;
  error?: string;
}> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/video-stats/platform`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Erreur' };
    return {
      success: true,
      stats: {
        totalVideos: data.stats?.totalVideos ?? 0,
        publishedVideos: data.stats?.publishedVideos ?? 0,
        totalViews: data.stats?.totalViews ?? 0,
        totalRevenue: data.stats?.totalRevenue ?? 0,
        monthlyViews: data.stats?.monthlyViews ?? [],
        monthlyRevenue: data.stats?.monthlyRevenue ?? [],
        monthlyLabels: data.stats?.monthlyLabels ?? [],
      },
    };
  } catch (e) {
    console.error('getPlatformStats', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Erreur réseau',
    };
  }
}
