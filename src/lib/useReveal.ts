import { useEffect } from 'react'

// Scroll reveal for every `.reveal` (and `.lift`) on the page. Elements are visible by
// default and only hidden once the observer is confirmed running, so a failure
// leaves readable content. Anything already in the viewport is never hidden,
// so the first paint is complete and nothing pops in above the fold.
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove('pre')
          io.unobserve(entry.target)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll<HTMLElement>('.reveal, .lift').forEach((node) => {
      if (node.getBoundingClientRect().top < innerHeight) return
      node.classList.add('pre')
      io.observe(node)
    })
    return () => io.disconnect()
  }, [])
}
