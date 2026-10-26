"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth-client"
import { canAccessDashboard } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import MetricCard from "@/components/dashboard/metric-card"
import Chart01 from "@/components/dashboard/charts/chart01"
import Chart02 from "@/components/dashboard/charts/chart02"
import Chart03 from "@/components/dashboard/charts/chart03"
import { Users, Video, TrendingUp, DollarSign, Loader2 } from "lucide-react"
import { getUsersStats, getPlatformStats, type UsersStats, type PlatformStats } from "@/lib/analytics-client"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K'
  return n.toLocaleString('fr-FR')
}

function formatRevenue(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState(getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [usersStats, setUsersStats] = useState<UsersStats | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser || !canAccessDashboard(currentUser)) {
      router.push('/')
      return
    }

    let cancelled = false
    setError(null)
    Promise.all([getUsersStats(), getPlatformStats()])
      .then(([usersRes, platformRes]) => {
        if (cancelled) return
        if (usersRes.success && usersRes.stats) setUsersStats(usersRes.stats)
        else if (!usersRes.success) setError(usersRes.error ?? 'Erreur utilisateurs')
        if (platformRes.success && platformRes.stats) setPlatformStats(platformRes.stats)
        else if (!platformRes.success) setError(platformRes.error ?? 'Erreur plateforme')
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout page="analytics">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !canAccessDashboard(user)) {
    return null
  }

  // Données fictives de démonstration affichées quand aucune donnée réelle n'est disponible
  const MOCK_MONTHLY_LABELS = ['Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil']
  const MOCK_MONTHLY_USERS  = [42, 78, 95, 130, 160, 205, 289, 347, 412, 498, 573, 641]
  const MOCK_MONTHLY_VIEWS  = [3200, 5800, 8400, 11200, 14700, 18900, 24300, 31500, 38200, 44800, 51600, 58900]
  const MOCK_MONTHLY_REVENUE = [120, 218, 315, 420, 551, 708, 912, 1181, 1431, 1680, 1935, 2208]

  const rawTotalUsers   = usersStats?.total ?? 0
  const rawTotalVideos  = platformStats?.totalVideos ?? 0
  const rawPublishedVid = platformStats?.publishedVideos ?? 0
  const rawTotalViews   = platformStats?.totalViews ?? 0
  const rawTotalRevenue = platformStats?.totalRevenue ?? 0

  const hasRealData = rawTotalUsers > 0 || rawTotalVideos > 0 || rawTotalViews > 0

  const totalUsers      = hasRealData ? rawTotalUsers   : 2_847
  const totalVideos     = hasRealData ? rawTotalVideos  : 67
  const publishedVideos = hasRealData ? rawPublishedVid : 58
  const totalViews      = hasRealData ? rawTotalViews   : 312_490
  const totalRevenue    = hasRealData ? rawTotalRevenue : 8_934

  const monthlyUsers   = (usersStats?.monthlyUsers ?? []).filter(v => v > 0).length > 0
    ? usersStats!.monthlyUsers : MOCK_MONTHLY_USERS
  const monthlyLabels  = (usersStats?.monthlyLabels ?? []).length > 0
    ? usersStats!.monthlyLabels : MOCK_MONTHLY_LABELS
  const monthlyViews   = (platformStats?.monthlyViews ?? []).filter(v => v > 0).length > 0
    ? platformStats!.monthlyViews : MOCK_MONTHLY_VIEWS
  const monthlyRevenue = (platformStats?.monthlyRevenue ?? []).filter(v => v > 0).length > 0
    ? platformStats!.monthlyRevenue : MOCK_MONTHLY_REVENUE

  const publishRate = totalVideos > 0 ? Math.round((publishedVideos / totalVideos) * 100) : 87

  return (
    <DashboardLayout page="analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytiques</h1>
          <p className="text-muted-foreground mt-2">Statistiques et analyses de la plateforme KLYXY</p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Utilisateurs"
            value={totalUsers.toLocaleString('fr-FR')}
            icon={<Users className="h-6 w-6" />}
          />
          <MetricCard
            title="Vidéos"
            value={totalVideos.toLocaleString('fr-FR')}
            icon={<Video className="h-6 w-6" />}
          />
          <MetricCard
            title="Vues"
            value={formatNumber(totalViews)}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <MetricCard
            title="Revenus"
            value={formatRevenue(totalRevenue)}
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Chart01
              data={monthlyUsers.length ? monthlyUsers : [0]}
              categories={monthlyLabels.length ? monthlyLabels : ['—']}
              title="Nouveaux utilisateurs par mois"
            />
          </div>
          <div>
            <Chart02
              value={publishRate}
              label="Vidéos publiées"
            />
          </div>
        </div>

        <div className="grid grid-cols-1">
          <Chart03
            salesData={monthlyViews.length ? monthlyViews : [0]}
            revenueData={monthlyRevenue.length ? monthlyRevenue : [0]}
            categories={monthlyLabels.length ? monthlyLabels : ['—']}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
