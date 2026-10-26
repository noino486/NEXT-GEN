"use client"

// Inscription « rapide » du design : compte gratuit uniquement (accountType: "free").
// /signup reste la page complète avec choix du plan et paiement.
//
// Les boutons Apple / Google sont fidèles à la maquette mais non branchés : aucune route
// OAuth n'existe côté backend aujourd'hui.

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff } from "lucide-react"
import { AuthShell, AuthLink, AuthField, AuthError } from "@/components/auth-shell"
import { AppleIcon, GoogleIcon } from "@/components/social-icons"
import { signupUser, setUser } from "@/lib/auth-client"

const UNDERLINED = "font-semibold text-white underline underline-offset-2"

export default function InscriptionPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !email || !password) {
      setError("Tous les champs sont requis")
      return
    }
    if (!acceptedTerms) {
      setError("Merci d'accepter les conditions d'utilisation")
      return
    }

    setIsLoading(true)
    try {
      const result = await signupUser({ username, email, password, accountType: "free", recaptchaToken: null })
      if (!result.success) {
        setError(result.error || "Erreur lors de la création du compte")
        setIsLoading(false)
        return
      }
      if (result.user) setUser(result.user)
      router.push("/signup/thank-you")
    } catch (err) {
      console.error("Erreur:", err)
      setError("Erreur de connexion. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  const socialUnavailable = (provider: string) => setError(`La connexion avec ${provider} arrive bientôt.`)

  return (
    <AuthShell
      tall
      title="Rejoins Klyxy"
      subtitle="Crée ton compte pour accéder à tout le contenu."
      footer={
        <>
          Déjà un compte ? <AuthLink href="/login">Se connecter</AuthLink>
        </>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-3.5">
          <AuthField
            id="username"
            label="Nom d'utilisateur"
            height={50}
            placeholder="Klyxy_user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            disabled={isLoading}
          />
          <AuthField
            id="email"
            type="email"
            label="Adresse email"
            height={50}
            placeholder="nom@klyxy.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isLoading}
          />
          <AuthField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Mot de passe"
            height={50}
            placeholder="Créer un mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={isLoading}
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
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pb-6 pt-[18px]">
          <input
            type="checkbox"
            className="sr-only"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span
            className={`mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] ${
              acceptedTerms ? "bg-primary" : "border border-white/20 bg-input"
            }`}
            aria-hidden="true"
          >
            {acceptedTerms && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
          </span>
          <span className="text-[12.5px] leading-normal text-muted-foreground">
            J'accepte les <span className={UNDERLINED}>conditions d'utilisation</span> et la{" "}
            <span className={UNDERLINED}>politique de confidentialité</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="h-[50px] w-full rounded-full bg-primary text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <div className="flex items-center gap-3 py-6">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-muted-foreground">ou continuer avec</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => socialUnavailable("Apple")}
          className="flex h-12 w-full items-center justify-center gap-[9px] rounded-full bg-foreground text-[15px] font-semibold text-black transition-opacity hover:opacity-90"
        >
          <AppleIcon />
          Continuer avec Apple
        </button>
        <button
          type="button"
          onClick={() => socialUnavailable("Google")}
          className="flex h-12 w-full items-center justify-center gap-[9px] rounded-full border border-white/20 bg-transparent text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <GoogleIcon />
          Continuer avec Google
        </button>
      </div>
    </AuthShell>
  )
}
