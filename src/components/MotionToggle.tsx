import { copy } from "../i18n";
import { setMotionPaused, useMotionPaused } from "../lib/motion";

/**
 * Stops and restarts the page's moving parts. The render runs on its own for
 * as long as the page is open, so there has to be a way to hold it still that
 * doesn't depend on a system setting (WCAG 2.2.2). As a quiet round icon on
 * the landing, and as a line of text in the footer.
 */
export function MotionToggle({ look = "icon", className = "" }: { look?: "icon" | "text"; className?: string }) {
  const paused = useMotionPaused();
  const label = paused ? copy.nav.play : copy.nav.pause;

  if (look === "text") {
    return (
      <button
        type="button"
        onClick={() => setMotionPaused(!paused)}
        className={`link w-fit text-left text-ink-muted ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setMotionPaused(!paused)}
      className={`press inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ink/25 text-ink-muted transition-colors duration-(--dur-fast) hover:border-ink hover:text-ink ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        {paused ? <path d="M4 2.5v11l9.5-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />}
      </svg>
    </button>
  );
}
