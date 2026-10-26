"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"

import {
  ACCESS_CODE_HEADER,
  getStoredAccessCode,
  installAccessCodeHeader,
  setAccessCode,
} from "@/lib/access-code"
import { getBackendUrl } from "@/lib/utils"

type GateState = "checking" | "locked" | "open"

async function checkCode(code: string | null): Promise<"ok" | "wrong" | "locked" | "unreachable"> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/access/check`, {
      headers: code ? { [ACCESS_CODE_HEADER]: code } : undefined,
    })

    if (response.ok) return "ok"
    if (response.status === 429) return "locked"
    return "wrong"
  } catch {
    return "unreachable"
  }
}

// Phase privée : tant que l'API est protégée par ACCESS_CODE, le site demande ce code
// avant d'afficher quoi que ce soit. Sans ACCESS_CODE côté API, il est invisible.
export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function init() {
      installAccessCodeHeader()
      try {
        const response = await fetch(`${getBackendUrl()}/api/access/status`)
        const { required } = (await response.json()) as { required: boolean }

        if (!required) {
          if (!isCancelled) setState("open")
          return
        }
      } catch {
        // API injoignable ou ancienne version : on laisse le site gérer ses propres erreurs
        if (!isCancelled) setState("open")
        return
      }

      const stored = getStoredAccessCode()

      if (stored && (await checkCode(stored)) === "ok") {
        setAccessCode(stored)
        installAccessCodeHeader()
        if (!isCancelled) setState("open")
        return
      }

      setAccessCode(null)
      if (!isCancelled) setState("locked")
    }

    void init()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await checkCode(code.trim())

    if (result === "ok") {
      setAccessCode(code.trim())
      installAccessCodeHeader()
      setState("open")
    } else if (result === "locked") {
      setError("Trop de tentatives. Réessaie dans quelques minutes.")
    } else if (result === "unreachable") {
      setError("Impossible de joindre le serveur. Réessaie dans un instant.")
    } else {
      setError("Code incorrect.")
    }

    setIsSubmitting(false)
  }

  if (state === "checking") return null
  if (state === "open") return <>{children}</>

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-center text-2xl font-semibold">klyxy</h1>
        <p className="text-center text-sm text-muted-foreground">
          Accès privé. Saisis le code d&apos;accès pour continuer.
        </p>
        <input
          type="password"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Code d'accès"
          aria-label="Code d'accès"
          className="h-[52px] w-full rounded-full border border-white/10 bg-secondary px-5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || code.trim() === ""}
          className="h-[52px] w-full rounded-full bg-primary text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Vérification…" : "Entrer"}
        </button>
      </form>
    </main>
  )
}
