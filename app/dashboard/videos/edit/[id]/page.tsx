"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Image as ImageIcon, Loader2, X, Check, Upload } from "lucide-react"
import { getVideoById, getCreators, updateVideo, uploadVideoToCloudflare, uploadVideoToCloudflareTus, TUS_UPLOAD_SIZE_THRESHOLD, type Creator, type CreateVideoData } from "@/lib/videos-client"
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

export default function EditVideoPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN
  const [user, setUser] = useState(getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
  const [loadingCreators, setLoadingCreators] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState<string>("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailTop10, setThumbnailTop10] = useState<string>("")
  const [thumbnailTop10File, setThumbnailTop10File] = useState<File | null>(null)
  const [creatorId, setCreatorId] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [badge, setBadge] = useState<string>("")
  const [rank, setRank] = useState<string>("")
  const [duration, setDuration] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [isHero, setIsHero] = useState(false)
  const [heroDisplay, setHeroDisplay] = useState<'thumbnail' | 'trailer'>('thumbnail')
  const [heroTrailerStreamId, setHeroTrailerStreamId] = useState<string>("")
  const [heroTrailerFile, setHeroTrailerFile] = useState<File | null>(null)
  const [uploadingHeroTrailer, setUploadingHeroTrailer] = useState(false)
  const [heroTrailerProgress, setHeroTrailerProgress] = useState(0)

  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const thumbnailTop10InputRef = useRef<HTMLInputElement>(null)
  const heroTrailerInputRef = useRef<HTMLInputElement>(null)

  const hasTop10Position = rank !== "" && parseInt(rank, 10) >= 1 && parseInt(rank, 10) <= 10

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    if (!currentUser || !canAccessAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }
    let cancelled = false
    const run = async () => {
      try {
        setLoadingCreators(true)
        const cr = await getCreators()
        if (!cancelled && cr.success && cr.creators) setCreators(cr.creators)
      } catch (e) {
        if (!cancelled) { console.error(e); toast.error('Erreur chargement créateurs') }
      } finally {
        if (!cancelled) setLoadingCreators(false)
      }
      if (isNaN(id)) {
        if (!cancelled) router.push('/dashboard/videos')
        return
      }
      try {
        const result = await getVideoById(id)
        if (cancelled) return
        if (result.success && result.video) {
          const v = result.video
          setTitle(v.title)
          setDescription(v.description ?? "")
          setThumbnail(v.thumbnail ?? "")
          setThumbnailTop10((v as { thumbnail_top10?: string }).thumbnail_top10 ?? "")
          setCreatorId(String(v.creator_id))
          setCategory(v.category)
          setSelectedCategories(
            Array.isArray((v as { categories?: string[] }).categories) && (v as { categories?: string[] }).categories!.length > 0
              ? (v as { categories?: string[] }).categories!
              : [v.category]
          )
          setBadge(v.badge ?? "")
          setRank(v.rank != null ? String(v.rank) : "")
          setDuration(v.duration ?? "")
          setPublishedAt(v.published_at ? new Date(v.published_at).toISOString().slice(0, 16) : "")
          setStatus((v.status === 'draft' || v.status === 'published' ? v.status : 'draft') as 'draft' | 'published')
          setIsHero(!!(v as { is_hero?: boolean }).is_hero)
          setHeroDisplay(((v as { hero_display?: 'thumbnail' | 'trailer' }).hero_display === 'trailer' ? 'trailer' : 'thumbnail'))
          setHeroTrailerStreamId((v as { hero_trailer_stream_id?: string | null }).hero_trailer_stream_id ?? "")
        } else {
          toast.error(result.error ?? 'Vidéo introuvable')
          router.push('/dashboard/videos')
          return
        }
      } catch (e) {
        if (cancelled) return
        console.error(e)
        toast.error('Erreur chargement vidéo')
        router.push('/dashboard/videos')
        return
      }
      setIsLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [router, id])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Sélectionnez une image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image max 5 Mo')
      return
    }
    setThumbnailFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setThumbnail(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnail("")
    setThumbnailFile(null)
    thumbnailInputRef.current && (thumbnailInputRef.current.value = "")
  }

  const handleThumbnailTop10Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Sélectionnez une image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image max 5 Mo')
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
    thumbnailTop10InputRef.current && (thumbnailTop10InputRef.current.value = "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Titre requis')
      return
    }
    if (!creatorId) {
      toast.error('Créateur requis')
      return
    }
    const rankNum = rank.trim() ? parseInt(rank, 10) : null
    const isInTop10 = rankNum != null && rankNum >= 1 && rankNum <= 10
    if (!isInTop10 && !category && selectedCategories.length === 0) {
      toast.error('Au moins une catégorie requise lorsque la vidéo n\'est pas dans le Top 10')
      return
    }
    if (rank.trim() && (isNaN(rankNum!) || rankNum! < 1 || rankNum! > 10)) {
      toast.error('Position Top 10 : entre 1 et 10')
      return
    }
    if (isInTop10 && (!thumbnail && !thumbnailFile)) {
      toast.error('Miniature standard requise pour une vidéo dans le Top 10')
      return
    }
    if (isInTop10 && (!thumbnailTop10 && !thumbnailTop10File)) {
      toast.error('Miniature Top 10 (9:16) requise pour la section Top 10')
      return
    }
    if (isHero && heroDisplay === 'trailer' && !heroTrailerStreamId.trim()) {
      toast.error('Uploadez la bande annonce ou choisissez "Miniature (image de la vidéo)"')
      return
    }
    setIsSubmitting(true)
    try {
      const categoriesList = selectedCategories.length ? selectedCategories : (category ? [category] : (isInTop10 ? ['latest'] : []))
      const categoryValue = (categoriesList[0] || category || (isInTop10 ? 'latest' : '')) as CreateVideoData['category']
      const payload: Partial<CreateVideoData> & { categories?: string[] } = {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail: thumbnail || undefined,
        thumbnail_top10: isInTop10 ? (thumbnailTop10 || undefined) : undefined,
        creator_id: parseInt(creatorId, 10),
        category: categoryValue,
        categories: categoriesList,
        badge: badge || undefined,
        is_top_10: isInTop10,
        rank: isInTop10 && rankNum ? rankNum : undefined,
        duration: duration.trim() || undefined,
        published_at: publishedAt || undefined,
        status,
        is_hero: isHero,
        hero_display: heroDisplay,
        hero_trailer_stream_id: isHero && heroDisplay === 'trailer' && heroTrailerStreamId ? heroTrailerStreamId : undefined,
      }
      const result = await updateVideo(id, payload)
      if (result.success) {
        toast.success('Vidéo mise à jour')
        router.push('/dashboard/videos')
      } else {
        toast.error(result.error ?? 'Erreur mise à jour')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur mise à jour')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isNaN(id)) {
    return (
      <DashboardLayout page="videos">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !canAccessAdmin(user)) return null

  return (
    <DashboardLayout page="videos">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modifier la vidéo</h1>
          <p className="text-muted-foreground mt-2">Modifiez les métadonnées. La vidéo Stream reste inchangée.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
            <CardDescription>Modifiez les champs puis enregistrez.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{hasTop10Position ? 'Miniature standard *' : 'Miniature'}</Label>
                <p className="text-xs text-muted-foreground">
                  {hasTop10Position ? 'Affichée partout sauf dans la section Top 10.' : 'PNG, JPG jusqu\'à 5MB'}
                </p>
                <div className="space-y-3">
                  {thumbnail ? (
                    <div className="relative inline-block max-w-md">
                      <img src={thumbnail} alt="Miniature standard" className="h-48 w-full object-cover rounded-lg border border-border" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeThumbnail}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary max-w-md"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Miniature standard</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5MB</p>
                    </div>
                  )}
                  <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </div>
              </div>
              {hasTop10Position && (
                <div className="space-y-2 rounded-lg border border-primary/30 bg-muted/20 p-4">
                  <Label>Miniature Top 10 (9:16) *</Label>
                  <p className="text-xs text-muted-foreground">Affichée dans la section Top 10. Format 9:16.</p>
                  <div className="space-y-3">
                    {thumbnailTop10 ? (
                      <div className="relative inline-block w-32">
                        <img src={thumbnailTop10} alt="Miniature Top 10" className="aspect-[9/16] w-full object-cover rounded-lg border border-border" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeThumbnailTop10}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary w-32 aspect-[9/16] flex flex-col items-center justify-center"
                        onClick={() => thumbnailTop10InputRef.current?.click()}
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">9:16</p>
                      </div>
                    )}
                    <input ref={thumbnailTop10InputRef} type="file" accept="image/*" onChange={handleThumbnailTop10Change} className="hidden" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Créateur *</Label>
                {loadingCreators ? (
                  <div className="flex gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm text-muted-foreground">Chargement…</span></div>
                ) : (
                  <Select value={creatorId} onValueChange={setCreatorId} required>
                    <SelectTrigger><SelectValue placeholder="Créateur" /></SelectTrigger>
                    <SelectContent>
                      {creators.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.username} ({c.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Catégories d'affichage (plusieurs possibles) {hasTop10Position ? '(optionnel si Top 10)' : '*'}</Label>
                <p className="text-xs text-muted-foreground">Cochez une ou plusieurs catégories pour que la vidéo apparaisse dans ces sections.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {CATEGORIES.map((c) => (
                    <label key={c.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(c.value)}
                        onCheckedChange={(checked) => {
                          setSelectedCategories((prev) =>
                            checked ? [...prev, c.value] : prev.filter((x) => x !== c.value)
                          )
                        }}
                      />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
                <Label className="pt-2 block">Catégorie principale (optionnel)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Optionnel si catégories cochées ou Top 10" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select value={badge || "none"} onValueChange={(v) => setBadge(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {BADGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Position dans le Top 10 (optionnel)</Label>
                <p className="text-xs text-muted-foreground">Position 1 à 10 dans le Top 10 de la catégorie. Laisser vide si pas dans le Top 10.</p>
                <Input type="number" min={1} max={10} value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Ex: 1 — vide si pas Top 10" />
              </div>
              <div className="space-y-2">
                <Label>Durée</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="MM:SS ou HH:MM:SS" />
              </div>
              <div className="space-y-2">
                <Label>Date de publication</Label>
                <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* En-tête (Hero) */}
              <div className="space-y-4 rounded-xl border-2 border-border bg-muted/20 p-5">
                <h3 className="text-base font-semibold text-foreground">En-tête (Hero) de l&apos;accueil</h3>
                <p className="text-xs text-muted-foreground -mt-2">
                  Afficher cette vidéo en haut de la page d&apos;accueil, avec sa miniature ou une bande annonce.
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
                  <span className="text-sm font-medium">Afficher cette vidéo en hero</span>
                </label>
                {isHero && (
                  <div className="space-y-3 pl-6 border-l-2 border-border">
                    <Label className="text-sm">Affichage dans le hero</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hero_display_edit"
                          checked={heroDisplay === 'thumbnail'}
                          onChange={() => { setHeroDisplay('thumbnail'); setHeroTrailerStreamId(""); setHeroTrailerFile(null); heroTrailerInputRef.current && (heroTrailerInputRef.current.value = ""); }}
                          className="rounded-full"
                        />
                        <span className="text-sm">Miniature (image de la vidéo)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hero_display_edit"
                          checked={heroDisplay === 'trailer'}
                          onChange={() => setHeroDisplay('trailer')}
                          className="rounded-full"
                        />
                        <span className="text-sm">Bande annonce (vidéo courte)</span>
                      </label>
                    </div>
                    {heroDisplay === 'trailer' && (
                      <div className="space-y-2">
                        <Label className="text-sm">Bande annonce (Cloudflare Stream)</Label>
                        <p className="text-xs text-muted-foreground">
                          Uploadez une courte vidéo pour l&apos;en-tête. Si déjà configurée, vous pouvez en mettre une nouvelle.
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
                            {heroTrailerFile ? (heroTrailerStreamId ? `${heroTrailerFile.name} ✓` : 'Upload…') : (heroTrailerStreamId ? 'Remplacer la bande annonce' : 'Choisir une vidéo (bande annonce)')}
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
                          <p className="text-xs text-muted-foreground">Bande annonce enregistrée. Enregistrez la vidéo pour appliquer.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement…</> : <><Check className="h-4 w-4 mr-2" />Enregistrer</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/videos')}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
