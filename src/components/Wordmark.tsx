// The brand: the workstation mark from the favicon beside the lowercase
// wordmark in the display face. Never bolded.
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <a href="#" className={`inline-flex items-center gap-2 text-ink ${className}`} aria-label="meshrun">
      <svg
        viewBox="20 0 200 220"
        width="20"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden
      >
        <path d="M120 6v34" className="text-accent" stroke="currentColor" strokeDasharray="10 8" />
        <path d="M120 40 200 80 120 120 40 80Z" />
        <path d="M40 80v80l80 40v-80" />
        <path d="M200 80v80l-80 40" />
        <circle cx="58" cy="102" r="7" className="fill-accent" stroke="none" />
      </svg>
      <span className="font-display text-base tracking-[-0.02em]">meshrun</span>
    </a>
  )
}
