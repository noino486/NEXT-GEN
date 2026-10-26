import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * URL du backend API (Express).
 * - Si NEXT_PUBLIC_BACKEND_URL est défini (front et back sur deux domaines, ex.
 *   https://api-app.klyxy.fr) → on l'utilise, côté navigateur comme côté serveur.
 *   Next.js la grave dans le code AU BUILD : elle doit être fournie à la construction.
 * - Sinon, dans le navigateur → '' (URL relative /api/* = même origine : mode
 *   unifié `npm start`, où start-server.js proxifie /api vers Express).
 * - Sinon, en SSR → 127.0.0.1:BACKEND_PORT (mode unifié).
 */
export function getBackendUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL
  if (typeof configured === 'string' && configured) {
    return configured.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') return ''
  return `http://127.0.0.1:${process.env.BACKEND_PORT || 3002}`
}
