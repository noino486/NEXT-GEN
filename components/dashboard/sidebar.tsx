"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  Video,
  BarChart3,
  FileText,
  TrendingUp,
  FolderOpen,
  Link2,
  Image as ImageIcon,
  X
} from "lucide-react"
import { getUser } from "@/lib/auth-client"
import { isAdministrator, canAccessAdmin, isCreateur, canManageUsers } from "@/lib/roles-client"

interface SidebarProps {
  sidebarToggle: boolean
  page?: string
  setSidebarToggle: (toggle: boolean) => void
}

const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytiques',
    link: '/dashboard/analytics',
  },
  {
    id: 'users',
    icon: Users,
    label: 'Utilisateurs',
    link: '/dashboard/users',
  },
  {
    id: 'logs',
    icon: FileText,
    label: 'Logs',
    link: '/dashboard/logs',
  },
  {
    id: 'videos',
    icon: Video,
    label: 'Vidéos',
    link: '/dashboard/videos',
  },
  {
    id: 'video-stats',
    icon: TrendingUp,
    label: 'Statistiques Vidéos',
    link: '/dashboard/video-stats',
  },
  {
    id: 'categories',
    icon: FolderOpen,
    label: 'Catégories',
    link: '/dashboard/categories',
  },
  {
    id: 'utm',
    icon: Link2,
    label: 'Liens UTM / Tracking',
    link: '/dashboard/utm',
  },
  {
    id: 'hero',
    icon: ImageIcon,
    label: 'En-tête (Hero)',
    link: '/dashboard/hero',
  },
]

export default function Sidebar({ sidebarToggle, page, setSidebarToggle }: SidebarProps) {
  const pathname = usePathname()
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems)

  // Utiliser useEffect pour éviter les problèmes d'hydratation
  useEffect(() => {
    const currentUser = getUser()
    const isAdmin = isAdministrator(currentUser)
    const canAccess = canAccessAdmin(currentUser)
    const isCreator = isCreateur(currentUser)

    // Filtrer les éléments du menu selon les permissions
    const filtered = menuItems.filter(item => {
      // Les supports n'ont pas accès aux Analytiques
      if (item.id === 'analytics' && !isAdmin) {
        return false
      }
      // Seuls les administrateurs et le support ont accès aux Utilisateurs
      if (item.id === 'users' && !canManageUsers(currentUser)) {
        return false
      }
      // Seuls les administrateurs ont accès aux Logs
      if (item.id === 'logs' && !isAdmin) {
        return false
      }
      // Seuls les administrateurs et le support ont accès aux Vidéos
      if (item.id === 'videos' && !canAccess) {
        return false
      }
      // Les créateurs et admin/support ont accès aux Statistiques Vidéos
      if (item.id === 'video-stats' && !isCreator && !canAccess) {
        return false
      }
      // Seuls les administrateurs et le support ont accès aux Catégories
      if (item.id === 'categories' && !canAccess) {
        return false
      }
      // Seuls les administrateurs ont accès aux Liens UTM
      if (item.id === 'utm' && !isAdmin) {
        return false
      }
      // Seuls les administrateurs ont accès à l'en-tête (Hero)
      if (item.id === 'hero' && !isAdmin) {
        return false
      }
      // Dashboard accessible à tous les utilisateurs connectés
      return true
    })

    setFilteredMenuItems(filtered)
  }, [])

  const isActive = (item: typeof menuItems[0]) => {
    return pathname === item.link || pathname?.startsWith(item.link + '/')
  }

  return (
    <aside
      className={`sidebar fixed left-0 top-0 z-30 flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-border bg-card px-4 sm:px-5 transition-all duration-300 w-[280px] max-w-[85vw] lg:w-[290px] ${
        sidebarToggle ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between sidebar-header py-4 px-1">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/klyxy.svg"
            alt="KLYXY"
            width={100}
            height={34}
            className="h-auto w-auto max-w-[100px]"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
        {/* Bouton fermer - mobile uniquement */}
        <button
          className="lg:hidden p-2 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => setSidebarToggle(false)}
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav>
          <div>
            <h3 className="mb-4 text-xs uppercase leading-[20px] text-muted-foreground">
              <span className="menu-group-title">MENU</span>
            </h3>

            <ul className="flex flex-col gap-4 mb-6">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                
                return (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className={`menu-item group relative flex items-center gap-3 px-3 py-2 font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-0 ${
                        active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon 
                        className={`w-5 h-5 transition-colors ${
                          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                      <span className="menu-item-text">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}
