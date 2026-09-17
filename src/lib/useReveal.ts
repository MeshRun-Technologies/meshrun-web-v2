import { useCallback, useRef } from 'react'

// Scroll reveal for a scroller's `.reveal` children. Returns a callback ref for
// the scrolling element. Children are visible by default and only hidden once
// the observer is confirmed running, so a failure leaves readable content.
export function useReveal() {
  const observer = useRef<IntersectionObserver | null>(null)

  return useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove('pre')
          io.unobserve(entry.target)
        }
      },
      { root: el, threshold: 0.15 },
    )
    el.querySelectorAll<HTMLElement>('.reveal').forEach((node) => {
      node.classList.add('pre')
      io.observe(node)
    })
    observer.current = io
  }, [])
}
