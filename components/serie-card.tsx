import { Play } from "lucide-react"

interface SerieCardProps {
  id: string
  title: string
  thumbnail: string
  onClick: () => void
}

export function SerieCard({ id, title, thumbnail, onClick }: SerieCardProps) {
  return (
    <button
      onClick={onClick}
      className="group block w-full transform transition-all duration-300 ease-out hover:scale-[1.15] hover:z-50 origin-center relative overflow-visible"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-card shadow-xl">
        <img 
          src={thumbnail || "/placeholder.svg"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Play className="h-7 w-7 fill-black text-black ml-1" />
          </div>
        </div>

        <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
      </div>
    </button>
  )
}

