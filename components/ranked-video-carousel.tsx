"use client"

import { RankedVideoCard } from "./ranked-video-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  pitch?: string
}

interface RankedVideoCarouselProps {
  title: string
  videos: Video[]
  showRank?: boolean
  showBadge?: boolean
  badgeText?: string
}

export function RankedVideoCarousel({ title, videos, showRank = true, showBadge = false, badgeText = "Pour vous" }: RankedVideoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

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

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
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
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-16 bg-gradient-to-r from-background via-background/90 to-transparent flex items-center justify-start pl-1 sm:pl-2 opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition-opacity duration-300 touch-manipulation"
            aria-label="Précédent"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-colors">
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pb-4 pl-8 sm:pl-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, index) => (
            <div key={video.id} className="flex-none w-[180px] md:w-[200px] py-4 px-1 pt-8 overflow-visible">
              <div className="space-y-2">
                <RankedVideoCard {...video} rank={index + 1} showRank={showRank} showBadge={showBadge} badgeText={badgeText} />
                {video.pitch && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 px-0.5">{video.pitch}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-16 bg-gradient-to-l from-background via-background/90 to-transparent flex items-center justify-end pr-1 sm:pr-2 opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition-opacity duration-300 touch-manipulation"
            aria-label="Suivant"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-colors">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

