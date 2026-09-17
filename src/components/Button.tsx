import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

// Primary carries the brand colour. It uses the deeper `cta` fill, not the
// accent itself, so its text passes contrast in both modes.
const variants: Record<Variant, string> = {
  primary: 'bg-cta text-on-cta hover:bg-cta-hover',
  secondary:
    'border border-edge bg-surface text-ink hover:border-ink',
  ghost: 'text-ink-muted hover:text-ink',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  // Trailing arrow that nudges on hover — for the one action that moves you on.
  arrow?: boolean
}

export function Button({
  variant = 'secondary',
  arrow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`group inline-flex h-7 shrink-0 items-center gap-1.5 rounded-sm px-3 text-xs font-medium transition-[color,background-color,border-color,transform] duration-(--dur-fast) ease-standard active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {arrow && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
          aria-hidden
          className="transition-transform duration-(--dur-base) ease-expressive group-hover:translate-x-0.5"
        >
          <path d="M3 8h9.5M8.5 4l4 4-4 4" />
        </svg>
      )}
    </button>
  )
}
