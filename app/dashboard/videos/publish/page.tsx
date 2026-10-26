"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth-client"
import { canAccessAdmin } from "@/lib/roles-client"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Upload, Image as ImageIcon, Loader2, X, Check, Video } from "lucide-react"
import { createVideo, getCreators, uploadVideoToCloudflare, uploadVideoToCloudflareTus, TUS_UPLOAD_SIZE_THRESHOLD, type Creator, type CreateVideoData } from "@/lib/videos-client"
import { Checkbox } from "@/components/ui/checkbox"

const CATEGORIES = [
  { value: 'latest', label: 'Dernières sorties' },
  { value: 'popular', label: 'Top 10' },
  { value: 'influences', label: 'Influences' },
  { value: 'rap_musique', label: 'Rap / Musique' },
  { value: 'inside', label: 'Inside' },
  { value: 'sport', label: 'Sport' },
  { value: 'featured', label: 'Contenu en vedette' },
  { value: 'fastlife', label: 'Fastlife' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'humour', label: 'Humour' },
  { value: 'mode', label: 'Mode' },
  { value: 'gossip', label: 'Gossip' },
  { value: 'tele_realite', label: 'Télé réalité' },
  { value: 'selection', label: 'Notre Sélection' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'series', label: 'Séries' },
] as const

const BADGES = [
  { value: 'Pour vous', label: 'Pour vous' },
  { value: 'Nouveau', label: 'Nouveau' },
  { value: 'Populaire', label: 'Populaire' },
  { value: 'Tendance', label: 'Tendance' },
] as const

export default function PublishVideoPage() {
  const router = useRouter()
  const [user, setUser] = useState(getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
  const [loadingCreators, setLoadingCreators] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cloudflareStreamId, setCloudflareStreamId] = useState("")
  const [thumbnail, setThumbnail] = useState<string>("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  /** Miniature 9:16 pour la section Top 10 (affichée dans le carousel Top 10) */
  const [thumbnailTop10, setThumbnailTop10] = useState<string>("")
  const [thumbnailTop10File, setThumbnailTop10File] = useState<File | null>(null)
  const [creatorId, setCreatorId] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [badge, setBadge] = useState<string>("")
  /** Position dans le Top 10 (1-10). Si renseignée, la vidéo est dans le Top 10 de sa catégorie. */
  const [rank, setRank] = useState<string>("")
  const [duration, setDuration] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  /** 'video' = vidéo longue, 'short' = short (même flux d'upload, catégorie forcée à shorts) */
  const [contentType, setContentType] = useState<'video' | 'short'>('video')
  /** Hero : afficher cette vidéo en en-tête de l'accueil */
  const [isHero, setIsHero] = useState(false)
  /** Hero : "thumbnail" = miniature de la vidéo, "trailer" = bande annonce uploadée */
  const [heroDisplay, setHeroDisplay] = useState<'thumbnail' | 'trailer'>('thumbnail')
  const [heroTrailerStreamId, setHeroTrailerStreamId] = useState<string>("")
  const [heroTrailerFile, setHeroTrailerFile] = useState<File | null>(null)
  const [uploadingHeroTrailer, setUploadingHeroTrailer] = useState(false)
  const [heroTrailerProgress, setHeroTrailerProgress] = useState(0)

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const thumbnailTop10InputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const heroTrailerInputRef = useRef<HTMLInputElement>(null)

  const hasTop10Position = rank !== "" && parseInt(rank, 10) >= 1 && parseInt(rank, 10) <= 10

  const isShortMode = contentType === 'short'
  // En mode short, on force la catégorie "shorts"
  useEffect(() => {
    if (isShortMode) setCategory('shorts')
  }, [isShortMode])

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    // Vérifier l'accès (administrateur ou support)
    if (!currentUser || !canAccessAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }

    loadCreators()
    setIsLoading(false)
  }, [router])

  const loadCreators = async () => {
    try {
      setLoadingCreators(true)
      const result = await getCreators()
      if (result.success && result.creators) {
        setCreators(result.creators)
      } else {
        toast.error(result.error || 'Erreur lors du chargement des créateurs')
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des créateurs:', error)
      toast.error('Erreur lors du chargement des créateurs')
    } finally {
      setLoadingCreators(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    setThumbnailFile(file)

    // Convertir en base64 pour prévisualisation
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnail(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnail("")
    setThumbnailFile(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const handleThumbnailTop10Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }
    setThumbnailTop10File(file)
    const reader = new FileReader()
    reader.onloadend = () => setThumbnailTop10(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeThumbnailTop10 = () => {
    setThumbnailTop10("")
    setThumbnailTop10File(null)
    if (thumbnailTop10InputRef.current) thumbnailTop10InputRef.current.value = ""
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo (MP4, WebM, MOV, etc.)')
      return
    }
    if (file.size > 10 * 1024 * 1024 * 1024) {
      toast.error('La vidéo ne doit pas dépasser 10 Go.')
      return
    }
    setVideoFile(file)
  }

  const handleUploadVideo = async () => {
    if (!videoFile) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const useTus = videoFile.size > TUS_UPLOAD_SIZE_THRESHOLD
      const result = useTus
        ? await uploadVideoToCloudflareTus(videoFile, (bytesUploaded, bytesTotal) => {
            setUploadProgress(bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0)
          })
        : await uploadVideoToCloudflare(videoFile)
      if (result.success && result.videoId) {
        setCloudflareStreamId(result.videoId)
        if ('duration' in result && typeof result.duration === 'string' && result.duration) {
          setDuration(result.duration)
        }
        toast.success(useTus ? 'Vidéo uploadée (TUS resumable)' : 'Vidéo uploadée sur Cloudflare Stream')
      } else {
        toast.error(result.error || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      console.error('❌ Upload vidéo:', err)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const clearVideo = () => {
    setVideoFile(null)
    setCloudflareStreamId("")
    setDuration("")
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    if (!creatorId) {
      toast.error('Veuillez sélectionner un créateur')
      return
    }

    const rankNum = rank.trim() ? parseInt(rank, 10) : null
    const isInTop10 = rankNum != null && rankNum >= 1 && rankNum <= 10

    // Catégorie(s) obligatoire(s) si pas de position Top 10
    if (!isInTop10 && !category && selectedCategories.length === 0) {
      toast.error('Veuillez sélectionner au moins une catégorie ou une position dans le Top 10 (1-10)')
      return
    }
    if (rank.trim() && (isNaN(rankNum!) || rankNum! < 1 || rankNum! > 10)) {
      toast.error('La position dans le Top 10 doit être entre 1 et 10')
      return
    }

    if (isInTop10) {
      if (!thumbnail && !thumbnailFile) {
        toast.error('La miniature standard est requise pour une vidéo dans le Top 10 (affichée si vous la retirez du Top 10)')
        return
      }
      if (!thumbnailTop10 && !thumbnailTop10File) {
        toast.error('La miniature Top 10 (9:16) est requise pour afficher la vidéo dans la section Top 10')
        return
      }
    }

    if (!cloudflareStreamId.trim()) {
      toast.error('L\'ID Cloudflare Stream est requis')
      return
    }

    if (isHero && heroDisplay === 'trailer' && !heroTrailerStreamId.trim()) {
      toast.error('Uploadez la bande annonce ou choisissez "Miniature (image de la vidéo)"')
      return
    }

    setIsSubmitting(true)

    try {
      let thumbnailBase64 = thumbnail
      if (thumbnailFile) thumbnailBase64 = thumbnail
      let thumbnailTop10Base64 = thumbnailTop10
      if (thumbnailTop10File) thumbnailTop10Base64 = thumbnailTop10

      const categoriesList = selectedCategories.length ? selectedCategories : (category ? [category] : (isInTop10 ? ['latest'] : []))
      const categoryValue = (categoriesList[0] || category || (isInTop10 ? 'latest' : '')) as CreateVideoData['category']

      const videoData: CreateVideoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        cloudflare_stream_id: cloudflareStreamId.trim(),
        thumbnail: thumbnailBase64 || undefined,
        thumbnail_top10: isInTop10 ? (thumbnailTop10Base64 || undefined) : undefined,
        creator_id: parseInt(creatorId, 10),
        category: categoryValue,
        categories: categoriesList,
        badge: badge || undefined,
        is_top_10: isInTop10,
        rank: isInTop10 && rankNum ? rankNum : undefined,
        duration: duration.trim() || undefined,
        published_at: publishedAt || undefined,
        status: status,
        is_hero: isHero,
        hero_display: heroDisplay,
        hero_trailer_stream_id: isHero && heroDisplay === 'trailer' && heroTrailerStreamId ? heroTrailerStreamId : undefined,
      }

      const result = await createVideo(videoData)

      if (result.success) {
        toast.success('Vidéo créée avec succès!')
        // Réinitialiser le formulaire
        setTitle("")
        setDescription("")
        setCloudflareStreamId("")
        setThumbnail("")
        setThumbnailFile(null)
        setThumbnailTop10("")
        setThumbnailTop10File(null)
        setVideoFile(null)
        setCreatorId("")
        setCategory("")
        setBadge("")
        setRank("")
        setDuration("")
        setPublishedAt("")
        setStatus('draft')
        setContentType('video')
        setIsHero(false)
        setHeroDisplay('thumbnail')
        setHeroTrailerStreamId("")
        setHeroTrailerFile(null)
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
        if (thumbnailTop10InputRef.current) thumbnailTop10InputRef.current.value = ""
        if (videoInputRef.current) videoInputRef.current.value = ""
        if (heroTrailerInputRef.current) heroTrailerInputRef.current.value = ""
      } else {
        toast.error(result.error || 'Erreur lors de la création de la vidéo')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la vidéo:', error)
      toast.error('Erreur lors de la création de la vidéo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout page="videos">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !canAccessAdmin(user)) {
    return null
  }

  return (
    <DashboardLayout page="videos">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Publier une Vidéo</h1>
          <p className="text-muted-foreground mt-2">Créez et publiez une nouvelle vidéo ou un short sur la plateforme KLYXY</p>
          {/* Type de contenu : Vidéo longue ou Short (même flux d'upload) */}
          <div className="flex gap-2 mt-4 p-1 rounded-lg bg-muted/50 w-fit">
            <Button
              type="button"
              variant={contentType === 'video' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContentType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Vidéo longue
            </Button>
            <Button
              type="button"
              variant={contentType === 'short' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setContentType('short')}
            >
              Short
            </Button>
          </div>
          {isShortMode && (
            <p className="text-xs text-muted-foreground mt-2">Même flux que les vidéos : uploadez votre fichier vidéo et une miniature ci-dessous.</p>
          )}
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la vidéo</CardTitle>
            <CardDescription>Remplissez les informations nécessaires pour publier la vidéo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Sessions Nocturnes - Derrière les Rythmes"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description de la vidéo..."
                  rows={4}
                />
              </div>

              {/* Upload vidéo vers Cloudflare Stream */}
              <div className="space-y-2">
                <Label>Fichier vidéo</Label>
                <div className="space-y-3">
                  {videoFile ? (
                    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Video className="h-10 w-10 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{videoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} Mo
                            {videoFile.size > TUS_UPLOAD_SIZE_THRESHOLD && ' (upload resumable TUS)'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleUploadVideo}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Upload en cours…
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Uploader sur Cloudflare
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" size="icon" onClick={clearVideo}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {uploading && uploadProgress > 0 && (
                        <Progress value={uploadProgress} className="h-2" />
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 transition-colors hover:border-primary hover:bg-muted/30"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-center text-sm font-medium text-foreground">
                        Cliquez pour sélectionner une vidéo
                      </p>
                      <p className="mt-1 text-center text-xs text-muted-foreground">
                        MP4, WebM, MOV… jusqu'à 10 Go (TUS au-delà de 200 Mo)
                      </p>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* ID Cloudflare Stream */}
              <div className="space-y-2">
                <Label htmlFor="cloudflare_stream_id">ID Cloudflare Stream *</Label>
                <Input
                  id="cloudflare_stream_id"
                  value={cloudflareStreamId}
                  onChange={(e) => setCloudflareStreamId(e.target.value)}
                  placeholder="Rempli après upload ci‑dessus ou collez un ID existant"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Uploadez une vidéo ci‑dessus pour le remplir automatiquement, ou saisissez un ID existant.
                </p>
              </div>

              {/* Miniature standard (toujours utilisée ; si Top 10, sert quand on retire la vidéo du Top 10) */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">
                  {hasTop10Position ? 'Miniature standard *' : 'Miniature'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {hasTop10Position
                    ? 'Affichée partout sauf dans la section Top 10 (et si vous retirez la vidéo du Top 10).'
                    : 'PNG, JPG jusqu\'à 5MB'}
                </p>
                <div className="space-y-3">
                  {thumbnail ? (
                    <div className="relative inline-block max-w-md">
                      <img
                        src={thumbnail}
                        alt="Miniature standard"
                        className="h-48 w-full object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeThumbnail}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors max-w-md"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez pour ajouter la miniature standard
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG jusqu'à 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Miniature Top 10 (9:16) — affichée uniquement quand une position Top 10 est renseignée */}
              {hasTop10Position && (
                <div className="space-y-2 rounded-lg border border-primary/30 bg-muted/20 p-4">
                  <Label>Miniature Top 10 (9:16) *</Label>
                  <p className="text-xs text-muted-foreground">
                    Affichée dans la section Top 10. Format vertical 9:16 recommandé.
                  </p>
                  <div className="space-y-3">
                    {thumbnailTop10 ? (
                      <div className="relative inline-block w-32">
                        <img
                          src={thumbnailTop10}
                          alt="Miniature Top 10"
                          className="aspect-[9/16] w-full object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeThumbnailTop10}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors w-32 aspect-[9/16] flex flex-col items-center justify-center"
                        onClick={() => thumbnailTop10InputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">9:16</p>
                      </div>
                    )}
                    <input
                      ref={thumbnailTop10InputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailTop10Change}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Créateur */}
              <div className="space-y-2">
                <Label htmlFor="creator_id">Créateur *</Label>
                {loadingCreators ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Chargement des créateurs...</span>
                  </div>
                ) : (
                  <Select value={creatorId} onValueChange={setCreatorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un créateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id.toString()}>
                          {creator.username} ({creator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Section Catégorie (avec Top 10 dedans) — visible sur la page Publier une vidéo */}
              <div className="space-y-4 rounded-xl border-2 border-border bg-muted/20 p-5">
                <h3 className="text-base font-semibold text-foreground">Catégorie</h3>
                <p className="text-xs text-muted-foreground -mt-2">
                  Choisissez une catégorie ou une position dans le Top 10 (1-10). L’un des deux suffit pour publier.
                </p>
                {isShortMode ? (
                  <div className="flex h-10 items-center rounded-md border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
                    Nos Shorts (automatique)
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Catégories (plusieurs possibles)</Label>
                    <p className="text-xs text-muted-foreground">Cochez une ou plusieurs catégories.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedCategories.includes(cat.value)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories((prev) =>
                                checked ? [...prev, cat.value] : prev.filter((c) => c !== cat.value)
                              )
                            }}
                          />
                          <span className="text-sm">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                    <Label htmlFor="category">Catégorie principale (optionnel)</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Optionnel si catégories cochées ou Top 10" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label htmlFor="rank">Position dans le Top 10 (1-10)</Label>
                  <p className="text-xs text-muted-foreground">
                    Si vous mettez une position (1 à 10), la vidéo est dans le Top 10. Ça compte comme catégorie. Les deux miniatures (standard + 9:16) seront demandées.
                  </p>
                  <Input
                    id="rank"
                    type="number"
                    min={1}
                    max={10}
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="Ex: 1 — laisser vide si pas dans le Top 10"
                  />
                </div>
              </div>

              {/* Badge */}
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Select value={badge || "none"} onValueChange={(value) => setBadge(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun badge</SelectItem>
                    {BADGES.map((badgeOption) => (
                      <SelectItem key={badgeOption.value} value={badgeOption.value}>
                        {badgeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duration">Durée</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 24:15"
                  pattern="[0-9]{1,2}:[0-5][0-9]"
                />
                <p className="text-xs text-muted-foreground">
                  Format: MM:SS ou HH:MM:SS
                </p>
              </div>

              {/* Date de publication */}
              <div className="space-y-2">
                <Label htmlFor="published_at">Date de publication</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour publier immédiatement
                </p>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* En-tête (Hero) : afficher cette vidéo en hero sur l'accueil */}
              <div className="space-y-4 rounded-xl border-2 border-border bg-muted/20 p-5">
                <h3 className="text-base font-semibold text-foreground">En-tête (Hero) de l&apos;accueil</h3>
                <p className="text-xs text-muted-foreground -mt-2">
                  Choisissez si cette vidéo doit s&apos;afficher en haut de la page d&apos;accueil, avec sa miniature ou une bande annonce.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={isHero}
                    onCheckedChange={(checked) => {
                      setIsHero(!!checked)
                      if (!checked) {
                        setHeroDisplay('thumbnail')
                        setHeroTrailerStreamId("")
                        setHeroTrailerFile(null)
                        heroTrailerInputRef.current && (heroTrailerInputRef.current.value = "")
                      }
                    }}
                  />
                  <span className="text-sm font-medium">Afficher cette vidéo en hero (en-tête de l&apos;accueil)</span>
                </label>
                {isHero && (
                  <div className="space-y-3 pl-6 border-l-2 border-border">
                    <Label className="text-sm">Affichage dans le hero</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hero_display"
                          checked={heroDisplay === 'thumbnail'}
                          onChange={() => { setHeroDisplay('thumbnail'); setHeroTrailerStreamId(""); setHeroTrailerFile(null); heroTrailerInputRef.current && (heroTrailerInputRef.current.value = ""); }}
                          className="rounded-full"
                        />
                        <span className="text-sm">Miniature (image de la vidéo)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hero_display"
                          checked={heroDisplay === 'trailer'}
                          onChange={() => setHeroDisplay('trailer')}
                          className="rounded-full"
                        />
                        <span className="text-sm">Bande annonce (vidéo courte)</span>
                      </label>
                    </div>
                    {heroDisplay === 'trailer' && (
                      <div className="space-y-2">
                        <Label className="text-sm">Uploader la bande annonce (Cloudflare Stream)</Label>
                        <p className="text-xs text-muted-foreground">
                          Uploadez une courte vidéo qui s&apos;affichera à la place de la miniature dans l&apos;en-tête. Même logique que les vidéos.
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            ref={heroTrailerInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              if (!file.type.startsWith('video/')) {
                                toast.error('Sélectionnez un fichier vidéo')
                                return
                              }
                              setHeroTrailerFile(file)
                              setUploadingHeroTrailer(true)
                              setHeroTrailerProgress(0)
                              try {
                                const useTus = file.size > TUS_UPLOAD_SIZE_THRESHOLD
                                const result = useTus
                                  ? await uploadVideoToCloudflareTus(file, (up, total) => setHeroTrailerProgress(total > 0 ? Math.round((up / total) * 100) : 0))
                                  : await uploadVideoToCloudflare(file)
                                if (result.success && result.videoId) {
                                  setHeroTrailerStreamId(result.videoId)
                                  toast.success('Bande annonce uploadée')
                                } else toast.error(result.error || 'Erreur upload')
                              } catch (err) {
                                toast.error('Erreur lors de l\'upload')
                              } finally {
                                setUploadingHeroTrailer(false)
                                setHeroTrailerProgress(0)
                              }
                              e.target.value = ""
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => heroTrailerInputRef.current?.click()}
                            disabled={uploadingHeroTrailer}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {heroTrailerFile ? (heroTrailerStreamId ? `${heroTrailerFile.name} ✓` : 'Upload…') : 'Choisir une vidéo (bande annonce)'}
                          </Button>
                          {heroTrailerStreamId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => { setHeroTrailerStreamId(""); setHeroTrailerFile(null); heroTrailerInputRef.current && (heroTrailerInputRef.current.value = ""); }}
                            >
                              Retirer
                            </Button>
                          )}
                        </div>
                        {uploadingHeroTrailer && heroTrailerProgress > 0 && (
                          <Progress value={heroTrailerProgress} className="h-2 max-w-xs" />
                        )}
                        {heroTrailerStreamId && (
                          <p className="text-xs text-muted-foreground">Bande annonce enregistrée (ID Cloudflare). Elle sera utilisée dans le hero à la création.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4 relative z-10">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Créer la vidéo
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/videos')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

