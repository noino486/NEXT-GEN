import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Configuration pour le backend
  // En production unifié, le backend est sur le même serveur
  env: {
    // En production, utiliser l'URL actuelle (même serveur)
    // En développement, utiliser la variable d'environnement ou localhost
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
    // Sans backend (ex. déploiement Vercel du front seul) → mode démo avec miniatures YouTubeurs
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? (process.env.NEXT_PUBLIC_BACKEND_URL ? '' : '1'),
  },
  // Configuration des images
  images: {
    remotePatterns: [],
  },
  // Forcer le build navigateur de tus-js-client (évite _xhr undefined avec Node build)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'tus-js-client': path.resolve(__dirname, 'node_modules/tus-js-client/lib/browser/index.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
