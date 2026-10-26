"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoCarousel } from "@/components/video-carousel"
import { RankedVideoCarousel } from "@/components/ranked-video-carousel"
import { DecouvrirSections } from "@/components/discover-sections"
import { getAllVideosPublic, type Video } from "@/lib/videos-client"

function toCarouselVideo(v: Video) {
  return { id: String(v.id), title: v.title, thumbnail: v.thumbnail ?? "", duration: v.duration ?? "0:00" }
}

/** Pour le Top 10 : utiliser la miniature 9:16 (thumbnail_top10) si dispo, sinon thumbnail */
function toRankedVideo(v: Video, index: number) {
  const thumbnail = v.thumbnail_top10 ?? v.thumbnail ?? ""
  return { ...toCarouselVideo(v), thumbnail, rank: v.rank ?? index + 1 }
}

const CATEGORY_LABELS: Record<string, string> = {
  featured: "Contenu en Vedette",
  popular: "Populaire Maintenant",
  latest: "Dernières Sorties",
  selection: "Notre Selection",
  shorts: "Nos Shorts",
  series: "Nos Séries"
}

function DiscoverContent() {
  const category = useSearchParams().get("category")
  const [allVideos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAllVideosPublic({ status: "published" })
      .then((res) => {
        if (!cancelled && res.success && res.videos) setVideos(res.videos)
        if (!cancelled) setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const videos = category ? allVideos.filter((v) => v.category === category || v.categories?.includes(category)) : allVideos

  const featured = videos.filter((v) => v.category === "featured").map(toCarouselVideo)
  const popular = videos.filter((v) => v.is_top_10).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map((v, i) => toRankedVideo(v, i))
  const latest = videos.map(toCarouselVideo)
  const selection = videos.filter((v) => v.category === "selection").map(toCarouselVideo)
  const shorts = videos.filter((v) => v.category === "shorts").map(toCarouselVideo)
  const series = videos.filter((v) => v.category === "series").map(toCarouselVideo)

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      <section className="flex flex-col gap-2.5 px-6 pb-8 pt-[116px] lg:px-14">
        <h1 className="text-[32px] font-extrabold tracking-[-0.02em] md:text-[40px]">Découvrir</h1>
        <p className="text-base text-muted-foreground">Ce qui bouge, maintenant — lives, tendances et évènements Klyxy.</p>
      </section>

      {!loading && !category && videos.length > 0 && <DecouvrirSections videos={videos} />}

      {loading ? (
        <div className="space-y-12 container mx-auto px-6 sm:px-8 lg:px-12 pb-12">
          {[1, 2, 3, 4].map((i) => (
            <section key={i}>
              <div className="mb-2">
                <div className="h-7 w-48 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="min-w-[240px] sm:min-w-[280px] flex-shrink-0 space-y-2">
                    <div className="aspect-video rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-12 container mx-auto px-6 sm:px-8 lg:px-12 pb-12">
          {featured.length > 0 && (
            <section id="featured" className="scroll-mt-24">
              <VideoCarousel title={CATEGORY_LABELS.featured} videos={featured} />
            </section>
          )}
          {popular.length > 0 && (
            <section id="popular" className="scroll-mt-24">
              <RankedVideoCarousel title={CATEGORY_LABELS.popular} videos={popular} />
            </section>
          )}
          {latest.length > 0 && (
            <section id="latest" className="scroll-mt-24">
              <VideoCarousel title={CATEGORY_LABELS.latest} videos={latest} />
            </section>
          )}
          {selection.length > 0 && (
            <section id="selection" className="scroll-mt-24">
              <RankedVideoCarousel title={CATEGORY_LABELS.selection} videos={selection} showRank={false} showBadge badgeText="Pour vous" />
            </section>
          )}
          {shorts.length > 0 && (
            <section id="shorts" className="scroll-mt-24">
              <VideoCarousel title={CATEGORY_LABELS.shorts} videos={shorts} />
            </section>
          )}
          {series.length > 0 && (
            <section id="series" className="scroll-mt-24">
              <VideoCarousel title={CATEGORY_LABELS.series} videos={series} />
            </section>
          )}
          {!loading && videos.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>Aucune vidéo publiée.</p>
              <p className="mt-2 text-sm">Publiez des vidéos depuis le dashboard pour les voir ici.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverContent />
    </Suspense>
  )
}
