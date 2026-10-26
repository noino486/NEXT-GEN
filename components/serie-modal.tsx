"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

interface Episode {
  id: string
  title: string
  thumbnail: string
  duration: string
  description?: string
}

interface Season {
  seasonNumber: number
  episodes: Episode[]
}

interface SerieModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  thumbnail: string
  seasons: Season[]
  serieId: string
}

export function SerieModal({ open, onOpenChange, title, thumbnail, seasons, serieId }: SerieModalProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1]))

  const toggleSeason = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons)
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber)
    } else {
      newExpanded.add(seasonNumber)
    }
    setExpandedSeasons(newExpanded)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Hero Image */}
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden flex-shrink-0">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4">{title}</h2>
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-black font-bold px-4 py-2 md:px-6 md:py-4 text-sm md:text-base"
            >
              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 fill-black" />
              Regarder
            </Button>
          </div>
        </div>

        {/* Seasons and Episodes - Scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {seasons.map((season) => (
            <div key={season.seasonNumber} className="mb-6">
              <button
                onClick={() => toggleSeason(season.seasonNumber)}
                className="flex items-center justify-between w-full mb-4 text-left hover:text-primary transition-colors"
              >
                <h3 className="text-xl md:text-2xl font-bold">
                  Saison {season.seasonNumber} ({season.episodes.length} épisode{season.episodes.length > 1 ? 's' : ''})
                </h3>
                {expandedSeasons.has(season.seasonNumber) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedSeasons.has(season.seasonNumber) && (
                <div className="space-y-3 md:space-y-4">
                  {season.episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={`/watch/${episode.id}`}
                      className="group flex gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="relative w-32 md:w-40 h-20 md:h-24 flex-shrink-0 rounded overflow-hidden bg-card">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-4 w-4 md:h-5 md:w-5 fill-black text-black ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">
                          {episode.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base lg:text-lg mb-1 group-hover:text-primary transition-colors">
                          {episode.title}
                        </h4>
                        {episode.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-1">
                            {episode.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{episode.duration}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

