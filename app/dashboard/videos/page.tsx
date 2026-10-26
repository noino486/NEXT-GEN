"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth-client"
import { canAccessAdmin } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Video as VideoIcon, Eye, Edit, Trash2 } from "lucide-react"
import { getAllVideos, deleteVideo, type Video } from "@/lib/videos-client"
import CreateVideoModal from "@/components/dashboard/create-video-modal"

const CATEGORY_LABELS: Record<string, string> = {
  latest: 'Dernières sorties',
  popular: 'Top 10',
  influences: 'Influences',
  rap_musique: 'Rap / Musique',
  inside: 'Inside',
  sport: 'Sport',
  featured: 'Contenu en vedette',
  fastlife: 'Fastlife',
  podcast: 'Podcast',
  vlog: 'Vlog',
  humour: 'Humour',
  mode: 'Mode',
  gossip: 'Gossip',
  tele_realite: 'Télé réalité',
  selection: 'Notre Sélection',
  shorts: 'Shorts',
  series: 'Séries',
  lifestyle: 'Fastlife',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

export default function VideosPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser || !canAccessAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }

    let cancelled = false
    setIsLoading(true)
    getAllVideos({
      status: filter === 'all' ? undefined : filter,
      limit: 100,
      light: true
    })
      .then((result) => {
        if (cancelled) return
        if (result.success && result.videos) setVideos(result.videos)
        else toast.error(result.error || 'Erreur lors du chargement des vidéos')
      })
      .catch((err) => {
        if (cancelled) return
        console.error('❌ Erreur lors du chargement des vidéos:', err)
        toast.error('Erreur lors du chargement des vidéos')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [router, filter])

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const result = await getAllVideos({
        status: filter === 'all' ? undefined : filter,
        limit: 100,
        light: true
      })
      if (result.success && result.videos) setVideos(result.videos)
      else toast.error(result.error || 'Erreur lors du chargement des vidéos')
    } catch (error) {
      console.error('❌ Erreur lors du chargement des vidéos:', error)
      toast.error('Erreur lors du chargement des vidéos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (videoId: number, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la vidéo "${title}" ?`)) {
      return
    }

    try {
      const result = await deleteVideo(videoId)
      if (result.success) {
        toast.success('Vidéo supprimée avec succès')
        loadVideos()
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const showMain = mounted && !!user && canAccessAdmin(user)
  const filteredVideos = filter === 'all'
    ? videos
    : videos.filter((v) => v.status === filter)

  return (
    <DashboardLayout page="videos">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Gestion des Vidéos</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Gérez toutes les vidéos de la plateforme KLYXY</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} disabled={!showMain || isLoading} className="w-full sm:w-auto shrink-0 min-h-10 touch-manipulation">
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Publier une vidéo
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            disabled={!showMain || isLoading}
          >
            Toutes {showMain && !isLoading && `(${videos.length})`}
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
            size="sm"
            disabled={!showMain || isLoading}
          >
            Publiées {showMain && !isLoading && `(${videos.filter((v) => v.status === 'published').length})`}
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilter('draft')}
            size="sm"
            disabled={!showMain || isLoading}
          >
            Brouillons {showMain && !isLoading && `(${videos.filter((v) => v.status === 'draft').length})`}
          </Button>
        </div>

        {!showMain || isLoading ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-sm">Vidéo</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden sm:table-cell">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden md:table-cell">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden lg:table-cell">Publication</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-9 rounded bg-muted animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                      <td className="py-3 px-4 hidden md:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></td>
                      <td className="py-3 px-4 hidden lg:table-cell"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
                      <td className="py-3 px-4 text-right"><div className="h-8 w-24 ml-auto rounded bg-muted animate-pulse" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <VideoIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune vidéo trouvée</p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Publier votre première vidéo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-sm">Vidéo</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden sm:table-cell">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden md:table-cell">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-sm hidden lg:table-cell">Publication</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-9 flex-shrink-0 rounded overflow-hidden bg-muted">
                            {video.thumbnail ? (
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <VideoIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            {video.is_top_10 && video.rank && (
                              <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] font-bold px-1">
                                #{video.rank}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{video.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                              {video.creator_username || video.creator_email || 'Créateur inconnu'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm hidden sm:table-cell">
                        {CATEGORY_LABELS[video.category] || video.category}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className={`text-sm font-medium ${
                          video.status === 'published' ? 'text-green-600' :
                          video.status === 'draft' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {STATUS_LABELS[video.status] || video.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                        {video.published_at ? new Date(video.published_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/watch/${video.id}`)} title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/videos/edit/${video.id}`)} title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(video.id, video.title)} title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de création de vidéo */}
        <CreateVideoModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={loadVideos}
        />
      </div>
    </DashboardLayout>
  )
}

