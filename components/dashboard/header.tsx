"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Menu, X, User as UserIcon, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeUser, type User } from "@/lib/auth-client"

interface HeaderProps {
  sidebarToggle: boolean
  setSidebarToggle: (toggle: boolean) => void
  user: User | null
}

export default function Header({ sidebarToggle, setSidebarToggle, user }: HeaderProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    removeUser()
    router.push('/')
    router.refresh()
  }

  const hasUnverifiedEmail = user && user.emailVerified === false

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-border bg-card">
      <div className="flex w-full items-center justify-between px-3 py-3 sm:px-4 lg:px-6 lg:py-4">

        {/* Bouton burger / fermer sidebar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarToggle(!sidebarToggle)}
          className="h-10 w-10 shrink-0"
        >
          {sidebarToggle ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo visible uniquement sur mobile (sidebar cachée) */}
        <Link href="/dashboard" className="lg:hidden">
          <span className="text-xl font-bold text-primary">KLYXY</span>
        </Link>

        {/* Actions côté droit */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Notifications */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                {hasUnverifiedEmail && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[min(20rem,calc(100vw-1rem))] p-0"
            >
              {hasUnverifiedEmail ? (
                <div className="p-4 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Email non vérifié</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vérifiez votre boîte de réception ({user?.email}) pour activer votre compte.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucune notification
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu utilisateur */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-10 px-2 sm:px-3">
                  <UserIcon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[8rem] text-sm">
                    {user.username || user.email || 'Utilisateur'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[min(18rem,calc(100vw-1rem))] z-[100]"
              >
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium truncate">{user.username || 'Utilisateur'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-destructive"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      Déconnexion...
                    </span>
                  ) : (
                    'Déconnexion'
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </div>
    </header>
  )
}
