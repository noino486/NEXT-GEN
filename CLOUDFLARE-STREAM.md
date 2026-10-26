# Intégration Cloudflare Stream

Ce document explique comment intégrer Cloudflare Stream pour l'upload de vidéos dans la plateforme KLYXY.

## Upload depuis le dashboard (implémenté)

**Vous n'avez plus besoin d'aller sur Cloudflare pour publier une vidéo.**

1. Allez sur **Dashboard → Vidéos → Publier une vidéo** (ou modal Créer une vidéo).
2. Sélectionnez un fichier vidéo (MP4, WebM, MOV, etc., **jusqu'à 10 Go**).
3. Cliquez sur **Uploader sur Cloudflare**. L’ID Cloudflare Stream et la durée sont remplis automatiquement.
4. Renseignez titre, créateur, catégorie, etc., puis **Créer la vidéo**.

- **Fichiers ≤ 200 Mo** : upload direct via le backend (`POST /api/videos/upload`).
- **Fichiers > 200 Mo (jusqu'à 10 Go)** : upload **TUS resumable** (reprise en cas d’interruption). Le frontend utilise `tus-js-client` avec le proxy backend `POST /api/videos/upload-tus`, qui initie l’upload côté Cloudflare sans exposer l’API token au client. Les chunks sont envoyés directement vers Cloudflare après l’init.

Les variables `CLOUDFLARE_ACCOUNT_ID` et `CLOUDFLARE_API_TOKEN` doivent être définies dans `.env.local` (côté backend).

## Configuration

### 1. Obtenir les identifiants Cloudflare Stream

**Important :** Il faut un **API Token** (créé dans My Profile → API Tokens), **pas** la clé API globale (Global API Key). Sinon vous aurez l’erreur *« Unable to authenticate request »* (code 10001).

#### Account ID

1. Connectez-vous au [dashboard Cloudflare](https://dash.cloudflare.com)
2. Sélectionnez le bon compte (ou allez dans **Stream**)
3. Dans la barre latérale droite, récupérez l’**Account ID** (zone **API**)

#### API Token (avec permission Stream)

1. **My Profile** (icône utilisateur) → **API Tokens** → **Create Token**
2. Utilisez le template **« Edit Cloudflare Stream »** ou créez un token personnalisé :
   - **Permissions** : **Cloudflare Stream** → **Edit**
3. **Account resources** : inclure au moins le compte concerné
4. **Create Token**, puis **copier** le token (affiché une seule fois)

### 2. Configurer les variables d'environnement

Dans `.env.local` (à la racine du projet, utilisé par le backend) :

```env
CLOUDFLARE_ACCOUNT_ID=votre_account_id
CLOUDFLARE_API_TOKEN=votre_api_token
```

Pas d’espace ni de guillemets autour des valeurs. Redémarrer le serveur backend après modification.

#### Customer code (lecture vidéo, page /watch/[id])

Le player KLYXY utilise l’iframe officielle Cloudflare Stream. Il faut un **customer code** (sous-domaine Stream) :

1. [Stream → Vidéos](https://dash.cloudflare.com/?to=/:account/stream/videos) → ouvrir une vidéo
2. **Embed** : l’URL d’embed contient `https://customer-XXXX.cloudflarestream.com/...`
3. **XXXX** est le customer code. Mettez **uniquement** le code dans `.env.local` :

```env
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE=XXXX
```

Le player accepte aussi l’URL complète (`customer-XXXX.cloudflarestream.com`) et normalise automatiquement.

Sans cette variable, la page `/watch/[id]` affiche un message demandant de la configurer. Le bouton **Play** de l’overlay (miniature) appelle `player.play()` via le SDK Stream ; les contrôles de l’iframe restent utilisables.

### 3. Erreur « Unable to authenticate request » (10001)

Si l’upload renvoie cette erreur :

- Vérifier que `CLOUDFLARE_API_TOKEN` est un **API Token** (Create Token), pas la Global API Key
- Vérifier que le token a la permission **Cloudflare Stream** → **Edit**
- Vérifier que `CLOUDFLARE_ACCOUNT_ID` correspond au bon compte
- Vérifier l’absence d’espaces ou de retours à la ligne dans les variables
- Tester le token : [Verify token](https://developers.cloudflare.com/fundamentals/api/get-started/validate/) (le token doit être actif)

### 4. Installation des dépendances

Si vous souhaitez utiliser le SDK Cloudflare, installez-le :

```bash
npm install @cloudflare/stream
```

## Upload de vidéos

### Option 1 : Upload direct depuis le frontend (recommandé)

Cloudflare Stream supporte l'upload direct depuis le navigateur. Voici comment l'implémenter :

1. **Générer un token d'upload** (backend) :

```javascript
// server/controllers/videosController.js
import crypto from 'crypto';

export async function getUploadToken(req, res) {
  try {
    const userId = parseInt(req.headers['x-user-id'], 10);
    const userRole = req.headers['x-user-role'] || '';

    // Vérifier les permissions
    if (!canAccessAdmin({ role: userRole })) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé'
      });
    }

    // Générer un token d'upload unique
    const uploadToken = crypto.randomBytes(32).toString('hex');
    
    // Stocker le token temporairement (optionnel, pour validation)
    // Vous pouvez utiliser Redis ou une table temporaire
    
    return res.status(200).json({
      success: true,
      uploadToken,
      uploadUrl: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`
    });
  } catch (error) {
    console.error('❌ Erreur lors de la génération du token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du token'
    });
  }
}
```

2. **Upload depuis le frontend** :

```typescript
// lib/cloudflare-stream-client.ts
export async function uploadVideoToCloudflare(
  file: File,
  uploadToken: string
): Promise<{ success: boolean; videoId?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Erreur lors de l\'upload'
      };
    }

    const data = await response.json();
    return {
      success: true,
      videoId: data.result?.uid
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'upload de la vidéo'
    };
  }
}
```

### Option 2 : Upload via le backend

Si vous préférez uploader via le backend :

```javascript
// server/controllers/videosController.js
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

export async function uploadVideo(req, res) {
  try {
    const userId = parseInt(req.headers['x-user-id'], 10);
    const userRole = req.headers['x-user-role'] || '';

    // Vérifier les permissions
    if (!canAccessAdmin({ role: userRole })) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier vidéo fourni'
      });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          ...formData.getHeaders()
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({
        success: false,
        error: error.errors?.[0]?.message || 'Erreur lors de l\'upload'
      });
    }

    const data = await response.json();
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      videoId: data.result?.uid,
      video: data.result
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de la vidéo'
    });
  }
}
```

## Utilisation dans la page de publication

Dans la page `app/dashboard/videos/publish/page.tsx`, vous pouvez ajouter un composant d'upload :

```typescript
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);

const handleVideoUpload = async (file: File) => {
  setUploading(true);
  setUploadProgress(0);

  try {
    // Option 1: Upload direct
    const result = await uploadVideoToCloudflare(file, uploadToken);
    
    if (result.success && result.videoId) {
      setCloudflareStreamId(result.videoId);
      toast.success('Vidéo uploadée avec succès!');
    } else {
      toast.error(result.error || 'Erreur lors de l\'upload');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    toast.error('Erreur lors de l\'upload');
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};
```

## Récupération des informations de la vidéo

Une fois la vidéo uploadée, vous pouvez récupérer ses informations :

```typescript
export async function getVideoInfo(videoId: string): Promise<{
  success: boolean;
  video?: any;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des informations'
      };
    }

    const data = await response.json();
    return {
      success: true,
      video: data.result
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération des informations'
    };
  }
}
```

## Lecture de la vidéo

Le player KLYXY (`KlyxyVideoPlayer`) utilise l’**iframe** Cloudflare Stream + **SDK** (`sdk.latest.js`) :

- Iframe : `https://customer-{CODE}.cloudflarestream.com/{VIDEO_UID}/iframe?controls=true&preload=auto`
- SDK : `Stream(iframe)` pour `player.play()` / `player.pause()`
- Overlay poster avec **bouton Play** cliquable qui appelle `player.play()`, puis masque l’overlay.

Configurer `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE` (voir ci‑dessus). La page `/watch/[id]` utilise ce player.

## Ressources

- [Documentation Cloudflare Stream](https://developers.cloudflare.com/stream/)
- [API Reference](https://developers.cloudflare.com/api/operations/stream-videos-upload-a-video)
- [Player Documentation](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/)

