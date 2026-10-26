"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Redirection : l'ancienne section "Bandes annonces" a été remplacée par "En-tête (Hero)".
 * Redirige vers /dashboard/hero pour que les types Next.js et les anciens liens continuent de fonctionner.
 */
export default function BandesAnnoncesRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/hero")
  }, [router])
  return null
}
