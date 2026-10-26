"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { VideoCarousel } from "@/components/video-carousel"
import { RankedVideoCarousel } from "@/components/ranked-video-carousel"
import { Play, Plus } from "lucide-react"
import Image from "next/image"
import { getAllVideosPublic, type Video } from "@/lib/videos-client"
import { getActiveTrailer } from "@/lib/hero-trailers-client"
import { HeroVideo } from "@/components/hero-video"
import { TendancesTrio, ContinueWatchingRow, PopularRow } from "@/components/home-sections"

function toCarouselVideo(v: Video) {
  return { id: String(v.id), title: v.title ?? "", thumbnail: v.thumbnail ?? "", duration: v.duration ?? "0:00", pitch: v.description?.slice(0, 80) }
}

/** Pour le Top 10 : utiliser la miniature 9:16 (thumbnail_top10) si dispo, sinon thumbnail */
function toRankedVideo(v: Video, index: number) {
  const thumbnail = v.thumbnail_top10 ?? v.thumbnail ?? ""
  return { ...toCarouselVideo(v), thumbnail, rank: v.rank ?? index + 1 }
}

function resolveVideoUrl(url: string): string {
  if (!url || !url.trim()) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return url
  return url
}

function getHeroVideoUrl(trailer: {
  video_url?: string | null
  cloudflare_stream_id?: string | null
}): string {
  if (trailer.cloudflare_stream_id) {
    const code = (process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? "")
      .replace(/^https?:\/\//i, "")
      .replace(/^customer-/i, "")
      .replace(/\.cloudflarestream\.com.*$/i, "")
      .trim() || "l0yzss3rimrxsqvu"
    return `https://customer-${code}.cloudflarestream.com/${trailer.cloudflare_stream_id}/manifest/video.m3u8`
  }
  return resolveVideoUrl(trailer.video_url ?? "")
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [heroTrailer, setHeroTrailer] = useState<{
    video_url?: string | null
    cloudflare_stream_id?: string | null
    poster_url?: string | null
    video_id?: number | null
    updated_at?: string | null
  } | null>(null)
  const [heroVideo, setHeroVideo] = useState<{
    id: number
    title?: string
    thumbnail?: string
    cloudflare_stream_id?: string
    updated_at?: string | null
  } | null>(null)
  const [heroContent, setHeroContent] = useState<{
    title?: string | null
    title_accent?: string | null
    description?: string | null
    show_content: boolean
  } | null>(null)

  useEffect(() => {
    getActiveTrailer().then((res) => {
      if (res.success) {
        if (res.trailer) {
          setHeroTrailer({
            video_url: res.trailer.video_url,
            cloudflare_stream_id: res.trailer.cloudflare_stream_id,
            poster_url: res.trailer.poster_url,
            video_id: res.trailer.video_id,
            updated_at: (res.trailer as { updated_at?: string }).updated_at,
          })
        }
        if (res.video) setHeroVideo({
          id: res.video.id,
          title: res.video.title,
          thumbnail: res.video.thumbnail,
          cloudflare_stream_id: res.video.cloudflare_stream_id,
          updated_at: (res.video as { updated_at?: string }).updated_at,
        })
        if (res.heroContent) setHeroContent(res.heroContent)
      }
    })
  }, [])

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

  // Une vidéo peut être dans plusieurs sections via categories[] ou category (rétrocompat)
  const inCategory = (v: Video, slug: string) =>
    (v.categories && v.categories.includes(slug)) || v.category === slug || (slug === "fastlife" && v.category === "lifestyle")
  const safeVideos = videos.filter((v): v is Video => v != null && v.id != null)
  // Most recently published video — used as fallback hero background
  const latestPublishedVideo = safeVideos.length > 0
    ? [...safeVideos].sort((a, b) => {
        const aTime = new Date((a as any).created_at ?? (a as any).updated_at ?? 0).getTime()
        const bTime = new Date((b as any).created_at ?? (b as any).updated_at ?? 0).getTime()
        return bTime - aTime
      })[0]
    : null
  const popularVideos = safeVideos.filter((v) => v.is_top_10).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  const latest = [...safeVideos].map(toCarouselVideo)
  const popular = safeVideos.filter((v) => v.is_top_10).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map((v, i) => toRankedVideo(v, i))
  const influences = safeVideos.filter((v) => inCategory(v, "influences")).map(toCarouselVideo)
  const rapMusique = safeVideos.filter((v) => inCategory(v, "rap_musique")).map(toCarouselVideo)
  const inside = safeVideos.filter((v) => inCategory(v, "inside")).map(toCarouselVideo)
  const sport = safeVideos.filter((v) => inCategory(v, "sport")).map(toCarouselVideo)
  const featured = safeVideos.filter((v) => inCategory(v, "featured")).map(toCarouselVideo)
  const fastlife = safeVideos.filter((v) => inCategory(v, "fastlife")).map(toCarouselVideo)
  const podcast = safeVideos.filter((v) => inCategory(v, "podcast")).map(toCarouselVideo)
  const vlog = safeVideos.filter((v) => inCategory(v, "vlog")).map(toCarouselVideo)
  const humour = safeVideos.filter((v) => inCategory(v, "humour")).map(toCarouselVideo)
  const mode = safeVideos.filter((v) => inCategory(v, "mode")).map(toCarouselVideo)
  const gossip = safeVideos.filter((v) => inCategory(v, "gossip")).map(toCarouselVideo)
  const teleRealite = safeVideos.filter((v) => inCategory(v, "tele_realite")).map(toCarouselVideo)
  const selection = safeVideos.filter((v) => inCategory(v, "selection")).map((v, i) => toRankedVideo(v, i))
  const shorts = safeVideos.filter((v) => inCategory(v, "shorts")).map(toCarouselVideo)

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation overlay />
      <MobileBottomNav />

      <section className="relative h-[680px] md:h-[820px] overflow-hidden">
        <div className="absolute inset-0">
          {(() => {
            const rawUrl = heroVideo?.thumbnail
              || heroTrailer?.poster_url
              || latestPublishedVideo?.thumbnail
              || "/concert-stage-performance.png"
            const cacheBust = heroVideo?.updated_at ?? heroTrailer?.updated_at ?? null
            const posterUrl = !rawUrl || rawUrl.startsWith("data:") || cacheBust == null
              ? (rawUrl || "/concert-stage-performance.png")
              : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(String(cacheBust))}`
            if (heroTrailer?.video_id && heroVideo) {
              if (heroTrailer.cloudflare_stream_id) {
                return (
                  <HeroVideo
                    key={`trailer-${heroTrailer.cloudflare_stream_id}`}
                    videoUrl={getHeroVideoUrl({ cloudflare_stream_id: heroTrailer.cloudflare_stream_id })}
                    posterUrl={posterUrl}
                    className="w-full h-full object-cover"
                  />
                )
              }
              return (
                <div className="w-full h-full bg-background">
                  <img src={posterUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )
            }
            if (heroTrailer?.cloudflare_stream_id || heroTrailer?.video_url) {
              return (
                <HeroVideo
                  key={heroTrailer.cloudflare_stream_id || heroTrailer.video_url || ""}
                  videoUrl={getHeroVideoUrl(heroTrailer)}
                  posterUrl={posterUrl}
                  className="w-full h-full object-cover"
                />
              )
            }
            return (
              <img
                src={posterUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            )
          })()}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,.86) 9%, rgba(0,0,0,.6) 18%, rgba(0,0,0,.32) 28%, transparent 40%)" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.4) 0%, transparent 40%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 16%)" }} />
        </div>

        <div className="absolute inset-0 z-[5] flex flex-col justify-between px-6 pb-8 pt-[76px] lg:px-14">
          <div className="mt-24 flex max-w-[540px] flex-col gap-[18px] md:mt-[190px]">
            <h1 className="text-[40px] font-extrabold leading-[1.03] tracking-[-0.02em] [text-shadow:0_4px_24px_rgba(0,0,0,.55)] md:text-[50px]">
              {heroContent?.show_content && (heroContent.title || heroContent.title_accent) ? (
                <>
                  <span className="block text-white">{heroContent.title}</span>
                  {heroContent.title_accent && <span className="block text-primary">{heroContent.title_accent}</span>}
                </>
              ) : (
                <>
                  <span className="block text-white">Découvrez</span>
                  <span className="block text-primary">Klyxy</span>
                </>
              )}
            </h1>
            <p className="max-w-[420px] text-base leading-[1.55] text-foreground/85 [text-shadow:0_2px_12px_rgba(0,0,0,.6)]">
              {heroContent?.show_content && heroContent.description
                ? heroContent.description
                : "Le meilleur du rap, du lifestyle et du sport, au même endroit."}
            </p>
            <div className="flex items-center gap-3.5 pt-1">
              <Link
                href={heroVideo?.id ? `/watch/${heroVideo.id}` : latestPublishedVideo?.id ? `/watch/${latestPublishedVideo.id}` : latest.length ? `/watch/${latest[0].id}` : "/discover"}
                className="inline-flex h-[42px] items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                <Play className="h-[15px] w-[15px] fill-current" />
                Lecture
              </Link>
              <Link
                href={heroVideo?.id ? `/watch/${heroVideo.id}` : latestPublishedVideo?.id ? `/watch/${latestPublishedVideo.id}` : latest.length ? `/watch/${latest[0].id}` : "/discover"}
                aria-label="Plus d'infos"
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-foreground/50 text-white transition-colors hover:bg-white/10"
              >
                <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <TendancesTrio videos={safeVideos} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </section>

      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <section key={i} className="container mx-auto py-4">
              <div className="mb-2 px-4 lg:px-8">
                <div className="h-7 w-48 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden px-4 lg:px-8">
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
        </>
      ) : (
        <>
          <div className="flex flex-col gap-11 px-6 pb-4 pt-10 lg:px-14">
            <ContinueWatchingRow videos={safeVideos} />
            <PopularRow videos={popularVideos} />
          </div>
          {latest.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Dernières sorties" videos={latest} />
            </section>
          )}
          {influences.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Influences" videos={influences} />
            </section>
          )}
          {rapMusique.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Rap / Musique" videos={rapMusique} />
            </section>
          )}
          {inside.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Inside" videos={inside} />
            </section>
          )}
          {sport.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Sport" videos={sport} />
            </section>
          )}
          {featured.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Contenu en vedette" videos={featured} />
            </section>
          )}
          {fastlife.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Fastlife" videos={fastlife} />
            </section>
          )}
          {podcast.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Podcast" videos={podcast} />
            </section>
          )}
          {vlog.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Vlog" videos={vlog} />
            </section>
          )}
          {humour.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Humour" videos={humour} />
            </section>
          )}
          {mode.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Mode" videos={mode} />
            </section>
          )}
          {gossip.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Gossip" videos={gossip} />
            </section>
          )}
          {teleRealite.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Télé réalité" videos={teleRealite} />
            </section>
          )}
          {selection.length > 0 && (
            <section className="container mx-auto py-0">
              <RankedVideoCarousel title="Notre Sélection" videos={selection} showRank={false} showBadge badgeText="Pour vous" />
            </section>
          )}
          {shorts.length > 0 && (
            <section className="container mx-auto py-0">
              <VideoCarousel title="Shorts" videos={shorts} />
            </section>
          )}
          {!loading && latest.length === 0 && popular.length === 0 && influences.length === 0 && rapMusique.length === 0 && inside.length === 0 && sport.length === 0 && featured.length === 0 && fastlife.length === 0 && podcast.length === 0 && vlog.length === 0 && humour.length === 0 && mode.length === 0 && gossip.length === 0 && teleRealite.length === 0 && selection.length === 0 && shorts.length === 0 && (
            <section className="container mx-auto py-12 text-center text-muted-foreground">
              <p>Aucune vidéo publiée pour le moment.</p>
              <p className="mt-2 text-sm">Publiez des vidéos depuis le dashboard pour les voir ici.</p>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-border/50 mt-10 md:mt-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Plateforme</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">À propos</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Créateurs</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Partenaires</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Support</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">Centre d'aide</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Communauté</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Légal</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">Confidentialité</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Conditions</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Directives</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Réseaux</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">Instagram</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Twitter</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Discord</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 md:mt-16 pt-4 sm:pt-6 md:pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">© 2026 klyxy. Tous droits réservés.</p>
            <Image src="/klyxy.svg" alt="KLYXY" width={82} height={28} className="h-[22px] w-auto" style={{ width: 'auto' }} />
          </div>
        </div>
      </footer>
    </div>
  )
}
