// Frontend Logic - Categories Client (TypeScript ONLY)
// This file contains client-side only functions for categories

import { getBackendUrl } from './utils';

export interface CategoryThumbnail {
  id: number;
  thumbnail_url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  thumbnails: CategoryThumbnail[];
}

/**
 * Récupérer toutes les catégories avec leurs miniatures
 */
export async function getAllCategories(): Promise<{ success: boolean; categories?: Category[]; error?: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des catégories',
      };
    }

    return {
      success: true,
      categories: data.categories || [],
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error);
    return {
      success: false,
      error: 'Erreur de connexion. Veuillez réessayer.',
    };
  }
}

/**
 * Mettre à jour les miniatures d'une catégorie
 */
export async function updateCategoryThumbnails(
  categoryId: number,
  thumbnails: { thumbnail_url: string; display_order: number }[]
): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('klyxy_user') : null;
    if (!userStr) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      };
    }

    const user = JSON.parse(userStr);
    const token = user.token || '';

    const response = await fetch(`${getBackendUrl()}/api/categories/${categoryId}/thumbnails`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id?.toString() || '',
        'x-user-role': user.role || '',
      },
      body: JSON.stringify({ thumbnails }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour des miniatures',
      };
    }

    return {
      success: true,
      category: data.category,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des miniatures:', error);
    return {
      success: false,
      error: 'Erreur de connexion. Veuillez réessayer.',
    };
  }
}

