import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

import { Button, LinkButton } from "./components/Button";
import {
  contact,
  footer,
  pillars,
  steps,
  targets,
  targetsNote,
  trades,
  yours,
} from "./content";
import { column, Crosses } from "./components/layout";
import { Nav, NavSentinel } from "./components/Nav";
import { ProductCycler } from "./components/ProductCycler";
import { ScrollCue } from "./components/ScrollCue";
import { Sheet } from "./components/Sheet";
import { Stream } from "./components/Stream";
import { ThemeToggle } from "./components/ThemeToggle";
import { Wordmark } from "./components/Wordmark";
import { Workstation } from "./components/Workstation";
import { useReveal } from "./lib/useReveal";

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
        <Targets />
        <Pillars />
        <Cost />
        <Session />
        <Yours />
        <Pricing />
        <Closing />
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------------ */

// Section padding: generous, so each section breathes between its rules.
const band = "py-24 sm:py-36";

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
    // self-start: as a grid child the wrapper would stretch to the row and
    // carry the crosses past the box's corners.
    <div className={`relative self-start ${className}`}>
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
    <section id={id} className="rule-bleed scroll-mt-11">
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

// 16px stroke icons in the app's register: 1.5px, square caps, no fills. Drawn
// here rather than pulled from an icon set, so they share the site's pen.
const icons = {
  monitor: "M2.5 3.5h11v7h-11zM1 13h14M6.5 13v-2.5h3V13",
  gauge: "M2.5 12.5a5.5 5.5 0 0 1 11 0M8 12.5 11.2 8M4 7.4l.8.5M8 5.2v1M12 7.4l-.8.5",
  cpu: "M5 5h6v6H5zM2.5 2.5h11v11h-11zM6 .5v2M10 .5v2M6 13.5v2M10 13.5v2M.5 6h2M.5 10h2M13.5 6h2M13.5 10h2",
  pointer: "M4 2.5 11.5 7.3 8.3 8.2 9.7 12.1 7.8 12.8 6.4 8.9 4 11.2Z",
  layers: "M8 1.5 14.5 5 8 8.5 1.5 5ZM2 8.2 8 11.5 14 8.2",
  drive: "M2 4.5h12v7H2zM4.5 8h4M11.5 7.5v1",
  shield: "M8 1.5 13.5 4v4.4c0 3-2.4 5.1-5.5 6.1-3.1-1-5.5-3.1-5.5-6.1V4ZM5.5 7.8l2 2 3.2-3.4",
  terminal: "M2.5 2.5h11v11h-11zM5 6l2 2-2 2M8.5 10.5h3",
  server: "M2 2.5h12v4.5H2zM2 9h12v4.5H2zM4.5 4.75h1.5M4.5 11.25h1.5",
  zap: "M9.2 1.5 3.5 9h4l-.7 5.5L12.5 7h-4Z",
  lock: "M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3 7h10v6.5H3z",
  coin: "M8 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM8 3.6v8.8M10 6.2a2 2 0 0 0-2-1.2 1.8 1.8 0 0 0 0 3.5 1.8 1.8 0 0 1 0 3.5 2 2 0 0 1-2-1.2",
  check: "M3 8.5 6 11.5 13 4.5",
  cross: "M4 4 12 12M12 4 4 12",
};

// The hover outline of a ruled cell; the `ruled` utility plots it.
function Outline() {
  return (
    <svg aria-hidden className="trace">
      <rect width="100%" height="100%" pathLength={1} />
    </svg>
  );
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
  );
}

// The landing: a full pane of drawings with the hook sitting in the clearing
// at its centre. Come near a part and it dimensions itself; move onto it and
// it opens into the linework underneath.
const HOOK = "The workstation era is over.";

function Hero() {
  return (
    <section
      id="hero"
      className="rule-bleed relative flex h-svh min-h-[560px] w-full flex-col justify-center overflow-hidden"
    >
      <Sheet />
      <NavSentinel />
      <ScrollCue />

      <div className="relative z-10 flex flex-col items-center px-5 pb-10 text-center sm:px-10">
        <h1 className="max-w-[16ch] font-display text-[clamp(36px,7.2vw,60px)] leading-[1.04] tracking-[-0.02em] text-balance text-ink">
          <Words
            text={HOOK}
            className="blur-in"
            style={(i) => delay(120 + i * 70)}
          />
        </h1>

        <p
          className="row-in mt-7 flex flex-wrap items-center justify-center gap-x-[0.4em] gap-y-2 text-[clamp(17px,2.9vw,24px)] leading-tight text-ink-muted sm:mt-9"
          style={delay(520)}
        >
          {/* The cycler carries the whole sentence for screen readers, so the
              words either side of it are decoration. */}
          <span aria-hidden>Run</span>
          <ProductCycler />
          <span aria-hidden>on anything.</span>
        </p>
      </div>
    </section>
  );
}

// 01 — the measured claims, as a ruled pair of rows.
function Targets() {
  return (
    <Section id="platform" className={band}>
      <Heading
        n="01"
        label="Platform"
        title="CAD in the Cloud"
        sub="MeshRun streams full windows CAD from powerful cloud PCs straight to your screen."
      />
      <Ruled className="mt-12" cols="sm:grid-cols-2">
        {targets.map((t, i) => (
          <li key={t.value} style={stagger(i)} className="reveal p-6">
            <Outline />
            <div className="flex items-start gap-4">
              <span className="mt-0.5 text-accent">
                <Icon name={t.icon} />
              </span>
              <div>
                <Label>{t.label}</Label>
                <h3 className="mt-2 font-display text-lg tracking-[-0.02em] text-ink">
                  {t.value}
                </h3>
                <p className="mt-2 text-base text-ink-muted">{t.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </Ruled>
      <Label className="reveal mt-6">{targetsNote}</Label>
    </Section>
  );
}

// 02 — what the product is. One pillar open at a time: `name` on the rows makes
// the browser close the others, so the accordion needs no state of its own.
function Pillars() {
  return (
    <Section id="experience" className={band}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Heading
          n="02"
          label="Experience"
          title="What We Deliver"
          sub="Not a clunky band-aid solution. Just your apps running cleanly on Mac."
        />
        <div className="border-t border-hairline">
          {pillars.map((p, i) => (
            <details
              key={p.title}
              name="pillar"
              open={i === 0}
              style={stagger(i)}
              className="disclosure reveal group border-b border-hairline"
            >
              <summary className="flex cursor-pointer items-center gap-4 py-5 text-ink transition-colors duration-(--dur-fast) hover:text-accent">
                <span className="text-accent">
                  <Icon name={p.icon} />
                </span>
                <h3 className="flex-1 font-display text-lg tracking-[-0.02em]">
                  {p.title}
                </h3>
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
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </summary>
              <p className="pb-5 pl-9 text-base text-ink-muted">{p.body}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/**
 * No pointer means no hover, so on a phone the rows turn over as they pass the
 * middle of the screen instead of waiting for one that never comes.
 */
function useFlipOnPass(ref: RefObject<HTMLUListElement | null>) {
  useEffect(() => {
    const list = ref.current;
    if (!list || matchMedia("(hover: hover)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.flip = entry.isIntersecting
            ? "on"
            : "off";
        }
      },
      // A band across the middle of the viewport, one row deep.
      { rootMargin: "-46% 0px -46% 0px" },
    );
    for (const row of list.querySelectorAll("li")) observer.observe(row);
    return () => observer.disconnect();
  }, [ref]);
}

// 03 — the trade, one row at a time: what buying costs, what renting returns.
function Cost() {
  const listRef = useRef<HTMLUListElement>(null);
  useFlipOnPass(listRef);

  return (
    <Section id="how" className={band}>
      <Heading
        n="03"
        label="How it works"
        title="You don’t need to own a workstation, You need power for a few hours a week."
      />
      <ul ref={listRef} className="mt-12 border-t border-hairline">
        {trades.map((t, i) => (
          <li
            key={t.cost}
            data-flip="off"
            style={stagger(i)}
            className="trade reveal group flex items-center gap-4 border-b border-hairline py-5"
          >
            <span className="relative inline-grid size-4 shrink-0 place-items-center">
              <span className="was col-start-1 row-start-1 text-ink-subtle">
                <Icon name="cross" />
              </span>
              <span className="now col-start-1 row-start-1 text-accent">
                <Icon name="check" />
              </span>
            </span>
            <span className="grid flex-1">
              <span className="was col-start-1 row-start-1 text-md text-ink-muted">
                {t.cost}
              </span>
              <span className="now col-start-1 row-start-1 text-md text-ink">
                {t.gain}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// 04 — the session, start to finish.
function Session() {
  return (
    <Section id="session" className={band}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Heading
            n="04"
            label="A session"
            title="How a session works"
            sub="Everything from opening the app to getting to work takes as little as 45 seconds."
          />
          {/* The whole thing drawn: the workstation's picture streamed to the
              Mac. It plots as the section scrolls in. */}
          <div className="reveal mt-12 hidden lg:block">
            <Stream className="w-full max-w-sm text-ink-subtle" />
          </div>
        </div>
        <Ruled ordered>
          {steps.map((s, i) => (
            <li
              key={s.step}
              style={stagger(i)}
              className="reveal grid grid-cols-[4.5rem_1fr] gap-4 p-6"
            >
              <Outline />
              <Label className="text-accent">{s.step}</Label>
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

// 05 — files and licensing.
function Yours() {
  return (
    <Section id="privacy" className={band}>
      <Heading
        n="05"
        label="Privacy &amp; Compliance"
        title="Your files and your licence stay yours."
        sub="Renting compute shouldn’t mean giving up control of your files or buying software twice."
      />
      <Ruled className="mt-12" cols="sm:grid-cols-3">
        {yours.map((y, i) => (
          <li key={y.title} style={stagger(i)} className="reveal p-6">
            <Outline />
            <span className="text-accent">
              <Icon name={y.icon} />
            </span>
            <h3 className="mt-5 font-display text-lg tracking-[-0.02em] text-ink">
              {y.title}
            </h3>
            <p className="mt-2 text-base text-ink-muted">{y.body}</p>
          </li>
        ))}
      </Ruled>
    </Section>
  );
}

// 06 — pricing, which is a notice rather than a table until there is one.
function Pricing() {
  return (
    <Section id="pricing" className={band}>
      <Heading
        n="06"
        label="Pricing"
        title="Pay for what you need."
        sub="Two simple plans with monthly GPU hours. Running into a busy project week? Top up extra hours anytime without upgrading your plan. We don’t sell licenses, get that from your software provider."
      />
      <div className="reveal mt-12 flex max-w-2xl items-start gap-4 border border-hairline bg-surface p-6">
        <span className="mt-0.5 shrink-0 text-accent">
          <Icon name="coin" />
        </span>
        <p className="text-base text-ink-muted">
          <span className="text-ink">Pricing Coming Soon.</span> We&rsquo;re
          still in development, and will post information when it&rsquo;s
          available.
        </p>
      </div>
    </Section>
  );
}

function Closing() {
  return (
    <Section className={`${band} text-center`}>
      <div className="reveal mx-auto flex max-w-xl flex-col items-center">
        <Workstation className="w-24 text-ink-subtle" />
        <h2 className="mt-8 font-display text-2xl tracking-[-0.02em] text-balance text-ink sm:text-3xl">
          Carry the laptop you love. Run the software it can&rsquo;t.
        </h2>
        <p className="mt-4 text-md text-ink-muted">
          MeshRun isn&rsquo;t available yet. Tell us how you want to get more
          out of your laptop and we&rsquo;ll get in touch.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" disabled>
            Request Early Access
          </Button>
          <LinkButton href={`mailto:${contact}`} size="lg">
            {contact}
          </LinkButton>
        </div>
        <Label className="mt-6">
          We don&rsquo;t sell licences · Not affiliated with Autodesk.
        </Label>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer>
      <Section className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="reveal max-w-xs text-md text-ink-muted">
              {footer.blurb}
            </p>
            <Label className="reveal mt-5">{footer.entity}</Label>
          </div>
          <div className="reveal flex flex-col gap-4">
            {footer.notices.map((notice) => (
              <p key={notice.slice(0, 24)} className="text-sm text-ink-subtle">
                {notice}
              </p>
            ))}
          </div>
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
      </Section>
      <div
        className={`${column} flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between`}
      >
        <Wordmark />
        <div className="flex items-center gap-6">
          <p className="text-sm text-ink-muted">{footer.copyright}</p>
          <a
            href={`mailto:${contact}`}
            className="text-sm text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
          >
            {contact}
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
