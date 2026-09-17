import { useLayoutEffect } from 'react'

// Enhance readable markup before paint. Keep the initial viewport visible,
// and replay entrances only after an element has left the viewing area.
export function useReveal() {
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = [...document.querySelectorAll<HTMLElement>('.reveal, .lift')]
    let observer: IntersectionObserver | undefined
    let exitObserver: IntersectionObserver | undefined

    const reset = () => {
      observer?.disconnect()
      exitObserver?.disconnect()
      nodes.forEach((node) => node.classList.remove('pre'))
    }
    const setup = () => {
      reset()
      if (preference.matches) return

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) entry.target.classList.remove('pre')
          }
        },
        // A fixed inset behaves consistently on narrow screens too. A zero
        // threshold also lets sections taller than the viewport reveal.
        { threshold: 0, rootMargin: '0px 0px -48px 0px' },
      )
      // Reset outside a wider boundary so the 32px transform cannot cause
      // repeated enter/leave callbacks at the viewport edge.
      exitObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) entry.target.classList.add('pre')
          }
        },
        { threshold: 0, rootMargin: '80px' },
      )
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect()
        node.classList.toggle('pre', rect.top >= innerHeight - 48 || rect.bottom <= 0)
        observer!.observe(node)
        exitObserver!.observe(node)
      })
    }

    setup()
    preference.addEventListener('change', setup)
    return () => {
      preference.removeEventListener('change', setup)
      reset()
    }
  }, [])
}
