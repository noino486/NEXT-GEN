import { Play } from "lucide-react"

/** Pastille blanche « lecture » affichée au survol des vignettes. */
export function PlayBadge({ size = 42 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-[rgba(244,244,245,0.95)]"
      style={{ width: size, height: size }}
    >
      <Play className="fill-black text-black" style={{ width: size * 0.38, height: size * 0.38 }} />
    </div>
  )
}

/** Durée affichée dans un coin d'une vignette. */
export function DurationBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute z-[6] rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white ${className}`}
    >
      {children}
    </div>
  )
}
