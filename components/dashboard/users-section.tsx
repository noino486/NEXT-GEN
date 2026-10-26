"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Search, UserCog } from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getUser } from "@/lib/auth-client"
import { isAdministrator, isSupport } from "@/lib/roles-client"

interface User {
  id: number
  username: string
  email: string
  account_type: 'free' | 'premium'
  role: 'createur' | 'support' | 'administrateur' | null
  created_at: string
  updated_at: string | null
}

import { getBackendUrl } from '@/lib/utils'

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const currentUser = getUser()
  const isAdmin = isAdministrator(currentUser)
  const isSupportUser = isSupport(currentUser)

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${getBackendUrl()}/api/users`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du chargement des utilisateurs')
      }

      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
      setError(null)
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      const errorMessage = err instanceof Error ? err.message : 'Impossible de charger les utilisateurs'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.id?.toString() || '',
          'X-User-Role': currentUser?.role || '',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      // Recharger la liste
      await loadUsers()
      setUserToDelete(null)
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.id?.toString() || '',
          'X-User-Role': currentUser?.role || '',
        },
        body: JSON.stringify({ role: newRole || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour du rôle')
      }

      // Recharger la liste
      await loadUsers()
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle')
    }
  }

  const handleAccountTypeChange = async (userId: number, newAccountType: 'free' | 'premium') => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}/account-type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.id?.toString() || '',
          'X-User-Role': currentUser?.role || '',
        },
        body: JSON.stringify({ accountType: newAccountType }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour du type de compte')
      }

      // Recharger la liste
      await loadUsers()
    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du type de compte')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleDisplayName = (role: string | null) => {
    if (!role) return 'Aucun'
    const names: Record<string, string> = {
      'createur': 'Créateur',
      'support': 'Support',
      'administrateur': 'Administrateur'
    }
    return names[role] || role
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          <h2 className="text-2xl font-semibold">Utilisateurs</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type de compte</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.account_type}
                        onValueChange={(value) => handleAccountTypeChange(user.id, value as 'free' | 'premium')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Gratuit</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || ''}
                        onValueChange={(value) => handleRoleChange(user.id, value === 'none' ? '' : value)}
                        disabled={isSupportUser && (user.role === 'support' || user.role === 'administrateur')}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Aucun rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun rôle</SelectItem>
                          <SelectItem value="createur">Créateur</SelectItem>
                          {isAdmin && (
                            <>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="administrateur">Administrateur</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setUserToDelete(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.username}</strong> ({user.email}) ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                                Annuler
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Total: {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

