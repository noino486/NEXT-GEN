"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoCarousel } from "@/components/video-carousel"
import { KlyxyVideoPlayer } from "@/components/klyxy-video-player"
import { getUser } from "@/lib/auth-client"
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites-client"
import { Button } from "@/components/ui/button"
import { Play, Info, Loader2, ThumbsUp, ThumbsDown, Share2 } from "lucide-react"
import { toast } from "sonner"
import { getVideoByIdPublic, getAllVideosPublic, type Video } from "@/lib/videos-client"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showDescription, setShowDescription] = useState(false)
  const [inFavorites, setInFavorites] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)

  // Charger la vidéo principale en priorité (affichage immédiat), "À suivre" en parallèle sans bloquer
  useEffect(() => {
    if (isNaN(id)) {
      setLoading(false)
      return
    }
    let cancelled = false
    getVideoByIdPublic(id).then((vRes) => {
      if (cancelled) return
      if (vRes.success && vRes.video) setVideo(vRes.video)
      else setVideo(null)
      setLoading(false)
    })
    getAllVideosPublic({ status: "published", limit: 24, light: true }).then((rRes) => {
      if (cancelled) return
      if (rRes.success && rRes.videos) {
        const others = rRes.videos.filter((v) => v.id !== id).slice(0, 12)
        setRelated(others)
      } else setRelated([])
      setRelatedLoading(false)
    })
    isFavorite(id).then((res) => {
      if (!cancelled && res.success && res.isFavorite !== undefined) setInFavorites(res.isFavorite)
    })
    return () => { cancelled = true }
  }, [id])

  const handleMaListe = async () => {
    const user = getUser()
    if (!user) {
      router.push("/login")
      return
    }
    if (favoritesLoading || isNaN(id)) return
    setFavoritesLoading(true)
    try {
      if (inFavorites) {
        const res = await removeFavorite(id)
        if (res.success) {
          setInFavorites(false)
          toast.success("Retiré de votre liste")
        } else if (res.error) toast.error(res.error)
      } else {
        const res = await addFavorite(id)
        if (res.success) {
          setInFavorites(true)
          toast.success("Ajouté à votre liste")
        } else if (res.error) toast.error(res.error)
      }
    } finally {
      setFavoritesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Navigation />
        <MobileBottomNav />
        <div className="flex min-h-[50vh] items-center justify-center pt-20 sm:pt-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Navigation />
        <MobileBottomNav />
        <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
          <p className="text-muted-foreground">Vidéo introuvable.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  const relatedForCarousel = related.map((v) => ({
    id: String(v.id),
    title: v.title,
    thumbnail: v.thumbnail ?? "",
    duration: v.duration ?? "0:00"
  }))

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6 pt-20 sm:pt-24">
        <div className="max-w-full">
          <div className="mb-6">
            <KlyxyVideoPlayer
              streamId={video.cloudflare_stream_id ?? ""}
              poster={video.thumbnail}
              className="w-full"
              disablePiP={getUser()?.accountType !== "premium_plus"}
            />
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>←</span>
              <span>Accueil</span>
            </Link>
          </div>

          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2">{video.title}</h1>
          {video.creator_username && (
            <p className="text-muted-foreground text-sm mb-4">{video.creator_username}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showDescription ? "Masquer" : "Plus d'infos"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMaListe}
              disabled={favoritesLoading}
              title={inFavorites ? "Retirer de ma liste" : "Ajouter à ma liste"}
            >
              {favoritesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : inFavorites ? (
                <ThumbsDown className="h-4 w-4 mr-2" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              {inFavorites ? "Retirer de ma liste" : "Ma liste"}
            </Button>
            {getUser()?.accountType === "premium_plus" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.share?.({ title: video.title, url: typeof window !== "undefined" ? window.location.href : "" })}
                title="Partager"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            )}
          </div>

          {showDescription && video.description && (
            <div className="bg-secondary rounded-lg p-4 sm:p-6 mb-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {(relatedLoading || relatedForCarousel.length > 0) && (
            <div className="mt-8">
              {relatedLoading ? (
                <div className="space-y-4">
                  <div className="h-7 w-32 rounded bg-muted animate-pulse" />
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="min-w-[240px] sm:min-w-[280px] flex-shrink-0 space-y-2">
                        <div className="aspect-video rounded-lg bg-muted animate-pulse" />
                        <div className="h-4 w-full rounded bg-muted animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <VideoCarousel title="À suivre" videos={relatedForCarousel} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
