"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { signupUser, setUser } from "@/lib/auth-client"
import ReCaptcha, { type ReCaptchaHandle } from "@/components/recaptcha"

export default function SignupPage() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<"free" | "premium" | "premium_plus">("free")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "google" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  })
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const recaptchaRef = useRef<ReCaptchaHandle>(null)

  // Réinitialiser le moyen de paiement quand on change de type de compte
  const handleAccountTypeChange = (type: "free" | "premium" | "premium_plus") => {
    setAccountType(type)
    if (type === "free") {
      setPaymentMethod(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    // Validation des champs
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Tous les champs sont requis")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      setIsLoading(false)
      return
    }

    // Validation pour premium et premium_plus
    if ((accountType === "premium" || accountType === "premium_plus") && !paymentMethod) {
      setError("Veuillez sélectionner un moyen de paiement")
      setIsLoading(false)
      return
    }

    if ((accountType === "premium" || accountType === "premium_plus") && paymentMethod === "card") {
      if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        setError("Veuillez remplir toutes les informations de paiement")
        setIsLoading(false)
        return
      }
    }

    // Validation du CAPTCHA - DÉSACTIVÉ TEMPORAIREMENT
    // if (!recaptchaToken) {
    //   setError("Veuillez compléter la vérification CAPTCHA")
    //   setIsLoading(false)
    //   return
    // }

    try {
      const result = await signupUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        accountType,
        // Les données de carte ne sont JAMAIS envoyées à notre API (paiement à brancher via Stripe)
        paymentData: null,
        recaptchaToken: null, // DÉSACTIVÉ TEMPORAIREMENT
      })

      if (!result.success) {
        setError(result.error || 'Erreur lors de la création du compte')
        setIsLoading(false)
        return
      }

      // Succès
      setSuccess(true)
      console.log('✅ Compte créé:', result.user)
      
      // Stocker les informations de l'utilisateur
      if (result.user) {
        setUser(result.user)
      }
      
      // Réinitialiser le formulaire
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
      })
      setPaymentData({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
      })
      setPaymentMethod(null)
      // setRecaptchaToken(null) // Réinitialiser le CAPTCHA - DÉSACTIVÉ
      // recaptchaRef.current?.reset() // Réinitialiser le widget CAPTCHA - DÉSACTIVÉ
      setIsLoading(false)

      // Rediriger vers la page de remerciements après inscription
      setTimeout(() => {
        router.push('/signup/thank-you')
        router.refresh()
      }, 500)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur de connexion. Veuillez réessayer.')
      // setRecaptchaToken(null) // Réinitialiser le CAPTCHA en cas d'erreur - DÉSACTIVÉ
      // recaptchaRef.current?.reset() // Réinitialiser le widget CAPTCHA - DÉSACTIVÉ
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Rejoignez KLYXY et découvrez un univers de contenu créateur
            </p>
          </div>

          {/* Sélection du type de compte */}
          <div className="mb-4">
            <div className="flex flex-row md:grid md:grid-cols-3 gap-2 md:gap-3 items-start overflow-x-auto scrollbar-hide">
              {/* Compte Gratuit */}
              <button
                type="button"
                onClick={() => handleAccountTypeChange("free")}
                className={`relative p-2.5 md:p-4 rounded-lg border-2 transition-all text-left flex flex-col flex-shrink-0 w-[140px] md:w-auto md:h-full ${
                  accountType === "free"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-base md:text-lg font-bold">Gratuit</h3>
                  {accountType === "free" && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1.5 md:mb-2 text-left line-clamp-1">
                  Accès limité avec publicités
                </p>
                <div className="space-y-1 md:space-y-1.5 text-left flex-1 hidden md:block">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Accès au contenu</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage avec publicités</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Qualité maximale</p>
                      <p className="text-[10px] text-muted-foreground">HD maximum</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Sans publicités</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage ininterrompu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Accès illimité</p>
                      <p className="text-[10px] text-muted-foreground">Tout le contenu disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Téléchargement</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage hors ligne</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Multi-écrans</p>
                      <p className="text-[10px] text-muted-foreground">Sur tous vos appareils</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Interactions en live</p>
                      <p className="text-[10px] text-muted-foreground">Participez aux événements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Contenu exclusif</p>
                      <p className="text-[10px] text-muted-foreground">Vidéos réservées aux membres</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Avant-première</p>
                      <p className="text-[10px] text-muted-foreground">Accès en exclusivité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Visionnage à plusieurs</p>
                      <p className="text-[10px] text-muted-foreground">Regardez avec vos amis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Mode multi-tâche</p>
                      <p className="text-[10px] text-muted-foreground">Vidéo en arrière-plan continu</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Compte Premium */}
              <button
                type="button"
                onClick={() => handleAccountTypeChange("premium")}
                className={`relative p-2.5 md:p-4 rounded-lg border-2 transition-all text-left bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col flex-shrink-0 w-[140px] md:w-auto md:h-full ${
                  accountType === "premium"
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-base md:text-lg font-bold">Premium</h3>
                  {accountType === "premium" && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-base md:text-xl font-black">4,90€</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5 md:mb-2 line-clamp-1">
                  Accès complet sans publicités
                </p>
                <div className="space-y-1 md:space-y-1.5 flex-1 hidden md:block">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Qualité maximale</p>
                      <p className="text-[10px] text-muted-foreground">2080p max</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Sans publicités</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage ininterrompu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Accès illimité</p>
                      <p className="text-[10px] text-muted-foreground">Tout le contenu disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Téléchargement</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage hors ligne</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Multi-écrans</p>
                      <p className="text-[10px] text-muted-foreground">Sur tous vos appareils</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Interactions en live</p>
                        <p className="text-[10px] text-muted-foreground">Participez aux événements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Contenu exclusif</p>
                        <p className="text-[10px] text-muted-foreground">Vidéos réservées aux membres</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Avant-première</p>
                        <p className="text-[10px] text-muted-foreground">Accès en exclusivité</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Visionnage à plusieurs</p>
                        <p className="text-[10px] text-muted-foreground">Regardez avec vos amis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Mode multi-tâche</p>
                        <p className="text-[10px] text-muted-foreground">Vidéo en arrière-plan continu</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-2 pt-2 border-t border-border/50">
                  <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    POPULAIRE
                  </span>
                </div>
              </button>

              {/* Compte Premium+ */}
              <button
                type="button"
                onClick={() => handleAccountTypeChange("premium_plus")}
                className={`relative p-2.5 md:p-4 rounded-lg border-2 transition-all text-left bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex flex-col flex-shrink-0 w-[140px] md:w-auto md:h-full ${
                  accountType === "premium_plus"
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-base md:text-lg font-bold">Premium+</h3>
                  {accountType === "premium_plus" && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-base md:text-xl font-black">7,90€</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5 md:mb-2 line-clamp-1">
                  Expérience ultime avec fonctionnalités exclusives
                </p>
                <div className="space-y-1 md:space-y-1.5 flex-1 hidden md:block">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Qualité maximale</p>
                      <p className="text-[10px] text-muted-foreground">4K et Ultra HD disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Sans publicités</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage ininterrompu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Accès illimité</p>
                      <p className="text-[10px] text-muted-foreground">Tout le contenu disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Téléchargement</p>
                      <p className="text-[10px] text-muted-foreground">Visionnage hors ligne</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Multi-écrans</p>
                      <p className="text-[10px] text-muted-foreground">4 sessions actives</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Interactions en live</p>
                      <p className="text-[10px] text-muted-foreground">Participez aux événements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Contenu exclusif</p>
                      <p className="text-[10px] text-muted-foreground">Vidéos réservées aux membres</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Avant-première</p>
                      <p className="text-[10px] text-muted-foreground">Accès en exclusivité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Visionnage à plusieurs</p>
                      <p className="text-[10px] text-muted-foreground">Regardez avec vos amis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Mode multi-tâche</p>
                      <p className="text-[10px] text-muted-foreground">Vidéo en arrière-plan continu</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-2 pt-2 border-t border-border/50">
                  <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ULTIME
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 md:p-4 sm:p-5 space-y-3 md:space-y-4">
              {/* Nom d'utilisateur */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Votre nom d'utilisateur"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="h-9 md:h-10"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-9 md:h-10"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="h-9 md:h-10"
                />
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="h-9 md:h-10"
                />
              </div>
            </div>

            {/* Section paiement - Affichée uniquement pour Premium et Premium+ */}
            {(accountType === "premium" || accountType === "premium_plus") && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-3 md:p-4 sm:p-5 space-y-3 md:space-y-4 mt-3 md:mt-4">
                <h3 className="text-sm md:text-base font-semibold mb-2">Moyen de paiement</h3>
                
                {/* Choix du moyen de paiement */}
                {!paymentMethod && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("apple")}
                        className="flex-1 h-10 md:h-12 rounded-lg bg-black hover:bg-black/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        disabled
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        <span className="text-white font-medium text-sm">Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("google")}
                        className="flex-1 h-10 md:h-12 rounded-lg bg-white hover:bg-white/90 transition-colors flex items-center justify-center gap-2 border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        disabled
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-gray-700 font-medium text-sm">Pay</span>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Bientôt disponible</p>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-card/50 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className="w-full h-10 md:h-12 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 border border-border text-sm md:text-base"
                    >
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium text-sm">Carte bancaire</span>
                    </button>
                  </div>
                )}

                {/* Formulaire carte bancaire */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Informations de carte</h4>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Changer
                      </button>
                    </div>
                    
                    {/* Nom sur la carte */}
                    <div className="space-y-1.5">
                      <Label htmlFor="cardName" className="text-sm">Nom sur la carte</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        type="text"
                        placeholder="Jean Dupont"
                        value={paymentData.cardName}
                        onChange={handlePaymentChange}
                        required={accountType === "premium" || accountType === "premium_plus"}
                        className="h-9 md:h-10 bg-background/50 border-primary/50 focus:border-primary"
                      />
                    </div>

                    {/* Numéro de carte */}
                    <div className="space-y-1.5">
                      <Label htmlFor="cardNumber" className="text-sm">Numéro de carte</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={paymentData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()
                          setPaymentData((prev) => ({
                            ...prev,
                            cardNumber: value,
                          }))
                        }}
                        required={accountType === "premium" || accountType === "premium_plus"}
                        className="h-9 md:h-10 bg-background/50 border-primary/50 focus:border-primary"
                      />
                    </div>

                    {/* Date d'expiration et CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="expiryDate" className="text-sm">Date d'expiration</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "")
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4)
                            }
                            setPaymentData((prev) => ({
                              ...prev,
                              expiryDate: value,
                            }))
                          }}
                          required={accountType === "premium" || accountType === "premium_plus"}
                          className="h-9 md:h-10 bg-background/50 border-primary/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvv" className="text-sm">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          required={accountType === "premium" || accountType === "premium_plus"}
                          className="h-9 md:h-10 bg-background/50 border-primary/50 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages pour Apple Pay / Google Pay */}
                {paymentMethod === "apple" && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Apple Pay sera bientôt disponible</p>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(null)}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Changer de moyen de paiement
                    </button>
                  </div>
                )}

                {paymentMethod === "google" && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Google Pay sera bientôt disponible</p>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(null)}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Changer de moyen de paiement
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CAPTCHA - DÉSACTIVÉ TEMPORAIREMENT */}
            {/* {recaptchaSiteKey && (
              <div className="flex justify-center py-4">
                <ReCaptcha
                  ref={recaptchaRef}
                  siteKey={recaptchaSiteKey}
                  onVerify={(token) => {
                    setRecaptchaToken(token)
                    setError(null)
                  }}
                  onExpire={() => {
                    setRecaptchaToken(null)
                  }}
                />
              </div>
            )} */}

            {/* Bouton de soumission */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                // disabled={isLoading || (!!recaptchaSiteKey && !recaptchaToken)} // DÉSACTIVÉ TEMPORAIREMENT
                className="px-4 md:px-8 rounded-full text-sm md:text-base py-3 md:py-5 font-bold text-black hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? "Création en cours..." 
                  : accountType === "premium_plus" 
                    ? "Créer mon compte Premium+" 
                    : accountType === "premium" 
                      ? "Créer mon compte Premium" 
                      : "Créer mon compte gratuit"}
              </Button>
            </div>

            {/* Lien connexion */}
            <p className="text-center text-xs text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

