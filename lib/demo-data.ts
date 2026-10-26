// Données de démo (miniatures YouTubeurs) : uniquement pour illustrer le front sans backend.
// Activées avec NEXT_PUBLIC_DEMO_MODE=1 (voir lib/videos-client.ts et lib/hero-trailers-client.ts).
import type { Video } from './videos-client'

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1'

export const DEMO_VIDEOS = [
  {
    "id": 1,
    "title": "QUI TROUVERA LE MEILLEUR CONTAINER ? (ft Freddy Gladieux, Mastu, Theodort, Billy)",
    "description": "Squeezie — QUI TROUVERA LE MEILLEUR CONTAINER ? (ft Freddy Gladieux, Mastu, Theodort, Billy)",
    "thumbnail": "/miniatures/yt/bXwWvtrHr3M.jpg",
    "thumbnail_top10": "/miniatures/yt/bXwWvtrHr3M.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "featured",
      "selection"
    ],
    "is_top_10": true,
    "rank": 1,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-10-01T12:00:00.000Z",
    "updated_at": "2026-10-01T12:00:00.000Z"
  },
  {
    "id": 2,
    "title": "24H POUR BRAQUER UNE BANQUE (Ft Djilsi, Billy, Byilhan, Cocotte et Nico)",
    "description": "Inoxtag — 24H POUR BRAQUER UNE BANQUE (Ft Djilsi, Billy, Byilhan, Cocotte et Nico)",
    "thumbnail": "/miniatures/yt/TkbNbL_0HCI.jpg",
    "thumbnail_top10": "/miniatures/yt/TkbNbL_0HCI.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": true,
    "rank": 2,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-09-30T12:00:00.000Z",
    "updated_at": "2026-09-30T12:00:00.000Z"
  },
  {
    "id": 3,
    "title": "DEVINE QUI TU ES #4 ft. CYPRIEN",
    "description": "Amixem — DEVINE QUI TU ES #4 ft. CYPRIEN",
    "thumbnail": "/miniatures/yt/_hzgpE0NXR8.jpg",
    "thumbnail_top10": "/miniatures/yt/_hzgpE0NXR8.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": true,
    "rank": 3,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-09-29T12:00:00.000Z",
    "updated_at": "2026-09-29T12:00:00.000Z"
  },
  {
    "id": 4,
    "title": "Pourquoi je ne vous ai jamais parlé de mon frère",
    "description": "Cyprien — Pourquoi je ne vous ai jamais parlé de mon frère",
    "thumbnail": "/miniatures/yt/VzQMdaPS1dI.jpg",
    "thumbnail_top10": "/miniatures/yt/VzQMdaPS1dI.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences",
      "shorts"
    ],
    "is_top_10": true,
    "rank": 4,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-09-28T12:00:00.000Z",
    "updated_at": "2026-09-28T12:00:00.000Z"
  },
  {
    "id": 5,
    "title": "J’AFFRONTE DES ENFANTS CHAMPIONS ! (et j’essaye de les battre) #2",
    "description": "Michou — J’AFFRONTE DES ENFANTS CHAMPIONS ! (et j’essaye de les battre) #2",
    "thumbnail": "/miniatures/yt/x9x_3pgDdW8.jpg",
    "thumbnail_top10": "/miniatures/yt/x9x_3pgDdW8.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": true,
    "rank": 5,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-09-27T12:00:00.000Z",
    "updated_at": "2026-09-27T12:00:00.000Z"
  },
  {
    "id": 6,
    "title": "La naissance d'Halloween en France",
    "description": "Norman — La naissance d'Halloween en France",
    "thumbnail": "/miniatures/yt/ESnwlL4OnYc.jpg",
    "thumbnail_top10": "/miniatures/yt/ESnwlL4OnYc.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": true,
    "rank": 6,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-09-26T12:00:00.000Z",
    "updated_at": "2026-09-26T12:00:00.000Z"
  },
  {
    "id": 7,
    "title": "UNE NUIT AVEC UN VIDEUR DE BOÎTE !!",
    "description": "Tibo InShape — UNE NUIT AVEC UN VIDEUR DE BOÎTE !!",
    "thumbnail": "/miniatures/yt/krm0wyAJ7Ao.jpg",
    "thumbnail_top10": "/miniatures/yt/krm0wyAJ7Ao.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": true,
    "rank": 7,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-09-25T12:00:00.000Z",
    "updated_at": "2026-09-25T12:00:00.000Z"
  },
  {
    "id": 8,
    "title": "Voici 3 mondes, lequel tu choisis ?",
    "description": "Joyca — Voici 3 mondes, lequel tu choisis ?",
    "thumbnail": "/miniatures/yt/H-yZMZ9AA_k.jpg",
    "thumbnail_top10": "/miniatures/yt/H-yZMZ9AA_k.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside",
      "featured"
    ],
    "is_top_10": true,
    "rank": 8,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-09-24T12:00:00.000Z",
    "updated_at": "2026-09-24T12:00:00.000Z"
  },
  {
    "id": 9,
    "title": "pour mes vlogos, la rediffusion de bercy :)",
    "description": "Lena Situations — pour mes vlogos, la rediffusion de bercy :)",
    "thumbnail": "/miniatures/yt/n3X03776DxU.jpg",
    "thumbnail_top10": "/miniatures/yt/n3X03776DxU.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": true,
    "rank": 9,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-09-23T12:00:00.000Z",
    "updated_at": "2026-09-23T12:00:00.000Z"
  },
  {
    "id": 10,
    "title": "nos PIRES anecdotes",
    "description": "Gotaga — nos PIRES anecdotes",
    "thumbnail": "/miniatures/yt/2uxswerQekA.jpg",
    "thumbnail_top10": "/miniatures/yt/2uxswerQekA.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": true,
    "rank": 10,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-09-22T12:00:00.000Z",
    "updated_at": "2026-09-22T12:00:00.000Z"
  },
  {
    "id": 11,
    "title": "QUI SUBIRA LA PIRE ÉPREUVE (ft Maxime Biaggi, Gotaga & Billy)",
    "description": "Squeezie — QUI SUBIRA LA PIRE ÉPREUVE (ft Maxime Biaggi, Gotaga & Billy)",
    "thumbnail": "/miniatures/yt/lbLj5Yb6SAE.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-09-21T12:00:00.000Z",
    "updated_at": "2026-09-21T12:00:00.000Z"
  },
  {
    "id": 12,
    "title": "10 jours pour traverser les Etats-Unis sur la route 66 ! (Ft.GMK)",
    "description": "Inoxtag — 10 jours pour traverser les Etats-Unis sur la route 66 ! (Ft.GMK)",
    "thumbnail": "/miniatures/yt/doN-J9IewbA.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-09-20T12:00:00.000Z",
    "updated_at": "2026-09-20T12:00:00.000Z"
  },
  {
    "id": 13,
    "title": "ON TESTE DES EXPÉRIENCES TIKTOK EXTRÊMES #2",
    "description": "Amixem — ON TESTE DES EXPÉRIENCES TIKTOK EXTRÊMES #2",
    "thumbnail": "/miniatures/yt/FRAS6qOT7No.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-09-19T12:00:00.000Z",
    "updated_at": "2026-09-19T12:00:00.000Z"
  },
  {
    "id": 14,
    "title": "Les pubs VS La vie 2026",
    "description": "Cyprien — Les pubs VS La vie 2026",
    "thumbnail": "/miniatures/yt/lwjYrjSJMcA.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-09-18T12:00:00.000Z",
    "updated_at": "2026-09-18T12:00:00.000Z"
  },
  {
    "id": 15,
    "title": "VIVRE 1 MOIS À NEW YORK ! (pendant la coupe du monde)",
    "description": "Michou — VIVRE 1 MOIS À NEW YORK ! (pendant la coupe du monde)",
    "thumbnail": "/miniatures/yt/v3viqdoFbnY.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite",
      "featured"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-09-17T12:00:00.000Z",
    "updated_at": "2026-09-17T12:00:00.000Z"
  },
  {
    "id": 16,
    "title": "Si internet disparaissait...",
    "description": "Norman — Si internet disparaissait...",
    "thumbnail": "/miniatures/yt/j20juj_cEWA.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-09-16T12:00:00.000Z",
    "updated_at": "2026-09-16T12:00:00.000Z"
  },
  {
    "id": 17,
    "title": "24H AUX URGENCES DES ANIMAUX !!",
    "description": "Tibo InShape — 24H AUX URGENCES DES ANIMAUX !!",
    "thumbnail": "/miniatures/yt/wuZ9quCGxNw.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-09-15T12:00:00.000Z",
    "updated_at": "2026-09-15T12:00:00.000Z"
  },
  {
    "id": 18,
    "title": "24H DANS LE NOIR TOTAL ! (Cette maison n'a aucun sens)",
    "description": "Joyca — 24H DANS LE NOIR TOTAL ! (Cette maison n'a aucun sens)",
    "thumbnail": "/miniatures/yt/tE9MMqYu2Bk.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-09-14T12:00:00.000Z",
    "updated_at": "2026-09-14T12:00:00.000Z"
  },
  {
    "id": 19,
    "title": "CECI EST MON AU REVOIR.",
    "description": "Lena Situations — CECI EST MON AU REVOIR.",
    "thumbnail": "/miniatures/yt/H2ATKdzGEgI.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-09-13T12:00:00.000Z",
    "updated_at": "2026-09-13T12:00:00.000Z"
  },
  {
    "id": 20,
    "title": "j'aime quand ça vibre...",
    "description": "Gotaga — j'aime quand ça vibre...",
    "thumbnail": "/miniatures/yt/htfEZS2fV0g.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-09-12T12:00:00.000Z",
    "updated_at": "2026-09-12T12:00:00.000Z"
  },
  {
    "id": 21,
    "title": "QUI AURA L'OBJET PIÉGÉ ? (ft Joyca, Maxime Biaggi, Djilsi)",
    "description": "Squeezie — QUI AURA L'OBJET PIÉGÉ ? (ft Joyca, Maxime Biaggi, Djilsi)",
    "thumbnail": "/miniatures/yt/vRAPfDSmBGM.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-09-11T12:00:00.000Z",
    "updated_at": "2026-09-11T12:00:00.000Z"
  },
  {
    "id": 22,
    "title": "7 jours pour survivre en Jungle ! (avec la Légion étrangère)",
    "description": "Inoxtag — 7 jours pour survivre en Jungle ! (avec la Légion étrangère)",
    "thumbnail": "/miniatures/yt/U_nhj_Xog7c.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog",
      "featured",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-09-10T12:00:00.000Z",
    "updated_at": "2026-09-10T12:00:00.000Z"
  },
  {
    "id": 23,
    "title": "ESSAYEZ DE NE PAS RÉAGIR AU CONTENU DE LA BOITE #3",
    "description": "Amixem — ESSAYEZ DE NE PAS RÉAGIR AU CONTENU DE LA BOITE #3",
    "thumbnail": "/miniatures/yt/JS1RiLRZeYI.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-09-09T12:00:00.000Z",
    "updated_at": "2026-09-09T12:00:00.000Z"
  },
  {
    "id": 24,
    "title": "Si ChatGPT était un employé (court métrage)",
    "description": "Cyprien — Si ChatGPT était un employé (court métrage)",
    "thumbnail": "/miniatures/yt/KQGJ7tsII5E.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-09-08T12:00:00.000Z",
    "updated_at": "2026-09-08T12:00:00.000Z"
  },
  {
    "id": 25,
    "title": "4 JOURS POUR SURVIVRE ET CONSTRUIRE UNE CABANE DANS LA SAVANE ! (avec mes frères)",
    "description": "Michou — 4 JOURS POUR SURVIVRE ET CONSTRUIRE UNE CABANE DANS LA SAVANE ! (avec mes frères)",
    "thumbnail": "/miniatures/yt/01L8nwutYVc.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-09-07T12:00:00.000Z",
    "updated_at": "2026-09-07T12:00:00.000Z"
  },
  {
    "id": 26,
    "title": "NORMAN - DON'T SHOOT (ARC RAIDERS)",
    "description": "Norman — NORMAN - DON'T SHOOT (ARC RAIDERS)",
    "thumbnail": "/miniatures/yt/qrLLQ3_cn4Q.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-09-06T12:00:00.000Z",
    "updated_at": "2026-09-06T12:00:00.000Z"
  },
  {
    "id": 27,
    "title": "24H À LA COUPE DU MONDE DES JEUX VIDÉOS !!",
    "description": "Tibo InShape — 24H À LA COUPE DU MONDE DES JEUX VIDÉOS !!",
    "thumbnail": "/miniatures/yt/ueH1KDLAJPg.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-09-05T12:00:00.000Z",
    "updated_at": "2026-09-05T12:00:00.000Z"
  },
  {
    "id": 28,
    "title": "48H POUR REMPLIR UNE CAMIONNETTE D'OBJETS ABANDONNÉS (Avec Maxime Biaggi)",
    "description": "Joyca — 48H POUR REMPLIR UNE CAMIONNETTE D'OBJETS ABANDONNÉS (Avec Maxime Biaggi)",
    "thumbnail": "/miniatures/yt/HpX5R9rq-1M.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-09-04T12:00:00.000Z",
    "updated_at": "2026-09-04T12:00:00.000Z"
  },
  {
    "id": 29,
    "title": "BON FAUT QU'ON SE PRÉPARE",
    "description": "Lena Situations — BON FAUT QU'ON SE PRÉPARE",
    "thumbnail": "/miniatures/yt/KgmXdltUf3o.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife",
      "featured"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-09-03T12:00:00.000Z",
    "updated_at": "2026-09-03T12:00:00.000Z"
  },
  {
    "id": 30,
    "title": "c'était pas une bonne idée...",
    "description": "Gotaga — c'était pas une bonne idée...",
    "thumbnail": "/miniatures/yt/fUQru0SzyMY.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-09-02T12:00:00.000Z",
    "updated_at": "2026-09-02T12:00:00.000Z"
  },
  {
    "id": 31,
    "title": "FKH - Cyberkinetic (ft Freddy Gladieux, Squeezie, Myd, Pandrezz)",
    "description": "Squeezie — FKH - Cyberkinetic (ft Freddy Gladieux, Squeezie, Myd, Pandrezz)",
    "thumbnail": "/miniatures/yt/mlhGhLjDfUU.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z"
  },
  {
    "id": 32,
    "title": "10 jours pour traverser l’océan Atlantique ! (ft. Guirec Soudée)",
    "description": "Inoxtag — 10 jours pour traverser l’océan Atlantique ! (ft. Guirec Soudée)",
    "thumbnail": "/miniatures/yt/CVMeLYKPVfE.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-08-31T12:00:00.000Z",
    "updated_at": "2026-08-31T12:00:00.000Z"
  },
  {
    "id": 33,
    "title": "ON VIT 24H DANS UN PHARE EN PLEINE MER !",
    "description": "Amixem — ON VIT 24H DANS UN PHARE EN PLEINE MER !",
    "thumbnail": "/miniatures/yt/s5ssqJLDdxA.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-08-30T12:00:00.000Z",
    "updated_at": "2026-08-30T12:00:00.000Z"
  },
  {
    "id": 34,
    "title": "La vie d'une TREND",
    "description": "Cyprien — La vie d'une TREND",
    "thumbnail": "/miniatures/yt/2LzcMQH-LPg.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-08-29T12:00:00.000Z",
    "updated_at": "2026-08-29T12:00:00.000Z"
  },
  {
    "id": 35,
    "title": "PILE OU FACE de L’EXTRÊME à LAS VEGAS ! (c’est very bad trip irl mdrrr)",
    "description": "Michou — PILE OU FACE de L’EXTRÊME à LAS VEGAS ! (c’est very bad trip irl mdrrr)",
    "thumbnail": "/miniatures/yt/7qz6Yn3k5oc.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-08-28T12:00:00.000Z",
    "updated_at": "2026-08-28T12:00:00.000Z"
  },
  {
    "id": 36,
    "title": "LA MENACE NUCLÉAIRE",
    "description": "Norman — LA MENACE NUCLÉAIRE",
    "thumbnail": "/miniatures/yt/PULrYOQyRbQ.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "featured",
      "selection"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-08-27T12:00:00.000Z",
    "updated_at": "2026-08-27T12:00:00.000Z"
  },
  {
    "id": 37,
    "title": "⁠24H EN ÉCOLE DE POLICE !!",
    "description": "Tibo InShape — ⁠24H EN ÉCOLE DE POLICE !!",
    "thumbnail": "/miniatures/yt/01YVqU5oF-k.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-08-26T12:00:00.000Z",
    "updated_at": "2026-08-26T12:00:00.000Z"
  },
  {
    "id": 38,
    "title": "72H SANS POUVOIR DIRE ”NON” (En Martinique 🇲🇶)",
    "description": "Joyca — 72H SANS POUVOIR DIRE ”NON” (En Martinique 🇲🇶)",
    "thumbnail": "/miniatures/yt/mq01XDS2yUU.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-08-25T12:00:00.000Z",
    "updated_at": "2026-08-25T12:00:00.000Z"
  },
  {
    "id": 39,
    "title": "ON L'A RENCONTRÉ !!!",
    "description": "Lena Situations — ON L'A RENCONTRÉ !!!",
    "thumbnail": "/miniatures/yt/5AtdCiqYlZ8.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-08-24T12:00:00.000Z",
    "updated_at": "2026-08-24T12:00:00.000Z"
  },
  {
    "id": 40,
    "title": "squeezie me MOG...",
    "description": "Gotaga — squeezie me MOG...",
    "thumbnail": "/miniatures/yt/DiQhipeBR3k.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-08-23T12:00:00.000Z",
    "updated_at": "2026-08-23T12:00:00.000Z"
  },
  {
    "id": 41,
    "title": "GGB - All My Life (ft Adèle Castillon, Lena, Jain, Eva)",
    "description": "Squeezie — GGB - All My Life (ft Adèle Castillon, Lena, Jain, Eva)",
    "thumbnail": "/miniatures/yt/3P9hJnlPo4w.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-08-22T12:00:00.000Z",
    "updated_at": "2026-08-22T12:00:00.000Z"
  },
  {
    "id": 42,
    "title": "Qui sera le dernier survivant de La Secte (ft Michou, Byilhan et Anyme)",
    "description": "Inoxtag — Qui sera le dernier survivant de La Secte (ft Michou, Byilhan et Anyme)",
    "thumbnail": "/miniatures/yt/4FoylWoF1ns.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-08-21T12:00:00.000Z",
    "updated_at": "2026-08-21T12:00:00.000Z"
  },
  {
    "id": 43,
    "title": "LES PIRES BOULETTES AU TRAVAIL ! #4 (ça a mal tourné...)",
    "description": "Amixem — LES PIRES BOULETTES AU TRAVAIL ! #4 (ça a mal tourné...)",
    "thumbnail": "/miniatures/yt/eIp9I2RwmK0.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog",
      "featured"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-08-20T12:00:00.000Z",
    "updated_at": "2026-08-20T12:00:00.000Z"
  },
  {
    "id": 44,
    "title": "Je vous dis toute la vérité (ma plus longue FAQ)",
    "description": "Cyprien — Je vous dis toute la vérité (ma plus longue FAQ)",
    "thumbnail": "/miniatures/yt/ocPKgyakEiU.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-08-19T12:00:00.000Z",
    "updated_at": "2026-08-19T12:00:00.000Z"
  },
  {
    "id": 45,
    "title": "CETTE VIDÉO VA VOUS FAIRE SOURIRE ! (ou pleurer)",
    "description": "Michou — CETTE VIDÉO VA VOUS FAIRE SOURIRE ! (ou pleurer)",
    "thumbnail": "/miniatures/yt/_cMAhiHFeGg.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-08-18T12:00:00.000Z",
    "updated_at": "2026-08-18T12:00:00.000Z"
  },
  {
    "id": 46,
    "title": "Ma vie est un enfer...",
    "description": "Norman — Ma vie est un enfer...",
    "thumbnail": "/miniatures/yt/jZrVMPr_r1c.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-08-17T12:00:00.000Z",
    "updated_at": "2026-08-17T12:00:00.000Z"
  },
  {
    "id": 47,
    "title": "LE MÉTIER LE PLUS DANGEREUX DE FRANCE !!",
    "description": "Tibo InShape — LE MÉTIER LE PLUS DANGEREUX DE FRANCE !!",
    "thumbnail": "/miniatures/yt/xfWGXe53sXM.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-08-16T12:00:00.000Z",
    "updated_at": "2026-08-16T12:00:00.000Z"
  },
  {
    "id": 48,
    "title": "ON JUGE TOUS LES BILLETS DU MONDE (Avec Mcfly & Carlito et Mathieu)",
    "description": "Joyca — ON JUGE TOUS LES BILLETS DU MONDE (Avec Mcfly & Carlito et Mathieu)",
    "thumbnail": "/miniatures/yt/n7ASn5NsoPA.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-08-15T12:00:00.000Z",
    "updated_at": "2026-08-15T12:00:00.000Z"
  },
  {
    "id": 49,
    "title": "JE RAMASSE…",
    "description": "Lena Situations — JE RAMASSE…",
    "thumbnail": "/miniatures/yt/tz0rXgAT-Ok.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-08-14T12:00:00.000Z",
    "updated_at": "2026-08-14T12:00:00.000Z"
  },
  {
    "id": 50,
    "title": "je suis SPIDER-MAN !",
    "description": "Gotaga — je suis SPIDER-MAN !",
    "thumbnail": "/miniatures/yt/N4KYurF7ksY.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique",
      "featured"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-08-13T12:00:00.000Z",
    "updated_at": "2026-08-13T12:00:00.000Z"
  },
  {
    "id": 51,
    "title": "QUI FERA LE MEILLEUR HIT DE L'ÉTÉ ? (BOYSBAND vs GIRLSBAND)",
    "description": "Squeezie — QUI FERA LE MEILLEUR HIT DE L'ÉTÉ ? (BOYSBAND vs GIRLSBAND)",
    "thumbnail": "/miniatures/yt/hPo9DLCMofI.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-08-12T12:00:00.000Z",
    "updated_at": "2026-08-12T12:00:00.000Z"
  },
  {
    "id": 52,
    "title": "J’ai survécu à l’un des sommets les plus mortels des Alpes ! (1 an après l’Everest)",
    "description": "Inoxtag — J’ai survécu à l’un des sommets les plus mortels des Alpes ! (1 an après l’Everest)",
    "thumbnail": "/miniatures/yt/bY0tH3-kmG0.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-08-11T12:00:00.000Z",
    "updated_at": "2026-08-11T12:00:00.000Z"
  },
  {
    "id": 53,
    "title": "J'ai acheté tous les objets AMAZON avec ZÉRO AVIS  #3",
    "description": "Amixem — J'ai acheté tous les objets AMAZON avec ZÉRO AVIS  #3",
    "thumbnail": "/miniatures/yt/zr8xc870_2o.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-08-10T12:00:00.000Z",
    "updated_at": "2026-08-10T12:00:00.000Z"
  },
  {
    "id": 54,
    "title": "LES CLASH DES CONSOLES 2",
    "description": "Cyprien — LES CLASH DES CONSOLES 2",
    "thumbnail": "/miniatures/yt/s-gsIESfkUA.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-08-09T12:00:00.000Z",
    "updated_at": "2026-08-09T12:00:00.000Z"
  },
  {
    "id": 55,
    "title": "J’AFFRONTE DES ENFANTS CHAMPIONS ! (et j’essaye de les battre)",
    "description": "Michou — J’AFFRONTE DES ENFANTS CHAMPIONS ! (et j’essaye de les battre)",
    "thumbnail": "/miniatures/yt/qAp8gNZVzpk.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-08-08T12:00:00.000Z",
    "updated_at": "2026-08-08T12:00:00.000Z"
  },
  {
    "id": 56,
    "title": "Voici le pire agent de stars... (Les équipes de com)",
    "description": "Norman — Voici le pire agent de stars... (Les équipes de com)",
    "thumbnail": "/miniatures/yt/T6qIZGbVLNA.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-08-07T12:00:00.000Z",
    "updated_at": "2026-08-07T12:00:00.000Z"
  },
  {
    "id": 57,
    "title": "24H AVEC LES POMPIERS SUR LE PLUS GRAND INCENDIE DE FRANCE !!",
    "description": "Tibo InShape — 24H AVEC LES POMPIERS SUR LE PLUS GRAND INCENDIE DE FRANCE !!",
    "thumbnail": "/miniatures/yt/4KOMbK6R1MY.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife",
      "featured"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-08-06T12:00:00.000Z",
    "updated_at": "2026-08-06T12:00:00.000Z"
  },
  {
    "id": 58,
    "title": "On teste des lieux notés 1 étoile ! (En Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿) ★☆☆☆☆",
    "description": "Joyca — On teste des lieux notés 1 étoile ! (En Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿) ★☆☆☆☆",
    "thumbnail": "/miniatures/yt/jRf8lD4tVnA.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-08-05T12:00:00.000Z",
    "updated_at": "2026-08-05T12:00:00.000Z"
  },
  {
    "id": 59,
    "title": "J'AI PRIVATISÉ LE ROSE FESTIVAL",
    "description": "Lena Situations — J'AI PRIVATISÉ LE ROSE FESTIVAL",
    "thumbnail": "/miniatures/yt/gkEqIrlTIvE.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-08-04T12:00:00.000Z",
    "updated_at": "2026-08-04T12:00:00.000Z"
  },
  {
    "id": 60,
    "title": "JE PASSE UNE SEMAINE AVEC ITACHI (à l'aide...)",
    "description": "Gotaga — JE PASSE UNE SEMAINE AVEC ITACHI (à l'aide...)",
    "thumbnail": "/miniatures/yt/vDecQhtOtGw.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-08-03T12:00:00.000Z",
    "updated_at": "2026-08-03T12:00:00.000Z"
  },
  {
    "id": 61,
    "title": "QUI EST LE MEURTRIER ? (ALL STAR ÉDITION)",
    "description": "Squeezie — QUI EST LE MEURTRIER ? (ALL STAR ÉDITION)",
    "thumbnail": "/miniatures/yt/49Dy0nvs7Lw.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "selection"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-08-02T12:00:00.000Z",
    "updated_at": "2026-08-02T12:00:00.000Z"
  },
  {
    "id": 62,
    "title": "Qui Perdra son Job ?! (ft. Byilhan, Nico)",
    "description": "Inoxtag — Qui Perdra son Job ?! (ft. Byilhan, Nico)",
    "thumbnail": "/miniatures/yt/ig-_3_-9wu4.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-08-01T12:00:00.000Z",
    "updated_at": "2026-08-01T12:00:00.000Z"
  },
  {
    "id": 63,
    "title": "J’ai acheté tous les objets des pubs TikTok #7 ",
    "description": "Amixem — J’ai acheté tous les objets des pubs TikTok #7 ",
    "thumbnail": "/miniatures/yt/IUn6P8RSsOg.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-07-31T12:00:00.000Z",
    "updated_at": "2026-07-31T12:00:00.000Z"
  },
  {
    "id": 64,
    "title": "J’ai fait quoi depuis un an ? (admirez ma promo)",
    "description": "Cyprien — J’ai fait quoi depuis un an ? (admirez ma promo)",
    "thumbnail": "/miniatures/yt/ZMre1QaHN34.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences",
      "featured"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-07-30T12:00:00.000Z",
    "updated_at": "2026-07-30T12:00:00.000Z"
  },
  {
    "id": 65,
    "title": "J'AI INVITÉ 50 YOUTUBEURS A S'AFFRONTER !",
    "description": "Michou — J'AI INVITÉ 50 YOUTUBEURS A S'AFFRONTER !",
    "thumbnail": "/miniatures/yt/JwySrfw8ZSA.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-07-29T12:00:00.000Z",
    "updated_at": "2026-07-29T12:00:00.000Z"
  },
  {
    "id": 66,
    "title": "Être parents 2 (la créature a évolué)",
    "description": "Norman — Être parents 2 (la créature a évolué)",
    "thumbnail": "/miniatures/yt/a0q500rzJ74.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-07-28T12:00:00.000Z",
    "updated_at": "2026-07-28T12:00:00.000Z"
  },
  {
    "id": 67,
    "title": "Bodybuilder vs Gendarmes : Qui Est Le Plus Fort ?",
    "description": "Tibo InShape — Bodybuilder vs Gendarmes : Qui Est Le Plus Fort ?",
    "thumbnail": "/miniatures/yt/VHspOOVBR-M.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-07-27T12:00:00.000Z",
    "updated_at": "2026-07-27T12:00:00.000Z"
  },
  {
    "id": 68,
    "title": "LE JUSTE POIDS ! (Avec Djilsi et Nico)",
    "description": "Joyca — LE JUSTE POIDS ! (Avec Djilsi et Nico)",
    "thumbnail": "/miniatures/yt/90VcMwYZgNg.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-07-26T12:00:00.000Z",
    "updated_at": "2026-07-26T12:00:00.000Z"
  },
  {
    "id": 69,
    "title": "IL FAUT S’OCCUPER DE SON C*L",
    "description": "Lena Situations — IL FAUT S’OCCUPER DE SON C*L",
    "thumbnail": "/miniatures/yt/vRbIZDr3ajw.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-07-25T12:00:00.000Z",
    "updated_at": "2026-07-25T12:00:00.000Z"
  },
  {
    "id": 70,
    "title": "on m'a tendu un PIÈGE | BEST-OF",
    "description": "Gotaga — on m'a tendu un PIÈGE | BEST-OF",
    "thumbnail": "/miniatures/yt/KDVTKd1OEi8.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-07-24T12:00:00.000Z",
    "updated_at": "2026-07-24T12:00:00.000Z"
  },
  {
    "id": 71,
    "title": "LE PIRE DUO VA EN PRISON (ft Joyca, Théodort & Billy)",
    "description": "Squeezie — LE PIRE DUO VA EN PRISON (ft Joyca, Théodort & Billy)",
    "thumbnail": "/miniatures/yt/IVi1fd_LqOk.jpg",
    "creator_id": 1,
    "creator_username": "Squeezie",
    "category": "influences",
    "categories": [
      "influences",
      "humour",
      "featured",
      "selection"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-07-23T12:00:00.000Z",
    "updated_at": "2026-07-23T12:00:00.000Z"
  },
  {
    "id": 72,
    "title": "2 semaines pour découvrir le Japon ! (Je sors mon Manga) Ft. Amine, MangaWorkout",
    "description": "Inoxtag — 2 semaines pour découvrir le Japon ! (Je sors mon Manga) Ft. Amine, MangaWorkout",
    "thumbnail": "/miniatures/yt/ZMS_X-wdTi4.jpg",
    "creator_id": 1,
    "creator_username": "Inoxtag",
    "category": "influences",
    "categories": [
      "influences",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-07-22T12:00:00.000Z",
    "updated_at": "2026-07-22T12:00:00.000Z"
  },
  {
    "id": 73,
    "title": "ON MANGE 50 ALIMENTS DE LUXE (et on les juge) #2",
    "description": "Amixem — ON MANGE 50 ALIMENTS DE LUXE (et on les juge) #2",
    "thumbnail": "/miniatures/yt/lOR96LbTMp4.jpg",
    "creator_id": 1,
    "creator_username": "Amixem",
    "category": "humour",
    "categories": [
      "humour",
      "vlog"
    ],
    "is_top_10": false,
    "duration": "12:34",
    "status": "published",
    "created_at": "2026-07-21T12:00:00.000Z",
    "updated_at": "2026-07-21T12:00:00.000Z"
  },
  {
    "id": 74,
    "title": "SI LE PRÉSIDENT ÉTAIT YOUTUBEUR 2",
    "description": "Cyprien — SI LE PRÉSIDENT ÉTAIT YOUTUBEUR 2",
    "thumbnail": "/miniatures/yt/4mimpvZely8.jpg",
    "creator_id": 1,
    "creator_username": "Cyprien",
    "category": "humour",
    "categories": [
      "humour",
      "influences"
    ],
    "is_top_10": false,
    "duration": "18:02",
    "status": "published",
    "created_at": "2026-07-20T12:00:00.000Z",
    "updated_at": "2026-07-20T12:00:00.000Z"
  },
  {
    "id": 75,
    "title": "J’AI TESTÉ LE MEILLEUR vs LE PIRE HÔTEL DES ETATS-UNIS ! (on dort avec une souris mdrrr)",
    "description": "Michou — J’AI TESTÉ LE MEILLEUR vs LE PIRE HÔTEL DES ETATS-UNIS ! (on dort avec une souris mdrrr)",
    "thumbnail": "/miniatures/yt/B4Jp3lcw_D4.jpg",
    "creator_id": 1,
    "creator_username": "Michou",
    "category": "gossip",
    "categories": [
      "gossip",
      "tele_realite"
    ],
    "is_top_10": false,
    "duration": "24:47",
    "status": "published",
    "created_at": "2026-07-19T12:00:00.000Z",
    "updated_at": "2026-07-19T12:00:00.000Z"
  },
  {
    "id": 76,
    "title": "RONFLER (je teste des objets presque révolutionnaires)",
    "description": "Norman — RONFLER (je teste des objets presque révolutionnaires)",
    "thumbnail": "/miniatures/yt/GbLQXAVmzJc.jpg",
    "creator_id": 1,
    "creator_username": "Norman",
    "category": "humour",
    "categories": [
      "humour",
      "podcast",
      "selection",
      "shorts"
    ],
    "is_top_10": false,
    "duration": "9:15",
    "status": "published",
    "created_at": "2026-07-18T12:00:00.000Z",
    "updated_at": "2026-07-18T12:00:00.000Z"
  },
  {
    "id": 77,
    "title": "24H AVEC LES FORCES SPÉCIALES EN PRISON !!",
    "description": "Tibo InShape — 24H AVEC LES FORCES SPÉCIALES EN PRISON !!",
    "thumbnail": "/miniatures/yt/mZcUhlFQMng.jpg",
    "creator_id": 1,
    "creator_username": "Tibo InShape",
    "category": "sport",
    "categories": [
      "sport",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "31:20",
    "status": "published",
    "created_at": "2026-07-17T12:00:00.000Z",
    "updated_at": "2026-07-17T12:00:00.000Z"
  },
  {
    "id": 78,
    "title": "LE DILEMME PARFAIT ! (ft. Vald, Seb, HugoDécrypte)",
    "description": "Joyca — LE DILEMME PARFAIT ! (ft. Vald, Seb, HugoDécrypte)",
    "thumbnail": "/miniatures/yt/ohPHwSVQweY.jpg",
    "creator_id": 1,
    "creator_username": "Joyca",
    "category": "influences",
    "categories": [
      "influences",
      "inside",
      "featured"
    ],
    "is_top_10": false,
    "duration": "15:58",
    "status": "published",
    "created_at": "2026-07-16T12:00:00.000Z",
    "updated_at": "2026-07-16T12:00:00.000Z"
  },
  {
    "id": 79,
    "title": "LA CULTURE DU VIDE",
    "description": "Lena Situations — LA CULTURE DU VIDE",
    "thumbnail": "/miniatures/yt/BBDebkeFhTo.jpg",
    "creator_id": 1,
    "creator_username": "Lena Situations",
    "category": "mode",
    "categories": [
      "mode",
      "fastlife"
    ],
    "is_top_10": false,
    "duration": "42:10",
    "status": "published",
    "created_at": "2026-07-15T12:00:00.000Z",
    "updated_at": "2026-07-15T12:00:00.000Z"
  },
  {
    "id": 80,
    "title": "grosse embrouille avec Squeezie | BEST-OF",
    "description": "Gotaga — grosse embrouille avec Squeezie | BEST-OF",
    "thumbnail": "/miniatures/yt/4jaSCbI74fQ.jpg",
    "creator_id": 1,
    "creator_username": "Gotaga",
    "category": "inside",
    "categories": [
      "inside",
      "rap_musique"
    ],
    "is_top_10": false,
    "duration": "21:36",
    "status": "published",
    "created_at": "2026-07-14T12:00:00.000Z",
    "updated_at": "2026-07-14T12:00:00.000Z"
  }
] as Video[]
