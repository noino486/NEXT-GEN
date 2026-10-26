"use client"

// Sections de la page Découvrir (design Klyxy) :
//   1. En Direct sur Klyxy et prochainement..   (mock)
//   2. Rediffusion Live                          (vraies vidéos)
//   3. Vidéos à venir                            (mock)
//   4. Vidéo Mystère                             (vraies vidéos)
//   5. Jeux Concours                             (mock)
//
// TODO : « live », « évènement programmé » et « concours » n'ont pas encore de modèle côté API.
// Les tableaux LIVE_HIGHLIGHTS / UPCOMING_VIDEOS / CONTESTS sont donc fictifs ; leurs visuels
// viennent des vidéos publiées quand il y en a, sinon des assets de /public (lib/demo-media.ts).

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Play, Star, Ticket } from "lucide-react"
import type { Video } from "@/lib/videos-client"
import { SectionHeader } from "@/components/section-header"
import { demoThumb } from "@/lib/demo-media"

interface Highlight {
  id: string
  title: string
  kind: "live" | "upcoming"
  badge: string
  viewers?: string
}

const LIVE_HIGHLIGHTS: Highlight[] = [
  { id: "live-1", title: "Freestyle Studio — Session live", kind: "live", badge: "EN DIRECT", viewers: "2 340 spectateurs" },
  { id: "live-2", title: "Marché de Noël — Premier extrait", kind: "upcoming", badge: "DEMAIN · 20H00" },
  { id: "live-3", title: "Battle Freestyle National", kind: "upcoming", badge: "VENDREDI · 19H30" },
]

const UPCOMING_VIDEOS: Highlight[] = [
  { id: "up-1", title: "Pax Massilia — Épisode 2", kind: "upcoming", badge: "SAMEDI · 18H00" },
  { id: "up-2", title: "Best of réactions — Vol. 2", kind: "upcoming", badge: "DIMANCHE · 21H00" },
  { id: "up-3", title: "Tous les jours la même nuit — Finale", kind: "upcoming", badge: "MARDI · 19H00" },
]

const CONTESTS = [
  { id: "c-1", title: "Golden Coast Festival", subtitle: "2 places à gagner" },
  { id: "c-2", title: "Les Ardentes", subtitle: "2 places à gagner" },
  { id: "c-3", title: "Rose Festival", subtitle: "2 places à gagner" },
]

const CARD_OVERLAY = "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.35) 45%, transparent 72%)"
const GOLD = "#FFD24D"

/** Visuel d'une carte : miniature de la vidéo publiée de même rang, sinon visuel de démo. */
function pickThumb(videos: Video[], index: number): string {
  return videos[index]?.thumbnail || demoThumb(index)
}

// ---------------------------------------------------------------------------
// 1 & 3. En Direct / Vidéos à venir — même carte (400×220)

function HighlightRow({ title, items, videos, offset = 0 }: { title: string; items: Highlight[]; videos: Video[]; offset?: number }) {
  const [reminded, setReminded] = useState<Record<string, boolean>>({})

  return (
    <section className="flex flex-col gap-[18px] px-6 pb-12 lg:px-14">
      <SectionHeader title={title} />
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {items.map((item, i) => (
          <div key={item.id} className="relative h-[220px] w-[400px] shrink-0 overflow-hidden rounded-[14px] bg-secondary">
            <img src={pickThumb(videos, offset + i)} alt={item.title} className="block h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: CARD_OVERLAY }} />

            {item.kind === "live" ? (
              <div className="absolute left-3.5 top-3.5 flex items-center gap-[7px] rounded-full bg-black/60 py-1.5 pl-2.5 pr-3">
                <span className="live-dot h-[7px] w-[7px] rounded-full bg-[#FF4545]" />
                <span className="text-[11px] font-bold tracking-[.02em] text-white">{item.badge}</span>
              </div>
            ) : (
              <div className="absolute left-3.5 top-3.5 rounded-full bg-black/60 px-3.5 py-1.5">
                <span className="text-[11px] font-bold tracking-[.02em] text-primary">{item.badge}</span>
              </div>
            )}

            <div className="absolute inset-x-[18px] bottom-4 flex flex-col gap-2.5">
              <div>
                <div className="text-base font-bold text-white">{item.title}</div>
                {item.viewers && <div className="mt-[3px] text-xs text-[rgba(244,244,245,.65)]">{item.viewers}</div>}
              </div>
              {item.kind === "live" ? (
                <button className="inline-flex h-9 w-fit items-center gap-[7px] rounded-full bg-primary px-[18px] text-[13px] font-semibold text-black">
                  <Play className="h-[11px] w-[11px] fill-current" />
                  Regarder
                </button>
              ) : (
                <button
                  onClick={() => setReminded((r) => ({ ...r, [item.id]: !r[item.id] }))}
                  className="inline-flex h-9 w-fit items-center gap-[7px] rounded-full bg-[rgba(244,244,245,.14)] px-[18px] text-[13px] font-semibold text-white"
                >
                  <Bell className="h-3 w-3" strokeWidth={2} />
                  {reminded[item.id] ? "Rappel activé" : "Me rappeler"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function EnDirectSection({ videos }: { videos: Video[] }) {
  return <HighlightRow title="En Direct sur Klyxy et prochainement.." items={LIVE_HIGHLIGHTS} videos={videos} />
}

export function VideosAVenirSection({ videos }: { videos: Video[] }) {
  return <HighlightRow title="Vidéos à venir" items={UPCOMING_VIDEOS} videos={videos} offset={3} />
}

// ---------------------------------------------------------------------------
// 2. Rediffusion Live — rangée de couvertures 9:16

export function RediffusionLiveSection({ videos }: { videos: Video[] }) {
  const router = useRouter()
  const covers = videos.slice(0, 8)
  if (covers.length === 0) return null

  return (
    <section className="flex flex-col gap-[18px] px-6 pb-12 lg:px-14">
      <SectionHeader title="Rediffusion Live" subtitle="Les prochains lives" />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {covers.map((video) => (
          <button
            key={video.id}
            onClick={() => router.push(`/watch/${video.id}`)}
            className="relative h-[267px] w-[150px] shrink-0 overflow-hidden rounded-[14px] bg-secondary"
            aria-label={video.title}
          >
            <img
              src={video.thumbnail_top10 || video.thumbnail || demoThumb(0)}
              alt=""
              className="block h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 4. Vidéo Mystère — bannière floutée, 5 vignettes au choix

export function VideoMystereSection({ videos }: { videos: Video[] }) {
  const router = useRouter()
  const picks = videos.slice(0, 5)
  const backdrop = videos[0]?.thumbnail || demoThumb(0)

  const chooseRandom = () => {
    if (picks.length === 0) return
    router.push(`/watch/${picks[Math.floor(Math.random() * picks.length)].id}`)
  }

  return (
    <section className="px-6 pb-12 lg:px-14">
      <div className="relative h-[320px] w-full overflow-hidden rounded-[20px] bg-secondary">
        <img src={backdrop} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover" style={{ filter: "blur(22px)" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[26px] font-black text-black">?</div>
          <div className="text-[26px] font-extrabold text-white">Vidéo Mystère</div>
          <div className="max-w-[360px] text-sm font-medium leading-[1.45] text-[rgba(244,244,245,.8)]">
            5 vidéos secrètes vous attendent. À vous de choisir.
          </div>
          <div className="flex gap-2.5 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[1.5px] border-white/30">
                <img
                  src={picks[i]?.thumbnail || demoThumb(i)}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: "blur(3px) brightness(.6)" }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[17px] font-extrabold text-white">?</span>
              </div>
            ))}
          </div>
          <button
            onClick={chooseRandom}
            className="mt-1.5 inline-flex h-[42px] items-center gap-[7px] rounded-full bg-primary px-6 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Star className="h-[13px] w-[13px] fill-current" />
            Je choisis ma vidéo
          </button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 5. Jeux Concours — cartes 400×220

export function JeuxConcoursSection({ videos }: { videos: Video[] }) {
  return (
    <section className="flex flex-col gap-[18px] px-6 pb-20 lg:px-14">
      <SectionHeader title="Jeux Concours" />
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {CONTESTS.map((contest, i) => (
          <div key={contest.id} className="relative h-[220px] w-[400px] shrink-0 overflow-hidden rounded-[14px] bg-secondary">
            <img src={pickThumb(videos, 6 + i)} alt={contest.title} className="block h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: CARD_OVERLAY }} />
            <div className="absolute left-3.5 top-3.5 flex items-center gap-[7px] rounded-full bg-black/60 py-1.5 pl-3 pr-3.5">
              <Ticket className="h-3 w-3" style={{ color: GOLD }} fill={GOLD} />
              <span className="text-[11px] font-bold tracking-[.02em]" style={{ color: GOLD }}>
                CONCOURS
              </span>
            </div>
            <div className="absolute inset-x-[18px] bottom-4 flex flex-col gap-2.5">
              <div>
                <div className="text-base font-bold text-white">{contest.title}</div>
                <div className="mt-[3px] text-xs text-[rgba(244,244,245,.65)]">{contest.subtitle}</div>
              </div>
              <button
                className="inline-flex h-9 w-fit items-center rounded-full px-[18px] text-[13px] font-semibold text-black"
                style={{ background: GOLD }}
              >
                Participer
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------

export function DecouvrirSections({ videos }: { videos: Video[] }) {
  const published = videos.filter((v) => v.status === "published")
  return (
    <>
      <EnDirectSection videos={published} />
      <RediffusionLiveSection videos={published} />
      <VideosAVenirSection videos={published} />
      <VideoMystereSection videos={published} />
      <JeuxConcoursSection videos={published} />
    </>
  )
}
