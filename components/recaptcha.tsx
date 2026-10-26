"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (element: HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'expired-callback': () => void
      }) => number
      reset: (widgetId: number) => void
      getResponse: (widgetId: number) => string
    }
  }
}

interface ReCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  siteKey: string
}

export interface ReCaptchaHandle {
  reset: () => void
}

const ReCaptcha = forwardRef<ReCaptchaHandle, ReCaptchaProps>(
  ({ onVerify, onExpire, siteKey }, ref) => {
    const recaptchaRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<number | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const reset = () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current)
      }
    }

    useImperativeHandle(ref, () => ({
      reset
    }))

    useEffect(() => {
      // Ne pas charger si pas de clé configurée
      if (!siteKey) {
        return
      }

      // Vérifier si le script est déjà chargé
      if (window.grecaptcha) {
        setIsLoaded(true)
        return
      }

      // Vérifier si le script existe déjà dans le DOM
      const existingScript = document.querySelector('script[src*="recaptcha"]')
      if (existingScript) {
        // Attendre que le script se charge
        const checkLoaded = setInterval(() => {
          if (window.grecaptcha) {
            setIsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return () => clearInterval(checkLoaded)
      }

      // Charger le script reCAPTCHA
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsLoaded(true)
      }

      document.body.appendChild(script)

      // Ne pas supprimer le script à la démontage car il peut être utilisé par d'autres composants
    }, [siteKey])

    useEffect(() => {
      if (!isLoaded || !recaptchaRef.current || !window.grecaptcha) return

      // Vérifier si un widget existe déjà dans cet élément
      if (recaptchaRef.current.hasChildNodes()) {
        return
      }

      window.grecaptcha.ready(() => {
        if (recaptchaRef.current && !widgetIdRef.current) {
          // Vérifier une dernière fois avant de rendre
          if (recaptchaRef.current.hasChildNodes()) {
            return
          }
          
          try {
            widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: siteKey,
              callback: (token: string) => {
                onVerify(token)
              },
              'expired-callback': () => {
                if (onExpire) {
                  onExpire()
                }
              }
            })
          } catch (error) {
            console.error('Erreur lors du rendu de reCAPTCHA:', error)
          }
        }
      })
    }, [isLoaded, siteKey, onVerify, onExpire])

    // Nettoyer le widget lors du démontage
    useEffect(() => {
      return () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
          try {
            // Réinitialiser le widget au lieu de le supprimer
            window.grecaptcha.reset(widgetIdRef.current)
          } catch (error) {
            // Ignorer les erreurs de nettoyage
          }
        }
      }
    }, [])

    return <div ref={recaptchaRef} />
  }
)

ReCaptcha.displayName = 'ReCaptcha'

export default ReCaptcha

