"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth-client"
import { canAccessDashboard } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Search, Filter, Loader2 } from "lucide-react"

interface Log {
  id: number
  user_id: number
  user_role: string | null
  action: string
  resource_type: string | null
  resource_id: number | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user_username: string | null
  user_email: string | null
}

import { getBackendUrl } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  'update_role': 'Modification de rôle',
  'update_account_type': 'Modification de type de compte',
  'delete_user': 'Suppression d\'utilisateur',
  'view_users': 'Consultation utilisateurs',
  'view_analytics': 'Consultation analytiques',
}

const ROLE_LABELS: Record<string, string> = {
  'createur': 'Créateur',
  'support': 'Support',
  'administrateur': 'Administrateur',
}

export default function LogsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const currentUser = getUser()
    setUser(currentUser)

    // Vérifier l'accès logs (uniquement administrateur)
    if (!currentUser || !canAccessDashboard(currentUser)) {
      router.push('/')
      return
    }

    loadLogs()
  }, [router, page, filterAction])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (filterAction !== 'all') {
        params.append('action', filterAction)
      }

      const response = await fetch(`${getBackendUrl()}/api/logs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des logs')
      }

      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <DashboardLayout page="logs">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !canAccessDashboard(user)) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionDescription = (log: Log) => {
    const actionLabel = ACTION_LABELS[log.action] || log.action
    const details = log.details || {}

    if (log.action === 'update_role') {
      const oldRole = details.old_role ? ROLE_LABELS[details.old_role] || details.old_role : 'Aucun'
      const newRole = details.new_role ? ROLE_LABELS[details.new_role] || details.new_role : 'Aucun'
      return `${actionLabel} - ${details.target_username || 'Utilisateur'} : ${oldRole} → ${newRole}`
    }

    if (log.action === 'update_account_type') {
      const oldType = details.old_account_type === 'premium' ? 'Premium' : 'Gratuit'
      const newType = details.new_account_type === 'premium' ? 'Premium' : 'Gratuit'
      return `${actionLabel} - ${details.target_username || 'Utilisateur'} : ${oldType} → ${newType}`
    }

    if (log.action === 'delete_user') {
      return `${actionLabel} - ${details.deleted_username || 'Utilisateur'} (${details.deleted_email || ''})`
    }

    return actionLabel
  }

  const filteredLogs = logs.filter(log => {
    if (searchTerm.trim() === '') return true
    const search = searchTerm.toLowerCase()
    return (
      log.user_username?.toLowerCase().includes(search) ||
      log.user_email?.toLowerCase().includes(search) ||
      getActionDescription(log).toLowerCase().includes(search)
    )
  })

  return (
    <DashboardLayout page="logs">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs d'activité</h1>
          <p className="text-muted-foreground mt-2">
            Historique complet de toutes les actions effectuées sur le dashboard
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="update_role">Modification de rôle</SelectItem>
                <SelectItem value="update_account_type">Modification de compte</SelectItem>
                <SelectItem value="delete_user">Suppression d'utilisateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table des logs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Chargement des logs...</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun log trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user_username || 'Inconnu'}</div>
                          <div className="text-sm text-muted-foreground">{log.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.user_role ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {ROLE_LABELS[log.user_role] || log.user_role}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm">{getActionDescription(log)}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

