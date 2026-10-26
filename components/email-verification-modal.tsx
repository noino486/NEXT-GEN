"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, X } from "lucide-react"
import Link from "next/link"

interface EmailVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
}

export function EmailVerificationModal({ 
  open, 
  onOpenChange,
  userEmail 
}: EmailVerificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg md:text-2xl font-bold">
            Vérification d'email requise
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Vous devez vérifier votre adresse email avant de pouvoir regarder des vidéos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Instructions :</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Vérifiez votre boîte de réception ({userEmail || "votre email"})</li>
              <li>Cliquez sur le lien de vérification dans l'email</li>
              <li>Reconnectez-vous pour activer votre compte</li>
            </ol>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Si vous n'avez pas reçu l'email, vérifiez votre dossier de spams ou contactez le support.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
            asChild
          >
            <Link href="/dashboard">
              Aller aux paramètres
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

