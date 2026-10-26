/**
 * Visuels de repli (assets du dossier /public) pour les sections du design qui n'ont pas
 * encore de données réelles (lives, évènements, concours, reprise de lecture).
 */
import { DEMO_VIDEOS, IS_DEMO } from "./demo-data"

const LOCAL_THUMBS = [
  "/miniatures/miniatureRD.jpeg",
  "/miniatures/miniatureRD2.jpeg",
  "/miniatures/miniatureRD3.jpeg",
  "/miniatures/miniatureRD4.jpeg",
  "/miniatures/miniatureRD5.jpeg",
  "/miniatures/miniatureRD6.jpeg",
  "/miniatures/miniatureRD7.jpeg",
  "/miniatures/1200x680.jpg",
]

export const DEMO_THUMBS = IS_DEMO
  ? [...DEMO_VIDEOS.map((v) => v.thumbnail as string), ...LOCAL_THUMBS]
  : LOCAL_THUMBS

export const demoThumb = (index: number) => DEMO_THUMBS[index % DEMO_THUMBS.length]
