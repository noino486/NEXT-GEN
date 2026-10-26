import { Play } from "lucide-react"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"

interface ArtistCardProps {
  id: string
  name: string
  image: string
  followers: string
  verified?: boolean
}

export function ArtistCard({ id, name, image, followers, verified }: ArtistCardProps) {
  return (
    <Link href={`/profile/${id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl card-shadow card-hover bg-card">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center glow transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground ml-1" />
          </div>
        </div>

        <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/40 transition-colors duration-300 pointer-events-none" />
      </div>

      <div className="mt-4 text-center">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-center gap-1.5">
          {name}
          {verified && <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{followers} abonnés</p>
      </div>
    </Link>
  )
}
