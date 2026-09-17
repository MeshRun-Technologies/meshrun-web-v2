import type { CSSProperties, ReactNode } from "react";

import { Button, LinkButton } from "./components/Button";
import { cad, claims, faq, steps, tiers } from "./content";
import { Stream } from "./components/Stream";
import { Wordmark } from "./components/Wordmark";
import { Workstation } from "./components/Workstation";
import { useReveal } from "./lib/useReveal";
import { useTheme } from "./lib/useTheme";

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

// Sibling stagger for `reveal` children; capped so a long list never lags.
const stagger = (i: number): CSSProperties =>
  ({ "--stagger": `${Math.min(i, 6) * 80}ms` }) as CSSProperties;

// Display type set one word per span, so each word can carry its own delay.
function Words({
  text,
  className,
  style,
}: {
  text: string;
  className: string;
  style: (i: number) => CSSProperties;
}) {
  return text.split(" ").map((w, i) => (
    <span key={i}>
      <span className={className} style={style(i)}>
        {w}
      </span>{" "}
    </span>
  ));
}

export function App() {
  useReveal();
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
  );
}

/* ------------------------------------------------------------------------ */
/* Structure: one content column with rails; every section ends on a rule
   that bleeds past the column and crosses the rails at two registration
   marks. Rails and marks are hidden on phones, where the gutter is the edge. */

const column = "mx-auto max-w-6xl px-5 sm:px-10 sm:rails";

// Section padding: generous, so each section breathes between its rules.
const band = "py-24 sm:py-36";

function Crosses({ all = false }: { all?: boolean }) {
  return (
    <>
      {all && (
        <>
          <span aria-hidden className="cross -top-1 -left-1 hidden sm:block" />
          <span aria-hidden className="cross -top-1 -right-1 hidden sm:block" />
        </>
      )}
      <span aria-hidden className="cross -bottom-1 -left-1 hidden sm:block" />
      <span aria-hidden className="cross -right-1 -bottom-1 hidden sm:block" />
    </>
  );
}

// A card group drawn as a ruled grid, registration marks on its corners.
function Ruled({
  ordered = false,
  cols = "",
  className = "",
  children,
}: {
  ordered?: boolean;
  cols?: string;
  className?: string;
  children: ReactNode;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <div className={`relative ${className}`}>
      <Crosses all />
      <List className={`ruled ${cols}`}>{children}</List>
    </div>
  );
}

function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rule-bleed">
      <div className={`${column} ${className}`}>
        <Crosses />
        {children}
      </div>
    </section>
  );
}

// Mono, uppercase, tracked: the label register from the app.
function Label({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      style={style}
      className={`font-mono text-2xs tracking-wide text-ink-subtle uppercase tabular-nums ${className}`}
    >
      {children}
    </p>
  );
}

// Section opener: a numbered mono label over a display heading whose words
// fill with ink one after another as the block scrolls into view.
function Heading({
  n,
  label,
  title,
  sub,
}: {
  n: string;
  label: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="reveal max-w-2xl">
      <Label className="mb-4">
        {n} — {label}
      </Label>
      <h2 className="font-display text-2xl tracking-[-0.02em] sm:text-3xl">
        <Words text={title} className="ink" style={stagger} />
      </h2>
      {sub && <p className="mt-4 text-md text-ink-muted">{sub}</p>}
    </div>
  );
}

// 16px stroke icons in the app's register: 1.5px, square caps, no fills.
const icons = {
  cube: "M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5ZM2 5l6 3.5L14 5M8 8.5v6",
  stop: "M8 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM5.5 5.5h5v5h-5z",
  mac: "M2.5 3.5h11v7h-11zM1 13h14M6.5 13v-2.5h3V13",
};

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
  );
}

/* ------------------------------------------------------------------------ */

function ThemeToggle() {
  const { setAppearance } = useTheme();
  // Two states for the visitor, light and dark. The first click leaves
  // "system" for an explicit choice; the page follows the OS until then.
  const flip = () =>
    setAppearance(
      document.documentElement.classList.contains("dark") ? "light" : "dark",
    );
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
        <path
          d="M8 2.5v11a5.5 5.5 0 0 0 0-11Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </button>
  );
}

// In the flow, as the page's first row: it ends on the top rule and scrolls
// away with everything else.
function Nav() {
  return (
    <header className="rule-bleed">
      <div
        className={`${column} grid h-11 grid-cols-[1fr_auto_1fr] items-center`}
      >
        <Crosses />
        <Wordmark />
        <nav className="hidden gap-6 text-sm text-ink-muted sm:flex">
          {[
            ["How it works", "#how"],
            ["Pricing", "#pricing"],
            ["FAQ", "#faq"],
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
  );
}

function Hero() {
  return (
    <Section id="hero">
      <div className="grid items-center gap-12 py-24 sm:py-36 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Label className="row-in mb-6">Cloud CAD workstations for Mac</Label>
          {/* Sized to the viewport so "Run CAD on a Mac" holds one line on a phone. */}
          <h1 className="font-display text-[clamp(36px,10vw,60px)] leading-[1.04] tracking-[-0.02em] text-ink">
            <span className="block">
              <Words
                text="Run CAD on a Mac"
                className="blur-in"
                style={(i) => delay(i * 70)}
              />
            </span>
            <span className="block">
              <Words
                text={"that can’t."}
                className="blur-in"
                style={(i) => delay(280 + i * 70)}
              />
            </span>
          </h1>
          <p
            className="row-in mt-6 max-w-lg text-md text-ink-muted"
            style={delay(420)}
          >
            meshrun provisions a GPU workstation in the cloud, with your CAD
            package installed and licensed, and streams it to your laptop.
            Minutes to a working session, no cloud vocabulary, and no bill that
            keeps running after you close the lid.
          </p>
          <div className="row-in mt-8 flex flex-wrap gap-3" style={delay(520)}>
            <Button variant="primary" size="lg" disabled>
              Request a demo
            </Button>
            <LinkButton href="#how" size="lg" arrow>
              How it works
            </LinkButton>
          </div>
          <Label className="row-in mt-8" style={delay(600)}>
            Per-second billing · Auto-stop · Native Mac app
          </Label>
        </div>
        <Workstation className="w-48 justify-self-center text-ink-subtle sm:w-64 lg:w-72 lg:justify-self-end" />
      </div>
    </Section>
  );
}

// The inspiration's "trusted by" strip, minus the endorsement: the packages
// a workstation arrives with. The track is rendered twice for the loop.
function Ticker() {
  const track = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 gap-12 pr-12"
    >
      {cad.map((name) => (
        <li
          key={name}
          className="font-display text-lg whitespace-nowrap text-ink-subtle"
        >
          {name}
        </li>
      ))}
    </ul>
  );
  return (
    <Section className="py-12">
      <Label className="reveal mb-6">Runs the CAD stack you already use</Label>
      <div className="reveal overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="ticker">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </Section>
  );
}

function Claims() {
  return (
    <Section className={band}>
      <Heading
        n="01"
        label="Why meshrun"
        sub="Three things a bare GPU machine leaves you to do yourself."
        title="Built for CAD, not for cloud admins."
      />
      <Ruled className="mt-12" cols="sm:grid-cols-3">
        {claims.map((c, i) => (
          <li key={c.title} style={stagger(i)} className="reveal p-6">
            <span className="text-accent">
              <Icon name={c.icon} />
            </span>
            <h3 className="mt-5 font-display text-lg tracking-[-0.02em] text-ink">
              {c.title}
            </h3>
            <p className="mt-2 text-base text-ink-muted">{c.body}</p>
          </li>
        ))}
      </Ruled>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section id="how" className={band}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Heading
            n="02"
            label="How it works"
            sub="Three steps from a laptop that can't to a session that can."
            title="Sign in. Pick a workstation. Draw."
          />
          {/* The steps, drawn: the workstation's picture streamed to the Mac.
              It plots as the section scrolls in, and fills the column that the
              heading leaves empty beside the taller list. */}
          <div className="reveal mt-12 hidden lg:block">
            <Stream className="w-full max-w-sm text-ink-subtle" />
          </div>
        </div>
        <Ruled ordered>
          {steps.map((s, i) => (
            <li
              key={s.title}
              style={stagger(i)}
              className="reveal grid grid-cols-[3rem_1fr] gap-4 p-6"
            >
              <span className="font-mono text-sm text-accent tabular-nums">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg tracking-[-0.02em] text-ink">
                  {s.title}
                </h3>
                <p className="mt-1 text-base text-ink-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </Ruled>
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section id="pricing" className={band}>
      <Heading
        n="03"
        label="Pricing"
        sub="Three workstation classes. Pay per second while one is running; nothing while it is stopped."
        title="Three classes of workstation."
      />
      <Ruled className="mt-12" cols="sm:grid-cols-3">
        {tiers.map((t, i) => (
          <li
            key={t.name}
            style={stagger(i)}
            className={`reveal relative flex flex-col p-6 ${t.featured ? "featured order-first sm:order-0" : ""}`}
          >
            {t.featured && (
              <Label className="absolute -top-2 left-5 bg-bg px-1.5 text-accent">
                Most popular
              </Label>
            )}
            <h3 className="font-display text-lg tracking-[-0.02em] text-ink">
              {t.name}
            </h3>
            <Label className="mt-1 normal-case">
              {t.gpu} · {t.spec}
            </Label>
            <p className="mt-6 font-display text-2xl tracking-[-0.02em] text-ink">
              {t.price}
            </p>
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
              variant={t.featured ? "primary" : "secondary"}
              size="lg"
              disabled
              className="mt-8 w-full justify-center"
            >
              {t.cta}
            </Button>
          </li>
        ))}
      </Ruled>
      <Label className="reveal mt-6">
        [Specs indicative; final hardware and rates to be confirmed.]
      </Label>
    </Section>
  );
}

function Faq() {
  return (
    <Section id="faq" className={band}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Heading
          n="04"
          label="FAQ"
          title="Questions, before you ask for a demo."
        />
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
  );
}

function Closing() {
  return (
    <Section className={`${band} text-center`}>
      <div className="reveal mx-auto flex max-w-xl flex-col items-center">
        <Workstation className="w-24 text-ink-subtle" />
        <h2 className="mt-8 font-display text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
          Open the assembly your Mac can&rsquo;t.
        </h2>
        <p className="mt-4 text-md text-ink-muted">
          Minutes to a working CAD session. No cloud vocabulary. No bill after
          you close the lid.
        </p>
        <Button variant="primary" size="lg" disabled className="mt-8">
          Request a demo
        </Button>
        <Label className="mt-6">Early access · [date]</Label>
      </div>
    </Section>
  );
}

function Footer() {
  const links = [
    ["How it works", "#how"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
  ];
  return (
    <footer>
      {/* Tagline and link columns above the wordmark, set across the whole
          column width; then the bottom rule, then a one-line legal bar. */}
      <Section className="py-12 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <p className="font-display text-xl tracking-[-0.02em] text-ink sm:text-2xl">
            Cloud CAD workstations for Mac.
          </p>
          <nav className="grid gap-x-16 gap-y-2 text-sm sm:grid-cols-2">
            <Label>Product</Label>
            <ul className="flex flex-col gap-2 text-ink">
              {links.map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Each letter rises into place from below the clip as the footer
            scrolls in; the observer lifts .pre from the line. */}
        <div className="@container mt-16 sm:mt-20">
          {/* Sized to the column, not the viewport: the word spans rail to rail.
              "meshrun" advances 3.89em at this tracking; the end padding gives
              the last letter back the tracking it would otherwise lose to the clip. */}
          <p
            aria-hidden
            className="lift pe-[0.05em] font-display text-[25.6cqw] leading-none tracking-[-0.05em] whitespace-nowrap text-ink select-none"
          >
            {[..."meshrun"].map((c, i) => (
              <span key={i} style={stagger(i)}>
                {c}
              </span>
            ))}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-ink-subtle">
          <span>© 2026 meshrun</span>
          <ThemeToggle />
        </div>
      </Section>
    </footer>
  );
}
