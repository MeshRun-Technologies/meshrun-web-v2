// The drawing sheet behind the landing pane.
//
// Fourteen real mechanical drawings, built as data so the hero can plot them
// stroke by stroke and open each one up under the pointer. Pure geometry: no
// colour, no classes, nothing that belongs to the theme. Ported unchanged from
// the v1 site — the numbers are the drawings, and they are what they are.

const TAU = Math.PI * 2
/** A full circle as a path, so every mark on the sheet is one primitive. */
function circle(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function polygon(cx: number, cy: number, r: number, sides: number, turn = 0) {
  const pts: string[] = [];
  for (let i = 0; i < sides; i += 1) {
    const a = turn + (i / sides) * TAU;
    pts.push(
      `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`,
    );
  }
  return `M${pts.join("L")}Z`;
}

function rect(x: number, y: number, w: number, h: number) {
  return `M${x} ${y}h${w}v${h}h${-w}Z`;
}

/** 45° section hatching clipped to a rectangle. */
function hatch(x: number, y: number, w: number, h: number, step = 10) {
  const out: string[] = [];
  for (let d = -h; d < w; d += step) {
    const t1 = Math.max(0, -d);
    const t2 = Math.min(h, w - d);
    if (t2 <= t1) continue;
    out.push(
      `M${(x + d + t1).toFixed(1)} ${(y + t1).toFixed(1)}L${(x + d + t2).toFixed(1)} ${(y + t2).toFixed(1)}`,
    );
  }
  return out;
}

/** Centre-lines crossing a feature, drawn long in the drafting convention. */
function centre(cx: number, cy: number, r: number) {
  return [`M${cx - r} ${cy}H${cx + r}`, `M${cx} ${cy - r}V${cy + r}`];
}

/** A horizontal obround, the shape a milled slot leaves. */
function slotH(cx: number, cy: number, len: number, r: number) {
  const d = len / 2 - r;
  return `M${cx - d} ${cy - r}h${d * 2}a${r} ${r} 0 0 1 0 ${r * 2}h${-d * 2}a${r} ${r} 0 0 1 0 ${-r * 2}Z`;
}

/** A vertical obround. */
function slotV(cx: number, cy: number, len: number, r: number) {
  const d = len / 2 - r;
  return `M${cx - r} ${cy - d}a${r} ${r} 0 0 1 ${r * 2} 0v${d * 2}a${r} ${r} 0 0 1 ${-r * 2} 0Z`;
}

/** The small cross that marks an arc centre a dimension is measured from. */
function mark(x: number, y: number, r = 6) {
  return [`M${x - r} ${y}h${r * 2}`, `M${x} ${y - r}v${r * 2}`];
}

/**
 * A dimension keyed to the feature it measures. `at` is the point on the part
 * the pointer has to approach; `inner` marks the ones that only make sense once
 * the part has been opened up.
 */
type Dim = {
  paths: string[];
  at: [number, number];
  inner: boolean;
};

/** Arrowhead length and half-width. */
const ARROW = 7.5;
const BARB = 3.1;
/** Below this the arrows will not fit between the extension lines. */
const ARROW_ROOM = 24;
/** How far the extension line runs past the dimension line. */
const OVERRUN = 9;

/**
 * A linear dimension, drawn the way a drawing office would.
 *
 * The extension lines start on the feature itself, with no gap, and overrun the
 * dimension line. Arrowheads land on those extension lines; when the measured
 * span is too tight to hold them they flip outside and point back in, and the
 * dimension line grows tails for them to sit on. `centres` marks the arc
 * centres a dimension is taken from, so a slot or a bolt circle says what it is
 * actually measuring.
 */
function dimH(
  x1: number,
  x2: number,
  y: number,
  from: number,
  inner = false,
  centres: [number, number][] = [],
): Dim {
  const stop = y < from ? y - OVERRUN : y + OVERRUN;
  const tight = Math.abs(x2 - x1) < ARROW_ROOM;
  const tail = ARROW * 2.2;
  const head = (x: number, dir: number) =>
    `M${x + ARROW * dir} ${y - BARB}L${x} ${y}L${x + ARROW * dir} ${y + BARB}`;
  return {
    paths: [
      `M${x1} ${from}V${stop}`,
      `M${x2} ${from}V${stop}`,
      tight ? `M${x1 - tail} ${y}H${x2 + tail}` : `M${x1} ${y}H${x2}`,
      head(x1, tight ? -1 : 1),
      head(x2, tight ? 1 : -1),
      ...centres.flatMap(([mx, my]) => mark(mx, my)),
    ],
    at: [(x1 + x2) / 2, from],
    inner,
  };
}

function dimV(
  y1: number,
  y2: number,
  x: number,
  from: number,
  inner = false,
  centres: [number, number][] = [],
): Dim {
  const stop = x < from ? x - OVERRUN : x + OVERRUN;
  const tight = Math.abs(y2 - y1) < ARROW_ROOM;
  const tail = ARROW * 2.2;
  const head = (y: number, dir: number) =>
    `M${x - BARB} ${y + ARROW * dir}L${x} ${y}L${x + BARB} ${y + ARROW * dir}`;
  return {
    paths: [
      `M${from} ${y1}H${stop}`,
      `M${from} ${y2}H${stop}`,
      tight ? `M${x} ${y1 - tail}V${y2 + tail}` : `M${x} ${y1}V${y2}`,
      head(y1, tight ? -1 : 1),
      head(y2, tight ? 1 : -1),
      ...centres.flatMap(([mx, my]) => mark(mx, my)),
    ],
    at: [from, (y1 + y2) / 2],
    inner,
  };
}

export type BBox = readonly [number, number, number, number];

export type Drawing = {
  /** Filled silhouette, holes punched with evenodd. What you see at rest. */
  solid: string;
  /** The linework underneath, revealed by moving onto the part. */
  paths: string[];
  hidden: string[];
  bbox: BBox;
  dims: Dim[];
};

/** Zero when the point is inside the box, otherwise the distance to its edge. */
export function bboxDist(b: BBox, x: number, y: number) {
  const dx = Math.max(b[0] - x, 0, x - b[2]);
  const dy = Math.max(b[1] - y, 0, y - b[3]);
  return Math.hypot(dx, dy);
}

/**
 * Fourteen real drawings scattered across the sheet: a bolted flange, a
 * section, a hex nut, a bearing, a stepped shaft, a slotted plate, a
 * countersink detail, an angle bracket, a door opening, a spur gear, a welded
 * tee, a square tube, a pillow block and a bolted truss node.
 */
export const SHEET: Drawing[] = (() => {
  const out: Drawing[] = [];

  // Bolted flange.
  {
    const cx = 228;
    const cy = 166;
    const R = 96;
    const bolt = 66;
    const holes: string[] = [];
    const seats: [number, number][] = [];
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU - Math.PI / 2;
      const hx = cx + Math.cos(a) * bolt;
      const hy = cy + Math.sin(a) * bolt;
      holes.push(circle(hx, hy, 11));
      seats.push([hx, hy]);
    }
    out.push({
      solid: [circle(cx, cy, R), circle(cx, cy, 32), ...holes].join(""),
      paths: [
        circle(cx, cy, R),
        circle(cx, cy, 32),
        ...holes,
        ...centre(cx, cy, R + 18),
      ],
      hidden: [circle(cx, cy, bolt)],
      bbox: [cx - R, cy - R, cx + R, cy + R],
      dims: [
        dimH(cx - R, cx + R, cy + R + 46, cy),
        // Bolt circle, taken centre to centre off the top and bottom holes.
        dimV(cy - bolt, cy + bolt, cx - R - 44, cx, true, [seats[0], seats[3]]),
        dimV(cy - 32, cy + 32, cx + R + 44, cx, true),
      ],
    });
  }

  // Section through a bearing block.
  {
    const x = 360;
    const y = 392;
    const w = 128;
    const h = 92;
    out.push({
      solid: rect(x, y, w, h),
      paths: [
        rect(x, y, w, h),
        `M${x + 34} ${y}v${h}M${x + w - 34} ${y}v${h}`,
        ...hatch(x, y, 34, h),
        ...hatch(x + w - 34, y, 34, h),
      ],
      hidden: [`M${x + 34} ${y + 30}h${w - 68}M${x + 34} ${y + 62}h${w - 68}`],
      bbox: [x, y, x + w, y + h],
      dims: [
        dimH(x, x + w, y + h + 42, y + h),
        dimV(y, y + h, x + w + 34, x + w),
        dimH(x, x + 34, y - 34, y, true),
      ],
    });
  }

  // Hex nut.
  {
    const cx = 1284;
    const cy = 172;
    const r = 56;
    const flat = r * Math.cos(Math.PI / 6);
    out.push({
      solid: polygon(cx, cy, r, 6, Math.PI / 6) + circle(cx, cy, 32),
      paths: [
        polygon(cx, cy, r, 6, Math.PI / 6),
        circle(cx, cy, 32),
        ...centre(cx, cy, r + 16),
      ],
      hidden: [circle(cx, cy, 27)],
      bbox: [cx - flat, cy - r, cx + flat, cy + r],
      dims: [
        dimH(cx - flat, cx + flat, cy + r + 40, cy),
        dimV(cy - 32, cy + 32, cx + r + 40, cx, true),
      ],
    });
  }

  // Deep-groove ball bearing.
  {
    const cx = 186;
    const cy = 432;
    const R = 84;
    const balls = 0.72 * R;
    const ballPaths: string[] = [];
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * TAU;
      ballPaths.push(
        circle(cx + Math.cos(a) * balls, cy + Math.sin(a) * balls, 0.13 * R),
      );
    }
    out.push({
      solid: circle(cx, cy, R) + circle(cx, cy, 0.46 * R),
      paths: [
        circle(cx, cy, R),
        circle(cx, cy, R - 20),
        circle(cx, cy, 0.46 * R),
        circle(cx, cy, 0.46 * R + 20),
        ...ballPaths,
        ...centre(cx, cy, R + 18),
      ],
      hidden: [circle(cx, cy, balls)],
      bbox: [cx - R, cy - R, cx + R, cy + R],
      dims: [
        dimH(cx - R, cx + R, cy + R + 44, cy),
        dimV(cy - 0.46 * R, cy + 0.46 * R, cx + R + 42, cx, true),
      ],
    });
  }

  // Stepped shaft.
  {
    const cx = 408;
    const cy = 624;
    const steps: [number, number, number][] = [
      [-132, -38, 34],
      [-38, 48, 54],
      [48, 132, 26],
    ];
    const bodies = steps.map(([x1, x2, h]) =>
      rect(cx + x1, cy - h, x2 - x1, h * 2),
    );
    out.push({
      solid: bodies.join(""),
      paths: [...bodies, `M${cx - 156} ${cy}H${cx + 156}`],
      hidden: [],
      bbox: [cx - 132, cy - 54, cx + 132, cy + 54],
      dims: [
        dimH(cx - 132, cx + 132, cy + 102, cy + 54),
        dimV(cy - 54, cy + 54, cx - 176, cx - 38),
        dimH(cx - 38, cx + 48, cy - 96, cy - 54, true),
      ],
    });
  }

  // Slotted plate.
  {
    const cx = 744;
    const cy = 206;
    const w = 104;
    const h = 146;
    const slot = 44;
    const slotPath = slotV(cx, cy, slot * 2 + 30, 15);
    out.push({
      solid: rect(cx - w / 2, cy - h / 2, w, h) + slotPath,
      paths: [
        rect(cx - w / 2, cy - h / 2, w, h),
        slotPath,
        ...centre(cx, cy, h / 2 + 16),
      ],
      hidden: [],
      bbox: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
      dims: [
        dimH(cx - w / 2, cx + w / 2, cy + h / 2 + 40, cy + h / 2),
        // Slot length, centre to centre of the two end radii.
        dimV(cy - slot, cy + slot, cx + w / 2 + 40, cx, true, [
          [cx, cy - slot],
          [cx, cy + slot],
        ]),
      ],
    });
  }

  // Countersunk hole, section.
  {
    const cx = 744;
    const cy = 470;
    const t = 34;
    const bore = 17;
    const csk = 34;
    const hole = `M${cx - csk} ${cy - t}L${cx - bore} ${cy - t + 20}V${cy + t}H${cx + bore}V${cy - t + 20}L${cx + csk} ${cy - t}Z`;
    out.push({
      solid: rect(cx - 96, cy - t, 192, t * 2) + hole,
      paths: [
        `M${cx - 96} ${cy - t}h192M${cx - 96} ${cy + t}h192`,
        `M${cx - csk} ${cy - t}L${cx - bore} ${cy - t + 20}V${cy + t}`,
        `M${cx + csk} ${cy - t}L${cx + bore} ${cy - t + 20}V${cy + t}`,
        ...centre(cx, cy, t + 22),
      ],
      hidden: [],
      bbox: [cx - 96, cy - t, cx + 96, cy + t],
      dims: [
        dimH(cx - csk, cx + csk, cy - t - 40, cy - t, true),
        dimH(cx - bore, cx + bore, cy + t + 40, cy + t, true),
      ],
    });
  }

  // Angle bracket.
  {
    const cx = 186;
    const cy = 758;
    const L = 132;
    const t = 34;
    const body = `M${cx - L / 2} ${cy - L / 2}h${t}v${L - t}h${L - t}v${t}h${-L}Z`;
    const holes = [
      circle(cx - L / 2 + t / 2, cy - L / 2 + 30, 9),
      circle(cx + L / 2 - 30, cy + L / 2 - t / 2, 9),
    ];
    out.push({
      solid: body + holes.join(""),
      paths: [body, ...holes],
      hidden: [],
      bbox: [cx - L / 2, cy - L / 2, cx + L / 2, cy + L / 2],
      dims: [
        dimV(cy - L / 2, cy + L / 2, cx - L / 2 - 40, cx - L / 2),
        // Leg thickness: no room between the extension lines, so the arrows
        // sit outside and point back in.
        dimH(cx - L / 2, cx - L / 2 + t, cy + L / 2 + 42, cy + L / 2, true),
      ],
    });
  }

  // Door opening, plan.
  {
    const cx = 706;
    const cy = 818;
    const wall = 20;
    const open = 112;
    const left = rect(cx - 190, cy - wall / 2, 190 - open, wall);
    const right = rect(cx + open, cy - wall / 2, 190 - open, wall);
    out.push({
      solid: left + right,
      paths: [
        left,
        right,
        `M${cx - open} ${cy}V${cy - open * 2}`,
        `M${cx - open} ${cy - open * 2}A${open * 2} ${open * 2} 0 0 1 ${cx + open} ${cy}`,
      ],
      hidden: [],
      bbox: [cx - 190, cy - wall / 2, cx + 190, cy + wall / 2],
      dims: [
        // Structural opening, measured off the hinge the swing is struck from.
        dimH(cx - open, cx + open, cy + 62, cy + wall / 2, false, [
          [cx - open, cy],
        ]),
        dimV(cy - wall / 2, cy + wall / 2, cx - 214, cx - 190, true),
      ],
    });
  }

  // Spur gear.
  {
    const cx = 1052;
    const cy = 742;
    const tip = 84;
    const root = 64;
    const teeth: string[] = [];
    for (let i = 0; i < 24; i += 1) {
      const a = (i / 24) * TAU;
      teeth.push(
        `M${(cx + Math.cos(a) * root).toFixed(1)} ${(cy + Math.sin(a) * root).toFixed(1)}L${(cx + Math.cos(a) * tip).toFixed(1)} ${(cy + Math.sin(a) * tip).toFixed(1)}`,
      );
    }
    out.push({
      solid: circle(cx, cy, tip) + circle(cx, cy, 21),
      paths: [
        circle(cx, cy, tip),
        circle(cx, cy, root),
        circle(cx, cy, 21),
        ...teeth,
        `M${cx - 6} ${cy - 21}h12v8h-12Z`,
        ...centre(cx, cy, tip + 18),
      ],
      hidden: [circle(cx, cy, 74)],
      bbox: [cx - tip, cy - tip, cx + tip, cy + tip],
      dims: [
        dimH(cx - tip, cx + tip, cy + tip + 46, cy),
        dimV(cy - 21, cy + 21, cx + tip + 42, cx, true),
      ],
    });
  }

  // Welded tee.
  {
    const cx = 1412;
    const cy = 752;
    const t = 26;
    const web = 120;
    const flange = 150;
    const base = rect(cx - flange / 2, cy + web / 2, flange, t);
    const stem = rect(cx - t / 2, cy - web / 2, t, web);
    out.push({
      solid: base + stem,
      paths: [
        base,
        stem,
        `M${cx - t / 2 - 16} ${cy + web / 2}l16 -16M${cx + t / 2 + 16} ${cy + web / 2}l-16 -16`,
      ],
      hidden: [],
      bbox: [cx - flange / 2, cy - web / 2, cx + flange / 2, cy + web / 2 + t],
      dims: [
        dimH(
          cx - flange / 2,
          cx + flange / 2,
          cy + web / 2 + t + 42,
          cy + web / 2 + t,
        ),
        dimV(
          cy - web / 2,
          cy + web / 2,
          cx + flange / 2 + 40,
          cx + t / 2,
          true,
        ),
      ],
    });
  }

  // Square tube, section.
  {
    const cx = 1414;
    const cy = 428;
    const w = 112;
    const h = 96;
    const t = 18;
    const x = cx - w / 2;
    const y = cy - h / 2;
    out.push({
      solid: rect(x, y, w, h) + rect(x + t, y + t, w - t * 2, h - t * 2),
      paths: [
        rect(x, y, w, h),
        rect(x + t, y + t, w - t * 2, h - t * 2),
        ...hatch(x, y, w, t, 9),
        ...hatch(x, y + h - t, w, t, 9),
        ...hatch(x, y + t, t, h - t * 2, 9),
        ...hatch(x + w - t, y + t, t, h - t * 2, 9),
      ],
      hidden: [],
      bbox: [x, y, x + w, y + h],
      dims: [
        dimH(x, x + w, y + h + 40, y + h),
        // Wall thickness, arrows outside because the wall cannot hold them.
        dimV(y, y + t, x - 36, x, true),
      ],
    });
  }

  // Pillow block housing, front view.
  {
    const cx = 1046;
    const cy = 196;
    const bw = 92;
    const R = 58;
    const bore = 32;
    const yTop = cy + 52;
    const yBot = cy + 82;
    const k = R * Math.SQRT1_2;
    const foot = 64;
    const feet = cy + 67;
    const body =
      `M${cx - bw} ${yBot}H${cx + bw}V${yTop}H${cx + foot + 4}` +
      `L${(cx + k).toFixed(1)} ${(cy + k).toFixed(1)}` +
      `A${R} ${R} 0 1 0 ${(cx - k).toFixed(1)} ${(cy + k).toFixed(1)}` +
      `L${cx - foot - 4} ${yTop}H${cx - bw}Z`;
    const slots = [
      slotH(cx - foot, feet, 34, 9),
      slotH(cx + foot, feet, 34, 9),
    ];
    out.push({
      solid: [body, circle(cx, cy, bore), ...slots].join(""),
      paths: [
        body,
        circle(cx, cy, bore),
        circle(cx, cy, bore + 11),
        ...slots,
        // Grease nipple boss.
        `M${cx - 9} ${cy - R}v-14h18v14`,
        // The cap splits on the shaft centre, so the centre line doubles as it.
        ...centre(cx, cy, R + 24),
      ],
      hidden: [circle(cx, cy, bore + 20)],
      bbox: [cx - bw, cy - R - 14, cx + bw, yBot],
      dims: [
        // Mounting centres, struck off the two slot centres, and the overall
        // width stepped out beyond them.
        dimH(cx - foot, cx + foot, yBot + 42, feet, true, [
          [cx - foot, feet],
          [cx + foot, feet],
        ]),
        dimH(cx - bw, cx + bw, yBot + 78, yBot),
        dimH(cx - bore, cx + bore, cy - R - 52, cy, true),
      ],
    });
  }

  // Bolted truss node.
  {
    const cx = 1150;
    const cy = 452;
    const chord = rect(cx - 120, cy - 74, 240, 30);
    const plate = `M${cx - 88} ${cy - 44}h176v58l-54 42h-122Z`;
    const holes: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      holes.push(circle(cx - 54 + i * 36, cy - 59, 8));
    }
    const seats: [number, number][] = [
      [cx - 50, cy + 16],
      [cx - 6, cy + 16],
    ];
    for (const [hx, hy] of seats) holes.push(circle(hx, hy, 8));
    out.push({
      solid: [chord, plate, ...holes].join(""),
      paths: [
        chord,
        plate,
        ...holes,
        // Bolt line through the chord, and the fillet welds either side.
        `M${cx - 120} ${cy - 59}H${cx + 120}`,
        `M${cx - 88} ${cy - 44}l-13 -13M${cx + 88} ${cy - 44}l13 -13`,
      ],
      hidden: [`M${cx - 88} ${cy + 16}H${cx + 88}`],
      bbox: [cx - 120, cy - 74, cx + 120, cy + 56],
      dims: [
        dimV(cy - 74, cy - 44, cx + 158, cx + 120),
        // Plate depth, then the bolt gauge across the two lower holes.
        dimV(cy - 44, cy + 56, cx - 128, cx - 88, true),
        dimH(seats[0][0], seats[1][0], cy + 96, cy + 16, true, seats),
      ],
    });
  }

  return out;
})();

/** Flat list of every dimension, tagged with the drawing it belongs to. */
export const DIMS = SHEET.flatMap((drawing, d) =>
  drawing.dims.map((dim, i) => ({ ...dim, part: d, key: `${d}-${i}` })),
);

/** Running path index per drawing, so the stagger never mutates during render. */
export const PLOT_OFFSET = (() => {
  const out: number[] = [];
  let n = 0;
  for (const d of SHEET) {
    out.push(n);
    n += d.paths.length;
  }
  return out;
})();

export const PLOT_STEP = 6;
export const PLOT_MAX = 900;
export const ENTRY_MS = 1500;

/** How close the pointer gets before a part's outside dimensions appear. */
export const NEAR_REACH = 96;
/** And how close to an internal feature before that one appears. */
export const INNER_REACH = 150;
/** Radius of the lens that lifts the clearing under the pointer. */
export const LENS_R = 230;
