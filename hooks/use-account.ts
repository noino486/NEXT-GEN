"use client"

import { useEffect, useState } from "react"
import { getUser, type User } from "@/lib/auth-client"
import { getCurrentUserSettings } from "@/lib/settings-client"

/** Utilisateur connecté (localStorage) + sa photo de profil réelle (API settings). */
export function useAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    const current = getUser()
    setUser(current)
    if (!current) return
    let cancelled = false
    getCurrentUserSettings()
      .then((res) => {
        if (!cancelled && res.success && res.user?.profilePicture) setProfilePicture(res.user.profilePicture)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return { user, setUser, profilePicture }
}
