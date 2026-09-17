import { useEffect, useState } from 'react'

export type Appearance = 'system' | 'light' | 'dark'

const KEY = 'meshrun.theme'
const QUERY = '(prefers-color-scheme: dark)'

function stored(): Appearance {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function apply(appearance: Appearance) {
  const dark =
    appearance === 'dark' ||
    (appearance === 'system' && matchMedia(QUERY).matches)
  document.documentElement.classList.toggle('dark', dark)
}

// Follows macOS unless the user chooses. index.html applies the same rule
// before first paint; this hook keeps it live afterwards.
export function useTheme() {
  const [appearance, setState] = useState<Appearance>(stored)

  useEffect(() => {
    apply(appearance)
    if (appearance !== 'system') return
    const mq = matchMedia(QUERY)
    // Reads storage, not this instance's state: two toggles on the page each
    // hold their own copy, and only storage is shared between them.
    const onChange = () => apply(stored())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [appearance])

  function setAppearance(next: Appearance) {
    try {
      if (next === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, next)
    } catch {
      /* applies for this run only */
    }
    // Apply directly as well: another instance may have moved the page on
    // since this one's state last changed, in which case setState is a no-op.
    apply(next)
    setState(next)
  }

  return { appearance, setAppearance }
}
