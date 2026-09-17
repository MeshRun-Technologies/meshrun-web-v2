// A cloud workstation as a wireframe isometric drawing, plotted stroke by
// stroke. Every path has pathLength=1 so the `plot` utility can draw it.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
} as const

const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

export function Workstation({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 220"
      aria-hidden
      className={`plot ${className}`}
      {...stroke}
    >
      {/* Uplink to the site, drawn last as a dashed line. */}
      <path className="dashed text-accent" pathLength={1} d="M120 6v34" style={delay(900)} />

      {/* Chassis: top, left and right faces. */}
      <path pathLength={1} d="M120 40 200 80 120 120 40 80Z" style={delay(0)} />
      <path pathLength={1} d="M40 80v80l80 40v-80" style={delay(180)} />
      <path pathLength={1} d="M200 80v80l-80 40" style={delay(360)} />

      {/* Vents on the right face, parallel to its top edge. */}
      <path pathLength={1} d="M134 134l52-26" style={delay(540)} />
      <path pathLength={1} d="M134 150l52-26" style={delay(600)} />
      <path pathLength={1} d="M134 166l52-26" style={delay(660)} />

      {/* Power LED on the left face. */}
      <circle className="text-accent" pathLength={1} cx="58" cy="102" r="2.5" style={delay(760)} />
    </svg>
  )
}
