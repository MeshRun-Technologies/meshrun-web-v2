import type { CSSProperties, ReactNode } from 'react'

import { Button, LinkButton } from './components/Button'
import { cad, claims, steps } from './content'
import { Wordmark } from './components/Wordmark'
import { Workstation } from './components/Workstation'
import { useReveal } from './lib/useReveal'
import { useTheme } from './lib/useTheme'

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

// Sibling stagger for `reveal` children; capped so a long list never lags.
const stagger = (i: number): CSSProperties =>
  ({ '--stagger': `${Math.min(i, 6) * 80}ms` }) as CSSProperties

export function App() {
  useReveal()
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Claims />
        <HowItWorks />
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

// Section opener: a numbered mono label over a display heading.
function Heading({
  n,
  label,
  children,
  sub,
}: {
  n: string
  label: string
  children: ReactNode
  sub?: string
}) {
  return (
    <div className="reveal max-w-2xl">
      <Label className="mb-4">
        {n} — {label}
      </Label>
      <h2 className="font-display text-2xl tracking-[-0.02em] text-ink sm:text-3xl">{children}</h2>
      {sub && <p className="mt-4 text-md text-ink-muted">{sub}</p>}
    </div>
  )
}

// 16px stroke icons in the app's register: 1.5px, square caps, no fills.
const icons = {
  cube: 'M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5ZM2 5l6 3.5L14 5M8 8.5v6',
  stop: 'M8 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM5.5 5.5h5v5h-5z',
  mac: 'M2.5 3.5h11v7h-11zM1 13h14M6.5 13v-2.5h3V13',
}

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <path d={icons[name]} />
    </svg>
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
      <div className="grid min-h-[70svh] items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.5fr_1fr]">
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
        <Workstation className="w-48 justify-self-center text-ink-subtle sm:w-64 lg:w-72 lg:justify-self-end" />
      </div>
    </Section>
  )
}

// The inspiration's "trusted by" strip, minus the endorsement: the packages
// a workstation arrives with. The track is rendered twice for the loop.
function Ticker() {
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-12 pr-12">
      {cad.map((name) => (
        <li key={name} className="font-display text-lg whitespace-nowrap text-ink-subtle">
          {name}
        </li>
      ))}
    </ul>
  )
  return (
    <Section className="py-8">
      <Label className="reveal mb-5">Runs the CAD stack you already use</Label>
      <div className="reveal overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="ticker">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </Section>
  )
}

function Claims() {
  return (
    <Section className="py-20 sm:py-28">
      <Heading n="01" label="Why meshrun" sub="A workstation for CAD, not a bare machine you have to finish yourself.">
        Open the assembly your Mac can&rsquo;t.
      </Heading>
      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {claims.map((c, i) => (
          <li
            key={c.title}
            style={stagger(i)}
            className="reveal rounded-md border border-hairline bg-surface p-6 transition-colors duration-(--dur-fast) hover:border-hairline-strong"
          >
            <span className="text-accent">
              <Icon name={c.icon} />
            </span>
            <h3 className="mt-5 font-display text-lg tracking-[-0.02em] text-ink">{c.title}</h3>
            <p className="mt-2 text-base text-ink-muted">{c.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function HowItWorks() {
  return (
    <Section id="how" className="py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Heading n="02" label="How it works" sub="Three steps from a laptop that can't to a session that can.">
          Sign in. Pick a workstation. Draw.
        </Heading>
        <ol className="rounded-md border border-hairline bg-surface">
          {steps.map((s, i) => (
            <li
              key={s.title}
              style={stagger(i)}
              className={`reveal grid grid-cols-[3rem_1fr] gap-4 p-6 ${i < steps.length - 1 ? 'rule-draw' : ''}`}
            >
              <span className="font-mono text-sm text-accent tabular-nums">0{i + 1}</span>
              <div>
                <h3 className="font-display text-lg tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="mt-1 text-base text-ink-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
