import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'lg'

// Primary carries the brand colour. It uses the deeper `cta` fill, not the
// accent itself, so its text passes contrast in both modes.
const variants: Record<Variant, string> = {
  primary: 'bg-cta text-on-cta hover:bg-cta-hover',
  secondary: 'border border-edge bg-surface text-ink hover:border-ink',
  ghost: 'text-ink-muted hover:text-ink',
}

// The app's 28px control, and a 40px step for the page's few large actions.
const sizes: Record<Size, string> = {
  sm: 'h-7 gap-1.5 px-3 text-xs',
  lg: 'h-10 gap-2 px-5 text-sm',
}

const base =
  'group inline-flex shrink-0 items-center rounded-sm font-medium transition-[color,background-color,border-color,transform] duration-(--dur-fast) ease-standard active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:grayscale'

interface Look {
  variant?: Variant
  size?: Size
  // Trailing arrow that nudges on hover — for the one action that moves you on.
  arrow?: boolean
}
type ButtonProps = Look & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'secondary',
  size = 'sm',
  arrow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button data-absorb="" data-variant={variant} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  )
}

// Same look as an anchor, for in-page navigation.
export function LinkButton({
  variant = 'secondary',
  size = 'sm',
  arrow = false,
  className = '',
  children,
  ...props
}: Look & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a data-absorb="" data-variant={variant} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
      {arrow && <Arrow />}
    </a>
  )
}

function Arrow() {
  return (
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
  )
}
