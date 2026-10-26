"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { AuthShell, AuthLink, AuthField, AuthError } from "@/components/auth-shell"
import { loginUser, setUser } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email et mot de passe requis")
      return
    }

    setIsLoading(true)
    try {
      const result = await loginUser(email, password)
      if (!result.success) {
        setError(result.error || "Erreur lors de la connexion")
        setIsLoading(false)
        return
      }
      if (result.user) setUser(result.user)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Erreur:", err)
      setError("Erreur de connexion. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Content de te revoir"
      subtitle="Connecte-toi pour retrouver tes vidéos et ton Top 10."
      footer={
        <>
          Pas encore de compte ? <AuthLink href="/signup">Créer un compte</AuthLink>
        </>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <AuthField
          id="email"
          type="email"
          label="Adresse email"
          placeholder="nom@klyxy.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={isLoading}
        />

        {/* Le backend exige un mot de passe (pas de lien magique) : champ conservé. */}
        <AuthField
          id="password"
          type={showPassword ? "text" : "password"}
          label="Mot de passe"
          placeholder="Entrer le mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={isLoading}
          labelAside={
            <Link href="/forgot-password" className="text-xs font-semibold text-white underline underline-offset-2">
              Mot de passe oublié ?
            </Link>
          }
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="h-[52px] w-full rounded-full bg-primary text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  )
}
