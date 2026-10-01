import { useCallback, useEffect, useState } from "react";

import { Button } from "./Button";
import { openEarlyAccess } from "./EarlyAccess";
import { column, Crosses } from "./layout";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

const NAV_LINKS = [
  ["Platform", "#platform"],
  ["How it Works", "#how"],
  ["Privacy & Compliance", "#privacy"],
  ["Pricing", "#pricing"],
] as const;

/** Long enough for the rows to lift away and the sheet to retract behind them. */
const MENU_EXIT_MS = 500;

const icons = {
  menu: "M2 4h12M2 8h12M2 12h12",
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
      className="tap inline-flex size-7 items-center justify-center rounded-sm text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
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
        <div className="grid h-11 shrink-0 grid-cols-[1fr_auto] items-center">
          <Wordmark />
          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            <ThemeToggle />
            <IconButton
              label="Close menu"
              path={icons.close}
              onClick={onClose}
            />
          </div>
        </div>

        <nav className="flex flex-1 flex-col justify-center">
          <ul className="border-t border-hairline">
            {NAV_LINKS.map(([label, href], i) => (
              <li
                key={href}
                className={`border-b border-hairline ${
                  closing ? "veil-row-out" : "veil-row"
                }`}
                style={{
                  animationDelay: closing
                    ? `${(NAV_LINKS.length - 1 - i) * 38}ms`
                    : `${160 + i * 70}ms`,
                }}
              >
                <a
                  href={href}
                  onClick={onClose}
                  className="group flex items-baseline justify-between gap-6 py-6 text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
                >
                  <span className="font-display text-[clamp(32px,8vw,60px)] leading-none tracking-[-0.02em]">
                    {label}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                    aria-hidden
                    className="shrink-0 -translate-x-3 text-accent opacity-0 transition-[transform,opacity] duration-(--dur-base) ease-expressive group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    <path d="M3 8h9.5M8.5 4l4 4-4 4" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div
            className={`mt-10 ${closing ? "veil-row-out" : "veil-row"}`}
            style={{
              animationDelay: closing
                ? "0ms"
                : `${160 + NAV_LINKS.length * 70}ms`,
            }}
          >
            {/* Waits for the menu to retract, so its scroll lock is released
                before the dialog takes its own. */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onClose();
                window.setTimeout(openEarlyAccess, MENU_EXIT_MS);
              }}
            >
              Request a demo
            </Button>
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

  const openMenu = useCallback(() => {
    setClosing(false);
    setOpen(true);
  }, []);

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
        className={`fixed inset-x-0 top-0 z-40 border-b bg-bg transition-[translate,opacity] duration-(--dur-slow) ease-expressive ${
          onScreen && !open
            ? "translate-y-0 border-hairline opacity-100"
            : "pointer-events-none -translate-y-full border-transparent opacity-0"
        }`}
      >
        <div
          className={`${column} grid h-11 grid-cols-[1fr_auto_1fr] items-center`}
        >
          <Crosses />
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
            <ThemeToggle />
            {/* The display lives on the wrapper, not the control: `hidden` and
                the Button's own `inline-flex` are both plain display utilities,
                so on one element the generated order decides, not the markup. */}
            <span className="hidden sm:inline-flex">
              <Button variant="primary" onClick={openEarlyAccess}>
                Request a demo
              </Button>
            </span>
            <span className="inline-flex sm:hidden">
              <IconButton
                label="Open menu"
                path={icons.menu}
                onClick={openMenu}
              />
            </span>
          </div>
        </div>
      </header>

      {open && <Menu closing={closing} onClose={closeMenu} />}
    </>
  );
}
