"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUser, setUser, type User } from "@/lib/auth-client"
import DashboardLayout from "@/components/dashboard/layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Settings, 
  Lock, 
  Mail, 
  User as UserIcon, 
  CreditCard, 
  FileText,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronRight,
  Loader2,
  SquareStack,
  Wallet,
  Monitor,
  Shield,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import {
  getCurrentUserSettings,
  updatePassword,
  requestPasswordReset,
  updateProfilePicture,
  updateEmail,
  updateAccountType,
  getUserInvoices,
  type UserSettings,
  type Invoice
} from "@/lib/settings-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { EmailVerificationNotification } from "@/components/dashboard/email-verification-notification"

interface SettingCardProps {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  badge?: string
}

function SettingCard({ icon: Icon, title, description, onClick, badge }: SettingCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group"
    >
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-border/50">
        <div className="flex items-center gap-4 p-6">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
        </div>
      </Card>
    </button>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUserState] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // États pour les modals
  const [openModal, setOpenModal] = useState<string | null>(null)

  // États pour le formulaire de mot de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // États pour l'email
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  // États pour la photo de profil
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // États pour l'abonnement
  const [accountType, setAccountType] = useState<'free' | 'premium' | 'premium_plus'>('free')
  const [isUpdatingAccountType, setIsUpdatingAccountType] = useState(false)

  // États pour la réinitialisation par email
  const [isRequestingReset, setIsRequestingReset] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    setUserState(currentUser)

    // Vérifier que l'utilisateur est connecté
    if (!currentUser) {
      router.push('/login')
      return
    }

    loadSettings()
    loadInvoices()
  }, [router])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const result = await getCurrentUserSettings()
      if (result.success && result.user) {
        setSettings(result.user)
        setProfilePicture(result.user.profilePicture)
        setAccountType(result.user.accountType)
        setNewEmail(result.user.email)
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvoices = async () => {
    try {
      const result = await getUserInvoices()
      if (result.success && result.invoices) {
        setInvoices(result.invoices)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword || !currentPassword) {
      toast.error('Tous les champs sont requis')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const result = await updatePassword(currentPassword, newPassword)
      if (result.success) {
        toast.success(result.message || 'Mot de passe mis à jour avec succès')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setOpenModal(null)
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour du mot de passe')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) {
      toast.error('Email non disponible')
      return
    }

    setIsRequestingReset(true)
    try {
      const result = await requestPasswordReset(user.email)
      if (result.success) {
        toast.success(result.message || 'Si cet email existe, un lien de réinitialisation a été envoyé')
        setOpenModal(null)
      } else {
        toast.error(result.error || 'Erreur lors de la demande de réinitialisation')
      }
    } catch (error) {
      toast.error('Erreur lors de la demande de réinitialisation')
    } finally {
      setIsRequestingReset(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setIsUpdatingPicture(true)
      try {
        const result = await updateProfilePicture(base64String)
        if (result.success) {
          toast.success(result.message || 'Photo de profil mise à jour avec succès')
          setProfilePicture(result.profilePicture || base64String)
          if (settings) {
            setSettings({ ...settings, profilePicture: result.profilePicture || base64String })
          }
        } else {
          toast.error(result.error || 'Erreur lors de la mise à jour de la photo de profil')
        }
      } catch (error) {
        toast.error('Erreur lors de la mise à jour de la photo de profil')
      } finally {
        setIsUpdatingPicture(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail || !emailPassword) {
      toast.error('Tous les champs sont requis')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error('Format d\'email invalide')
      return
    }

    setIsUpdatingEmail(true)
    try {
      const result = await updateEmail(newEmail, emailPassword)
      if (result.success) {
        toast.success(result.message || 'Email mis à jour avec succès')
        setEmailPassword("")
        if (result.email && user) {
          const updatedUser = { ...user, email: result.email }
          setUser(updatedUser)
          setUserState(updatedUser)
        }
        await loadSettings()
        setOpenModal(null)
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour de l\'email')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'email')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleAccountTypeUpdate = async (newType: 'free' | 'premium' | 'premium_plus') => {
    if (newType === accountType) return

    setIsUpdatingAccountType(true)
    try {
      const result = await updateAccountType(newType)
      if (result.success) {
        toast.success(result.message || 'Type de compte mis à jour avec succès')
        setAccountType(newType)
        if (user) {
          const updatedUser = { ...user, accountType: newType }
          setUser(updatedUser)
          setUserState(updatedUser)
        }
        await loadSettings()
        setOpenModal(null)
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour du type de compte')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du type de compte')
    } finally {
      setIsUpdatingAccountType(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout page="dashboard">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.username || user.email || "Utilisateur"
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <DashboardLayout page="dashboard">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="space-y-4 md:space-y-8 max-w-4xl w-full">
          {/* Notification de vérification d'email */}
          {user && user.emailVerified === false && (
            <EmailVerificationNotification userEmail={user.email} />
          )}

          {/* Message de bienvenue */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Bienvenue, {displayName} !
                </h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-base sm:text-lg">
                  Ici vous pouvez tout gérer et administrer la plateforme KLYXY
                </p>
              </div>
            </div>
          </div>

          {/* En-tête Paramètres */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              Paramètres
            </h2>
            <p className="text-muted-foreground">
              Gérez vos paramètres de compte, sécurité et abonnement
            </p>
          </div>

          {/* Liste des paramètres */}
          <div className="space-y-3">
            <SettingCard
              icon={SquareStack}
              title="Changer d'offre"
              description="Modifiez votre type d'abonnement (Gratuit ou Premium)"
              onClick={() => setOpenModal('subscription')}
            />

            <SettingCard
              icon={Wallet}
              title="Gérer votre mode de paiement"
              description="Configurez et gérez vos méthodes de paiement"
              onClick={() => setOpenModal('payment')}
            />

            <SettingCard
              icon={Lock}
              title="Mettre à jour le mot de passe"
              description="Modifiez votre mot de passe pour sécuriser votre compte"
              onClick={() => setOpenModal('password')}
            />

            <SettingCard
              icon={Mail}
              title="Modifier l'adresse email"
              description="Mettez à jour votre adresse email de connexion"
              onClick={() => setOpenModal('email')}
            />

            <SettingCard
              icon={UserIcon}
              title="Photo de profil"
              description="Mettez à jour votre photo de profil"
              onClick={() => setOpenModal('profile')}
            />

            <SettingCard
              icon={Monitor}
              title="Gérer les accès et les appareils"
              description="Consultez et gérez les appareils connectés à votre compte"
              onClick={() => setOpenModal('devices')}
            />

            <SettingCard
              icon={FileText}
              title="Gérer les factures"
              description="Consultez l'historique de vos factures et paiements"
              onClick={() => setOpenModal('invoices')}
            />

            <SettingCard
              icon={Shield}
              title="Sécurité et confidentialité"
              description="Paramètres de sécurité, notifications et confidentialité"
              onClick={() => setOpenModal('security')}
            />
          </div>

          <Separator className="my-8" />

          {/* Section Profils */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gérer les profils</h2>
                <p className="text-sm text-muted-foreground mt-1">1 profil</p>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profilePicture || undefined} alt={displayName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">{settings?.email || user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Photo de profil */}
      <Dialog open={openModal === 'profile'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photo de profil</DialogTitle>
            <DialogDescription>
              Mettez à jour votre photo de profil. Format accepté : JPG, PNG (max 5MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 md:space-y-6 py-2 md:py-4">
            <div className="flex items-center gap-4 md:gap-6">
              <Avatar className="h-16 w-16 md:h-24 md:w-24">
                <AvatarImage src={profilePicture || undefined} alt={displayName} />
                <AvatarFallback className="text-lg md:text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingPicture}
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUpdatingPicture ? "Mise à jour..." : "Changer la photo"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Mot de passe */}
      <Dialog open={openModal === 'password'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le mot de passe</DialogTitle>
            <DialogDescription>
              Utilisez votre mot de passe actuel pour le modifier
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-3 md:space-y-4 py-2 md:py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isUpdatingPassword} className="flex-1">
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenModal(null)}>
                Annuler
              </Button>
            </div>
          </form>
          <Separator />
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="font-medium mb-2">Réinitialiser le mot de passe par email</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Si vous avez oublié votre mot de passe, nous pouvons vous envoyer un lien de réinitialisation à votre adresse email
              </p>
              <form onSubmit={handlePasswordResetRequest} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={user?.email || settings?.email || ''}
                    disabled
                    className="flex-1 bg-muted"
                  />
                  <Button type="submit" variant="outline" disabled={isRequestingReset || !user?.email}>
                    {isRequestingReset ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Envoyer"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si un compte est associé à cet email, vous recevrez un lien de réinitialisation.
                </p>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Email */}
      <Dialog open={openModal === 'email'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'adresse email</DialogTitle>
            <DialogDescription>
              Mettez à jour votre adresse email. Vous devrez confirmer avec votre mot de passe actuel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailUpdate} className="space-y-3 md:space-y-4 py-2 md:py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Nouvel email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="emailPassword"
                  type={showEmailPassword ? "text" : "password"}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Confirmez avec votre mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                >
                  {showEmailPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isUpdatingEmail} className="flex-1">
                {isUpdatingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenModal(null)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Abonnement */}
      <Dialog open={openModal === 'subscription'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl md:max-w-3xl p-0 gap-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2.5 sm:pb-3 border-b border-border/50">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              Choisissez votre formule
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-row md:grid md:grid-cols-3 gap-2 md:gap-0 items-start overflow-x-auto scrollbar-hide md:divide-y-0 md:divide-x divide-border/50">
            {/* Côté Gratuit */}
            <div className={`p-3 md:p-4 sm:p-6 flex flex-col flex-shrink-0 w-[160px] md:w-auto ${accountType === 'free' ? 'bg-primary/5' : ''}`}>
              {accountType === 'free' && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <span className="bg-primary text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    ACTUEL
                  </span>
                </div>
              )}
              
              <div className="text-center mb-2.5 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Gratuit</h3>
                <p className="text-xs sm:text-base text-muted-foreground">Accès limité avec publicités</p>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 mb-2.5 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Accès au contenu</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visionnage avec publicités</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Qualité maximale</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">HD maximum</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">Sans publicités</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Interruptions publicitaires fréquentes</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">Accès illimité</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Contenu limité disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">Téléchargement</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Non disponible</p>
                  </div>
                </div>

                {/* Ce qui manque par rapport à Premium+ */}
                <div className="pt-2 border-t border-border/50 space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Qualité maximale</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">4K et Ultra HD disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Sans publicités</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Visionnage ininterrompu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Accès illimité</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Tout le contenu disponible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Interactions en live</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Participez aux événements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Téléchargement</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Visionnage hors ligne</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Multi-écrans</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Sur tous vos appareils</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Contenu exclusif</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Vidéos réservées aux membres</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avant-première</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Accès en exclusivité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Visionnage à plusieurs</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Regardez avec vos amis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Mode multi-tâche</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Vidéo en arrière-plan continu</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleAccountTypeUpdate('free')}
                disabled={accountType === 'free' || isUpdatingAccountType}
                variant={accountType === 'free' ? 'default' : 'outline'}
                className="w-full max-w-[85%] mx-auto border-2 hover:bg-secondary text-sm sm:text-base py-2 sm:py-2"
              >
                {isUpdatingAccountType && accountType !== 'free' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : accountType === 'free' ? (
                  'Plan actuel'
                ) : (
                  'Choisir ce plan'
                )}
              </Button>
            </div>

            {/* Côté Premium */}
            <div className={`p-3 md:p-4 sm:p-6 flex flex-col flex-shrink-0 w-[160px] md:w-auto relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t-2 md:border-t-0 md:border-l-2 border-primary/50 ${accountType === 'premium' ? 'bg-primary/10' : ''}`}>
              {accountType === 'premium' && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <span className="bg-primary text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    ACTUEL
                  </span>
                </div>
              )}

              <div className="text-center mb-2.5 sm:mb-4 pt-0.5 sm:pt-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Premium</h3>
                <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black">4,90€</span>
                  <span className="text-sm sm:text-base text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">Accès complet sans publicités</p>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 mb-2.5 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Qualité maximale</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">2080p max</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Sans publicités</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visionnage ininterrompu</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Accès illimité</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tout le contenu disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Téléchargement</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visionnage hors ligne</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Multi-écrans</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">2 sessions actives max</p>
                  </div>
                </div>

                {/* Ce qui manque par rapport à Premium+ */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Interactions en live</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Participez aux événements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Contenu exclusif</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Vidéos réservées aux membres</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avant-première</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Accès en exclusivité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Visionnage à plusieurs</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Regardez avec vos amis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Mode multi-tâche</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Vidéo en arrière-plan continu</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleAccountTypeUpdate('premium')}
                disabled={accountType === 'premium' || isUpdatingAccountType}
                className="w-full max-w-[85%] mx-auto bg-primary hover:bg-primary/90 text-black font-bold text-sm sm:text-base py-2 sm:py-2"
              >
                {isUpdatingAccountType && accountType !== 'premium' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : accountType === 'premium' ? (
                  'Plan actuel'
                ) : (
                  'Choisir ce plan'
                )}
              </Button>
            </div>

            {/* Côté Premium+ */}
            <div className={`p-3 md:p-4 sm:p-6 flex flex-col flex-shrink-0 w-[160px] md:w-auto relative bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-t-2 md:border-t-0 md:border-l-2 border-primary/50 ${accountType === 'premium_plus' ? 'bg-primary/15' : ''}`}>
              {accountType === 'premium_plus' ? (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <span className="bg-primary text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    ACTUEL
                  </span>
                </div>
              ) : (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <span className="bg-primary text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    ULTIME
                  </span>
                </div>
              )}

              <div className="text-center mb-2.5 sm:mb-4 pt-0.5 sm:pt-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Premium+</h3>
                <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black">7,90€</span>
                  <span className="text-sm sm:text-base text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">Expérience ultime avec fonctionnalités exclusives</p>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 mb-2.5 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Qualité maximale</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">4K et Ultra HD disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Sans publicités</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visionnage ininterrompu</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Accès illimité</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tout le contenu disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Interactions en live</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Participez aux événements</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Téléchargement</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visionnage hors ligne</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Multi-écrans</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">4 sessions actives</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Contenu exclusif</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Vidéos réservées aux membres</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Avant-première</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Accès en exclusivité</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Visionnage à plusieurs</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Regardez avec vos amis</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium">Mode multi-tâche</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Vidéo en arrière-plan continu</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleAccountTypeUpdate('premium_plus')}
                disabled={accountType === 'premium_plus' || isUpdatingAccountType}
                className="w-full max-w-[85%] mx-auto bg-primary hover:bg-primary/90 text-black font-bold text-sm sm:text-base py-2 sm:py-2"
              >
                {isUpdatingAccountType && accountType !== 'premium_plus' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : accountType === 'premium_plus' ? (
                  'Plan actuel'
                ) : (
                  'Choisir ce plan'
                )}
              </Button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary/50 text-center text-[10px] sm:text-xs text-muted-foreground">
            <p>Vous pouvez changer de plan à tout moment. Sans engagement.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Factures */}
      <Dialog open={openModal === 'invoices'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Mes factures</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Consultez l'historique de vos factures
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 md:py-4">
            {invoices.length === 0 ? (
              <div className="text-center py-4 md:py-8">
                <FileText className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2 md:mb-4" />
                <p className="text-muted-foreground text-sm md:text-base">
                  Aucune facture disponible pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 md:p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {invoice.description || `Facture #${invoice.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        {invoice.amount.toFixed(2)} €
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Paiement */}
      <Dialog open={openModal === 'payment'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer votre mode de paiement</DialogTitle>
            <DialogDescription>
              Vos méthodes de paiement enregistrées
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
              <div className="p-3 rounded-full bg-muted w-fit mx-auto">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Aucune méthode de paiement</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vous n&apos;avez pas encore ajouté de méthode de paiement.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-primary">Bientôt disponible</p>
              </div>
              <p className="text-xs text-muted-foreground">
                La gestion des méthodes de paiement par carte bancaire sera disponible prochainement.
                Pour toute question concernant votre abonnement, contactez le support.
              </p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <CreditCard className="h-4 w-4 mr-2" />
              Ajouter une carte (bientôt disponible)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Appareils */}
      <Dialog open={openModal === 'devices'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accès et appareils</DialogTitle>
            <DialogDescription>
              Session active sur votre compte
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground text-sm">Cet appareil</p>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      Actif maintenant
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Navigateur web · Session actuelle
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connecté en tant que <span className="font-medium">{user?.email}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-primary">Bientôt disponible</p>
              </div>
              <p className="text-xs text-muted-foreground">
                La gestion complète des appareils connectés (historique des connexions, déconnexion à distance) sera disponible prochainement.
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Déconnexion</p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('klyxy_user')
                    window.location.href = '/login'
                  }
                }}
              >
                Se déconnecter de tous les appareils
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Sécurité */}
      <Dialog open={openModal === 'security'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sécurité et confidentialité</DialogTitle>
            <DialogDescription>
              Informations sur la sécurité de votre compte
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Infos compte */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Informations du compte</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Adresse email</span>
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[180px] truncate">{settings?.email || user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Abonnement</span>
                  </div>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {accountType === 'free' ? 'Gratuit' : accountType === 'premium_plus' ? 'Premium+' : 'Premium'}
                  </span>
                </div>
                {settings?.createdAt && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Membre depuis</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(settings.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2FA */}
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Authentification à deux facteurs</p>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                  Bientôt
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sécurisez votre compte avec une couche de protection supplémentaire. Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>

            {/* Confidentialité */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Confidentialité</p>
              <p className="text-xs text-muted-foreground">
                Vos données personnelles sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  toast.info('Pour une demande de suppression de données, contactez le support.')
                }}
              >
                Demander la suppression de mes données
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
