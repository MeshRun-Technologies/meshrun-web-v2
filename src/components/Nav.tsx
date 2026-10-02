import { useCallback, useEffect, useState } from "react";

import { bloop } from "../lib/bloop";
import { Button } from "./Button";
import { HeroField } from "./HeroField";
import { openEarlyAccess } from "./EarlyAccess";
import { contact } from "../content";
import { column } from "./layout";
import { Wordmark } from "./Wordmark";

const NAV_LINKS = [
  ["Platform", "#platform"],
  ["How it Works", "#how"],
  ["Privacy & Compliance", "#privacy"],
  ["Pricing", "#pricing"],
] as const;

const MENU_EVENT = "meshrun:menu";

/** Opens the menu from anywhere, such as the landing's own header. */
export function openMenu() {
  window.dispatchEvent(new Event(MENU_EVENT));
}

/** Where the blob turns for each link, so pressing one turns it. */
const LINK_VIEWS = [
  { azimuth: 200, polar: 180, zoom: 1 },
  { azimuth: 330, polar: 160, zoom: 1 },
  { azimuth: 250, polar: 135, zoom: 1 },
  { azimuth: 360, polar: 150, zoom: 1 },
];

/** Long enough for the rows to lift away and the sheet to retract behind them. */
const MENU_EXIT_MS = 500;

const icons = {
  menu: "M2 5h12M2 11h12",
  close: "M3 3l10 10M13 3 3 13",
};

/**
 * The bar's 28px control, matching the theme toggle beside it: no border, no
 * fill, the icon alone until you reach for it.
 */
function IconButton({
  label,
  path,
  onClick,
}: {
  label: string;
  path: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press -mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
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
        <path d={path} />
      </svg>
    </button>
  );
}

/**
 * Marks the point in the landing pane past which the bar belongs on screen.
 * Sits inside the pane rather than after it, so the bar is already in place by
 * the time the content arrives and the trigger is not a single-pixel boundary.
 */
export function NavSentinel() {
  return (
    <div
      id="nav-sentinel"
      aria-hidden
      className="pointer-events-none absolute bottom-[10%] left-0 h-px w-full"
    />
  );
}

/**
 * The bar drops in once the landing has been scrolled past. Observing the
 * sentinel avoids a scroll listener firing on every frame; with no landing on
 * the page the bar simply stays put.
 */
function useNavVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("nav-sentinel");
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return visible;
}

/**
 * Holds the page still behind the menu. The root is the scrolling box, so the
 * lock goes there; the body's own overflow would not stop the viewport.
 */
function useScrollLock() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);
}

/**
 * The menu drops as a sheet from the top edge with the rails drawing down its
 * gutters, and the rows ride in under it. Closing rewinds it: the rows lift
 * away first, then the sheet retracts.
 */
function Menu({ closing, onClose }: { closing: boolean; onClose: () => void }) {
  useScrollLock();
  const [turn, setTurn] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={`fixed inset-0 z-50 bg-bg ${
        closing ? "veil-out pointer-events-none" : "veil"
      }`}
    >
      <div className={`${column} flex h-full flex-col`}>
        <div className="grid h-16 shrink-0 grid-cols-[1fr_auto] items-center">
          <Wordmark />
          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            <IconButton
              label="Close menu"
              path={icons.close}
              onClick={onClose}
            />
          </div>
        </div>

        {/* The blob, live, at the top of the sheet; it turns to whichever
            link is touched, and a tap on it plays its note (touch only: the
            menu is the phone's, and a mouse click here isn't a tap). */}
        <div
          aria-hidden
          onPointerUp={(event) => {
            if (event.pointerType === "touch" && !closing) bloop();
          }}
          className={`relative min-h-0 flex-1 overflow-hidden rounded-lg ${closing ? "veil-row-out" : "veil-row"}`}
          style={{ animationDelay: closing ? `${NAV_LINKS.length * 38}ms` : "80ms" }}
        >
          <HeroField view={turn === null ? undefined : LINK_VIEWS[turn]} />
        </div>

        <nav aria-label="Main" className="shrink-0 pt-6">
          <ul>
            {NAV_LINKS.map(([label, href], i) => (
              <li
                key={href}
                className={`border-t border-hairline-strong ${closing ? "veil-row-out" : "veil-row"}`}
                style={{
                  animationDelay: closing
                    ? `${(NAV_LINKS.length - 1 - i) * 38}ms`
                    : `${160 + i * 70}ms`,
                }}
              >
                <a
                  href={href}
                  onClick={onClose}
                  onPointerEnter={() => setTurn(i)}
                  onFocus={() => setTurn(i)}
                  className="press group flex items-center gap-4 py-4 text-ink transition-colors duration-(--dur-fast)"
                >
                  <span className="w-6 text-sm text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display flex-1 text-[clamp(22px,6.4vw,40px)] leading-none">{label}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                    aria-hidden
                    className="shrink-0 text-ink-subtle transition-[transform,color] duration-(--dur-base) ease-expressive group-hover:translate-x-1 group-hover:text-accent"
                  >
                    <path d="M3 8h9.5M8.5 4l4 4-4 4" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div
            className={`flex flex-col gap-4 border-t border-hairline-strong pt-6 pb-8 ${closing ? "veil-row-out" : "veil-row"}`}
            style={{
              animationDelay: closing ? "0ms" : `${160 + NAV_LINKS.length * 70}ms`,
            }}
          >
            {/* Waits for the menu to retract, so its scroll lock is released
                before the dialog takes its own. */}
            <Button
              variant="primary"
              size="lg"
              arrow
              className="w-full justify-center"
              onClick={() => {
                onClose();
                window.setTimeout(openEarlyAccess, MENU_EXIT_MS);
              }}
            >
              Request early access
            </Button>
            <a href={`mailto:${contact}`} className="text-center text-sm text-ink-muted">
              {contact}
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}

// Fixed, and out of the way until the landing has been scrolled past. The
// menu is a sibling, not a child: the bar's slide is a transform, which would
// otherwise become the containing block for anything fixed inside it.
export function Nav() {
  const onScreen = useNavVisible();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const showMenu = useCallback(() => {
    setClosing(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(MENU_EVENT, showMenu);
    return () => window.removeEventListener(MENU_EVENT, showMenu);
  }, [showMenu]);

  // Closing plays the opening in reverse, so the menu stays mounted until the
  // retraction has finished.
  const closeMenu = useCallback(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, MENU_EXIT_MS);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b bg-bg/90 backdrop-blur-md transition-[translate,opacity] duration-(--dur-slow) ease-expressive ${
          onScreen
            ? "translate-y-0 border-hairline opacity-100"
            : "pointer-events-none -translate-y-full border-transparent opacity-0"
        }`}
      >
        <div
          className={`${column} grid h-16 grid-cols-[1fr_auto_1fr] items-center`}
        >
          <Wordmark className="col-start-1" />
          <nav className="col-start-2 hidden gap-6 text-sm text-ink-muted sm:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="group relative transition-colors duration-(--dur-fast) hover:text-ink"
              >
                {label}
                {/* Drawn, not faded: the rule runs out from the left the way
                    every other line on the page arrives. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-(--dur-base) ease-expressive group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>
          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            {/* The display lives on the wrapper, not the control: `hidden` and
                the Button's own `inline-flex` are both plain display utilities,
                so on one element the generated order decides, not the markup. */}
            <span className="hidden sm:inline-flex">
              <Button variant="primary" onClick={openEarlyAccess}>
                Request early access
              </Button>
            </span>
            <span className="inline-flex sm:hidden">
              <IconButton
                label="Open menu"
                path={icons.menu}
                onClick={showMenu}
              />
            </span>
          </div>
        </div>
      </header>

      {open && <Menu closing={closing} onClose={closeMenu} />}
    </>
  );
}
