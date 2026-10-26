"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, Video, Search, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { getUser, type User } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ShortsModal from "@/app/shorts/shorts-modal"

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isShortsModalOpen, setIsShortsModalOpen] = useState(false)
  const [shortsInitialIndex, setShortsInitialIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const hiddenPaths = ['/dashboard', '/login', '/signup', '/signup/thank-you']
  const shouldHide = hiddenPaths.some(path => pathname?.startsWith(path))

  if (shouldHide) {
    return null
  }

  const handleMenuAction = (href: string) => {
    setMenuOpen(false)
    router.push(href)
  }

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil', href: '/', isActive: pathname === '/' },
    { id: 'discover', icon: Compass, label: 'Découvrir', href: '/discover', isActive: pathname === '/discover' },
    {
      id: 'shorts',
      icon: Video,
      label: 'Shorts',
      onClick: () => {
        setShortsInitialIndex(0)
        setIsShortsModalOpen(true)
      },
      isActive: false,
    },
    {
      id: 'search',
      icon: Search,
      label: 'Rechercher',
      onClick: () => setIsSearchOpen(true),
      isActive: false,
    },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.isActive

            if ('onClick' in item && item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">Menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56 mb-2">
              <DropdownMenuItem onClick={() => handleMenuAction(user ? '/dashboard' : '/login')}>
                Mon espace client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction(user ? '/ma-liste' : '/login')}>
                Ma liste
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction(user ? '/mes-telechargements' : '/login')}>
                Téléchargements
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Modal de recherche mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher créateurs, vidéos..."
                  className="pl-10"
                  autoFocus
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setIsSearchOpen(false)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchOpen(false)
                    }
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Annuler
              </Button>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-muted-foreground text-center mt-8">
                Résultats de recherche...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Shorts */}
      <ShortsModal 
        open={isShortsModalOpen} 
        onOpenChange={setIsShortsModalOpen}
        initialIndex={shortsInitialIndex}
      />
    </>
  )
}
