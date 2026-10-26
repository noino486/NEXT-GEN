"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignupModal({ open, onOpenChange }: SignupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl md:max-w-3xl p-0 gap-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2.5 sm:pb-3 border-b border-border/50">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Choisissez votre formule
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-row md:grid md:grid-cols-2 gap-2 md:gap-0 items-start overflow-x-auto scrollbar-hide md:divide-y-0 md:divide-x divide-border/50">
          {/* Côté Gratuit */}
          <div className="p-3 md:p-4 sm:p-6 flex flex-col flex-shrink-0 w-[200px] md:w-auto">
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
            </div>

            <Button 
              variant="outline" 
              className="w-full max-w-[85%] mx-auto border-2 hover:bg-secondary text-sm sm:text-base py-2 sm:py-2"
            >
              Continuer gratuitement
            </Button>
          </div>

          {/* Côté Payant */}
          <div className="p-3 md:p-4 sm:p-6 flex flex-col flex-shrink-0 w-[200px] md:w-auto relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t-2 md:border-t-0 md:border-l-2 border-primary/50">
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
              <span className="bg-primary text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                POPULAIRE
              </span>
            </div>

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
                  <p className="text-sm sm:text-base font-medium">Accès illimité</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tout le contenu disponible</p>
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
                  <p className="text-sm sm:text-base font-medium">Qualité maximale</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">4K et Ultra HD disponible</p>
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
                  <p className="text-xs sm:text-sm text-muted-foreground">Sur tous vos appareils</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full max-w-[85%] mx-auto bg-primary hover:bg-primary/90 text-black font-bold text-sm sm:text-base py-2 sm:py-2"
            >
              Créer un compte Premium
            </Button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary/50 text-center text-[10px] sm:text-xs text-muted-foreground">
          <p>Vous pouvez annuler à tout moment. Sans engagement.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

