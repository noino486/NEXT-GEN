"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth-client"
import { canManageUsers } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import UsersSection from "@/components/dashboard/users-section"
import MetricCard from "@/components/dashboard/metric-card"
import Chart01 from "@/components/dashboard/charts/chart01"
import Chart02 from "@/components/dashboard/charts/chart02"
import { Users, UserPlus, UserCheck, UserX, Loader2 } from "lucide-react"
import { getBackendUrl } from '@/lib/utils'

export default function UsersPage() {
  const router = useRouter()
  const [user, setUser] = useState(getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    free: 0,
    withRole: 0,
    monthlyUsers: [] as number[],
    monthlyLabels: [] as string[],
  })

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    // Vérifier l'accès gestion utilisateurs (administrateur ou support)
    if (!currentUser || !canManageUsers(currentUser)) {
      router.push('/')
      return
    }

    // Charger les statistiques
    loadStats()

    setIsLoading(false)
  }, [router])

  const loadStats = async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/users/stats`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erreur HTTP:', response.status, errorData)
        return
      }

      const data = await response.json()

      if (data.success && data.stats) {
        setStats({
          total: data.stats.total || 0,
          premium: data.stats.premium || 0,
          free: data.stats.free || 0,
          withRole: data.stats.withRole || 0,
          monthlyUsers: data.stats.monthlyUsers || [],
          monthlyLabels: data.stats.monthlyLabels || [],
        })
      } else {
        console.error('❌ Format de réponse invalide:', data)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout page="users">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !canManageUsers(user)) {
    return null
  }

  const premiumPercentage = stats.total > 0 ? ((stats.premium / stats.total) * 100).toFixed(1) : '0'

  return (
    <DashboardLayout page="users">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Gérez tous les utilisateurs de la plateforme KLYXY</p>
        </div>

        {/* Cartes de métriques */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Utilisateurs"
            value={stats.total.toString()}
            change="+12.5%"
            changeType="positive"
            icon={<Users className="h-6 w-6" />}
          />
          <MetricCard
            title="Comptes Premium"
            value={stats.premium.toString()}
            change={`${premiumPercentage}%`}
            changeType="positive"
            icon={<UserCheck className="h-6 w-6" />}
          />
          <MetricCard
            title="Comptes Gratuits"
            value={stats.free.toString()}
            change={`${stats.total > 0 ? ((stats.free / stats.total) * 100).toFixed(1) : 0}%`}
            changeType="neutral"
            icon={<UserX className="h-6 w-6" />}
          />
          <MetricCard
            title="Avec Rôle"
            value={stats.withRole.toString()}
            change={`${stats.total > 0 ? ((stats.withRole / stats.total) * 100).toFixed(1) : 0}%`}
            changeType="positive"
            icon={<UserPlus className="h-6 w-6" />}
          />
        </div>

        {/* Graphiques */}
        {stats.monthlyUsers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Chart01 
                data={stats.monthlyUsers}
                categories={stats.monthlyLabels}
                title="Nouveaux utilisateurs par mois"
              />
            </div>
            <div>
              <Chart02 
                value={parseFloat(premiumPercentage)}
                label="Taux Premium"
              />
            </div>
          </div>
        )}

        {/* Section Utilisateurs */}
        <UsersSection />
      </div>
    </DashboardLayout>
  )
}

