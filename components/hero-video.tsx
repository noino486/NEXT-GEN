"use client"

import { useEffect, useRef } from "react"

function isHlsUrl(url: string): boolean {
  if (!url || !url.trim()) return false
  const u = url.toLowerCase()
  return u.includes(".m3u8") || u.includes("/manifest/")
}

interface HeroVideoProps {
  videoUrl: string
  posterUrl?: string | null
  className?: string
}

export function HeroVideo({ videoUrl, posterUrl, className = "" }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<InstanceType<typeof import("hls.js").default> | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const url = videoUrl.trim()
    const useHls = isHlsUrl(url)

    if (useHls && typeof window !== "undefined") {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls()
          hlsRef.current = hls
          hls.loadSource(url)
          hls.attachMedia(video)
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url
        }
      })
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
      }
    }
  }, [videoUrl])

  const poster = posterUrl || "/concert-stage-performance.png"

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      poster={poster}
    >
      {!isHlsUrl(videoUrl) && <source src={videoUrl} type="video/mp4" />}
      <img src="/concert-stage-performance.png" alt="KLYXY" className="w-full h-full object-cover" />
    </video>
  )
}
