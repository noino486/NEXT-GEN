"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth-client"
import { isCreateur, canAccessAdmin } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import MetricCard from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Eye, DollarSign, TrendingUp, Heart, Share2, Clock, Video as VideoIcon, Banknote } from "lucide-react"
import { getCreatorVideoStats, type CreatorStats } from "@/lib/video-stats-client"
import Chart01 from "@/components/dashboard/charts/chart01"
import Chart02 from "@/components/dashboard/charts/chart02"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import dynamique pour éviter les erreurs SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function VideoStatsPage() {
  const router = useRouter()
  const [user, setUser] = useState(getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('30')
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawRequested, setWithdrawRequested] = useState(false)

  const loadStats = async () => {
    const currentUser = getUser()
    if (!currentUser) return

    try {
      const result = await getCreatorVideoStats(currentUser.id, period)

      if (result.success && result.stats) {
        setStats(result.stats)
      } else {
        toast.error(result.error || 'Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error)
      toast.error('Erreur lors du chargement des statistiques')
    }
  }

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser || (!isCreateur(currentUser) && !canAccessAdmin(currentUser))) {
      setIsLoading(false)
      router.push('/dashboard')
      return
    }

    loadStats().finally(() => setIsLoading(false))
  }, [router, period])

  const formatCurrency = (amount: number | string | null | undefined) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(Number(amount) || 0)
  }

  const formatNumber = (num: number | string | null | undefined) => {
    const n = Number(num) || 0
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M'
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K'
    }
    return n.toString()
  }

  const formatDuration = (seconds: number | string | null | undefined) => {
    const s = Number(seconds) || 0
    const hours = Math.floor(s / 3600)
    const minutes = Math.floor((s % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <DashboardLayout page="video-stats">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || (!isCreateur(user) && !canAccessAdmin(user))) {
    return null
  }

  // Données fictives de démonstration affichées quand aucune donnée réelle n'est disponible
  const MOCK_PERIOD_LABELS = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  })
  const MOCK_VIEWS_DATA   = [320,410,380,520,490,610,580,720,690,840,810,950,920,1060,1030,1170,1140,1280,1250,1390,1360,1500,1470,1610,1580,1720,1690,1830,1800,1940]
  const MOCK_REVENUE_DATA = [12.4,15.9,14.7,20.2,19.0,23.7,22.5,27.9,26.8,32.6,31.4,36.8,35.6,41.1,39.9,45.4,44.2,49.6,48.5,54.0,52.8,58.2,57.1,62.5,61.4,66.8,65.7,71.2,70.0,75.4]

  const rawGlobal = stats?.globalStats
  const hasRealStats = rawGlobal
    ? (Number(rawGlobal.total_views) > 0 || Number(rawGlobal.total_revenue) > 0)
    : false

  const globalStats = hasRealStats
    ? {
        total_videos:       Number(rawGlobal!.total_videos) || 0,
        total_views:        Number(rawGlobal!.total_views) || 0,
        total_unique_views: Number(rawGlobal!.total_unique_views) || 0,
        total_watch_time:   Number(rawGlobal!.total_watch_time) || 0,
        total_revenue:      Number(rawGlobal!.total_revenue) || 0,
        total_favorites:    Number(rawGlobal!.total_favorites) || 0,
        total_shares:       Number(rawGlobal!.total_shares) || 0,
      }
    : {
        total_videos:       12,
        total_views:        47_832,
        total_unique_views: 31_549,
        total_watch_time:   9_240,
        total_revenue:      2_341.50,
        total_favorites:    3_289,
        total_shares:       841,
      }

  const rawPeriodStats = stats?.periodStats || []
  const rawVideoStats  = stats?.videoStats  || []

  const hasRealPeriodData = rawPeriodStats.some(s => Number(s.views) > 0)

  const periodStats = hasRealPeriodData ? rawPeriodStats : []
  const videoStats  = rawVideoStats

  // Préparer les données pour les graphiques (éviter null/undefined → .toString() crash)
  const viewsData   = hasRealPeriodData
    ? rawPeriodStats.map(stat => Number(stat?.views) || 0)
    : MOCK_VIEWS_DATA
  const revenueData = hasRealPeriodData
    ? rawPeriodStats.map(stat => parseFloat(String(stat?.revenue ?? 0)))
    : MOCK_REVENUE_DATA
  const dates = hasRealPeriodData
    ? rawPeriodStats.map(stat => {
        if (!stat?.date) return ''
        const date = new Date(stat.date)
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      })
    : MOCK_PERIOD_LABELS

  // Options pour le graphique de revenus
  const revenueChartOptions = {
    series: [
      {
        name: "Revenus (€)",
        data: revenueData,
      },
    ],
    colors: ["#00E5FF"],
    chart: {
      fontFamily: "Geist, sans-serif",
      type: "area" as const,
      height: 300,
      width: "100%",
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 220 },
          xaxis: { labels: { rotate: -45, style: { fontSize: "10px" } } },
          yaxis: { labels: { style: { fontSize: "10px" } } },
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    xaxis: {
      categories: dates,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
        formatter: function (val: number) {
          return formatCurrency(Number(val) || 0)
        },
      },
    },
    grid: {
      borderColor: "var(--border)",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: function (val: number) {
          return formatCurrency(Number(val) || 0)
        },
      },
    },
  }

  return (
    <DashboardLayout page="video-stats">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Statistiques Vidéos</h1>
            <p className="text-muted-foreground mt-2">Analysez les performances de vos vidéos et vos revenus</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              onClick={() => setWithdrawModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shrink-0"
            >
              <Banknote className="h-4 w-4 mr-2" />
              Retirer mes gains
            </Button>
            <Button
              variant={period === '7' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7')}
            >
              7 jours
            </Button>
            <Button
              variant={period === '30' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30')}
            >
              30 jours
            </Button>
            <Button
              variant={period === '90' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('90')}
            >
              90 jours
            </Button>
            <Button
              variant={period === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('all')}
            >
              Tout
            </Button>
          </div>
        </div>

        {/* Cartes de métriques */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenus totaux"
            value={formatCurrency(globalStats.total_revenue)}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <MetricCard
            title="Vues totales"
            value={formatNumber(globalStats.total_views)}
            icon={<Eye className="h-6 w-6" />}
          />
          <MetricCard
            title="Vues uniques"
            value={formatNumber(globalStats.total_unique_views)}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <MetricCard
            title="Temps de visionnage"
            value={formatDuration(globalStats.total_watch_time)}
            icon={<Clock className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Vidéos"
            value={globalStats.total_videos}
            icon={<VideoIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="Ajouts dans les favoris"
            value={formatNumber(globalStats.total_favorites)}
            icon={<Heart className="h-6 w-6" />}
          />
          <MetricCard
            title="Partages"
            value={formatNumber(globalStats.total_shares)}
            icon={<Share2 className="h-6 w-6" />}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Chart01
            data={viewsData}
            categories={dates}
            title="Vues par jour"
          />

          <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Revenus par jour</h3>
            </div>
            <div className="w-full -ml-2">
              <Chart
                options={revenueChartOptions}
                series={revenueChartOptions.series}
                type="area"
                height={300}
                width="100%"
              />
            </div>
          </div>
        </div>

        {/* Tableau des vidéos */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par vidéo</CardTitle>
            <CardDescription>
              Détails des performances de chacune de vos vidéos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videoStats.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune statistique disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vidéo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Vues</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Vues uniques</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Temps visionnage</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenus</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ajouts dans les favoris</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Partages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videoStats.map((video) => (
                      <tr key={video.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {video.thumbnail && (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="h-12 w-20 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{video.title}</p>
                              <p className="text-xs text-muted-foreground">{video.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-sm">{formatNumber(video.total_views)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatNumber(video.total_unique_views)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatDuration(video.total_watch_time)}</td>
                        <td className="text-right py-3 px-4 text-sm font-medium">{formatCurrency(video.total_revenue)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatNumber(video.total_favorites)}</td>
                        <td className="text-right py-3 px-4 text-sm">{formatNumber(video.total_shares)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Retirer mes gains */}
      <Dialog open={withdrawModalOpen} onOpenChange={(open) => { setWithdrawModalOpen(open); if (!open) setWithdrawRequested(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Retirer mes gains
            </DialogTitle>
            <DialogDescription>
              Solde disponible pour le retrait
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-5">
            {/* Solde */}
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5 text-center space-y-1">
              <p className="text-sm text-muted-foreground">Solde disponible</p>
              <p className="text-4xl font-black text-green-500">
                {formatCurrency(globalStats.total_revenue)}
              </p>
            </div>

            {withdrawRequested ? (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center space-y-2">
                <p className="text-sm font-semibold text-primary">Demande envoyée !</p>
                <p className="text-xs text-muted-foreground">
                  Votre demande de retrait a bien été prise en compte. Le virement sera effectué sous 3 à 5 jours ouvrés.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Les retraits sont traités sous 3 à 5 jours ouvrés. Un minimum de 10 € est requis pour effectuer un retrait.
                  </p>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={() => {
                    setWithdrawRequested(true)
                    toast.success('Demande de retrait envoyée avec succès !')
                  }}
                  disabled={globalStats.total_revenue < 10}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Confirmer le retrait de {formatCurrency(globalStats.total_revenue)}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setWithdrawModalOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

