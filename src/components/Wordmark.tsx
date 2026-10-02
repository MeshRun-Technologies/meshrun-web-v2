import { useId } from "react";

/**
 * The mark: a rack of three server units under a lid, split by clean gaps, lit
 * in the blob's colours from orange at the top left to blue at the bottom
 * right. The gaps are the page's black, so it sits on any dark ground.
 */
export function Mark({ size = 22, className = "" }: { size?: number; className?: string }) {
  // Each mark needs its own gradient id: several are on the page at once, and
  // one inside a hidden element would otherwise take the others' fill with it.
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={className}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="12" y1="4" x2="88" y2="96">
          <stop offset="0" stopColor="#e2401a" />
          <stop offset="0.28" stopColor="#ff8a3d" />
          <stop offset="0.48" stopColor="#f3cc9c" />
          <stop offset="0.66" stopColor="#8da0ce" />
          <stop offset="0.84" stopColor="#4f8dff" />
          <stop offset="1" stopColor="#73bfc4" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`} stroke="var(--color-bg)" strokeWidth="5" strokeLinejoin="round">
        <polygon points="50,3.8 90,26.9 50,50 10,26.9" />
        <polygon points="90,26.9 50,50 50,65.4 90,42.3" fillOpacity="0.7" />
        <polygon points="10,26.9 50,50 50,65.4 10,42.3" fillOpacity="0.52" />
        <polygon points="90,42.3 50,65.4 50,80.8 90,57.7" fillOpacity="0.6" />
        <polygon points="10,42.3 50,65.4 50,80.8 10,57.7" fillOpacity="0.44" />
        <polygon points="90,57.7 50,80.8 50,96.2 90,73.1" fillOpacity="0.5" />
        <polygon points="10,57.7 50,80.8 50,96.2 10,73.1" fillOpacity="0.36" />
      </g>
    </svg>
  );
}

// The brand: the mark beside the lowercase wordmark in the display face, in
// lower case where everything else in that face is capitals. Never bolded.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="#" className={`inline-flex items-center gap-2.5 text-ink ${className}`} aria-label="meshrun">
      <Mark size={22} />
      <span className="font-display text-[17px] tracking-[-0.03em]">meshrun</span>
    </a>
  );
}
