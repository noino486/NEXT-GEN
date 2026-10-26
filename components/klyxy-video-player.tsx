"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings2, RotateCcw, RotateCw } from "lucide-react"
import Hls from "hls.js"

interface KlyxyVideoPlayerProps {
  streamId: string
  poster?: string
  className?: string
  /** Désactive PiP pour free/premium (activé pour premium_plus uniquement) */
  disablePiP?: boolean
}

function normalizeCustomerCode(raw: string): string {
  let s = (raw ?? "").trim()
  if (!s) return ""
  s = s.replace(/^https?:\/\//i, "").replace(/^customer-/i, "").replace(/\.cloudflarestream\.com.*$/i, "")
  return s.trim()
}

const CUSTOMER_CODE = normalizeCustomerCode(process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? "")

function buildManifestUrl(uid: string, bandwidthHint?: number): string {
  const base = `https://customer-${CUSTOMER_CODE}.cloudflarestream.com/${uid}/manifest/video.m3u8`
  if (bandwidthHint != null && bandwidthHint > 0) {
    return `${base}?clientBandwidthHint=${bandwidthHint}`
  }
  return base
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function KlyxyVideoPlayer({ streamId, poster, className = "", disablePiP = true }: KlyxyVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [qualityOpen, setQualityOpen] = useState(false)
  const qualityMenuRef = useRef<HTMLDivElement>(null)

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [qualityLevel, setQualityLevel] = useState<string>("auto")
  const [levels, setLevels] = useState<{ height: number; width: number; bitrate: number }[]>([])
  const [currentLevelIndex, setCurrentLevelIndex] = useState(-1)
  const [useHls, setUseHls] = useState(false)

  const showPosterOverlay = overlayVisible && !!poster && ready && !loading
  const showLoadingPlaceholder = !ready && !poster && !loading

  const resetHideControlsTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
      hideControlsTimerRef.current = null
    }
    setControlsVisible(true)
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
    }
  }, [isPlaying])

  const handlePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setOverlayVisible(false)
    setControlsVisible(true)
    video.play().catch(() => {
      video.muted = true
      setMuted(true)
      video.play().catch(() => {})
    })
  }, [])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      setOverlayVisible(false)
      video.play().catch(() => {
        video.muted = true
        setMuted(true)
        video.play().catch(() => {})
      })
    } else {
      video.pause()
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const bar = progressBarRef.current
    if (!video || !bar || !Number.isFinite(video.duration)) return
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    video.currentTime = pct * video.duration
    setCurrentTime(video.currentTime)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const v = parseFloat(e.target.value)
    setVolume(v)
    video.volume = v
    if (v > 0) video.muted = false
    setMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  const skipBack10 = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    video.currentTime = Math.max(0, video.currentTime - 10)
    setCurrentTime(video.currentTime)
    resetHideControlsTimer()
  }, [resetHideControlsTimer])

  const skipForward10 = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    video.currentTime = Math.min(video.duration, video.currentTime + 10)
    setCurrentTime(video.currentTime)
    resetHideControlsTimer()
  }, [resetHideControlsTimer])

  const applyQuality = useCallback((optionId: string) => {
    setQualityLevel(optionId)
    setQualityOpen(false)
    const hls = hlsRef.current
    if (!hls) return
    if (optionId === "auto") {
      hls.currentLevel = -1
      setCurrentLevelIndex(-1)
    } else {
      const idx = parseInt(optionId, 10)
      if (idx >= 0 && idx < hls.levels.length) {
        hls.currentLevel = idx
        setCurrentLevelIndex(idx)
      }
    }
  }, [])

  useEffect(() => {
    if (!streamId || !CUSTOMER_CODE) {
      setLoading(false)
      return
    }

    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const manifestUrl = buildManifestUrl(streamId)

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      })
      hlsRef.current = hls
      setUseHls(true)

      hls.loadSource(manifestUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const levelsList = data.levels.map((l) => ({ height: l.height, width: l.width, bitrate: l.bitrate }))
        setLevels(levelsList)
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setCurrentLevelIndex(data.level)
      })

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setLoading(false)
          setReady(false)
        }
      })

      const onPlay = () => {
        setIsPlaying(true)
        setOverlayVisible(false)
      }
      const onPause = () => setIsPlaying(false)
      const onEnded = () => setIsPlaying(false)
      const onTimeUpdate = () => setCurrentTime(video.currentTime)
      const onDurationChange = () => setDuration(video.duration)
      const onLoadedMetadata = () => setDuration(video.duration)

      video.addEventListener("play", onPlay)
      video.addEventListener("pause", onPause)
      video.addEventListener("ended", onEnded)
      video.addEventListener("timeupdate", onTimeUpdate)
      video.addEventListener("durationchange", onDurationChange)
      video.addEventListener("loadedmetadata", onLoadedMetadata)

      setReady(true)
      setLoading(false)

      return () => {
        hls.destroy()
        hlsRef.current = null
        video.removeEventListener("play", onPlay)
        video.removeEventListener("pause", onPause)
        video.removeEventListener("ended", onEnded)
        video.removeEventListener("timeupdate", onTimeUpdate)
        video.removeEventListener("durationchange", onDurationChange)
        video.removeEventListener("loadedmetadata", onLoadedMetadata)
      }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = manifestUrl
      setUseHls(false)
      setLevels([])
    }

    const onPlay = () => {
      setIsPlaying(true)
      setOverlayVisible(false)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onLoadedMetadata = () => setDuration(video.duration)
    const onCanPlay = () => {
      setReady(true)
      setLoading(false)
    }

    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("canplay", onCanPlay)

    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("canplay", onCanPlay)
      video.src = ""
    }
  }, [streamId])

  useEffect(() => {
    if (!isPlaying) return
    resetHideControlsTimer()
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    }
  }, [isPlaying, resetHideControlsTimer])

  useEffect(() => {
    if (!qualityOpen) return
    const close = (e: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target as Node)) {
        setQualityOpen(false)
      }
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [qualityOpen])

  if (!streamId) {
    return (
      <div className={`klyxy-player flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-primary/20 bg-black/90 shadow-[0_0_40px_-8px_var(--primary)] ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Image src="/klyxy.svg" alt="KLYXY" width={64} height={22} className="h-5 w-auto opacity-60" />
          <p className="text-sm text-muted-foreground">Aucune vidéo</p>
        </div>
      </div>
    )
  }

  if (!CUSTOMER_CODE) {
    return (
      <div className={`klyxy-player flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-primary/20 bg-black/90 p-4 shadow-[0_0_40px_-8px_var(--primary)] ${className}`}>
        <Image src="/klyxy.svg" alt="KLYXY" width={72} height={24} className="h-6 w-auto opacity-70" />
        <p className="text-center text-sm text-muted-foreground">
          Configurer <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE</code> pour la lecture.
        </p>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const currentQualityLabel =
    qualityLevel === "auto"
      ? "Auto"
      : useHls && currentLevelIndex >= 0 && levels[currentLevelIndex]
        ? `${levels[currentLevelIndex].height}p`
        : "Auto"

  return (
    <div
      className={`klyxy-player group relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-black shadow-[0_0_50px_-12px_var(--primary),0_4px_24px_rgba(0,0,0,0.4)] ring-1 ring-white/5 ${className}`}
      ref={containerRef}
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      <button
        type="button"
        onClick={togglePlayPause}
        className="absolute inset-0 z-[2] cursor-pointer"
        aria-label={isPlaying ? "Pause" : "Lecture"}
      />

      {/* Boutons -10s / +10s sur la vidéo (gauche et droite, centrés vers le milieu) */}
      <div
        className={`pointer-events-none absolute inset-0 z-[5] flex items-center justify-between px-16 transition-opacity duration-300 sm:px-24 md:px-32 ${
          controlsVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={skipBack10}
          className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-black/50 p-4 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent sm:h-16 sm:w-16 sm:p-5"
          aria-label="Reculer de 10 secondes"
        >
          <RotateCcw className="absolute inset-0 m-auto h-11 w-11 shrink-0 text-white/80 sm:h-12 sm:w-12" />
          <span className="relative z-10 text-[11px] font-bold sm:text-[13.2px]">10</span>
        </button>
        <button
          type="button"
          onClick={skipForward10}
          className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-black/50 p-4 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent sm:h-16 sm:w-16 sm:p-5"
          aria-label="Avancer de 10 secondes"
        >
          <RotateCw className="absolute inset-0 m-auto h-11 w-11 shrink-0 text-white/80 sm:h-12 sm:w-12" />
          <span className="relative z-10 text-[11px] font-bold sm:text-[13.2px]">10</span>
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/90">
          <div className="h-14 w-14 rounded-full border-2 border-primary/30 border-t-primary" style={{ animation: "klyxy-spin 0.8s linear infinite" }} />
          <Image src="/klyxy.svg" alt="KLYXY" width={56} height={19} className="h-4 w-auto opacity-60" />
        </div>
      )}

      {showPosterOverlay && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-primary/20" />
          <div className="absolute top-4 left-4 z-10">
            <Image src="/klyxy.svg" alt="KLYXY" width={52} height={18} className="h-4 w-auto drop-shadow-lg opacity-95" />
          </div>
          <button
            type="button"
            onClick={handlePlay}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(255,255,255,0.1),0_0_30px_var(--primary)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_0_6px_rgba(255,255,255,0.15),0_0_40px_var(--primary)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black active:scale-105"
            aria-label="Lancer la vidéo KLYXY"
          >
            <Play className="h-12 w-12 fill-current pl-1.5" />
          </button>
          <p className="relative mt-4 text-xs font-medium uppercase tracking-widest text-white/70">Lire sur KLYXY</p>
        </div>
      )}

      {showLoadingPlaceholder && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/25 via-black to-primary/10">
          <div className="h-14 w-14 rounded-full border-2 border-primary/40 border-t-primary" style={{ animation: "klyxy-spin 0.9s linear infinite" }} />
          <Image src="/klyxy.svg" alt="KLYXY" width={56} height={19} className="h-4 w-auto opacity-70" />
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full rounded-2xl object-contain bg-black"
        playsInline
        preload="metadata"
        poster={poster}
        disablePictureInPicture={disablePiP}
        disableRemotePlayback={disablePiP}
        onClick={(e) => {
          e.stopPropagation()
          togglePlayPause()
        }}
      />

      <div
        className={`absolute inset-x-0 bottom-0 z-[6] flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-1 pt-12 transition-opacity duration-300 sm:pb-2 sm:pt-16 ${
          controlsVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div
          ref={progressBarRef}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          className="mb-2 h-1 w-full cursor-pointer rounded-full bg-white/20 transition-colors hover:h-1.5 hover:bg-white/30 sm:mb-3"
          onClick={handleSeek}
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-2 px-2 pb-1 sm:gap-3 sm:px-3 sm:pb-2">
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/90 text-primary-foreground transition-colors hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current pl-0.5" />}
          </button>

          <span className="min-w-[4rem] shrink-0 text-xs font-medium tabular-nums text-white/90">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            {/* Qualité (uniquement avec HLS.js) */}
            {useHls && (
              <div className="relative" ref={qualityMenuRef}>
                <button
                  type="button"
                  onClick={() => setQualityOpen((o) => !o)}
                  className="flex h-8 min-w-[4rem] shrink-0 items-center justify-center gap-1 rounded-full px-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                  aria-label="Qualité"
                  aria-expanded={qualityOpen}
                >
                  <Settings2 className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs font-medium">{currentQualityLabel}</span>
                </button>
                {qualityOpen && (
                  <>
                    <div className="absolute inset-0 -z-10 h-24" aria-hidden />
                    <div className="absolute bottom-full right-0 mb-1 max-h-64 min-w-[7rem] overflow-y-auto rounded-lg border border-white/20 bg-black/95 py-1 shadow-xl backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => applyQuality("auto")}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                          qualityLevel === "auto" ? "bg-primary/20 text-primary" : "text-white/90"
                        }`}
                      >
                        Automatique
                        {qualityLevel === "auto" && <span className="text-primary">✓</span>}
                      </button>
                      {levels.map((level, index) => (
                        <button
                          key={`${level.height}-${index}`}
                          type="button"
                          onClick={() => applyQuality(String(index))}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            qualityLevel === String(index) ? "bg-primary/20 text-primary" : "text-white/90"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {level.height}p
                            {level.bitrate > 0 && (
                              <span className="ml-2 text-xs text-white/60">
                                {Math.round(level.bitrate / 1000)} kbps
                              </span>
                            )}
                          </span>
                          {qualityLevel === String(index) && <span className="shrink-0 text-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="klyxy-volume h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary sm:w-20"
              aria-label="Volume"
            />
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
              aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
