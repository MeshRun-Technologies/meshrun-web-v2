import { useLayoutEffect } from 'react'

/** Share of a lifted line on screen before its letters stand up. */
const LIFT_IN = 0.4
/** Pixels scrolled back up before they fall, so a trackpad's bounce doesn't. */
const LIFT_TURN = 24

// Enhance readable markup before paint. Keep the initial viewport visible,
// and replay entrances only after an element has left the viewing area.
export function useReveal() {
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = [...document.querySelectorAll<HTMLElement>('.reveal')]
    const lifts = [...document.querySelectorAll<HTMLElement>('.lift')]
    let observer: IntersectionObserver | undefined
    let exitObserver: IntersectionObserver | undefined
    let onScroll: (() => void) | undefined

    const reset = () => {
      observer?.disconnect()
      exitObserver?.disconnect()
      if (onScroll) removeEventListener('scroll', onScroll)
      ;[...nodes, ...lifts].forEach((node) => node.classList.remove('pre'))
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

      // Lifted type plays its entrance backwards: turn round and scroll up while
      // it is on screen and the letters drop below the line again, last one
      // first; scroll back down and they stand up as they did on the way in.
      // Driven by scroll direction, not visibility, so the exit starts the
      // moment you turn rather than once the word is already leaving.
      let lastY = scrollY
      let travelled = 0
      let frame = 0
      const check = () => {
        frame = 0
        const y = scrollY
        const delta = y - lastY
        lastY = y
        travelled = delta < 0 ? travelled - delta : 0
        for (const node of lifts) {
          const r = node.getBoundingClientRect()
          const shown = Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / r.height
          if (r.top >= innerHeight) node.classList.add('pre')
          else if (delta > 0 && shown >= LIFT_IN) node.classList.remove('pre')
          else if (travelled >= LIFT_TURN) node.classList.add('pre')
        }
      }
      onScroll = () => {
        if (!frame) frame = requestAnimationFrame(check)
      }
      addEventListener('scroll', onScroll, { passive: true })
      lifts.forEach((node) => {
        const r = node.getBoundingClientRect()
        node.classList.toggle('pre', r.top >= innerHeight - 48)
      })
      // Landing with the word already in view stands it up straight away.
      requestAnimationFrame(() =>
        lifts.forEach((node) => {
          const r = node.getBoundingClientRect()
          if (r.top < innerHeight && r.bottom > 0) node.classList.remove('pre')
        }),
      )
    }

    setup()
    preference.addEventListener('change', setup)
    return () => {
      preference.removeEventListener('change', setup)
      reset()
    }
  }, [])
}
