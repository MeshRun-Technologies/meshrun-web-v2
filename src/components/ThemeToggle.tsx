import { useRef } from "react";

import { useTheme } from "../lib/useTheme";

/** The swap lands at the midpoint, while the icon is scaled down to a point. */
const SWAP_COMMIT_MS = 300;
const SWAP_MS = 640;

/**
 * The mark for the appearance you would switch to: a moon while the page is
 * light, a sun while it is dark. Clicking spins the icon down to a point,
 * swaps it there and opens it back out, so one shape appears to turn into the
 * other rather than cutting.
 */
export function ThemeToggle() {
  const { setAppearance } = useTheme();
  const iconRef = useRef<HTMLSpanElement>(null);
  const spinning = useRef(false);

  const toggle = () => {
    // Two states for the visitor, light and dark. The first click leaves
    // "system" for an explicit choice; the page follows the OS until then.
    const commit = () =>
      setAppearance(
        document.documentElement.classList.contains("dark") ? "light" : "dark",
      );

    const icon = iconRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!icon || reduced || spinning.current) {
      commit();
      return;
    }

    spinning.current = true;
    icon.classList.remove("swap");
    // Reading the layout restarts the animation rather than letting the class
    // removal and re-add collapse into one frame.
    void icon.offsetWidth;
    icon.classList.add("swap");
    window.setTimeout(commit, SWAP_COMMIT_MS);
    window.setTimeout(() => {
      icon.classList.remove("swap");
      spinning.current = false;
    }, SWAP_MS);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark"
      className="tap inline-flex size-7 items-center justify-center rounded-sm text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
    >
      <span ref={iconRef} className="grid place-items-center">
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
          className="when-light"
        >
          <path d="M13.5 9.6A5.9 5.9 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z" />
        </svg>
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
          className="when-dark"
        >
          <circle cx="8" cy="8" r="3.1" />
          <path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7 13 13M13 3l-1.3 1.3M4.3 11.7 3 13" />
        </svg>
      </span>
    </button>
  );
}
