// The whole product in one drawing: a Mac on the left, a workstation on the
// right, and the stream between them. Same pen as the workstation mark —
// 1px, square caps, every path pathLength=1 so `plot` draws it stroke by
// stroke. Pair with `reveal` so it plots when scrolled into view.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
} as const

const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

export function Stream({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 260" aria-hidden className={`plot ${className}`} {...stroke}>
      {/* Laptop: base, then the lid standing up from its back edge. */}
      <path pathLength={1} d="M150 130 221 170 134 220 63 180Z" style={delay(0)} />
      <path pathLength={1} d="M150 130 221 170 221 90 150 50Z" style={delay(150)} />
      <path pathLength={1} d="M158 128 213 160 213 98 158 66Z" style={delay(300)} />
      {/* The picture on the Mac is the workstation's picture: three lines. */}
      <path pathLength={1} d="M168 100l30 17M168 112l30 17M168 124l16 9" style={delay(450)} />

      {/* Workstation, the mark from the hero at three-quarter scale. */}
      <g transform="translate(430 30) scale(0.8)">
        <path pathLength={1} d="M120 40 200 80 120 120 40 80Z" style={delay(300)} />
        <path pathLength={1} d="M40 80v80l80 40v-80" style={delay(450)} />
        <path pathLength={1} d="M200 80v80l-80 40" style={delay(600)} />
        <path pathLength={1} d="M134 134l52-26M134 150l52-26M134 166l52-26" style={delay(750)} />
        <circle className="text-accent" pathLength={1} cx="58" cy="102" r="3" style={delay(850)} />
      </g>

      {/* The stream: drawn last, dashed, in the brand colour. */}
      <path
        className="dashed text-accent"
        pathLength={1}
        d="M240 110 H320 V70 H420"
        style={delay(950)}
      />
      <path
        className="dashed text-accent"
        pathLength={1}
        d="M240 126 H336 V86 H420"
        style={delay(1050)}
      />
    </svg>
  )
}
