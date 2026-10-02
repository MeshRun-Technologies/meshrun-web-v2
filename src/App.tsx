import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { Button, LinkButton } from "./components/Button";
import { Cursor } from "./components/Cursor";
import { EarlyAccess, openEarlyAccess } from "./components/EarlyAccess";
import { HeroField } from "./components/HeroField";
import { column } from "./components/layout";
import { Nav, NavSentinel, openMenu } from "./components/Nav";
import { useHeroHandoff } from "./components/ScrollCue";
import { Wordmark } from "./components/Wordmark";
import { contact, footer, pillars, steps, targets, targetsNote, trades, yours } from "./content";
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

/** The blob's four tones, in an order where no two neighbours match. */
const TONES = ["ember", "dune", "ocean", "eclipse"] as const;

/**
 * Lit things follow the cursor: whatever [data-glow] it is over learns where
 * it is (--mx, --my, as shares of its box) and its light moves there. One
 * listener for the page, writing straight to the element, so nothing renders.
 */
function useGlow() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    const onMove = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-glow]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(((event.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((event.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
}

export function App() {
  useReveal();
  useGlow();
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
      <EarlyAccess />
      <Cursor />
    </>
  );
}

/* ------------------------------------------------------------------------ */
// Sections are full-bleed tiles in two blacks, alternating down the page the
// way a product page alternates its surfaces: the change of tone is the
// divider, so there are no rules between them.

function Section({
  id,
  alt = false,
  className = "",
  children,
}: {
  id?: string;
  alt?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-16 ${alt ? "bg-surface" : "bg-bg"}`}>
      <div className={`${column} ${className}`}>{children}</div>
    </section>
  );
}

const band = "py-24 sm:py-32 lg:py-40";

// Section opener, set to the left: wide capitals whose words fill with ink
// one after another as the block scrolls in.
function Heading({ title, sub, className = "" }: { title: string; sub?: string; className?: string }) {
  return (
    <div className={`reveal flex max-w-3xl flex-col ${className}`}>
      <h2 className="display text-[clamp(32px,4.6vw,60px)] leading-[1] text-balance">
        <Words text={title} className="ink" style={stagger} />
      </h2>
      {sub && <p className="mt-6 max-w-[44ch] text-md text-ink-muted text-pretty">{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

// The landing: the live render, the whole object, centred in a black pane
// with the promise set across it. The line and the action sit at the foot,
// to the left.
const HOOK = "CAD without the tower";

function Hero() {
  useHeroHandoff();
  return (
    <section id="hero" className="stage relative h-svh min-h-[680px] w-full overflow-hidden">
      <HeroField />
      <div aria-hidden className="hero-veil" />
      <NavSentinel />

      <header className={`${column} absolute inset-x-0 top-0 z-10 grid h-16 grid-cols-[1fr_auto] items-center sm:h-20 sm:grid-cols-[1fr_auto_1fr]`}>
        <Wordmark />
        <nav aria-label="Main" className="hidden gap-8 text-sm text-ink-muted sm:flex">
          <a href="#platform" className="link">Platform</a>
          <a href="#session" className="link">How it works</a>
          <a href="#pricing" className="link">Pricing</a>
        </nav>
        <span className="flex items-center gap-1 justify-self-end">
          <Button onClick={openEarlyAccess}>Request early access</Button>
          <button
            type="button"
            onClick={openMenu}
            aria-label="Open menu"
            className="press -mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink-muted hover:text-ink sm:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
              <path d="M2 5h12M2 11h12" />
            </svg>
          </button>
        </span>
      </header>

      {/* Set on the sphere's centre, which is the pane's. */}
      <h1 className="display absolute inset-x-0 top-1/2 z-10 mx-auto max-w-[11ch] -translate-y-1/2 px-5 text-center text-[clamp(40px,7.4vw,104px)] leading-[0.98] text-balance">
        <Words text={HOOK} className="blur-in" style={(i) => delay(160 + i * 80)} />
      </h1>

      <div className={`${column} absolute inset-x-0 bottom-0 z-10 flex flex-col gap-6 pb-10 sm:flex-row sm:items-center sm:gap-10 sm:pb-12`}>
        <p className="row-in max-w-[30ch] text-[clamp(16px,1.5vw,19px)] text-ink-muted" style={delay(620)}>
          Windows-only CAD, on the Mac you already own.
        </p>
        <span className="row-in" style={delay(720)}>
          <Button variant="primary" size="lg" arrow onClick={openEarlyAccess}>
            Request early access
          </Button>
        </span>
      </div>
    </section>
  );
}

// The measured claims, as four wide figures. Under the cursor a figure fills
// with its own slice of the blob; the others step back.
function Targets() {
  return (
    <Section id="platform" className={`${band} text-center`}>
      <Heading
        className="mx-auto items-center"
        title="CAD in the cloud"
        sub="meshrun streams full Windows CAD from powerful cloud PCs straight to your screen."
      />
      <ul className="figures mt-16 grid grid-cols-2 gap-x-6 gap-y-14 sm:mt-24 lg:grid-cols-4">
        {targets.map((t, i) => (
          <li
            key={t.figure}
            data-glow
            data-tone={TONES[i % TONES.length]}
            style={stagger(i)}
            className="reveal flex flex-col items-center gap-3 py-4"
          >
            <span className="display relative text-[clamp(32px,4vw,56px)] leading-none whitespace-nowrap">
              {t.figure}
              <span aria-hidden className="figure-glow">
                {t.figure}
              </span>
            </span>
            <span className="max-w-[18ch] text-base text-ink-muted">{t.caption}</span>
          </li>
        ))}
      </ul>
      <p className="reveal mt-16 text-sm text-ink-subtle">{targetsNote}</p>
    </Section>
  );
}

// What the product is: the object, live, at the centre of the four things it
// gives you, laid out round it like callouts on a drawing.
const PLACE = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-3 lg:row-start-2",
];

/** Where the blob turns for each tile: it only rotates, it never comes closer. */
const TONE_VIEWS = [
  { azimuth: 200, polar: 180, zoom: 1 },
  { azimuth: 330, polar: 160, zoom: 1 },
  { azimuth: 250, polar: 135, zoom: 1 },
  { azimuth: 360, polar: 150, zoom: 1 },
] as const;

function Pillars() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <Section id="experience" alt className={band}>
      <Heading title="What we deliver" sub="Not a clunky band-aid solution. Just your apps running cleanly on Mac." />
      <div className="tiles mt-14 grid gap-3 sm:mt-20 lg:grid-cols-[1fr_1.25fr_1fr] lg:grid-rows-2">
        <div
          aria-hidden
          className="relative order-first aspect-square overflow-hidden rounded-lg bg-bg lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:aspect-auto"
        >
          <HeroField view={hovered === null ? undefined : TONE_VIEWS[hovered % TONE_VIEWS.length]} />
        </div>
        {pillars.map((p, i) => (
          <article
            key={p.title}
            data-tile
            data-glow
            data-tone={TONES[i % TONES.length]}
            style={stagger(i)}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            className={`reveal flex min-h-60 flex-col justify-end gap-3 rounded-lg border border-hairline-strong bg-bg p-8 ${PLACE[i]}`}
          >
            <h3 className="text-xl font-medium tracking-[-0.02em]">{p.title}</h3>
            <p className="muted text-base text-ink-muted">{p.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

// The trade, as a switch big enough to notice, that flips to renting as the
// reader scrolls it up the screen: owning the box is flat and grey, renting
// floods the panel with the render. A click takes it over from there.
function Cost() {
  const [rent, setRent] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // Until someone picks a side, the switch follows the scroll: it owns the
  // box while the panel is below the middle of the screen, and rents once
  // the panel reaches it (and back again on the way up).
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (touched.current) return;
        if (entry.isIntersecting) setRent(true);
        else if (entry.boundingClientRect.top > innerHeight / 2) setRent(false);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const flip = (value: boolean) => {
    touched.current = true;
    setRent(value);
  };
  const rows = trades.map((t) => (rent ? t.gain : t.cost));
  const options: [string, boolean][] = [
    ["Own a workstation", false],
    ["Rent with meshrun", true],
  ];

  return (
    <Section id="how" className={band}>
      <Heading
        title="Rent the power, not the box"
        sub="You don’t need to own a workstation. You need power for a few hours a week."
      />
      <div
        ref={panel}
        data-rent={rent}
        className="cost-panel reveal mt-14 rounded-lg border border-hairline-strong bg-surface p-6 sm:mt-20 sm:p-10"
      >
        <div role="group" aria-label="Compare" className="relative grid grid-cols-2 rounded-full bg-bg/70 p-1.5">
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-ink transition-transform duration-700 ease-expressive"
            style={{ transform: rent ? "translateX(100%)" : "none" }}
          />
          {options.map(([label, value]) => (
            <button
              key={label}
              type="button"
              aria-pressed={rent === value}
              onClick={() => flip(value)}
              className={`press relative h-16 rounded-full text-[clamp(15px,1.8vw,22px)] font-medium tracking-[-0.01em] transition-colors duration-500 sm:h-20 ${
                rent === value ? "text-on-cta" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ul key={String(rent)} aria-live="polite" className="mt-10 grid gap-x-12 sm:mt-12 lg:grid-cols-2">
          {rows.map((row, i) => (
            <li
              key={row}
              style={delay(i * 60)}
              className={`row-in flex items-baseline gap-4 border-t py-5 text-[clamp(18px,1.9vw,24px)] leading-snug tracking-[-0.015em] ${
                rent ? "border-black/15" : "border-hairline-strong text-ink-subtle"
              }`}
            >
              <span aria-hidden className="w-5 shrink-0 text-base">
                {rent ? "+" : "−"}
              </span>
              {row}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// The machine's states, as the app shows them, keyed to the steps of a session:
// where the camera sits on the live blob for each, closing in and coming
// round as the session moves on.
const MACHINE = [
  { state: "asleep", label: "Asleep", detail: "Not using hours", view: { azimuth: 270, polar: 180, zoom: 0.78 } },
  { state: "picked", label: "Revit", detail: "~/Projects/tower-B", view: { azimuth: 225, polar: 162, zoom: 1.0 } },
  { state: "booting", label: "Waking up", detail: "Mounting your folder", view: { azimuth: 320, polar: 142, zoom: 1.35 } },
  { state: "live", label: "Live", detail: "Hours stop when you close it", view: { azimuth: 380, polar: 124, zoom: 1.85 } },
] as const;

/** How far apart the steps sit in the scroll, as a share of the screen. */
const STEP_SPAN = 0.5;
/** Long enough for the smooth scroll to land before the next tick counts. */
const STEP_MS = 760;

/**
 * The session as the app runs it, as one pinned screen. Each wheel tick moves
 * one step, like the landing's hand-off, so four ticks cover it: the step's
 * words change on the left, and on the right the machine, the live render,
 * comes round and closes in, warming from asleep to live. The pane is ordinary scroll underneath, so the
 * scrollbar, keys and trackpads all still move through it. Phones get the
 * steps as a plain list.
 */
function Session() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const pane = useRef<HTMLDivElement>(null);
  const markers = useRef<HTMLDivElement>(null);

  // Which step is current: whichever marker the middle of the screen is in.
  useEffect(() => {
    const items = [...(markers.current?.children ?? [])];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = items.indexOf(entry.target);
          activeRef.current = i;
          setActive(i);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  // One tick, one step, while the pane is pinned; past either end the page
  // scrolls on as usual.
  useEffect(() => {
    let moving = false;
    const onWheel = (event: WheelEvent) => {
      const el = pane.current;
      if (!el || !matchMedia("(min-width: 1024px)").matches || !event.deltaY) return;
      if (document.documentElement.style.overflow === "hidden") return;
      const rect = el.getBoundingClientRect();
      const pinned = rect.top <= 2 && rect.bottom >= innerHeight - 2;
      if (!pinned) return;
      if (moving) {
        event.preventDefault();
        return;
      }
      const next = activeRef.current + (event.deltaY > 0 ? 1 : -1);
      if (next < 0 || next >= MACHINE.length) return;
      event.preventDefault();
      moving = true;
      const top = scrollY + rect.top + next * STEP_SPAN * innerHeight;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      window.setTimeout(() => {
        moving = false;
      }, STEP_MS);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Phones: the step whose card is in the middle of the screen.
  const [mobileActive, setMobileActive] = useState(0);
  const mobileList = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const items = [...(mobileList.current?.children ?? [])];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setMobileActive(items.indexOf(entry.target));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const machine = MACHINE[active];
  const step = steps[active];

  return (
    <section id="session" className="scroll-mt-16 bg-surface">
      {/* Phones: the steps as a list, each with the state it puts the machine in. */}
      <div className={`${column} py-24 sm:py-32 lg:hidden`}>
        <Heading
          title="From Dock to design"
          sub="Everything from opening the app to getting to work takes as little as 45 seconds."
        />
        {/* The machine rides along at the top, coming round and closing in. */}
        <div className="sticky top-20 z-10 mt-10 flex justify-end">
          <div data-state={MACHINE[mobileActive].state} className="machine relative grid size-28 place-items-center">
            <div className="machine-orb relative size-full overflow-hidden rounded-full">
              <HeroField view={MACHINE[mobileActive].view} />
            </div>
          </div>
        </div>
        <ol ref={mobileList} className="-mt-28">
          {steps.map((s, i) => (
            <li key={s.step} className="flex flex-col gap-4 border-t border-hairline-strong py-10 pr-32">
              <span className="text-sm text-accent">{s.step.replace("Step ", "")}</span>
              <h3 className="display text-[clamp(26px,6vw,36px)] leading-[1.02]">{s.title}</h3>
              <p className="max-w-[38ch] text-md text-ink-muted">{s.body}</p>
              <span className="mt-1 inline-flex w-fit items-center gap-2.5 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">
                {MACHINE[i].label}
                <span className="text-ink-subtle">{MACHINE[i].detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop: one pinned screen, stepped through. */}
      <div
        ref={pane}
        className="relative hidden lg:block"
        style={{ height: `calc(100svh + ${(MACHINE.length - 1) * STEP_SPAN * 100}svh)` }}
      >
        <div ref={markers} aria-hidden className="pointer-events-none absolute inset-0">
          {MACHINE.map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0"
              style={{
                top: i === 0 ? 0 : `${(i * STEP_SPAN + STEP_SPAN / 2) * 100}svh`,
                height: `${(i === 0 || i === MACHINE.length - 1 ? STEP_SPAN * 1.5 : STEP_SPAN) * 100}svh`,
              }}
            />
          ))}
        </div>

        <div className="sticky top-0 h-svh">
          <div className={`${column} grid h-full grid-cols-[1fr_1fr] items-center gap-20 pt-16`}>
            <div className="flex flex-col gap-14">
              <Heading
                title="From Dock to design"
                sub="Everything from opening the app to getting to work takes as little as 45 seconds."
              />
              <div className="flex flex-col gap-6">
                <div aria-hidden className="flex gap-2">
                  {MACHINE.map((m, i) => (
                    <span
                      key={m.state}
                      className={`h-1 w-10 rounded-full transition-colors duration-500 ${i <= active ? "bg-accent" : "bg-hairline-strong"}`}
                    />
                  ))}
                </div>
                <div key={active} className="step-in flex min-h-52 flex-col gap-4" style={{ "--dir": 1 } as CSSProperties}>
                  <span className="text-sm text-accent">{step.step.replace("Step ", "")} of 04</span>
                  <h3 className="display text-[clamp(30px,3.2vw,46px)] leading-[1.02]">{step.title}</h3>
                  <p className="max-w-[40ch] text-md text-ink-muted">{step.body}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-10">
              <div data-state={machine.state} className="machine relative grid size-[min(42vw,72svh,640px)] place-items-center">
                <div className="machine-orb relative size-full overflow-hidden rounded-full">
                  <HeroField view={machine.view} />
                </div>
              </div>
              <div role="status" className="flex items-center gap-3 rounded-full border border-ink/15 bg-bg/60 px-5 py-2.5 text-[15px]">
                <span className={`size-2 rounded-full ${machine.state === "live" ? "bg-accent" : "border border-ink/40"}`} />
                <span className="text-ink">{machine.label}</span>
                <span className="text-ink-subtle">{machine.detail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Files and licensing, as three tiles.
function Yours() {
  return (
    <Section id="privacy" className={band}>
      <Heading
        title="Your files and licence stay yours"
        sub="Renting compute shouldn’t mean giving up control of your files or buying software twice."
      />
      <ul className="tiles mt-14 grid gap-3 sm:mt-20 lg:grid-cols-3">
        {yours.map((y, i) => (
          <li
            key={y.title}
            data-tile
            data-glow
            data-tone={(["ember", "ocean", "dune"] as const)[i % 3]}
            style={stagger(i)}
            className="reveal flex min-h-60 flex-col gap-3 rounded-lg border border-hairline-strong bg-surface p-8 pt-24"
          >
            <h3 className="text-xl font-medium tracking-[-0.02em]">{y.title}</h3>
            <p className="muted text-base text-ink-muted">{y.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// Pricing, which is a notice rather than a table until there is one.
function Pricing() {
  return (
    <Section id="pricing" alt className={band}>
      <div className="grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:items-end lg:gap-20">
        <Heading
          title="Pay for what you need"
          sub="Plans sized to how you actually work, so you never pay for hours you don’t use. Licences come from your software provider, not us."
        />
        <div className="reveal flex flex-col gap-6 rounded-lg border border-hairline-strong bg-bg p-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <p className="display text-[clamp(22px,2.4vw,32px)] leading-tight">Pricing coming soon</p>
            <p className="max-w-[36ch] text-base text-ink-muted">
              We’re still in development, and will post plans when they’re ready.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={openEarlyAccess}>
            Request early access
          </Button>
        </div>
      </div>
    </Section>
  );
}

function Closing() {
  return (
    <section className="relative flex min-h-[900px] items-center justify-center overflow-hidden bg-bg py-24 text-center">
      <HeroField view={{ azimuth: 300, polar: 160, zoom: 1.45 }} />
      <div aria-hidden className="closing-veil absolute inset-0" />
      <div className={`${column} reveal relative flex flex-col items-center gap-6`}>
        <h2 className="display max-w-[12ch] text-[clamp(40px,6.6vw,96px)] leading-[0.96] text-balance">
          Leave the tower behind
        </h2>
        <p className="max-w-[38ch] text-md text-ink-muted">
          Carry the laptop you love. Run the software it can’t. meshrun isn’t available yet; tell us how you work and
          we’ll be in touch.
        </p>
        <div className="pair mt-2 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={openEarlyAccess}>
            Request early access
          </Button>
          <LinkButton href={`mailto:${contact}`} size="lg">
            {contact}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = [
  ["Product", [["Platform", "#platform"], ["What we deliver", "#experience"], ["How it works", "#session"], ["Pricing", "#pricing"]]],
  ["Company", [["Privacy", "#privacy"], ["Contact", `mailto:${contact}`], ["Early access", "#"]]],
] as const;

function Footer() {
  return (
    <footer className="bg-surface">
      <div className={`${column} flex flex-col gap-14 pt-20 pb-10`}>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Wordmark />
            <p className="max-w-[40ch] text-base text-ink-muted">{footer.blurb}</p>
          </div>
          {FOOTER_LINKS.map(([heading, links]) => (
            <nav key={heading} aria-label={heading} className="flex flex-col gap-3 text-sm">
              <span className="font-medium text-ink">{heading}</span>
              {links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={label === "Early access" ? (e) => (e.preventDefault(), openEarlyAccess()) : undefined}
                  className="link w-fit text-ink-muted"
                >
                  {label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-hairline-strong pt-8 text-xs text-ink-subtle">
          {footer.notices.map((notice) => (
            <p key={notice.slice(0, 24)} className="max-w-5xl">
              {notice}
            </p>
          ))}
          <p className="mt-2">
            {footer.entity} {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
