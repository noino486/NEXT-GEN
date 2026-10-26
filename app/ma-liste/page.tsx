"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth-client"
import { getFavorites, removeFavorite } from "@/lib/favorites-client"
import type { Video } from "@/lib/videos-client"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

function toCarouselVideo(v: Video) {
  return {
    id: String(v.id),
    title: v.title,
    thumbnail: v.thumbnail ?? "",
    duration: v.duration ?? "0:00",
  }
}

export default function MaListePage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push("/login")
      return
    }

    let cancelled = false
    setLoading(true)
    getFavorites()
      .then((res) => {
        if (!cancelled && res.success && res.videos) {
          setVideos(res.videos)
        } else if (!res.success && res.error) {
          toast.error(res.error)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [router])

  const handleRemove = async (videoId: number) => {
    const res = await removeFavorite(videoId)
    if (res.success) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
      toast.success("Retiré de votre liste")
    } else if (res.error) {
      toast.error(res.error)
    }
  }

  if (!getUser()) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24 sm:pt-28">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ma Liste</h1>
            <p className="text-sm text-muted-foreground">Vos vidéos sauvegardées</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card/30">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Votre liste est vide</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Cliquez sur le bouton « Ma liste » sur une vidéo pour l&apos;ajouter ici.
            </p>
            <Button asChild>
              <Link href="/discover">Découvrir des vidéos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="group relative">
                <VideoCard {...toCarouselVideo(video)} />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(video.id)
                  }}
                >
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
