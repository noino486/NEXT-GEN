// Frontend Logic - Client-side videos utilities (TypeScript ONLY)
import { getUser } from './auth-client';
import { getBackendUrl } from './utils';
import { ACCESS_CODE_HEADER, getAccessCode, isBackendUrl } from './access-code';
import { IS_DEMO, DEMO_VIDEOS } from './demo-data';

export type VideoCategorySlug =
  | 'featured' | 'popular' | 'latest' | 'selection' | 'shorts' | 'series'
  | 'rap_musique' | 'sport' | 'influences' | 'inside' | 'podcast' | 'vlog'
  | 'humour' | 'mode' | 'gossip' | 'tele_realite' | 'fastlife' | 'lifestyle';

export interface Video {
  id: number;
  title: string;
  description?: string;
  cloudflare_stream_id?: string;
  thumbnail?: string;
  /** Miniature 9:16 pour la section Top 10 (affichée dans le carousel Top 10) */
  thumbnail_top10?: string;
  creator_id: number;
  creator_username?: string;
  creator_email?: string;
  category: VideoCategorySlug;
  /** Liste des catégories où la vidéo apparaît (multi-catégories). Si absent, on utilise category. */
  categories?: string[];
  badge?: string;
  is_top_10: boolean;
  rank?: number;
  duration?: string;
  published_at?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  /** Cette vidéo est affichée en hero sur l'accueil (depuis publish/edit) */
  is_hero?: boolean;
  /** Hero : "thumbnail" = miniature de la vidéo, "trailer" = bande annonce uploadée */
  hero_display?: 'thumbnail' | 'trailer';
  /** ID Cloudflare Stream de la bande annonce (si hero_display === 'trailer') */
  hero_trailer_stream_id?: string | null;
}

export interface Creator {
  id: number;
  username: string;
  email: string;
  role?: string;
  created_at: string;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  cloudflare_stream_id?: string;
  thumbnail?: string;
  /** Miniature 9:16 pour la section Top 10 (requise si rank 1-10) */
  thumbnail_top10?: string;
  creator_id: number;
  category: VideoCategorySlug;
  /** Plusieurs catégories possibles ; si fourni, category = categories[0] côté backend. */
  categories?: string[];
  badge?: string;
  is_top_10?: boolean;
  rank?: number;
  duration?: string;
  published_at?: string;
  status?: 'draft' | 'published' | 'archived';
  /** Afficher cette vidéo en hero sur l'accueil */
  is_hero?: boolean;
  /** Hero : "thumbnail" = miniature, "trailer" = bande annonce */
  hero_display?: 'thumbnail' | 'trailer';
  /** ID Cloudflare Stream de la bande annonce (si hero_display === 'trailer') */
  hero_trailer_stream_id?: string | null;
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

/** Seuil (octets) au-delà duquel on utilise l'upload TUS resumable (Cloudflare recommande > 200 Mo). */
export const TUS_UPLOAD_SIZE_THRESHOLD = 200 * 1024 * 1024;

/**
 * Upload TUS resumable vers Cloudflare Stream (fichiers > 200 Mo).
 * Utilise le proxy backend /api/videos/upload-tus pour ne pas exposer l'API token.
 * Retourne le videoId (stream-media-id). La durée n'est pas disponible immédiatement après TUS.
 */
export async function uploadVideoToCloudflareTus(
  file: File,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void
): Promise<{ success: boolean; videoId?: string; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Upload TUS disponible uniquement dans le navigateur.' };
  }

  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Import dynamique du build navigateur (évite Node/XMLHttpRequest manquant en SSR)
    const tus = await import('tus-js-client/lib/browser/index.js');
    let mediaId: string | null = null;

    return new Promise((resolve) => {
      const upload = new tus.Upload(file, {
        endpoint: `${getBackendUrl()}/api/videos/upload-tus`,
        headers: {
          'x-user-id': currentUser.id.toString(),
          'x-user-role': currentUser.role || ''
        },
        // Le code d'accès ne part que vers notre API (les morceaux vont ensuite à Cloudflare)
        onBeforeRequest: (req: { getURL: () => string; setHeader: (name: string, value: string) => void; getUnderlyingObject?: () => unknown }) => {
          if (!isBackendUrl(req.getURL())) return;
          const accessCode = getAccessCode();
          if (accessCode) req.setHeader(ACCESS_CODE_HEADER, accessCode);
          // Cookie de session vers l'API (le XHR de tus ne passe pas par fetch)
          const xhr = req.getUnderlyingObject?.();
          if (xhr && typeof xhr === 'object' && 'withCredentials' in xhr) {
            (xhr as XMLHttpRequest).withCredentials = true;
          }
        },
        chunkSize: 50 * 1024 * 1024, // 50 MB (recommandé Cloudflare)
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          name: file.name,
          filetype: file.type
        },
        uploadSize: file.size,
        onError: (err: unknown) => {
          console.error('❌ Upload TUS:', err);
          resolve({
            success: false,
            error: (err as Error)?.message || 'Erreur lors de l\'upload TUS.'
          });
        },
        onProgress: (bytesUploaded: number, bytesTotal: number) => {
          onProgress?.(bytesUploaded, bytesTotal);
        },
        onSuccess: () => {
          resolve({
            success: true,
            videoId: mediaId || undefined
          });
        },
        onAfterResponse: (req: unknown, res: unknown) => {
          if (!res) return;
          const getHeader =
            typeof (res as { getResponseHeader?: (name: string) => string | null }).getResponseHeader === 'function'
              ? (name: string) => (res as { getResponseHeader: (name: string) => string | null }).getResponseHeader(name)
              : (res as { getHeader?: (n: string) => string | null })?.getHeader;
          const id = getHeader ? (getHeader('Stream-Media-Id') || getHeader('stream-media-id')) : null;
          if (id) mediaId = id;
        }
      });

      upload.start();
    });
  } catch (error) {
    console.error('❌ Erreur upload TUS:', error);
    return {
      success: false,
      error: (error as Error)?.message || 'Erreur lors de l\'upload TUS.'
    };
  }
}

/**
 * Uploader une vidéo vers Cloudflare Stream via le backend.
 * Retourne le videoId (cloudflare_stream_id) et la durée si disponible.
 * Pour les fichiers > 200 Mo, utiliser uploadVideoToCloudflareTus.
 */
export async function uploadVideoToCloudflare(
  file: File
): Promise<{ success: boolean; videoId?: string; duration?: string; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${getBackendUrl()}/api/videos/upload`, {
      method: 'POST',
      headers: {
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: formData
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        error: text || 'Erreur lors de l\'upload'
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || 'Erreur lors de l\'upload'
      };
    }

    return {
      success: true,
      videoId: data.videoId,
      duration: data.duration ?? undefined
    };
  } catch (error) {
    console.error('❌ Erreur upload vidéo:', error);
    return handleError(error, 'Erreur lors de l\'upload de la vidéo');
  }
}

/**
 * Récupérer tous les créateurs
 */
export async function getCreators(): Promise<{ success: boolean; creators?: Creator[]; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(`${getBackendUrl()}/api/videos/creators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const { success, data, error } = await handleApiResponse<{ creators: Creator[] }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la récupération des créateurs' };

    return { success: true, creators: data?.creators };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération des créateurs');
  }
}

/**
 * Créer une nouvelle vidéo
 */
export async function createVideo(videoData: CreateVideoData): Promise<{ success: boolean; video?: Video; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(`${getBackendUrl()}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify(videoData)
    });

    const { success, data, error } = await handleApiResponse<{ video: Video }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la création de la vidéo' };

    return { success: true, video: data?.video };
  } catch (error) {
    return handleError(error, 'Erreur lors de la création de la vidéo');
  }
}

/** Limite par défaut pour les listes vidéo (réduit le temps de chargement) */
const VIDEOS_LIST_LIMIT = 50

/**
 * Récupérer toutes les vidéos (utilisateur connecté, dashboard)
 * limit + light recommandés pour listes (rapidité).
 */
export async function getAllVideos(filters?: {
  category?: string;
  status?: string;
  creator_id?: number;
  limit?: number;
  light?: boolean;
}): Promise<{ success: boolean; videos?: Video[]; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.creator_id) queryParams.append('creator_id', filters.creator_id.toString());
    queryParams.set('limit', String(filters?.limit ?? VIDEOS_LIST_LIMIT));
    if (filters?.light) queryParams.set('light', '1');

    const url = `${getBackendUrl()}/api/videos?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const { success, data, error } = await handleApiResponse<{ videos: Video[] }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la récupération des vidéos' };

    return { success: true, videos: data?.videos };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération des vidéos');
  }
}

/**
 * Récupérer les vidéos publiées (sans auth, pour home/discover)
 * limit + light par défaut pour chargement rapide.
 */
export async function getAllVideosPublic(filters?: {
  category?: string;
  status?: 'published';
  limit?: number;
  light?: boolean;
}): Promise<{ success: boolean; videos?: Video[]; error?: string }> {
  if (IS_DEMO) {
    const videos = filters?.category
      ? DEMO_VIDEOS.filter((v) => v.category === filters.category || v.categories?.includes(filters.category!))
      : DEMO_VIDEOS;
    return { success: true, videos };
  }
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('status', filters?.status ?? 'published');
    if (filters?.category) queryParams.append('category', filters.category);
    queryParams.set('limit', String(filters?.limit ?? VIDEOS_LIST_LIMIT));
    if (filters?.light !== false) queryParams.set('light', '1');
    const url = `${getBackendUrl()}/api/videos?${queryParams}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      return { success: false, error: text || 'Erreur API' };
    }
    const data = await response.json();
    if (!response.ok) return { success: false, error: data?.error || 'Erreur' };
    return { success: true, videos: data?.videos ?? [] };
  } catch (e) {
    console.error('getAllVideosPublic:', e);
    return { success: false, error: 'Impossible de charger les vidéos' };
  }
}

/**
 * Récupérer une vidéo par ID (sans auth, pour watch public)
 */
export async function getVideoByIdPublic(id: number): Promise<{ success: boolean; video?: Video; error?: string }> {
  if (IS_DEMO) {
    const video = DEMO_VIDEOS.find((v) => v.id === Number(id));
    return video ? { success: true, video } : { success: false, error: 'Vidéo introuvable' };
  }
  try {
    const response = await fetch(`${getBackendUrl()}/api/videos/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      return { success: false, error: text || 'Erreur API' };
    }
    const data = await response.json();
    if (!response.ok) return { success: false, error: data?.error || 'Vidéo introuvable' };
    return { success: true, video: data?.video };
  } catch (e) {
    console.error('getVideoByIdPublic:', e);
    return { success: false, error: 'Impossible de charger la vidéo' };
  }
}

/**
 * Récupérer une vidéo par ID
 */
export async function getVideoById(id: number): Promise<{ success: boolean; video?: Video; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(`${getBackendUrl()}/api/videos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const { success, data, error } = await handleApiResponse<{ video: Video }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la récupération de la vidéo' };

    return { success: true, video: data?.video };
  } catch (error) {
    return handleError(error, 'Erreur lors de la récupération de la vidéo');
  }
}

/**
 * Mettre à jour une vidéo
 */
export async function updateVideo(
  id: number,
  videoData: Partial<CreateVideoData>
): Promise<{ success: boolean; video?: Video; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(`${getBackendUrl()}/api/videos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      },
      body: JSON.stringify(videoData)
    });

    const { success, data, error } = await handleApiResponse<{ video: Video }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la mise à jour de la vidéo' };

    return { success: true, video: data?.video };
  } catch (error) {
    return handleError(error, 'Erreur lors de la mise à jour de la vidéo');
  }
}

/**
 * Supprimer une vidéo
 */
export async function deleteVideo(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = getUser();
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const response = await fetch(`${getBackendUrl()}/api/videos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id.toString(),
        'x-user-role': currentUser.role || ''
      }
    });

    const { success, data, error } = await handleApiResponse<{ message: string }>(response);
    if (!success) return { success: false, error: error || 'Erreur lors de la suppression de la vidéo' };

    return { success: true };
  } catch (error) {
    return handleError(error, 'Erreur lors de la suppression de la vidéo');
  }
}

