"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Short {
  id: string
  title: string
  videoUrl: string
  thumbnail?: string
}

interface ShortsCarouselProps {
  title: string
  shorts: Short[]
  onShortClick: (index: number) => void
}

export function ShortsCarousel({ title, shorts, onShortClick }: ShortsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [visibleIndex, setVisibleIndex] = useState(0)

  // Détection du scroll pour mettre à jour les flèches et jouer les vidéos visibles
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)

    // Calculer quelle vidéo est visible (au centre du viewport)
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth
    const cardWidth = 180 + 8 // width + gap
    const centerPosition = scrollLeft + containerWidth / 2
    const newVisibleIndex = Math.round(centerPosition / cardWidth)
    
    if (newVisibleIndex >= 0 && newVisibleIndex < shorts.length) {
      setVisibleIndex(newVisibleIndex)
    }
  }

  // Mettre en pause toutes les vidéos sauf celle visible
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === visibleIndex) {
          // Jouer la vidéo visible (sans son, en boucle)
          if (video.paused) {
            video.muted = true
            video.loop = true
            video.play().catch(() => {})
          }
        } else {
          // Mettre en pause les autres
          if (!video.paused) {
            video.pause()
          }
        }
      }
    })
  }, [visibleIndex])

  // Initialiser la première vidéo visible
  useEffect(() => {
    const video = videoRefs.current[0]
    if (video && visibleIndex === 0) {
      video.muted = true
      video.loop = true
      video.play().catch(() => {})
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })
  }

  return (
    <div className="group/carousel relative">
      <div className="flex items-center justify-start mb-2 px-2 lg:px-4">
        <h2 className="text-xl md:text-2xl font-bold relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary rounded-full" />
        </h2>
      </div>

      <div className="relative px-0 sm:px-2 lg:px-4">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-background via-background/90 to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </div>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pb-4 pl-8 sm:pl-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {shorts.map((short, index) => (
            <div
              key={short.id}
              className="flex-none w-[180px] md:w-[200px] py-4 px-1 pt-8 overflow-visible cursor-pointer group"
              onClick={() => onShortClick(index)}
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-primary shadow-lg">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el
                    // Lancer la vidéo si elle est visible au chargement
                    if (el && index === 0) {
                      el.muted = true
                      el.loop = true
                      el.play().catch(() => {})
                    }
                  }}
                  src={short.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  autoPlay
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <svg
                      className="h-5 w-5 fill-black text-black ml-1"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-background via-background/90 to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          >
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
              <ChevronRight className="h-6 w-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

