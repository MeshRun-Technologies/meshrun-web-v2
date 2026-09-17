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
    const onChange = () => apply('system')
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
    setState(next)
  }

  return { appearance, setAppearance }
}
