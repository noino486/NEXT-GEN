"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { getUser } from "@/lib/auth-client"
import { canAccessAdmin } from "@/lib/roles-client"
import { getAllCategories, updateCategoryThumbnails, type Category } from "@/lib/categories-client"
import { toast } from "sonner"
import { Upload, X, Save, Loader2, FolderOpen, Search } from "lucide-react"

interface EditingState {
  categoryId: number
  thumbnails: { thumbnail_url: string; display_order: number }[]
}

export default function CategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingStates, setEditingStates] = useState<Map<number, EditingState>>(new Map())
  const [savingCategoryId, setSavingCategoryId] = useState<number | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser) {
      router.push('/login')
      return
    }

    if (!canAccessAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }

    loadCategories()
  }, [router])

  // Filtrer les catégories selon la recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [searchTerm, categories])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const result = await getAllCategories()
      if (result.success && result.categories) {
        setCategories(result.categories)
        setFilteredCategories(result.categories)
      } else {
        toast.error(result.error || 'Erreur lors du chargement des catégories')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeEditing = (category: Category) => {
    const existingThumbnails = category.thumbnails || []
    const thumbnailsArray: { thumbnail_url: string; display_order: number }[] = []
    
    for (let i = 1; i <= 10; i++) {
      const existing = existingThumbnails.find(t => t.display_order === i)
      thumbnailsArray.push({
        thumbnail_url: existing?.thumbnail_url || '',
        display_order: i
      })
    }
    
    setEditingStates(prev => {
      const newMap = new Map(prev)
      newMap.set(category.id, {
        categoryId: category.id,
        thumbnails: thumbnailsArray
      })
      return newMap
    })
  }

  const cancelEditing = (categoryId: number) => {
    setEditingStates(prev => {
      const newMap = new Map(prev)
      newMap.delete(categoryId)
      return newMap
    })
  }

  const handleThumbnailChange = (categoryId: number, index: number, file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setEditingStates(prev => {
        const newMap = new Map(prev)
        const state = newMap.get(categoryId)
        if (state) {
          const newThumbnails = [...state.thumbnails]
          newThumbnails[index] = {
            ...newThumbnails[index],
            thumbnail_url: base64String
          }
          newMap.set(categoryId, {
            ...state,
            thumbnails: newThumbnails
          })
        }
        return newMap
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveThumbnail = (categoryId: number, index: number) => {
    setEditingStates(prev => {
      const newMap = new Map(prev)
      const state = newMap.get(categoryId)
      if (state) {
        const newThumbnails = [...state.thumbnails]
        newThumbnails[index] = {
          ...newThumbnails[index],
          thumbnail_url: ''
        }
        newMap.set(categoryId, {
          ...state,
          thumbnails: newThumbnails
        })
      }
      return newMap
    })
  }

  const handleSave = async (categoryId: number) => {
    const editingState = editingStates.get(categoryId)
    if (!editingState) return

    // Filtrer les miniatures vides
    const validThumbnails = editingState.thumbnails.filter(t => t.thumbnail_url.trim() !== '')

    setSavingCategoryId(categoryId)
    try {
      const result = await updateCategoryThumbnails(categoryId, validThumbnails)
      if (result.success) {
        toast.success('Miniatures mises à jour avec succès')
        cancelEditing(categoryId)
        loadCategories()
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSavingCategoryId(null)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout page="categories">
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
    <DashboardLayout page="categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des Catégories</h1>
          <p className="text-muted-foreground">
            Gérez les miniatures des catégories affichées sur la page Découvrir (format 9:16, 10 max par catégorie)
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              <h2 className="text-2xl font-semibold">Catégories</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Miniatures</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const isEditing = editingStates.has(category.id)
                    const editingState = editingStates.get(category.id)
                    const isSaving = savingCategoryId === category.id

                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-mono text-sm">{category.id}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{category.slug}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-5 gap-2">
                                {editingState?.thumbnails.map((thumb, index) => (
                                  <div key={index} className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      {index + 1}
                                    </Label>
                                    <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
                                      {thumb.thumbnail_url ? (
                                        <>
                                          <img
                                            src={thumb.thumbnail_url}
                                            alt={`Miniature ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                          <button
                                            onClick={() => handleRemoveThumbnail(category.id, index)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                            type="button"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </>
                                      ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                                          <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                                          <span className="text-xs text-muted-foreground text-center px-1">
                                            +
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0]
                                              if (file) handleThumbnailChange(category.id, index, file)
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelEditing(category.id)}
                                  disabled={isSaving}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(category.id)}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Enregistrement...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Enregistrer
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {category.thumbnails.slice(0, 5).map((thumb, index) => (
                                  <div
                                    key={thumb.id || index}
                                    className="aspect-[9/16] w-12 rounded border-2 border-background overflow-hidden bg-muted"
                                  >
                                    {thumb.thumbnail_url ? (
                                      <img
                                        src={thumb.thumbnail_url}
                                        alt={`Miniature ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                        {index + 1}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {category.thumbnails.length === 0 && (
                                  <div className="text-sm text-muted-foreground">Aucune miniature</div>
                                )}
                                {category.thumbnails.length > 5 && (
                                  <div className="w-12 h-full flex items-center justify-center text-xs text-muted-foreground bg-muted rounded border-2 border-background">
                                    +{category.thumbnails.length - 5}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({category.thumbnails.length}/10)
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? null : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => initializeEditing(category)}
                            >
                              Modifier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && (
            <div className="text-sm text-muted-foreground">
              Total: {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
