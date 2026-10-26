import { Navigation } from "@/components/navigation"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Check } from "lucide-react"

export default function ProfilePage() {
  const videos = [
    {
      id: "1",
      title: "Sessions Nocturnes - Derrière les Rythmes",
      creator: "DJ Nova",
      thumbnail: "/miniatures/SQUEEZIEPOSTERV59.jpg",
      views: "1,2M",
      duration: "24:15",
    },
    {
      id: "2",
      title: "État de Flow - Session Freestyle",
      creator: "DJ Nova",
      thumbnail: "/miniatures/hq720.jpg",
      views: "890K",
      duration: "18:42",
    },
    {
      id: "3",
      title: "La Création de 'Rêves Néon'",
      creator: "DJ Nova",
      thumbnail: "/miniatures/1200x680.jpg",
      views: "2,1M",
      duration: "32:18",
    },
    {
      id: "4",
      title: "Live à The Underground",
      creator: "DJ Nova",
      thumbnail: "/miniatures/WhatsApp-Image-2025-02-01-a-00.32.59_c5ec4ba4.jpg",
      views: "750K",
      duration: "45:30",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Profile Header */}
      <section className="relative h-[50vh] mt-16">
        <div className="absolute inset-0">
          <img src="/dj-stage-lights.jpg" alt="Bannière de profil" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      </section>

      {/* Profile Info */}
      <section className="container mx-auto px-4 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
          <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-background shadow-2xl">
            <img src="/dj-performer.png" alt="DJ Nova" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">DJ Nova</h1>
              <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </span>
            </div>
            <p className="text-muted-foreground text-lg mb-4">Producteur de Musique Électronique & DJ</p>
            <div className="flex items-center gap-8 text-sm mb-6">
              <div>
                <span className="font-bold text-2xl text-foreground">2,4M</span>
                <span className="text-muted-foreground ml-2">Abonnés</span>
              </div>
              <div>
                <span className="font-bold text-2xl text-foreground">48</span>
                <span className="text-muted-foreground ml-2">Vidéos</span>
              </div>
              <div>
                <span className="font-bold text-2xl text-foreground">120M</span>
                <span className="text-muted-foreground ml-2">Vues Totales</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-semibold px-8">
                <Play className="mr-2 h-5 w-5 fill-black" />
                S'abonner
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-foreground/20 hover:bg-foreground/10 bg-transparent"
              >
                Partager
              </Button>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mt-8 max-w-3xl">
          {
            "Repoussant les limites de la musique électronique. Des raves underground aux festivals sur scène principale. Vous trouverez ici des sets exclusifs, des sessions studio et du contenu en coulisses."
          }
        </p>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="bg-secondary border-b border-border rounded-none w-full justify-start h-auto p-0">
            <TabsTrigger
              value="videos"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3"
            >
              Vidéos
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3"
            >
              Playlists
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3"
            >
              À propos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="mt-8">
            <div className="text-center py-16">
              <p className="text-muted-foreground">Aucune playlist pour le moment</p>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-8">
            <div className="max-w-3xl">
              <h3 className="text-xl font-semibold mb-4">À propos de DJ Nova</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                DJ Nova est à l'avant-garde de la musique électronique depuis plus d'une décennie. Connu pour ses
                productions innovantes et ses performances live électrisantes, Nova a été tête d'affiche de grands
                festivals dans le monde entier et a collaboré avec des légendes de l'industrie.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Genre</h4>
                  <p className="text-muted-foreground">Électronique, House, Techno</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Localisation</h4>
                  <p className="text-muted-foreground">Los Angeles, CA</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Liens</h4>
                  <p className="text-primary">website.com | instagram.com/djnova</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
