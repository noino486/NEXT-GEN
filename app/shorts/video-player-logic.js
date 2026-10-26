/**
 * Logique de gestion des vidéos pour le modal shorts
 * Backend - Logique pure en JavaScript
 */

/**
 * Arrête toutes les vidéos sauf celle à l'index spécifié
 */
export function pauseAllVideosExcept(videoRefs, indexToKeep) {
  videoRefs.forEach((video, index) => {
    if (video && index !== indexToKeep) {
      video.pause()
      video.currentTime = 0
    }
  })
}

/**
 * Arrête toutes les vidéos
 */
export function pauseAllVideos(videoRefs) {
  videoRefs.forEach((video) => {
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  })
}

/**
 * Lance une vidéo spécifique avec gestion des erreurs
 */
export function playVideo(video, onSuccess, onError) {
  if (!video) {
    console.log('❌ playVideo: video est null')
    if (onError) onError(new Error('Video element not found'))
    return
  }

  console.log('▶️ playVideo appelé - readyState:', video.readyState, 'paused:', video.paused)

  video.currentTime = 0
  video.muted = false

  const playPromise = video.play()
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('✅ play() résolu avec succès')
        if (onSuccess) onSuccess()
      })
      .catch((error) => {
        console.log('⚠️ play() échoué (autoplay bloqué?), tentative en muet:', error.message)
        // Si l'autoplay avec son échoue, essayer en muet
        video.muted = true
        video.play()
          .then(() => {
            console.log('✅ play() réussi en muet - activation du son dans 100ms')
            // Activer le son après 100ms
            setTimeout(() => {
              video.muted = false
            }, 100)
            if (onSuccess) onSuccess()
          })
          .catch((err) => {
            console.log('❌ play() échoué même en muet:', err.message)
            if (onError) onError(error)
          })
      })
  }
}

/**
 * Change de vidéo : arrête toutes les autres et lance la nouvelle
 */
export function changeToVideo(videoRefs, newIndex, onVideoChange) {
  console.log('🎬 changeToVideo appelé - newIndex:', newIndex, 'totalVideos:', videoRefs.length)
  
  if (newIndex < 0 || newIndex >= videoRefs.length) {
    console.log('❌ Index invalide:', newIndex)
    return false
  }

  // Arrêter toutes les vidéos sauf la nouvelle
  console.log('⏸️ Pause toutes les vidéos sauf index', newIndex)
  pauseAllVideosExcept(videoRefs, newIndex)

  // Fonction pour lancer la vidéo
  const attemptPlay = (video) => {
    if (!video) {
      console.log('❌ attemptPlay: video est null pour index', newIndex)
      return false
    }

    console.log('▶️ attemptPlay pour index', newIndex, 'readyState:', video.readyState)

    // Forcer le chargement si nécessaire
    if (video.readyState === 0 || video.readyState === 1) {
      console.log('📥 Chargement forcé de la vidéo index', newIndex)
      video.load()
    }

    // Réinitialiser la vidéo
    video.currentTime = 0
    video.muted = false

    console.log('🚀 Tentative de play() pour index', newIndex, 'paused:', video.paused)

    // Essayer de lancer
    playVideo(
      video,
      () => {
        console.log('✅ Play réussi pour index', newIndex)
        if (onVideoChange) onVideoChange(newIndex)
      },
      () => {
        // Si ça échoue, réessayer après un délai
        console.log('⚠️ Play échoué pour index', newIndex, '- réessai dans 200ms')
        setTimeout(() => attemptPlay(video), 200)
      }
    )

    return true
  }

  const newVideo = videoRefs[newIndex]
  console.log('🔍 Vidéo trouvée pour index', newIndex, ':', newVideo ? 'OUI' : 'NON')
  
  if (!newVideo) {
    // Si la vidéo n'existe pas encore, attendre qu'elle soit créée
    console.log('⏳ Attente de la création de la vidéo index', newIndex)
    let attempts = 0
    const maxAttempts = 30
    
    const checkInterval = setInterval(() => {
      attempts++
      const video = videoRefs[newIndex]
      
      if (video) {
        console.log('✅ Vidéo créée après', attempts, 'tentatives pour index', newIndex)
        clearInterval(checkInterval)
        attemptPlay(video)
      } else if (attempts >= maxAttempts) {
        console.log('❌ Timeout: vidéo non trouvée après', maxAttempts, 'tentatives pour index', newIndex)
        clearInterval(checkInterval)
      }
    }, 100)
    
    return true
  }

  // Lancer la nouvelle vidéo
  console.log('🎯 Lancement direct de la vidéo index', newIndex)
  attemptPlay(newVideo)
  return true
}

/**
 * Charge et lance une vidéo si elle n'est pas déjà en cours
 */
export function loadAndPlayVideo(video, onReady) {
  if (!video) {
    console.log('❌ loadAndPlayVideo: video est null')
    return
  }

  console.log('📦 loadAndPlayVideo - readyState:', video.readyState, 'paused:', video.paused)

  // Si la vidéo n'est pas chargée, la charger
  if (video.readyState === 0) {
    console.log('📥 Chargement de la vidéo (readyState 0)')
    video.load()
  }

  // Fonction pour lancer la vidéo
  const attemptPlay = () => {
    console.log('🎬 attemptPlay - paused:', video.paused, 'readyState:', video.readyState)
    if (video.paused) {
      playVideo(video, onReady, () => {
        // Réessayer après 200ms si ça échoue
        console.log('⚠️ loadAndPlayVideo échoué - réessai dans 200ms')
        setTimeout(attemptPlay, 200)
      })
    } else if (onReady) {
      console.log('✅ Vidéo déjà en cours - onReady appelé')
      onReady()
    }
  }

  // Si la vidéo est déjà prête, lancer directement
  if (video.readyState >= 2) {
    console.log('✅ Vidéo prête (readyState >= 2) - lancement immédiat')
    attemptPlay()
  } else {
    // Sinon, attendre qu'elle soit chargée
    console.log('⏳ Attente du chargement de la vidéo (readyState:', video.readyState, ')')
    const handleReady = () => {
      console.log('✅ Vidéo chargée - événement déclenché')
      attemptPlay()
    }
    
    video.addEventListener('loadeddata', handleReady, { once: true })
    video.addEventListener('canplay', handleReady, { once: true })
    
    // Lancer quand même après un délai
    setTimeout(() => {
      console.log('⏰ Timeout 500ms - tentative de play')
      attemptPlay()
    }, 500)
  }
}

/**
 * Gère le play/pause d'une vidéo
 */
export function togglePlayPause(video) {
  if (!video) return false

  if (video.paused) {
    playVideo(video)
    return true // isPlaying = true
  } else {
    video.pause()
    return false // isPlaying = false
  }
}

/**
 * Initialise la vidéo courante (utilisé au chargement)
 */
export function initializeCurrentVideo(videoRefs, currentIndex, isPlaying) {
  if (!videoRefs || currentIndex < 0 || currentIndex >= videoRefs.length) {
    return
  }

  // Arrêter les autres vidéos
  pauseAllVideosExcept(videoRefs, currentIndex)

  const video = videoRefs[currentIndex]
  if (!video) {
    // Si la vidéo n'existe pas encore, attendre
    let attempts = 0
    const maxAttempts = 30
    
    const checkInterval = setInterval(() => {
      attempts++
      const v = videoRefs[currentIndex]
      
      if (v) {
        clearInterval(checkInterval)
        if (isPlaying) {
          loadAndPlayVideo(v)
        } else {
          v.pause()
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
      }
    }, 100)
    
    return
  }

  // Si on doit jouer, lancer la vidéo
  if (isPlaying) {
    loadAndPlayVideo(video)
  } else {
    video.pause()
  }
}

/**
 * Gère le swipe vertical pour changer de vidéo
 */
export function handleSwipe(
  touchStartY,
  touchEndY,
  touchStartX,
  touchEndX,
  currentIndex,
  totalVideos,
  swipeThreshold = 50
) {
  const deltaY = touchEndY - touchStartY
  const deltaX = Math.abs(touchEndX - touchStartX)

  console.log('👆 handleSwipe - deltaY:', deltaY, 'deltaX:', deltaX, 'threshold:', swipeThreshold)

  // Ignorer si le mouvement est principalement horizontal
  if (deltaX > Math.abs(deltaY) * 1.5) {
    console.log('⏭️ Swipe horizontal détecté - ignoré')
    return null // Pas de changement
  }

  // Vérifier si c'est un swipe suffisant
  if (Math.abs(deltaY) < swipeThreshold) {
    console.log('⏭️ Mouvement insuffisant - deltaY:', Math.abs(deltaY), '< threshold:', swipeThreshold)
    return null // Pas assez de mouvement, c'est un clic
  }

  // Déterminer la nouvelle vidéo
  if (deltaY > 0 && currentIndex > 0) {
    // Swipe vers le bas -> vidéo précédente
    console.log('⬇️ Swipe vers le bas - index précédent:', currentIndex - 1)
    return currentIndex - 1
  } else if (deltaY < 0 && currentIndex < totalVideos - 1) {
    // Swipe vers le haut -> vidéo suivante
    console.log('⬆️ Swipe vers le haut - index suivant:', currentIndex + 1)
    return currentIndex + 1
  }

  console.log('⏭️ Swipe détecté mais pas de changement possible')
  return null // Pas de changement possible
}

/**
 * Gère la molette pour changer de vidéo
 */
export function handleWheel(
  accumulatedDelta,
  currentIndex,
  totalVideos,
  threshold = 30
) {
  console.log('🖱️ handleWheel - delta:', accumulatedDelta, 'threshold:', threshold, 'currentIndex:', currentIndex, 'total:', totalVideos)
  
  if (Math.abs(accumulatedDelta) < threshold) {
    console.log('⏭️ Molette: mouvement insuffisant')
    return null
  }

  if (accumulatedDelta > 0 && currentIndex < totalVideos - 1) {
    console.log('⬇️ Molette vers le bas - index suivant:', currentIndex + 1)
    return currentIndex + 1
  } else if (accumulatedDelta < 0 && currentIndex > 0) {
    console.log('⬆️ Molette vers le haut - index précédent:', currentIndex - 1)
    return currentIndex - 1
  }

  console.log('⏭️ Molette: pas de changement possible')
  return null
}

