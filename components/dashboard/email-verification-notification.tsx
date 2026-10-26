"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface EmailVerificationNotificationProps {
  userEmail?: string
  onDismiss?: () => void
}

export function EmailVerificationNotification({ 
  userEmail,
  onDismiss 
}: EmailVerificationNotificationProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <Alert className="border-primary/50 bg-primary/5 mb-4">
      <Mail className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">
        Email non vérifié
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-muted-foreground mb-3">
          Votre adresse email ({userEmail || "votre email"}) n'a pas encore été vérifiée. 
          Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Masquer
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

