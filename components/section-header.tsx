import Link from "next/link"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  seeAllHref?: string
  seeAllLabel?: string
  className?: string
}

/** En-tête de rangée du design : titre 19px + « Voir tout → » (ou sous-titre). */
export function SectionHeader({ title, subtitle, seeAllHref, seeAllLabel = "Voir tout →", className = "" }: SectionHeaderProps) {
  if (subtitle) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <h2 className="text-[19px] font-bold tracking-[-0.005em]">{title}</h2>
        <div className="text-[13px] font-medium text-muted-foreground">{subtitle}</div>
      </div>
    )
  }
  return (
    <div className={`flex items-baseline justify-between ${className}`}>
      <h2 className="text-[19px] font-bold tracking-[-0.005em]">{title}</h2>
      {seeAllHref ? (
        <Link href={seeAllHref} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          {seeAllLabel}
        </Link>
      ) : (
        <span className="text-[13px] font-medium text-muted-foreground">{seeAllLabel}</span>
      )}
    </div>
  )
}
