"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth-client"
import { isAdministrator } from "@/lib/roles-client"
import { Video, ArrowRight } from "lucide-react"

export default function HeroPage() {
  const router = useRouter()

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    if (!isAdministrator(currentUser)) {
      router.push("/dashboard")
      return
    }
  }, [router])

  return (
    <DashboardLayout page="hero">
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">En-tête (Hero) de l&apos;accueil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Le hero s&apos;configure lors de la publication ou de l&apos;édition d&apos;une vidéo.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Comment configurer le hero ?</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Allez sur <strong className="text-foreground">Vidéos</strong> puis <strong className="text-foreground">Publier une vidéo</strong> ou <strong className="text-foreground">Modifier</strong> une vidéo existante.</li>
            <li>Dans la section <strong className="text-foreground">En-tête (Hero) de l&apos;accueil</strong>, cochez <strong className="text-foreground">Afficher cette vidéo en hero</strong>.</li>
            <li>Choisissez&nbsp;:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                <li><strong className="text-foreground">Miniature</strong> : la miniature de la vidéo s&apos;affiche dans l&apos;en-tête de l&apos;accueil.</li>
                <li><strong className="text-foreground">Bande annonce</strong> : uploadez une courte vidéo (bande annonce) qui s&apos;affichera à la place de la miniature dans l&apos;en-tête (même logique Cloudflare que les vidéos).</li>
              </ul>
            </li>
            <li>Enregistrez ou créez la vidéo. Le hero de la page d&apos;accueil web sera mis à jour.</li>
          </ol>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/dashboard/videos/publish">
                <Video className="mr-2 h-4 w-4" />
                Publier une vidéo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/videos">
                Voir les vidéos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
