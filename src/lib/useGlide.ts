import { useEffect } from 'react'

// Wheel scrolling glides: each wheel tick moves a target, and the page eases
// toward it frame by frame instead of stepping. Touch, keyboard and anchor
// scrolling are left native; reduced-motion users get the browser's own.
export function useGlide() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const html = document.documentElement
    let target = scrollY
    let raf = 0

    const step = () => {
      const y = scrollY
      const gap = target - y
      if (Math.abs(gap) < 1) {
        scrollTo(0, target)
        html.style.scrollBehavior = ''
        raf = 0
        return
      }
      // ponytail: fixed lerp, frame-rate dependent; scale by dt if it ever matters.
      scrollTo(0, y + gap * 0.12)
      raf = requestAnimationFrame(step)
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch zoom
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1
      const max = html.scrollHeight - innerHeight
      target = Math.min(max, Math.max(0, (raf ? target : scrollY) + e.deltaY * unit))
      if (!raf) {
        // Our own scrollTo must not be smoothed by the anchor-link setting.
        html.style.scrollBehavior = 'auto'
        raf = requestAnimationFrame(step)
      }
    }

    addEventListener('wheel', onWheel, { passive: false })
    return () => {
      removeEventListener('wheel', onWheel)
      cancelAnimationFrame(raf)
      html.style.scrollBehavior = ''
    }
  }, [])
}
