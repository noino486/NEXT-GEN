"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth-client"
import { Download, Loader2, CheckCircle, Clock } from "lucide-react"

interface DownloadItem {
  id: string
  videoId: number
  title: string
  thumbnail: string
  duration: string
  progress?: number
  status: "pending" | "downloading" | "completed" | "failed"
}

export default function MesTelechargementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [inProgress, setInProgress] = useState<DownloadItem[]>([])
  const [completed, setCompleted] = useState<DownloadItem[]>([])

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push("/login")
      return
    }

    // TODO: Charger les téléchargements depuis l'API / stockage local
    setLoading(false)
    setInProgress([])
    setCompleted([])
  }, [router])

  if (!getUser()) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24 sm:pt-28">
        <div className="flex items-center gap-3 mb-8">
          <Download className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes Téléchargements</h1>
            <p className="text-sm text-muted-foreground">
              Téléchargements en cours et vidéos disponibles hors ligne
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Téléchargements en cours */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <Clock className="h-5 w-5 text-primary" />
                En cours
              </h2>
              {inProgress.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">Aucun téléchargement en cours</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {inProgress.map((item) => (
                    <div key={item.id} className="relative rounded-lg overflow-hidden border border-border bg-card/50">
                      <VideoCard
                        id={String(item.videoId)}
                        title={item.title}
                        thumbnail={item.thumbnail}
                        duration={item.duration}
                      />
                      {item.progress !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Téléchargements effectués */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                Terminés
              </h2>
              {completed.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">Aucune vidéo téléchargée</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Utilisez le bouton « Télécharger » sur une vidéo (Premium+) pour la visionner hors ligne.
                  </p>
                  <Button asChild>
                    <Link href="/discover">Découvrir des vidéos</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {completed.map((item) => (
                    <div key={item.id}>
                      <VideoCard
                        id={String(item.videoId)}
                        title={item.title}
                        thumbnail={item.thumbnail}
                        duration={item.duration}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
