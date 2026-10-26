"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Video } from "@/lib/videos-client"
import { SectionHeader } from "@/components/section-header"
import { PlayBadge, DurationBadge } from "@/components/play-badge"
import { demoThumb } from "@/lib/demo-media"

// ---------------------------------------------------------------------------
// Tendances — 3 miniatures en éventail, posées en bas du hero

export function TendancesTrio({ videos }: { videos: Video[] }) {
  const trio = videos.slice(0, 3)
  const [centerIndex, setCenterIndex] = useState(0)

  if (trio.length < 3) return null

  const order = [
    trio[(centerIndex + 2) % trio.length],
    trio[centerIndex % trio.length],
    trio[(centerIndex + 1) % trio.length],
  ]

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-end">
        <Link href="/discover" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          Voir tout →
        </Link>
      </div>
      <div className="flex h-[210px] items-center justify-center gap-3.5" style={{ perspective: 1200 }}>
        <button
          onClick={() => setCenterIndex((i) => (i - 1 + trio.length) % trio.length)}
          className="z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-black/55 text-white"
          aria-label="Précédent"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <div className="flex items-center justify-center">
          {order.map((video, i) => {
            const isCenter = i === 1
            return (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group relative shrink-0 overflow-hidden rounded-lg bg-secondary transition-all"
                style={{
                  width: isCenter ? 320 : 260,
                  height: isCenter ? 180 : 146,
                  transform: isCenter ? "none" : `rotateY(${i === 0 ? 24 : -24}deg) scale(.85)`,
                  marginLeft: i === 2 ? -14 : 0,
                  marginRight: i === 0 ? -14 : 0,
                  zIndex: isCenter ? 5 : 1,
                  boxShadow: isCenter ? "0 20px 44px rgba(0,0,0,.6)" : "0 14px 30px rgba(0,0,0,.5)",
                }}
              >
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="block h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-secondary" />
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/85 to-transparent opacity-70 transition-opacity duration-200 ${
                    isCenter ? "group-hover:opacity-35" : ""
                  }`}
                />
                {isCenter && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <PlayBadge />
                    </div>
                    {video.duration && <DurationBadge className="bottom-2.5 right-2.5">{video.duration}</DurationBadge>}
                    <div className="absolute bottom-2.5 left-2.5 right-16 line-clamp-1 text-[13px] font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]">
                      {video.title}
                    </div>
                  </>
                )}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => setCenterIndex((i) => (i + 1) % trio.length)}
          className="z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-black/55 text-white"
          aria-label="Suivant"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Continuer à regarder — cartes 240×180 avec barre de progression
//
// TODO : aucune API d'historique de lecture n'existe encore. Les vidéos sont les
// plus récentes et la progression est fictive (PROGRESS_MOCK).

const PROGRESS_MOCK = [71, 34, 12]

export function ContinueWatchingRow({ videos }: { videos: Video[] }) {
  const items = videos.slice(0, PROGRESS_MOCK.length)
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-[18px]">
      <SectionHeader title="Continuer à regarder" seeAllHref="/ma-liste" />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {items.map((video, i) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="group relative h-[180px] w-[240px] shrink-0 overflow-hidden rounded-2xl bg-secondary"
          >
            <img src={video.thumbnail || demoThumb(i)} alt={video.title} className="block h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <PlayBadge />
            </div>
            <div className="absolute bottom-[26px] left-3 right-3 truncate text-[13px] font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]">
              {video.title}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
              <div className="h-full bg-primary" style={{ width: `${PROGRESS_MOCK[i]}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Populaire cette semaine — Top 10 avec grand numéro derrière la miniature

export function PopularRow({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null

  return (
    <section className="flex flex-col gap-[18px]">
      <SectionHeader title="Populaire cette semaine" seeAllHref="/discover#popular" />
      <div className="flex gap-[68px] overflow-x-auto pb-4 pl-16 pt-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {videos.map((video, i) => (
          <Link key={video.id} href={`/watch/${video.id}`} className="group relative shrink-0">
            <span
              className="pointer-events-none absolute bottom-[30px] left-0 z-0 block -translate-x-[52%] text-[175px] font-black leading-[.72] text-black"
              style={{
                WebkitTextStroke: "5px #fff",
                paintOrder: "stroke fill",
                textShadow: "0 0 12px rgba(255,255,255,.4)",
              }}
            >
              {video.rank ?? i + 1}
            </span>
            <div className="relative z-[1] h-[299px] w-[168px] overflow-hidden rounded-lg bg-secondary">
              <img
                src={video.thumbnail_top10 || video.thumbnail || demoThumb(i)}
                alt={video.title}
                className="block h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 opacity-60 transition-opacity duration-200 group-hover:opacity-0"
                style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,.9), transparent 45%)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <PlayBadge />
              </div>
              {video.duration && <DurationBadge className="bottom-2 right-2">{video.duration}</DurationBadge>}
              <div className="absolute inset-0 rounded-lg border border-transparent transition-colors duration-200 group-hover:border-white/20" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
