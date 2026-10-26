# KLYXY front (Vercel)

Front Next.js seul (sans backend Express ni SQL). Sans `NEXT_PUBLIC_BACKEND_URL`, le site passe en **mode démo** :
vidéos + miniatures YouTubeurs viennent de `lib/demo-data.ts` (images dans `public/miniatures/yt/`).

Deploiement : importer ce dossier dans Vercel (Framework = Next.js, Root Directory = `klyxy-front` si repo parent).
Pour brancher le vrai backend plus tard : definir `NEXT_PUBLIC_BACKEND_URL` (le mode démo se coupe tout seul).
