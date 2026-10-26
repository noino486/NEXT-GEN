"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Play, X, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import {
  changeToVideo,
  pauseAllVideos,
  initializeCurrentVideo,
  handleSwipe as handleSwipeLogic,
  handleWheel as handleWheelLogic,
} from "./video-player-logic"

interface Short {
  id: string
  title: string
  videoUrl: string
  thumbnail?: string
  fullVideoId?: string
}

interface ShortsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex?: number
}

export default function ShortsModal({ open, onOpenChange, initialIndex = 0 }: ShortsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(1) // Volume entre 0 et 1
  const [isMuted, setIsMuted] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  const shorts: Short[] = [
    {
      id: "1",
      title: "Short #1",
      videoUrl: "/shorts/snaptik_7240003519082663194_v2.mp4",
      thumbnail: "/miniatures/SQUEEZIEPOSTERV59.jpg",
      fullVideoId: "1",
    },
    {
      id: "2",
      title: "Short #2",
      videoUrl: "/shorts/snaptik_7322996015793966369_v2.mp4",
      thumbnail: "/miniatures/hq720.jpg",
      fullVideoId: "2",
    },
    {
      id: "3",
      title: "Short #3",
      videoUrl: "/shorts/snaptik_7382627396723150112_v2.mp4",
      thumbnail: "/miniatures/1200x680.jpg",
      fullVideoId: "3",
    },
    {
      id: "4",
      title: "Short #4",
      videoUrl: "/shorts/snaptik_7401053613033868576_v2.mp4",
      fullVideoId: "4",
    },
    {
      id: "5",
      title: "Short #5",
      videoUrl: "/shorts/snaptik_7415986954593914144_v2.mp4",
      fullVideoId: "5",
    },
    {
      id: "6",
      title: "Short #6",
      videoUrl: "/shorts/snaptik_7425243649115426081_v2.mp4",
      fullVideoId: "6",
    },
    {
      id: "7",
      title: "Short #7",
      videoUrl: "/shorts/snaptik_7482101697695747350_v2.mp4",
      fullVideoId: "7",
    },
    {
      id: "8",
      title: "Short #8",
      videoUrl: "/shorts/snaptik_7534217020544535830_v2.mp4",
      fullVideoId: "8",
    },
    {
      id: "9",
      title: "Short #9",
      videoUrl: "/shorts/snaptik_7550338592971738401_v2.mp4",
      fullVideoId: "9",
    },
    {
      id: "10",
      title: "Short #10",
      videoUrl: "/shorts/snaptik_7550361792220843297_v2.mp4",
      fullVideoId: "10",
    },
    {
      id: "11",
      title: "Short #11",
      videoUrl: "/shorts/snaptik_7566675748358999318_v2.mp4",
      fullVideoId: "11",
    },
    {
      id: "12",
      title: "Short #12",
      videoUrl: "/shorts/snaptik_7587556116054265110_v2.mp4",
      fullVideoId: "12",
    },
    {
      id: "13",
      title: "Short #13",
      videoUrl: "/shorts/snaptik_7591589620933086486_v2.mp4",
      fullVideoId: "13",
    },
    {
      id: "14",
      title: "Short #14",
      videoUrl: "/shorts/snaptik_7593396085461142806_v2.mp4",
      fullVideoId: "14",
    },
    {
      id: "15",
      title: "Short #15",
      videoUrl: "/shorts/snaptik_7595978147099659542_v2.mp4",
      fullVideoId: "15",
    },
    {
      id: "16",
      title: "Short #16",
      videoUrl: "/shorts/snaptik_7596352921277680918_v2.mp4",
      fullVideoId: "16",
    },
    {
      id: "17",
      title: "Short #17",
      videoUrl: "/shorts/WhatsApp Video 2026-01-19 at 00.37.33.mp4",
      fullVideoId: "17",
    },
  ]

  // Fonction pour changer de vidéo
  const changeVideo = (newIndex: number) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= shorts.length) return

    setCurrentIndex(newIndex)
    setIsPlaying(true)
    changeToVideo(videoRefs.current, newIndex, () => {
      setIsPlaying(true)
      // Appliquer le volume à la nouvelle vidéo
      const newVideo = videoRefs.current[newIndex]
      if (newVideo) {
        newVideo.volume = volume
        newVideo.muted = isMuted
      }
    })
  }

  // Fonction pour gérer le volume
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    const video = videoRefs.current[currentIndex]
    if (video) {
      video.volume = newVolume
      video.muted = newVolume === 0
    }
  }

  // Fonction pour toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    const video = videoRefs.current[currentIndex]
    if (video) {
      video.muted = newMuted
      if (!newMuted && volume === 0) {
        setVolume(0.5)
        video.volume = 0.5
      }
    }
  }

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setIsPlaying(true)
    } else {
      pauseAllVideos(videoRefs.current)
    }
  }, [open, initialIndex])

  // Gestion de la vidéo courante
  useEffect(() => {
    if (!open) {
      pauseAllVideos(videoRefs.current)
      return
    }
    initializeCurrentVideo(videoRefs.current, currentIndex, isPlaying)

    // Appliquer le volume à la vidéo courante
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      currentVideo.volume = volume
      currentVideo.muted = isMuted
    }

    // Vérification périodique pour s'assurer qu'une seule vidéo joue
    const checkInterval = setInterval(() => {
      const currentVideo = videoRefs.current[currentIndex]
      
      if (currentVideo) {
        // Appliquer le volume seulement si nécessaire (éviter les modifications inutiles)
        if (Math.abs(currentVideo.volume - volume) > 0.01) {
          currentVideo.volume = volume
        }
        if (currentVideo.muted !== isMuted) {
          currentVideo.muted = isMuted
        }
        
        if (isPlaying && currentVideo.paused && currentVideo.readyState >= 2) {
          currentVideo.currentTime = 0
          currentVideo.play().catch(() => {
            currentVideo.muted = true
            currentVideo.play().catch(() => {})
          })
        } else if (!isPlaying && !currentVideo.paused) {
          currentVideo.pause()
        }
      }

      videoRefs.current.forEach((video, index) => {
        if (video && index !== currentIndex && !video.paused) {
          video.pause()
          video.currentTime = 0
        }
      })
    }, 300)

    return () => clearInterval(checkInterval)
  }, [currentIndex, open, isPlaying])

  // Effet séparé pour appliquer le volume quand il change
  useEffect(() => {
    if (!open) return
    
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      currentVideo.volume = volume
      currentVideo.muted = isMuted
    }
  }, [volume, isMuted, currentIndex, open])

  // Détection du scroll pour changer de vidéo
  useEffect(() => {
    if (!open) return

    const setupScrollDetection = (cont: HTMLElement) => {
      let scrollTimeout: NodeJS.Timeout
      const handleScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          const scrollPosition = cont.scrollTop
          const containerHeight = cont.clientHeight
          const videoHeight = containerHeight
          const newIndex = Math.round(scrollPosition / videoHeight)
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < shorts.length) changeVideo(newIndex)
        }, 150)
      }
      cont.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        cont.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimeout)
      }
    }

    const container = containerRef.current
    if (!container) {
      const checkContainer = setInterval(() => {
        const c = containerRef.current
        if (c) {
          clearInterval(checkContainer)
          setupScrollDetection(c)
        }
      }, 100)
      return () => clearInterval(checkContainer)
    }

    return setupScrollDetection(container)
  }, [currentIndex, open, shorts.length])

  // Scroll automatique vers la vidéo courante
  useEffect(() => {
    if (containerRef.current && open) {
      const videoElement = containerRef.current.children[currentIndex] as HTMLElement
      if (videoElement) videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex, open])

  // Gestion du swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY.current || !touchStartX.current) return
    const touchEndY = e.changedTouches[0].clientY
    const touchEndX = e.changedTouches[0].clientX
    const newIndex = handleSwipeLogic(
      touchStartY.current,
      touchEndY,
      touchStartX.current,
      touchEndX,
      currentIndex,
      shorts.length
    )
    if (newIndex !== null && newIndex !== currentIndex) changeVideo(newIndex)
    touchStartY.current = 0
    touchStartX.current = 0
  }

  useEffect(() => {
    if (!open) return

    const initWheel = () => {
      const container = containerRef.current
      if (!container) {
        setTimeout(initWheel, 100)
        return
      }
      let wheelTimeout: NodeJS.Timeout
      let accumulatedDelta = 0
      const handleWheelEvent = (e: WheelEvent) => {
        e.preventDefault()
        accumulatedDelta += e.deltaY
        clearTimeout(wheelTimeout)
        wheelTimeout = setTimeout(() => {
          const newIndex = handleWheelLogic(accumulatedDelta, currentIndex, shorts.length)
          if (newIndex !== null && newIndex !== currentIndex) changeVideo(newIndex)
          accumulatedDelta = 0
        }, 100)
      }
      container.addEventListener('wheel', handleWheelEvent, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheelEvent)
        clearTimeout(wheelTimeout)
      }
    }

    const cleanup = initWheel()
    return typeof cleanup === 'function' ? cleanup : undefined
  }, [currentIndex, open, shorts.length])

  // Gestion du clavier
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        e.preventDefault()
        changeVideo(currentIndex - 1)
      } else if (e.key === "ArrowDown" && currentIndex < shorts.length - 1) {
        e.preventDefault()
        changeVideo(currentIndex + 1)
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden bg-transparent border-none shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Shorts</DialogTitle>
        
        {/* Bouton fermer */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Container des vidéos */}
        <div
          ref={containerRef}
          className="w-full h-[90vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {shorts.map((short, index) => (
            <div
              key={short.id}
              className="relative w-full h-[90vh] flex-shrink-0 snap-start flex items-center justify-center py-2 px-4"
              style={{
                scrollSnapAlign: 'center',
              }}
            >
              {/* Container vidéo */}
              <div 
                className="relative w-full max-w-[325px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl bg-black"
              >
                <video
                  ref={(el) => { videoRefs.current[index] = el }}
                  src={short.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={false}
                  preload="auto"
                  onLoadedData={() => {
                    const video = videoRefs.current[index]
                    if (video && index === currentIndex && open && isPlaying) {
                      if (video.readyState < 2) video.load()
                      if (video.paused) {
                        video.currentTime = 0
                        video.volume = volume
                        video.muted = isMuted
                        video.play().catch(() => {
                          video.muted = true
                          video.play().then(() => {
                            setTimeout(() => {
                              video.muted = isMuted
                              video.volume = volume
                            }, 100)
                          }).catch(() => {})
                        })
                      }
                    }
                  }}
                  onCanPlay={() => {
                    const video = videoRefs.current[index]
                    if (video && index === currentIndex && open && isPlaying && video.paused) {
                      video.currentTime = 0
                      video.volume = volume
                      video.muted = isMuted
                      video.play().catch(() => {
                        video.muted = true
                        video.play().then(() => {
                          setTimeout(() => {
                            video.muted = isMuted
                            video.volume = volume
                          }, 100)
                        }).catch(() => {})
                      })
                    }
                  }}
                  onPlay={() => {
                    videoRefs.current.forEach((v, i) => {
                      if (v && i !== index && !v.paused) {
                        v.pause()
                        v.currentTime = 0
                      }
                    })
                  }}
                  onEnded={() => {
                    if (index < shorts.length - 1) {
                      changeVideo(index + 1)
                    } else {
                      changeVideo(0)
                    }
                  }}
                  onError={(e) => {
                    console.error(`Erreur de chargement de la vidéo ${short.id}:`, e)
                  }}
                />

                {/* Overlay avec dégradé */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Informations */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none z-20">
                  <div className="max-w-full">
                    <h2 className="text-white text-base md:text-lg font-bold mb-3 drop-shadow-lg">
                      {short.title}
                    </h2>
                    {short.fullVideoId && (
                      <Link
                        href={`/watch/${short.fullVideoId}`}
                        className="pointer-events-auto inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="lg"
                          className="bg-white hover:bg-white/90 text-black font-bold px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm"
                        >
                          <Play className="mr-2 h-3 w-3 md:h-4 md:w-4 fill-black" />
                          Voir la vidéo complète
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Contrôle de volume (desktop uniquement) */}
                {index === currentIndex && (
                  <div className="absolute bottom-20 right-4 z-30 hidden md:flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMute()
                      }}
                      className="text-white hover:text-primary transition-colors"
                      aria-label={isMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value)
                        handleVolumeChange(newVolume)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                      style={{
                        background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                  </div>
                )}

                {/* Indicateur de progression */}
                <div className="absolute top-2 left-0 right-0 flex gap-1 px-4 z-30">
                  {shorts.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? "bg-white"
                          : i < currentIndex
                          ? "bg-white/50"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
