"use client"

// Page Shorts du design : lecteur portrait centré 420×746, rail d'actions, navigation
// haut/bas et rangée « D'autres shorts à découvrir ». Le lien « Shorts » de la navbar
// ouvre toujours la modale existante (app/shorts/shorts-modal.tsx).

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronUp, ChevronDown, ArrowRight, Bookmark, Share, CalendarDays } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { SectionHeader } from "@/components/section-header"
import { PlayBadge } from "@/components/play-badge"
import { KlyxyVideoPlayer } from "@/components/klyxy-video-player"
import { getAllVideosPublic, type Video } from "@/lib/videos-client"
import { demoThumb } from "@/lib/demo-media"

const DROP_SHADOW = { filter: "drop-shadow(0 1px 6px rgba(0,0,0,.5))" }
const TEXT_SHADOW = "[text-shadow:0_1px_8px_rgba(0,0,0,.6)]"

function formatDate(iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function ShortsWebPage() {
  const router = useRouter()
  const [shorts, setShorts] = useState<Video[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllVideosPublic({ category: "shorts" })
      .then((res) => {
        if (res.success && res.videos) setShorts(res.videos)
      })
      .finally(() => setLoading(false))
  }, [])

  const current = shorts[index]
  const goTo = (next: number) => {
    if (next >= 0 && next < shorts.length) setIndex(next)
  }

  const share = async () => {
    if (!current) return
    const url = `${window.location.origin}/watch/${current.id}`
    try {
      if (navigator.share) await navigator.share({ title: current.title, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* partage annulé */
    }
  }

  const others = shorts.filter((_, i) => i !== index).slice(0, 5)
  const date = formatDate(current?.published_at)

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      {loading || !current ? (
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          {loading ? "Chargement…" : "Aucun short pour le moment."}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-7 px-6 pt-[122px] lg:px-14">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-opacity disabled:opacity-30 md:flex"
              aria-label="Short précédent"
            >
              <ChevronUp className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </button>

            <div className="relative h-[746px] w-[420px] max-w-full shrink-0 overflow-hidden rounded-[22px] bg-secondary shadow-[0_24px_64px_rgba(0,0,0,.6)]">
              {current.cloudflare_stream_id ? (
                <KlyxyVideoPlayer
                  key={current.id}
                  streamId={current.cloudflare_stream_id}
                  poster={current.thumbnail_top10 || current.thumbnail}
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <img
                  src={current.thumbnail_top10 || current.thumbnail || demoThumb(index)}
                  alt={current.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
              )}
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 18%)" }} />
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 26%)" }} />

              {/* Rail d'actions */}
              <div className="absolute bottom-[120px] right-[18px] z-[6] flex flex-col items-center gap-6">
                <button onClick={() => router.push(`/watch/${current.id}`)} className="flex flex-col items-center gap-1.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_4px_14px_rgba(0,229,255,.4)]">
                    <ArrowRight className="h-[21px] w-[21px] text-black" strokeWidth={2.25} />
                  </span>
                  <span className="text-xs font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">Voir</span>
                </button>
                <button className="flex flex-col items-center gap-1.5">
                  <Bookmark className="h-[30px] w-[30px] fill-white text-white" style={DROP_SHADOW} />
                  <span className="text-xs font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">Enregistrer</span>
                </button>
                <button onClick={share} className="flex flex-col items-center gap-0.5">
                  <Share className="h-[29px] w-[29px] text-white" strokeWidth={2} style={DROP_SHADOW} />
                  <span className="text-xs font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">Partager</span>
                </button>
              </div>

              {/* Légende */}
              <div className="pointer-events-none absolute bottom-6 left-5 right-[100px] z-[6] flex flex-col gap-[9px]">
                <div className={`text-[17px] font-bold text-white ${TEXT_SHADOW}`}>{current.title}</div>
                {current.description && (
                  <div className={`line-clamp-2 text-sm font-medium leading-[1.4] text-white ${TEXT_SHADOW}`}>{current.description}</div>
                )}
                {date && (
                  <div className="flex items-center gap-[7px]">
                    <CalendarDays className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    <span className="text-[13px] font-medium text-white [text-shadow:0_1px_6px_rgba(0,0,0,.6)]">{date}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => goTo(index + 1)}
              disabled={index >= shorts.length - 1}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-opacity disabled:opacity-30 md:flex"
              aria-label="Short suivant"
            >
              <ChevronDown className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </button>
          </div>

          {others.length > 0 && (
            <div className="flex flex-col gap-[18px] px-6 pb-[60px] pt-12 lg:px-14">
              <SectionHeader title="D'autres shorts à découvrir" seeAllHref="/discover#shorts" />
              <div className="flex justify-start gap-[18px] overflow-x-auto pb-2 scrollbar-hide md:justify-center" style={{ scrollbarWidth: "none" }}>
                {others.map((video, i) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setIndex(shorts.findIndex((s) => s.id === video.id))
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="group relative h-[302px] w-[170px] shrink-0 overflow-hidden rounded-[14px] bg-secondary text-left"
                  >
                    <img src={video.thumbnail_top10 || video.thumbnail || demoThumb(i)} alt={video.title} className="block h-full w-full object-cover" />
                    <div
                      className="absolute inset-0 opacity-65 transition-opacity duration-200 group-hover:opacity-30"
                      style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,.85), transparent 55%)" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <PlayBadge size={44} />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 line-clamp-2 text-[13px] font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]">
                      {video.title}
                    </div>
                    <div className="absolute inset-0 rounded-[14px] border border-transparent transition-colors duration-200 group-hover:border-white/20" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
