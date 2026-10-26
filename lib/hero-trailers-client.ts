// Frontend Logic - Hero Trailers (Bandes annonces) client
import { getUser } from './auth-client';
import { getBackendUrl } from './utils';
import { IS_DEMO, DEMO_VIDEOS } from './demo-data';

export interface HeroTrailer {
  id: number;
  title?: string | null;
  video_url?: string | null;
  /** Bande annonce (remplace la miniature) quand hero lié à une vidéo catalogue (video_id) */
  cloudflare_stream_id?: string | null;
  poster_url?: string | null;
  is_active: boolean;
  sort_order: number;
  /** Vidéo du catalogue affichée en hero */
  video_id?: number | null;
  created_at?: string;
  updated_at?: string;
  /** Infos vidéo catalogue (rempli par getAllTrailers) */
  video?: { id: number; title?: string; thumbnail?: string; cloudflare_stream_id?: string } | null;
}

export interface HeroContent {
  title?: string | null;
  title_accent?: string | null;
  description?: string | null;
  show_content: boolean;
}

function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) {
    return res.text().then((body) => {
      const preview = body?.slice(0, 80) ?? '';
      throw new Error(
        `Réponse non-JSON (${res.status}) — backend injoignable ou route absente. Vérifiez que le serveur API est démarré. ${preview ? `Réponse: ${preview}…` : ''}`
      );
    });
  }
  return res.json();
}

/**
 * Récupérer le hero actif : video (catalogue) + bande annonce optionnelle + contenu texte (public)
 */
export async function getActiveTrailer(): Promise<{
  success: boolean;
  trailer?: HeroTrailer | null;
  /** Vidéo du catalogue en hero (quand hero lié par video_id) */
  video?: { id: number; title?: string; thumbnail?: string; cloudflare_stream_id?: string; duration?: string; status?: string } | null;
  heroContent?: HeroContent | null;
  error?: string;
}> {
  if (IS_DEMO) {
    const v = DEMO_VIDEOS[0];
    return { success: true, trailer: null, video: { id: v.id, title: v.title, thumbnail: v.thumbnail, duration: v.duration, status: 'published' }, heroContent: null };
  }
  try {
    const res = await fetch(`${getBackendUrl()}/api/hero-trailers`);
    const data = await safeJson<{ trailer?: HeroTrailer; video?: { id: number; title?: string; thumbnail?: string; cloudflare_stream_id?: string; duration?: string; status?: string }; heroContent?: HeroContent; error?: string }>(res);
    if (!res.ok) return { success: false, error: data.error || 'Erreur' };
    return {
      success: true,
      trailer: data.trailer ?? null,
      video: data.video ?? null,
      heroContent: data.heroContent ?? null,
    };
  } catch (e) {
    console.error('getActiveTrailer', e);
    return { success: false, error: 'Impossible de charger le hero' };
  }
}

/**
 * Récupérer le contenu texte du hero (admin)
 */
export async function getHeroContent(): Promise<{
  success: boolean;
  content?: HeroContent | null;
  error?: string;
}> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/content`, {
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const data = await safeJson<{ content?: HeroContent; error?: string }>(res);
    if (!res.ok) return { success: false, error: data.error || 'Erreur' };
    return { success: true, content: data.content ?? null };
  } catch (e) {
    console.error('getHeroContent', e);
    return { success: false, error: 'Impossible de charger le contenu' };
  }
}

/**
 * Mettre à jour le contenu texte du hero (admin)
 */
export async function updateHeroContent(data: Partial<{
  title: string;
  title_accent: string;
  description: string;
  show_content: boolean;
}>): Promise<{ success: boolean; content?: HeroContent; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify(data),
    });
    const json = await safeJson<{ content?: HeroContent; error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true, content: json.content };
  } catch (e) {
    console.error('updateHeroContent', e);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * Liste toutes les bandes annonces (admin)
 */
export async function getAllTrailers(): Promise<{
  success: boolean;
  trailers?: HeroTrailer[];
  error?: string;
}> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/all`, {
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const data = await safeJson<{ trailers?: HeroTrailer[]; error?: string }>(res);
    if (!res.ok) return { success: false, error: data.error || 'Erreur' };
    return { success: true, trailers: data.trailers ?? [] };
  } catch (e) {
    console.error('getAllTrailers', e);
    return { success: false, error: 'Impossible de charger les bandes annonces' };
  }
}

/**
 * S'assurer qu'une ligne hero active existe (pour pouvoir uploader une bande annonce sans vidéo catalogue).
 */
export async function ensureActiveHeroRow(): Promise<{ success: boolean; trailer?: HeroTrailer; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/active`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify({}),
    });
    const json = await safeJson<{ trailer?: HeroTrailer; error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true, trailer: json.trailer };
  } catch (e) {
    console.error('ensureActiveHeroRow', e);
    return { success: false, error: 'Erreur lors de la création du hero' };
  }
}

/**
 * Définir la vidéo affichée en hero (admin). Un simple cocher sur la page Hero.
 */
export async function setActiveHeroVideo(videoId: number): Promise<{ success: boolean; trailer?: HeroTrailer; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };
    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/active`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify({ video_id: videoId }),
    });
    const json = await safeJson<{ trailer?: HeroTrailer; error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true, trailer: json.trailer };
  } catch (e) {
    console.error('setActiveHeroVideo', e);
    return { success: false, error: 'Erreur lors de la mise à jour du hero' };
  }
}

/**
 * Créer une entrée hero (admin)
 * Soit video_id (vidéo catalogue), soit video_url / cloudflare_stream_id (legacy)
 */
export async function createTrailer(data: {
  title?: string;
  video_id?: number;
  video_url?: string;
  cloudflare_stream_id?: string;
  poster_url?: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<{ success: boolean; trailer?: HeroTrailer; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    const res = await fetch(`${getBackendUrl()}/api/hero-trailers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify(data),
    });
    const json = await safeJson<{ trailer?: HeroTrailer; error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true, trailer: json.trailer };
  } catch (e) {
    console.error('createTrailer', e);
    return { success: false, error: 'Erreur lors de la création' };
  }
}

/**
 * Mettre à jour une bande-annonce (admin)
 */
export async function updateTrailer(
  id: number,
  data: Partial<{ title: string; video_id: number; video_url: string; cloudflare_stream_id: string; poster_url: string; is_active: boolean; sort_order: number }>
): Promise<{ success: boolean; trailer?: HeroTrailer; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
      body: JSON.stringify(data),
    });
    const json = await safeJson<{ trailer?: HeroTrailer; error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true, trailer: json.trailer };
  } catch (e) {
    console.error('updateTrailer', e);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * Supprimer une bande-annonce (admin)
 */
export async function deleteTrailer(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = getUser();
    if (!user) return { success: false, error: 'Non connecté' };

    const res = await fetch(`${getBackendUrl()}/api/hero-trailers/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.id.toString(),
        'x-user-role': user.role || '',
      },
    });
    const json = await safeJson<{ error?: string }>(res);
    if (!res.ok) return { success: false, error: json.error || 'Erreur' };
    return { success: true };
  } catch (e) {
    console.error('deleteTrailer', e);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}
