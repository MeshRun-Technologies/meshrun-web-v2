import { memo, useEffect, useRef } from "react";

import {
  bboxDist,
  DIMS,
  ENTRY_MS,
  INNER_REACH,
  LENS_R,
  NEAR_REACH,
  PLOT_MAX,
  PLOT_OFFSET,
  PLOT_STEP,
  SHEET,
} from "../lib/sheet";

// The same pen as the workstation and stream marks: 1px, square caps, mitred
// joins. The sheet is drawn in `edge`, the faintest mark in the palette, so a
// wall of linework stays behind the copy rather than competing with it.
const pen = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
} as const;

const SheetArt = memo(function SheetArt() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full text-edge"
      aria-hidden
    >
      {/* Solid parts: what the sheet looks like at rest. */}
      <g fillRule="evenodd">
        {SHEET.map((drawing, d) => (
          <path
            key={`s-${d}`}
            data-solid={d}
            d={drawing.solid}
            fill="currentColor"
            fillOpacity="0.17"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0"
          />
        ))}
      </g>

      {/* The linework underneath, plotted line by line on load. */}
      <g {...pen}>
        {SHEET.map((drawing, d) => (
          <g key={`w-${d}`} data-wire={d}>
            {drawing.paths.map((path, i) => (
              <path
                key={`p-${i}`}
                d={path}
                pathLength={1}
                className="sheet-line"
                style={{
                  animationDelay: `${Math.min((PLOT_OFFSET[d] + i) * PLOT_STEP, PLOT_MAX)}ms`,
                }}
              />
            ))}
            {drawing.hidden.map((path, i) => (
              <path
                key={`h-${i}`}
                d={path}
                pathLength={1}
                strokeDasharray="0.012 0.012"
                opacity="0.7"
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
});

/** Dimensions, each hidden until its own feature is approached. */
const DimLayer = memo(function DimLayer() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full text-accent"
      aria-hidden
      data-dims=""
    >
      {DIMS.map((dim) => (
        <g key={dim.key} data-dim={dim.key} opacity="0" {...pen}>
          {dim.paths.map((p, i) => (
            <path key={i} d={p} />
          ))}
        </g>
      ))}
    </svg>
  );
});

/**
 * The sheet. Parts sit solid until the pointer reaches one: come close and its
 * outside dimensions appear, move onto it and it opens into linework with the
 * internal dimensions nearest the pointer.
 */
export const Sheet = memo(function Sheet() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const solids = SHEET.map((_, d) =>
      root.querySelector<SVGPathElement>(`path[data-solid="${d}"]`),
    );
    const wires = SHEET.map((_, d) =>
      root.querySelector<SVGGElement>(`g[data-wire="${d}"]`),
    );
    const dimGroups = DIMS.map((dim) =>
      root.querySelector<SVGGElement>(`g[data-dim="${dim.key}"]`),
    );
    const svg = root.querySelector<SVGSVGElement>("[data-dims]");

    // The entrance is the one thing here that plays on its own; direct
    // manipulation below is the visitor's own doing and always runs.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let map = { ox: 0, oy: 0, k: 1, left: 0, top: 0 };
    const remap = () => {
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const k = Math.max(r.width / 1600, r.height / 900);
      map = {
        k,
        ox: (r.width - 1600 * k) / 2,
        oy: (r.height - 900 * k) / 2,
        left: r.left,
        top: r.top,
      };
    };
    remap();

    let pointerX = -9999;
    let pointerY = -9999;
    let frame = 0;
    const start = performance.now();
    const solidNow = SHEET.map(() => 0);
    const wireNow = SHEET.map(() => 1);
    const dimNow = DIMS.map(() => 0);
    let lensNow = 0;

    const tick = (now: number) => {
      const entry = reduced ? 1 : Math.min((now - start) / ENTRY_MS, 1);
      const px = (pointerX - map.left - map.ox) / map.k;
      const py = (pointerY - map.top - map.oy) / map.k;

      let busy = entry < 1;
      let closest = Infinity;

      for (let d = 0; d < SHEET.length; d += 1) {
        const dist = bboxDist(SHEET[d].bbox, px, py);
        if (dist < closest) closest = dist;
        const over = dist === 0;
        const near = dist < NEAR_REACH;

        // The part fills in as the sheet finishes plotting, and opens back up
        // wherever the pointer actually is.
        const wantSolid = over ? 0 : entry;
        const wantWire = over ? 1 : 1 - entry;

        solidNow[d] += (wantSolid - solidNow[d]) * 0.085;
        wireNow[d] += (wantWire - wireNow[d]) * 0.085;
        if (Math.abs(wantSolid - solidNow[d]) > 0.004) busy = true;
        if (Math.abs(wantWire - wireNow[d]) > 0.004) busy = true;

        solids[d]?.setAttribute("opacity", solidNow[d].toFixed(3));
        wires[d]?.setAttribute("opacity", wireNow[d].toFixed(3));

        for (let i = 0; i < DIMS.length; i += 1) {
          const dim = DIMS[i];
          if (dim.part !== d) continue;
          const want = dim.inner
            ? over && Math.hypot(dim.at[0] - px, dim.at[1] - py) < INNER_REACH
              ? 1
              : 0
            : near
              ? 1
              : 0;
          dimNow[i] += (want - dimNow[i]) * 0.11;
          if (Math.abs(want - dimNow[i]) > 0.004) busy = true;
          dimGroups[i]?.setAttribute("opacity", dimNow[i].toFixed(3));
        }
      }

      // Only lift the clearing while the pointer is actually on a drawing,
      // so passing over the headline leaves the sheet alone.
      const wantLens = closest < NEAR_REACH ? 1 : 0;
      lensNow += (wantLens - lensNow) * 0.085;
      if (Math.abs(wantLens - lensNow) > 0.004) busy = true;

      root.style.setProperty("--lens-x", `${pointerX - map.left}px`);
      root.style.setProperty("--lens-y", `${pointerY - map.top}px`);
      root.style.setProperty("--lens-r", `${(lensNow * LENS_R).toFixed(1)}px`);

      frame = busy ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      kick();
    };

    const onLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
      kick();
    };

    const onResize = () => {
      remap();
      kick();
    };

    kick();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0 bg-bg" aria-hidden>
      <div className="sheet-wash absolute inset-0" />

      <div className="sheet-mask absolute inset-0">
        <SheetArt />
      </div>

      <div className="sheet-mask absolute inset-0">
        <DimLayer />
      </div>

      {/* Hands the sheet over to the page below rather than cutting it off. */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-b from-transparent to-bg" />
    </div>
  );
});
