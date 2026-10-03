import { useCallback, useEffect, useRef } from "react";

/** Long enough for the smooth scroll to land before another tick is taken. */
const HANDOFF_MS = 900;

/** Slack either side of the hand-off, for sub-pixel landings. */
const EDGE = 8;

/** Whatever follows the pane, so renaming or reordering sections cannot leave the cue pointing at nothing. */
const content = () => document.getElementById("hero")?.nextElementSibling as HTMLElement | null | undefined;

/**
 * Where the page comes to rest once it has left the pane: the next section's
 * top, less the page's scroll padding and the section's own margin. The
 * hand-off scrolls to exactly this point and tests against it, so the two can
 * never disagree (scrollIntoView would add the padding on its own and stop
 * short, and every tick would then hand off again).
 */
function landing(el: HTMLElement) {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - padding - margin;
}

const behavior = (): ScrollBehavior =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/**
 * The landing pane behaves as a single screen: one wheel tick down hands over
 * to the page rather than scrolling the render away line by line, and one
 * tick up from the top of the page brings the whole pane back. Returns the
 * hand-off itself, for anything that wants to trigger it.
 */
export function useHeroHandoff() {
  const moving = useRef(false);

  const toContent = useCallback(() => {
    const next = content();
    if (next) window.scrollTo({ top: landing(next), behavior: behavior() });
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

  return toContent;
}

/** The hand-off as a control: a chevron at the foot of the pane. */
export function ScrollCue() {
  const toContent = useHeroHandoff();

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
