import type { CSSProperties, ReactNode } from 'react'

import { Button, LinkButton } from './components/Button'
import { Wordmark } from './components/Wordmark'
import { Workstation } from './components/Workstation'
import { useReveal } from './lib/useReveal'
import { useTheme } from './lib/useTheme'

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function App() {
  useReveal()
  return (
    <>
      <Nav />
      <main>
        <Hero />
      </main>
    </>
  )
}

/* ------------------------------------------------------------------------ */
/* Structure: one content column with rails; every section ends on a rule
   that bleeds past the column and crosses the rails at two registration
   marks. Rails and marks are hidden on phones, where the gutter is the edge. */

const column = 'mx-auto max-w-5xl px-5 sm:px-8 sm:rails'

function Crosses() {
  return (
    <>
      <span aria-hidden className="cross bottom-[-4px] left-[-4px] hidden sm:block" />
      <span aria-hidden className="cross right-[-4px] bottom-[-4px] hidden sm:block" />
    </>
  )
}

function Section({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="rule-bleed">
      <div className={`${column} ${className}`}>
        <Crosses />
        {children}
      </div>
    </section>
  )
}

// Mono, uppercase, tracked: the label register from the app.
function Label({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <p
      style={style}
      className={`font-mono text-2xs tracking-wide text-ink-subtle uppercase tabular-nums ${className}`}
    >
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------------ */

function ThemeToggle() {
  const { setAppearance } = useTheme()
  // Two states for the visitor, light and dark. The first click leaves
  // "system" for an explicit choice; the page follows the OS until then.
  const flip = () =>
    setAppearance(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
  return (
    <button
      type="button"
      onClick={flip}
      aria-label="Toggle light and dark"
      className="inline-flex size-7 items-center justify-center rounded-sm text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        aria-hidden
      >
        {/* Half-filled disc: the mark for "the other appearance", either way. */}
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 2.5v11a5.5 5.5 0 0 0 0-11Z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  )
}

function Nav() {
  return (
    <header className="rule-bleed sticky top-0 z-20 bg-bg/85 backdrop-blur">
      <div className={`${column} grid h-11 grid-cols-[1fr_auto_1fr] items-center`}>
        <Crosses />
        <Wordmark />
        <nav className="hidden gap-6 text-sm text-ink-muted sm:flex">
          {[
            ['How it works', '#how'],
            ['Pricing', '#pricing'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition-colors duration-(--dur-fast) hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <ThemeToggle />
          <Button variant="primary" disabled>
            Request a demo
          </Button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <Section>
      <div className="grid min-h-[70svh] items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Label className="row-in mb-6">Cloud CAD workstations for Mac</Label>
          <h1 className="font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
            <span className="line-reveal">
              <span>Run CAD on a Mac</span>
            </span>
            <span className="line-reveal">
              <span style={delay(90)}>that can&rsquo;t.</span>
            </span>
          </h1>
          <p className="row-in mt-6 max-w-lg text-md text-ink-muted" style={delay(220)}>
            meshrun provisions a GPU workstation in the cloud, with your CAD package installed and
            licensed, and streams it to your laptop. Minutes to a working session, no cloud vocabulary,
            and no bill that keeps running after you close the lid.
          </p>
          <div className="row-in mt-8 flex flex-wrap gap-3" style={delay(320)}>
            <Button variant="primary" size="lg" disabled>
              Request a demo
            </Button>
            <LinkButton href="#how" size="lg" arrow>
              How it works
            </LinkButton>
          </div>
          <Label className="row-in mt-8" style={delay(420)}>
            Per-second billing · Auto-stop · Native Mac app
          </Label>
        </div>
        <Workstation className="w-48 justify-self-center text-ink-subtle sm:w-64 lg:w-80 lg:justify-self-end" />
      </div>
    </Section>
  )
}
