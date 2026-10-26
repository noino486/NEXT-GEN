"use client"

// PATCH — remplace components/ranked-video-card.tsx tel quel.
//
// Ce que ça corrige : le numéro de rang (Top 10 sur Accueil, "Populaire
// Maintenant" sur Découvrir — ce composant est partagé par les deux) avait
// son contour fait d'un empilement de text-shadow dans 8 directions. Ça
// donne des POINTES dans les courbes du chiffre au lieu d'un vrai contour
// lisse (retour design, voir la maquette Klyxy). Remplacé par un vrai
// text-stroke CSS (WebkitTextStroke + paintOrder), qui suit le contour réel
// de la police.
//
// Changements vs l'original :
// - Couleur du contour : cyan (#00E5FF) -> blanc, pour matcher la maquette
//   finale (c'était un "surplus" de l'itération précédente).
// - Le hack spécial pour rank===10 (deux <span> séparés pour "1" et "0")
//   est supprimé : inutile avec un vrai text-stroke, "10" s'affiche
//   normalement comme n'importe quel autre nombre.
// - Le chiffre passe DERRIÈRE la miniature (seul le débord à gauche reste
//   visible) au lieu d'être AU-DESSUS : miniature re-stackée avec z-10,
//   chiffre repassé à z-0.

import { Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { getUser } from "@/lib/auth-client"
import { EmailVerificationModal } from "@/components/email-verification-modal"

interface RankedVideoCardProps {
  id: string
  title: string
  thumbnail: string
  duration: string
  rank: number
  showRank?: boolean
  showBadge?: boolean
  badgeText?: string
}

export function RankedVideoCard({ id, title, thumbnail, duration, rank, showRank = true, showBadge = false, badgeText = "Pour vous" }: RankedVideoCardProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const user = getUser()
    if (user && user.emailVerified === false) {
      e.preventDefault()
      setShowEmailModal(true)
    }
  }

  return (
    <>
      <Link
        href={`/watch/${id}`}
        onClick={handleClick}
        className="group block transform transition-all duration-300 ease-out hover:scale-[1.15] hover:z-50 relative overflow-visible"
        style={{ transformOrigin: 'center center' }}
      >
      <div className="relative z-10 aspect-[9/16] overflow-hidden rounded-lg bg-primary shadow-lg">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Sans miniature</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Play className="h-5 w-5 fill-black text-black ml-1" />
          </div>
        </div>

        <div className="absolute bottom-2 right-8 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold tracking-wide text-white z-20">
          {duration}
        </div>

        {showBadge && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-black z-20">
            {badgeText}
          </div>
        )}

        <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Grand numéro, contour blanc lisse (text-stroke, pas un empilement de
          shadows), DERRIÈRE la miniature (z-0 < z-10 ci-dessus) : seul le
          débord à gauche reste visible. */}
      {showRank && (
        <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
          <span
            className="text-[80px] md:text-[100px] font-black leading-none block relative text-black"
            style={{
              WebkitTextStroke: '3px #ffffff',
              paintOrder: 'stroke fill',
              textShadow: '0 0 10px rgba(255,255,255,0.4)',
            }}
          >
            {rank}
          </span>
        </div>
      )}
    </Link>
    <EmailVerificationModal
      open={showEmailModal}
      onOpenChange={setShowEmailModal}
      userEmail={getUser()?.email}
    />
    </>
  )
}
