"use client"

// Page Profil du design : colonne identité + grille de sections.
//
// TODO (pas encore de pages/API derrière) : Abonnement, Paiement, Cartes enregistrées,
// Historique de visionnage, Paramètres, Notifications, Confidentialité, Sécurité, Aide.
// Leurs liens pointent vers /dashboard (espace compte existant) ou restent inactifs ("#").

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, QrCode } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { UserAvatar } from "@/components/user-avatar"
import { useAccount } from "@/hooks/use-account"
import { removeUser } from "@/lib/auth-client"
import {
  UserEditIcon,
  SubscriptionIcon,
  PaymentIcon,
  CardsIcon,
  HistoryIcon,
  HeartIcon,
  DownloadIcon,
  SettingsIcon,
  BellIcon,
  ShieldIcon,
  KeyIcon,
  HelpIcon,
  LogoutIcon,
} from "@/components/profil-icons"

// Bleu du logo Klyxy, utilisé par la maquette Profil pour les icônes et l'anneau d'avatar.
const BRAND_BLUE = "text-[#4FC2EF]"

interface ProfilRow {
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href?: string
  destructive?: boolean
  onClick?: () => void
}

export default function ProfilPage() {
  const router = useRouter()
  const { user, profilePicture } = useAccount()

  useEffect(() => {
    // Page réservée aux utilisateurs connectés
    if (typeof window !== "undefined" && !localStorage.getItem("klyxy_user")) router.replace("/login")
  }, [router])

  const handleLogout = () => {
    removeUser()
    router.push("/")
    router.refresh()
  }

  const left: { title: string; rows: ProfilRow[] }[] = [
    {
      title: "Compte",
      rows: [
        { label: "Modifier le profil", icon: UserEditIcon, href: "/dashboard" },
        { label: "Abonnement", icon: SubscriptionIcon, href: "/dashboard" },
        { label: "Paiement", icon: PaymentIcon, href: "/dashboard" },
        { label: "Cartes enregistrées", icon: CardsIcon, href: "#" },
      ],
    },
    {
      title: "Activité",
      rows: [
        { label: "Historique de visionnage", icon: HistoryIcon, href: "#" },
        { label: "Ma liste", icon: HeartIcon, href: "/ma-liste" },
        { label: "Téléchargements", icon: DownloadIcon, href: "/mes-telechargements" },
      ],
    },
  ]

  const right: { title?: string; rows: ProfilRow[] }[] = [
    {
      title: "Réglages",
      rows: [
        { label: "Paramètres", icon: SettingsIcon, href: "/dashboard" },
        { label: "Notifications", icon: BellIcon, href: "#" },
        { label: "Confidentialité", icon: ShieldIcon, href: "#" },
        { label: "Sécurité et mot de passe", icon: KeyIcon, href: "/dashboard" },
      ],
    },
    {
      rows: [
        { label: "Aide et support", icon: HelpIcon, href: "#" },
        { label: "Déconnexion", icon: LogoutIcon, destructive: true, onClick: handleLogout },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navigation />
      <MobileBottomNav />

      <div className="flex flex-col gap-10 px-6 pb-[60px] pt-[124px] lg:flex-row lg:gap-12 lg:px-14">
        {/* Colonne identité */}
        <div className="flex w-full shrink-0 flex-col lg:w-[360px]">
          <div className="relative flex flex-col items-start gap-3.5">
            <div
              className="pointer-events-none absolute -left-10 -top-10 z-0 h-[240px] w-[240px]"
              style={{
                background: "radial-gradient(circle, rgba(79,194,239,.28) 0%, rgba(79,194,239,.08) 45%, transparent 72%)",
                filter: "blur(10px)",
              }}
            />

            <UserAvatar
              username={user?.username}
              src={profilePicture}
              className="relative z-[2] h-[120px] w-[120px] shadow-[0_14px_36px_rgba(0,0,0,.55),0_0_0_1px_rgba(255,255,255,.07)]"
              textClassName="text-5xl"
            />

            <div className="relative z-[2] text-2xl font-extrabold text-white">{user?.username ?? "Klyxy_user"}</div>

            <div className="relative z-[2] flex items-center gap-2.5">
              <span className="text-sm font-medium text-muted-foreground">@{(user?.username ?? "klyxy_user").toLowerCase()}</span>
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/[0.09]">
                <QrCode className="h-[13px] w-[13px] text-white" strokeWidth={1.8} />
              </div>
            </div>

            <Link
              href="/dashboard"
              className="relative z-[2] mt-1.5 inline-flex h-[42px] items-center justify-center rounded-full bg-[rgba(244,244,245,.12)] px-[22px] text-sm font-semibold text-white transition-colors hover:bg-[rgba(244,244,245,.18)]"
            >
              Modifier le profil
            </Link>
          </div>

          <div className="mt-14 hidden lg:flex">
            <span className="w-full text-center text-xs font-medium text-muted-foreground">Klyxy — version 1.0.0</span>
          </div>
        </div>

        {/* Grille des sections */}
        <div className="flex flex-1 flex-col gap-7 md:flex-row">
          <div className="flex flex-1 flex-col gap-7">
            {left.map((section) => (
              <SectionCard key={section.title} {...section} />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-7">
            {right.map((section, i) => (
              <SectionCard key={section.title ?? `untitled-${i}`} {...section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, rows }: { title?: string; rows: ProfilRow[] }) {
  return (
    <div className="rounded-[20px] bg-card px-6 py-[22px]">
      {title && <h2 className="mb-1.5 ml-0.5 text-base font-bold tracking-[-0.005em] text-white">{title}</h2>}
      {rows.map((row, i) => {
        const Icon = row.icon
        const content = (
          <>
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center">
              <Icon className={row.destructive ? "text-destructive" : BRAND_BLUE} />
            </span>
            <span className={`flex-1 text-[14.5px] font-medium ${row.destructive ? "text-destructive" : "text-white"}`}>
              {row.label}
            </span>
            {!row.destructive && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.25} />}
          </>
        )
        const rowClass = `flex w-full items-center gap-3.5 px-0.5 py-[13px] text-left ${
          i < rows.length - 1 ? "border-b border-white/[0.07]" : ""
        }`

        return row.onClick ? (
          <button key={row.label} onClick={row.onClick} className={rowClass}>
            {content}
          </button>
        ) : (
          <Link key={row.label} href={row.href ?? "#"} className={rowClass}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}
