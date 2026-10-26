// Code d'accès au site (phase privée) : stocké dans le navigateur et ajouté, en-tête
// `X-Access-Code`, à CHAQUE appel vers l'API. Le contrôle réel est fait par l'API
// (server/middleware/accessCode.js) ; ce module ne fait que transmettre le code.
import { getBackendUrl } from '@/lib/utils'

const STORAGE_KEY = 'klyxy_access_code'
const HEADER_NAME = 'X-Access-Code'

let currentCode: string | null = null
let isFetchPatched = false

export function getStoredAccessCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getAccessCode(): string | null {
  return currentCode ?? getStoredAccessCode()
}

export function setAccessCode(code: string | null): void {
  currentCode = code
  if (typeof window === 'undefined') return
  try {
    if (code) window.localStorage.setItem(STORAGE_KEY, code)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Navigation privée / stockage bloqué : le code reste en mémoire pour la session
  }
}

// Vrai pour les appels vers NOTRE API (et seulement elle : jamais vers Cloudflare, etc.)
export function isBackendUrl(url: string): boolean {
  const base = getBackendUrl()
  if (base) return url === base || url.startsWith(`${base}/`)
  return url.startsWith('/api/') || url.startsWith(`${window.location.origin}/api/`)
}

// Patch unique de fetch() pour les appels vers l'API : envoie le cookie de session
// (credentials: include), ajoute l'en-tête du code d'accès s'il existe, et renvoie vers
// /login quand la session a expiré (401), sauf pour les routes de connexion elles-mêmes.
export function installAccessCodeHeader(): void {
  if (typeof window === 'undefined' || isFetchPatched) return
  isFetchPatched = true

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input)
    if (!isBackendUrl(url)) return originalFetch(input, init)

    const code = getAccessCode()
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
    if (code) headers.set(HEADER_NAME, code)

    const response = await originalFetch(input, { ...init, headers, credentials: 'include' })

    const isAuthRoute = /\/api\/(auth\/(login|signup|logout)|access\/)/.test(url)
    if (response.status === 401 && !isAuthRoute && localStorage.getItem('klyxy_user')) {
      try {
        localStorage.removeItem('klyxy_user')
      } catch {
        // stockage indisponible
      }
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
    }
    return response
  }
}

export const ACCESS_CODE_HEADER = HEADER_NAME
