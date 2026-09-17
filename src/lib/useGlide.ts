import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Lenis owns wheel interpolation and anchor scrolling; touch stays native.
export function useGlide() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | undefined

    const setup = () => {
      lenis?.destroy()
      lenis = undefined
      if (preference.matches) return
      lenis = new Lenis({
        autoRaf: true,
        anchors: true,
        lerp: 0.1,
        syncTouch: false,
      })
    }

    setup()
    preference.addEventListener('change', setup)
    return () => {
      preference.removeEventListener('change', setup)
      lenis?.destroy()
    }
  }, [])
}
