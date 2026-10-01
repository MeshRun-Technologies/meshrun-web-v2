import { useCallback, useEffect, useRef } from "react";

/** Long enough for the smooth scroll to land before another tick is taken. */
const HANDOFF_MS = 900;

/** Slack either side of the hand-off, for sub-pixel landings. */
const EDGE = 8;

/** Whatever follows the pane, so renaming or reordering sections cannot leave the cue pointing at nothing. */
const content = () => document.getElementById("hero")?.nextElementSibling as HTMLElement | null | undefined;

/** Where the page comes to rest once it has left the pane, scroll margin included. */
function landing(el: HTMLElement) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - margin;
}

const behavior = (): ScrollBehavior =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/**
 * The way out of the landing pane, and back into it.
 *
 * The pane behaves as a single screen: one tick down hands over to the page
 * rather than scrolling the drawings away line by line, and one tick up from
 * the top of the page brings the whole pane back. The cue does the same thing
 * for anyone who would rather press it.
 */
export function ScrollCue() {
  const moving = useRef(false);

  const toContent = useCallback(() => {
    content()?.scrollIntoView({ behavior: behavior() });
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      // A locked root means the menu owns the scroll right now.
      if (document.documentElement.style.overflow === "hidden") return;
      // Trackpads keep sending ticks after the first; while the glide runs
      // they would cut it short, so they are swallowed until it lands.
      if (moving.current) {
        event.preventDefault();
        return;
      }
      const next = content();
      if (!next || !event.deltaY) return;

      const end = landing(next);
      const y = window.scrollY;
      const down = event.deltaY > 0;
      // Only while the pane is still (partly) on screen: down from anywhere
      // above the landing, up from anywhere at or above it.
      if (down ? y >= end - EDGE : y > end + EDGE || y <= EDGE) return;

      event.preventDefault();
      moving.current = true;
      if (down) toContent();
      else window.scrollTo({ top: 0, behavior: behavior() });
      window.setTimeout(() => {
        moving.current = false;
      }, HANDOFF_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [toContent]);

  return (
    <button
      type="button"
      onClick={toContent}
      data-absorb=""
      aria-label="Scroll to content"
      className="tap group absolute inset-x-0 bottom-8 z-10 mx-auto inline-flex size-9 items-center justify-center rounded-sm border border-hairline-strong bg-surface text-ink-muted transition-colors duration-(--dur-fast) hover:border-ink hover:text-ink"
    >
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
        className="bob"
      >
        <path d="M4 6.5 8 10.5l4-4" />
      </svg>
    </button>
  );
}
