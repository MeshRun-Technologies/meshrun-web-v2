import { useCallback, useEffect, useRef } from "react";

/** Long enough for the smooth scroll to land before another tick is taken. */
const HANDOFF_MS = 900;

/**
 * The way out of the landing pane.
 *
 * The pane behaves as a single screen: one tick down hands over to the page
 * rather than scrolling the drawings away line by line, and the cue does the
 * same thing for anyone who would rather press it.
 */
export function ScrollCue() {
  const leaving = useRef(false);

  const toContent = useCallback(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Whatever follows the pane, so renaming or reordering sections cannot
    // leave the cue pointing at nothing.
    document.getElementById("hero")?.nextElementSibling?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || leaving.current) return;
      // Only while the landing still owns the screen.
      if (window.scrollY > 8) return;
      // A locked root means the menu owns the scroll right now.
      if (document.documentElement.style.overflow === "hidden") return;

      event.preventDefault();
      leaving.current = true;
      toContent();
      window.setTimeout(() => {
        leaving.current = false;
      }, HANDOFF_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [toContent]);

  return (
    <button
      type="button"
      onClick={toContent}
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
