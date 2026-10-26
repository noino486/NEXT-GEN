interface UserAvatarProps {
  username?: string | null
  src?: string | null
  className?: string
  textClassName?: string
}

/** Photo de profil si disponible, sinon rond avec l'initiale du nom d'utilisateur. */
export function UserAvatar({ username, src, className = "", textClassName = "text-xs" }: UserAvatarProps) {
  return (
    <div className={`relative overflow-hidden rounded-full bg-secondary flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt="Profil" className="h-full w-full object-cover" style={{ objectPosition: "center 22%" }} />
      ) : (
        <span className={`font-bold text-foreground ${textClassName}`}>
          {(username ?? "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}
