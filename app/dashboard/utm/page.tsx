"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth-client"
import { isAdministrator } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2, Plus, Trash2, Edit, Send, FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function UTMPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [utmLinks, setUtmLinks] = useState<{ id: number; name: string; url: string; created_at: string }[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser || !isAdministrator(currentUser)) {
      router.push("/dashboard")
      return
    }

    // TODO: Charger les liens UTM depuis l'API
    setLoading(false)
    setUtmLinks([])
  }, [router])

  const showMain = mounted && !!user && isAdministrator(user)

  if (!showMain) {
    return null
  }

  return (
    <DashboardLayout page="utm">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Liens UTM / Tracking</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Créez et gérez les liens de tracking pour les créateurs et partenaires
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto shrink-0 min-h-10">
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Créer un lien
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Liens de tracking
            </CardTitle>
            <CardDescription>
              Créez et gérez vos liens de suivi pour mesurer les performances de vos campagnes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : utmLinks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Aucun lien de tracking</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier lien
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Suivez les clics, les conversions et l&apos;origine de vos visiteurs grâce aux liens UTM.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {utmLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{link.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{link.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Envoyer par email">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Exporter rapport">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
