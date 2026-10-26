"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { requestPasswordReset } from "@/lib/settings-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (!email?.trim()) {
      setError("Veuillez entrer votre adresse email.")
      return
    }
    setIsLoading(true)
    try {
      const result = await requestPasswordReset(email.trim())
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Une erreur s'est produite.")
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="min-h-[calc(100vh-4rem)] mt-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-bold">Mot de passe oublié</h1>
            <Link
              href="/login"
              className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Entrez votre adresse email. Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
              Si cet email est associé à un compte, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                placeholder="vous@exemple.com"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
