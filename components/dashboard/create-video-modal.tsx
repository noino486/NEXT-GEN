"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Image as ImageIcon, Loader2, X, Check, Video, Upload } from "lucide-react"
import { createVideo, getCreators, uploadVideoToCloudflare, uploadVideoToCloudflareTus, TUS_UPLOAD_SIZE_THRESHOLD, type Creator, type CreateVideoData } from "@/lib/videos-client"
import { Checkbox } from "@/components/ui/checkbox"

/** Ordre et libellés des sections (alignés iOS / web). Une vidéo peut apparaître dans plusieurs catégories. */
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

interface CreateVideoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CreateVideoModal({ open, onOpenChange, onSuccess }: CreateVideoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
  const [loadingCreators, setLoadingCreators] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cloudflareStreamId, setCloudflareStreamId] = useState("")
  const [thumbnail, setThumbnail] = useState<string>("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [creatorId, setCreatorId] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [badge, setBadge] = useState<string>("")
  const [rank, setRank] = useState<string>("")
  const [thumbnailTop10, setThumbnailTop10] = useState<string>("")
  const [thumbnailTop10File, setThumbnailTop10File] = useState<File | null>(null)
  const [duration, setDuration] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const thumbnailTop10InputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const hasTop10Position = rank !== "" && parseInt(rank, 10) >= 1 && parseInt(rank, 10) <= 10

  useEffect(() => {
    if (open) {
      loadCreators()
      // Réinitialiser le formulaire quand le modal s'ouvre
      resetForm()
    }
  }, [open])

  const resetForm = () => {
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
    setSelectedCategories([])
    setBadge("")
    setRank("")
    setDuration("")
    setPublishedAt("")
    setStatus('draft')
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
    if (thumbnailTop10InputRef.current) thumbnailTop10InputRef.current.value = ""
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

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
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
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
    // Jusqu'à 10 Go : upload direct ou TUS resumable si > 200 Mo
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
        toast.error('La miniature standard est requise pour une vidéo dans le Top 10')
        return
      }
      if (!thumbnailTop10 && !thumbnailTop10File) {
        toast.error('La miniature Top 10 (9:16) est requise pour la section Top 10')
        return
      }
    }

    if (!cloudflareStreamId.trim()) {
      toast.error('L\'ID Cloudflare Stream est requis')
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
      }

      const result = await createVideo(videoData)

      if (result.success) {
        toast.success('Vidéo créée avec succès!')
        resetForm()
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-2xl md:max-w-3xl max-h-[90dvh] sm:max-h-[95vh] overflow-y-auto p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-bold">Publier une Vidéo</DialogTitle>
          <DialogDescription>
            Remplissez les informations nécessaires pour publier une nouvelle vidéo sur la plateforme KLYXY
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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

          {/* Miniature */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Miniature</Label>
            <div className="space-y-3">
              {thumbnail ? (
                <div className="relative inline-block w-full">
                  <img
                    src={thumbnail}
                    alt="Miniature"
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
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour ajouter une miniature
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
                <SelectContent className="z-[110]">
                  {creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id.toString()}>
                      {creator.username} ({creator.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Section Catégorie (avec Top 10 dedans) — catégorie OU position Top 10 suffit */}
          <div className="space-y-4 rounded-xl border-2 border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Catégorie</h3>
            <p className="text-xs text-muted-foreground -mt-2">
              Choisissez une catégorie ou une position dans le Top 10 (1-10). L’un des deux suffit pour publier.
            </p>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie d’affichage</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Optionnel si Top 10" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Ou cochez une ou plusieurs catégories pour que la vidéo apparaisse dans ces sections :</p>
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
            <div className="space-y-2 pt-2 border-t border-border">
              <Label htmlFor="rank">Position dans le Top 10 (1-10)</Label>
              <p className="text-xs text-muted-foreground">
                Si vous mettez une position (1 à 10), la vidéo est dans le Top 10. Les deux miniatures (standard + 9:16) seront demandées.
              </p>
              <Input
                id="rank"
                type="number"
                min={1}
                max={10}
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Ex: 1 — vide si pas dans le Top 10"
              />
            </div>
          </div>

          {/* Miniature Top 10 (9:16) — affichée quand position Top 10 renseignée */}
          {hasTop10Position && (
            <div className="space-y-2 rounded-lg border border-primary/30 bg-muted/20 p-4">
              <Label>Miniature Top 10 (9:16) *</Label>
              <p className="text-xs text-muted-foreground">Affichée dans la section Top 10. Format 9:16.</p>
              <div className="space-y-2">
                {thumbnailTop10 ? (
                  <div className="relative inline-block w-28">
                    <img src={thumbnailTop10} alt="Miniature Top 10" className="aspect-[9/16] w-full object-cover rounded-lg border border-border" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={removeThumbnailTop10}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary w-28 aspect-[9/16] flex flex-col items-center justify-center"
                    onClick={() => thumbnailTop10InputRef.current?.click()}
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">9:16</span>
                  </div>
                )}
                <input ref={thumbnailTop10InputRef} type="file" accept="image/*" onChange={handleThumbnailTop10Change} className="hidden" />
              </div>
            </div>
          )}

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Select value={badge || "none"} onValueChange={(value) => setBadge(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun badge" />
              </SelectTrigger>
              <SelectContent className="z-[110]">
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
              <SelectContent className="z-[110]">
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
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
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

