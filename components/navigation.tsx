"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, User as UserIcon, LogOut, LayoutDashboard, Mail, Heart, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { removeUser, refreshUser, getUser } from "@/lib/auth-client"
import { useAccount } from "@/hooks/use-account"
import { UserAvatar } from "@/components/user-avatar"

interface NavigationProps {
  /** Barre transparente posée sur un hero plein cadre (Accueil). Devient opaque au scroll. */
  overlay?: boolean
}

const LINK_BASE = "text-sm font-medium transition-colors pb-1 border-b-2"
const LINK_ACTIVE = `${LINK_BASE} text-foreground border-primary`
const LINK_IDLE = `${LINK_BASE} text-foreground/70 border-transparent hover:text-foreground`

const ICON_BUTTON =
  "relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/10 cursor-pointer"

export function Navigation({ overlay = false }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, profilePicture } = useAccount()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Si le rôle n'est pas défini, essayer de le récupérer depuis le backend
    const current = getUser()
    if (current && !current.role) {
      refreshUser().then((res) => {
        if (res.success && res.user) setUser(res.user)
      })
    }
  }, [setUser])

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [overlay])

  const handleLogout = () => {
    removeUser()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const solid = !overlay || scrolled
  const onProfile = pathname === "/profil"
  const onShorts = pathname === "/shorts-page"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[76px] transition-colors duration-300 ${
        solid ? "bg-background/90 backdrop-blur-xl" : "bg-gradient-to-b from-black/35 to-transparent"
      }`}
    >
      <div className="flex h-full items-center justify-between px-6 lg:px-14">
        <div className="flex items-center gap-11">
          <Link href="/" aria-label="KLYXY">
            <Image src="/klyxy.svg" alt="KLYXY" width={82} height={22} className="h-[22px] w-auto" style={{ width: "auto" }} priority />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={pathname === "/" ? LINK_ACTIVE : LINK_IDLE}>
              Accueil
            </Link>
            <Link href="/discover" className={pathname === "/discover" ? LINK_ACTIVE : LINK_IDLE}>
              Découvrir
            </Link>
            <Link href="/shorts-page" className={onShorts ? LINK_ACTIVE : LINK_IDLE}>
              Shorts
            </Link>
            <Link href="/profil" className={onProfile ? LINK_ACTIVE : LINK_IDLE}>
              Profil
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            {!isSearchOpen ? (
              <button onClick={() => setIsSearchOpen(true)} className={ICON_BUTTON} aria-label="Rechercher">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            ) : (
              <div className="relative w-40 sm:w-52 md:w-64 transition-all duration-300 ease-in-out">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Rechercher créateurs, vidéos..."
                  className="pl-10 bg-secondary/50 border-border/50 backdrop-blur-sm focus:bg-secondary/80 transition-colors"
                  autoFocus
                  onBlur={(e) => {
                    // Ne ferme que si l'input est vide
                    if (!e.target.value) setIsSearchOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsSearchOpen(false)
                  }}
                />
              </div>
            )}
          </div>

          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className={ICON_BUTTON} aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  {user.emailVerified === false && (
                    <span className="absolute top-[7px] right-[7px] h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                {user.emailVerified === false ? (
                  <div className="p-4 border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Email non vérifié</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vérifiez votre boîte de réception ({user.email}) pour activer votre compte.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu modal={false} onOpenChange={setProfileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu du profil"
                className={`ml-1 h-[34px] w-[34px] shrink-0 rounded-full transition-shadow ${
                  profileMenuOpen || onProfile ? "ring-2 ring-[#4FC2EF]" : "hover:ring-2 hover:ring-[#4FC2EF]/50"
                }`}
              >
                {user ? (
                  <UserAvatar username={user.username} src={profilePicture} className="h-full w-full" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-secondary">
                    <UserIcon className="h-4 w-4" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-3 bg-card/95 backdrop-blur-xl border-border shadow-xl rounded-lg z-[100]"
            >
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 border-b border-border/50 mb-2">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {user.accountType === "premium" && (
                        <span className="inline-block text-[10px] font-bold bg-primary text-black px-1.5 py-0.5 rounded">
                          PREMIUM
                        </span>
                      )}
                      {user.role === "administrateur" && (
                        <span className="inline-block text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                          ADMINISTRATEUR
                        </span>
                      )}
                      {user.role === "support" && (
                        <span className="inline-block text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                          SUPPORT
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/profil"
                    className="w-full flex items-center gap-2 rounded-lg text-foreground font-medium px-3 py-2 text-sm hover:bg-white/10 transition-all"
                  >
                    <UserIcon className="w-4 h-4" />
                    Mon profil
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center gap-2 rounded-lg text-foreground font-medium px-3 py-2 text-sm hover:bg-white/10 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {user.role === "administrateur" || user.role === "support" ? "Tableau de bord" : "Gérer mon compte"}
                  </Link>
                  <Link
                    href="/ma-liste"
                    className="w-full flex items-center gap-2 rounded-lg text-foreground font-medium px-3 py-2 text-sm hover:bg-white/10 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    Ma Liste
                  </Link>
                  <Link
                    href="/mes-telechargements"
                    className="w-full flex items-center gap-2 rounded-lg text-foreground font-medium px-3 py-2 text-sm hover:bg-white/10 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Mes Téléchargements
                  </Link>

                  <DropdownMenuSeparator className="my-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg text-destructive font-medium px-3 py-2 text-sm hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center rounded-lg bg-primary text-black font-semibold px-4 py-2.5 text-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    S'inscrire
                  </Link>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center rounded-lg bg-white/10 text-foreground font-medium px-4 py-2.5 text-sm border border-border hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
