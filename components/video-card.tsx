"use client"

import { Play, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { getUser } from "@/lib/auth-client"
import { EmailVerificationModal } from "@/components/email-verification-modal"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string
  duration: string
}

export function VideoCard({ id, title, thumbnail, duration }: VideoCardProps) {
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
        className="group block transform transition-all duration-300 ease-out hover:scale-[1.15] origin-center relative hover:z-50"
      >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-card shadow-xl">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Sans miniature</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Play className="h-7 w-7 fill-black text-black ml-1" />
          </div>
        </div>

        {duration ? (
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide text-white">
            {duration}
          </div>
        ) : null}

        {getUser()?.accountType === "premium_plus" && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.share?.({ title, url: `${typeof window !== "undefined" ? window.location.origin : ""}/watch/${id}` }) }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/50 hover:bg-primary/80 text-white z-20"
            title="Partager"
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}

        <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />
      </div>
    </Link>
    <EmailVerificationModal 
      open={showEmailModal} 
      onOpenChange={setShowEmailModal}
      userEmail={getUser()?.email}
    />
    </>
  )
}
