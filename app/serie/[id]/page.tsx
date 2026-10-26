"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { SignupModal } from "@/components/signup-modal"
import { Button } from "@/components/ui/button"
import { Play, Info, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

export default function SeriePage() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)

  const seasons = [
    {
      seasonNumber: 1,
      episodes: [
        { 
          id: "s1e1", 
          title: "Première Nuit - Les Origines", 
          thumbnail: "/miniatures/miniatureRD.jpeg", 
          duration: "24:15",
          description: "Découvrez les débuts de cette série captivante. Nous suivons l'artiste dans sa quête créative initiale, explorant les influences et les premiers pas dans l'univers de la musique."
        },
        { 
          id: "s1e2", 
          title: "Les Premiers Pas en Studio", 
          thumbnail: "/miniatures/miniatureRD2.jpeg", 
          duration: "22:30",
          description: "Plongez dans l'univers du studio d'enregistrement. Cet épisode vous emmène derrière les portes d'un vrai studio professionnel et révèle les secrets de la production."
        },
        { 
          id: "s1e3", 
          title: "La Première Performance Live", 
          thumbnail: "/miniatures/miniatureRD3.jpeg", 
          duration: "25:45",
          description: "Suivez l'artiste lors de sa première grande performance en direct. Un moment charnière dans sa carrière avec toutes les émotions et les défis d'une vraie scène."
        },
        { 
          id: "s1e4", 
          title: "Collaborations et Rencontres", 
          thumbnail: "/miniatures/miniatureRD4.jpeg", 
          duration: "23:20",
          description: "Découvrez les rencontres inspirantes et les collaborations qui ont façonné l'artiste. Des échanges créatifs qui ont marqué son parcours musical."
        },
      ]
    },
    {
      seasonNumber: 2,
      episodes: [
        { 
          id: "s2e1", 
          title: "Nouvelle Direction Musicale", 
          thumbnail: "/miniatures/miniatureRD5.jpeg", 
          duration: "26:10",
          description: "L'artiste explore de nouveaux horizons musicaux. Cet épisode suit l'évolution créative et l'expérimentation de nouveaux styles et techniques."
        },
        { 
          id: "s2e2", 
          title: "Le Processus de Création", 
          thumbnail: "/miniatures/miniatureRD6.jpeg", 
          duration: "24:50",
          description: "Un regard approfondi sur le processus créatif, de l'idée initiale à la réalisation finale. Les méthodes de travail et l'inspiration de l'artiste."
        },
        { 
          id: "s2e3", 
          title: "L'Apogée Artistique", 
          thumbnail: "/miniatures/miniatureRD7.jpeg", 
          duration: "27:30",
          description: "L'épisode final de la saison 2 explore les sommets atteints et les perspectives d'avenir. Un moment de réflexion sur le parcours et les accomplissements."
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-6 mt-16">
        {/* Main Serie Section */}
        <div className="max-w-full">
          {/* Serie Hero */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <img src="/miniatures/SQUEEZIEPOSTERV59.jpg" alt="Série" className="w-full h-full object-cover" />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Content Overlay - Bottom Left */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12 z-20">
              <div className="max-w-2xl">
                {/* Title */}
                <h1 className="text-xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-6 drop-shadow-2xl leading-tight">
                  Sessions Nocturnes - La Série
                </h1>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 md:gap-4 mb-4">
                  <Button
                    onClick={() => setIsSignupModalOpen(true)}
                    size="lg"
                    className="bg-white hover:bg-white/90 text-black font-bold px-5 py-3 md:px-8 md:py-6 text-sm md:text-lg hover:scale-105 transition-all duration-300"
                  >
                    <Play className="mr-2 h-4 w-4 md:h-6 md:w-6 fill-black" />
                    Regarder
                  </Button>
                  <Button
                    onClick={() => setShowDescription(!showDescription)}
                    size="lg"
                    variant="outline"
                    className="border-foreground/30 hover:bg-foreground/10 bg-foreground/5 backdrop-blur-sm px-5 py-3 md:px-8 md:py-6 text-sm md:text-lg hover:scale-105 transition-all duration-300 text-white border-white/30"
                  >
                    <Info className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Plus d'infos
                  </Button>
                </div>

                {/* Episodes Toggle Button */}
                <Button
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm md:text-base flex items-center gap-2"
                >
                  {showEpisodes ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Masquer les épisodes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      {seasons.length} saison{seasons.length > 1 ? 's' : ''} • {seasons.reduce((acc, season) => acc + season.episodes.length, 0)} épisode{seasons.reduce((acc, season) => acc + season.episodes.length, 0) > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          <div 
            className={`mb-6 transition-all duration-700 ease-in-out overflow-hidden ${
              showEpisodes 
                ? 'max-h-[2000px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            {seasons.map((season) => (
              <div key={season.seasonNumber} className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Saison {season.seasonNumber}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {season.episodes.map((episode) => (
                    <Link 
                      key={episode.id}
                      href={`/watch/${episode.id}`}
                      className="group flex gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-card">
                        <img 
                          src={episode.thumbnail} 
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-4 w-4 fill-black text-black ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">
                          {episode.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors line-clamp-2">
                          {episode.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {episode.duration}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Video Info */}
          <div 
            className={`mb-6 transition-all duration-700 ease-in-out overflow-hidden ${
              showDescription 
                ? 'max-h-[500px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-secondary rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-muted-foreground">Il y a 3 jours</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {
                  "Découvrez les coulisses alors que nous décomposons le processus de production de mon dernier morceau. Dans cette session, je vous guide à travers mon processus créatif, des idées initiales au mixage final. Apprenez les techniques, le matériel et l'inspiration qui ont permis de créer ce morceau."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <SignupModal open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen} />
    </div>
  )
}

