"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Settings } from "lucide-react"
import Image from "next/image"
import { getUser } from "@/lib/auth-client"

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push('/signup')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Image 
                  src="/klyxy.svg" 
                  alt="KLYXY" 
                  width={70} 
                  height={24}
                  className="h-auto w-full max-w-[50px]"
                  style={{ height: 'auto' }}
                  priority
                />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-black mb-2">
                Votre compte a été créé avec succès !
              </CardTitle>
              <CardDescription className="text-base">
                Bienvenue sur KLYXY ! Vérifiez votre email pour activer votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-foreground font-medium mb-2">
                    📧 Vérification par email requise
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nous avons envoyé un email de confirmation à l'adresse que vous avez fournie.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Veuillez cliquer sur le lien dans l'email pour vérifier votre compte et commencer à utiliser KLYXY.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si vous n'avez pas reçu l'email, vérifiez votre dossier spam ou contactez le support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <Link href="/">
                    <Home className="h-5 w-5 mr-2" />
                    Revenir à l'accueil
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                >
                  <Link href="/dashboard">
                    <Settings className="h-5 w-5 mr-2" />
                    Gérer mon compte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

