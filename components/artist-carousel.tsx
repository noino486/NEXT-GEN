"use client"

import { ArtistCard } from "./artist-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

interface Artist {
  id: string
  name: string
  image: string
  followers: string
  verified?: boolean
}

interface ArtistCarouselProps {
  title: string
  artists: Artist[]
}

export function ArtistCarousel({ title, artists }: ArtistCarouselProps) {
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
      <div className="flex items-center justify-between mb-2 px-4 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary rounded-full" />
        </h2>
      </div>

      <div className="relative px-4 lg:px-8">
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
          className="flex gap-6 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {artists.map((artist) => (
            <div key={artist.id} className="flex-none w-[140px] sm:w-[160px] md:w-[180px] py-4 px-1">
              <ArtistCard {...artist} />
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

