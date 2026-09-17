import type { CSSProperties, ReactNode } from 'react'

import { Button, LinkButton } from './components/Button'
import { cad, claims, faq, steps, tiers } from './content'
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
        <Pricing />
        <Faq />
        <Closing />
      </main>
      <Footer />
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
      <span aria-hidden className="cross -bottom-1 -left-1 hidden sm:block" />
      <span aria-hidden className="cross -right-1 -bottom-1 hidden sm:block" />
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

function Pricing() {
  return (
    <Section id="pricing" className="py-20 sm:py-28">
      <Heading n="03" label="Pricing" sub="Three workstation classes. Pay per second while one is running; nothing while it is stopped.">
        A tier for the work in front of you.
      </Heading>
      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {tiers.map((t, i) => (
          <li
            key={t.name}
            style={stagger(i)}
            className={`reveal relative flex flex-col rounded-md border bg-surface p-6 ${
              t.featured ? 'order-first border-ink sm:order-none' : 'border-hairline'
            }`}
          >
            {t.featured && (
              <Label className="absolute -top-2 left-5 bg-surface px-1.5 text-accent">
                Most popular
              </Label>
            )}
            <h3 className="font-display text-lg tracking-[-0.02em] text-ink">{t.name}</h3>
            <Label className="mt-1 normal-case">
              {t.gpu} · {t.spec}
            </Label>
            <p className="mt-6 font-display text-2xl tracking-[-0.02em] text-ink">{t.price}</p>
            <p className="mt-2 text-base text-ink-muted">{t.fit}</p>
            <ul className="mt-6 flex flex-col gap-2 border-t border-hairline pt-6 text-sm text-ink">
              {t.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                    aria-hidden
                    className="text-accent"
                  >
                    <path d="M3 8.5l3 3 7-7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <Button
              variant={t.featured ? 'primary' : 'secondary'}
              size="lg"
              disabled
              className="mt-8 w-full justify-center"
            >
              {t.cta}
            </Button>
          </li>
        ))}
      </ul>
      <Label className="reveal mt-6">[Specs indicative; final hardware and rates to be confirmed.]</Label>
    </Section>
  )
}

function Faq() {
  return (
    <Section id="faq" className="py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Heading n="04" label="FAQ">Questions, before you ask for a demo.</Heading>
        <div className="border-t border-hairline">
          {faq.map((f, i) => (
            <details
              key={f.q}
              style={stagger(i)}
              className="disclosure reveal group border-b border-hairline"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-base text-ink transition-colors duration-(--dur-fast) hover:text-accent">
                {f.q}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  aria-hidden
                  className="shrink-0 text-ink-subtle"
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </summary>
              <p className="max-w-xl pb-6 text-base text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Closing() {
  return (
    <Section className="py-24 text-center sm:py-32">
      <div className="reveal mx-auto flex max-w-xl flex-col items-center">
        <Workstation className="w-24 text-ink-subtle" />
        <h2 className="mt-8 font-display text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
          Open the assembly your Mac can&rsquo;t.
        </h2>
        <p className="mt-4 text-md text-ink-muted">
          Minutes to a working CAD session. No cloud vocabulary. No bill after you close the lid.
        </p>
        <Button variant="primary" size="lg" disabled className="mt-8">
          Request a demo
        </Button>
        <Label className="mt-6">Early access · [date]</Label>
      </div>
    </Section>
  )
}

function Footer() {
  return (
    <footer>
      <div className={`${column} flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex flex-col gap-2">
          <Wordmark />
          <p className="text-sm text-ink-muted">Cloud CAD workstations for Mac.</p>
        </div>
        <nav className="flex gap-6 text-sm text-ink-muted">
          {[
            ['How it works', '#how'],
            ['Pricing', '#pricing'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="transition-colors duration-(--dur-fast) hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-ink-subtle">
          <span>© 2026 meshrun</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
