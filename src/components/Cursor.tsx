import { useEffect, useRef } from "react";

const RAISE_EVENT = "meshrun:cursor-raise";

/**
 * A modal dialog opens in the top layer, above anything a z-index can reach.
 * The cursor lives there too, as a popover; showing it again puts it back on
 * top of whatever has opened since.
 */
export function raiseCursor() {
  window.dispatchEvent(new Event(RAISE_EVENT));
}

// Controls that swallow the cursor opt in; everything else clickable only
// swells the ring, so big tiles and rows don't flood with colour.
const ABSORB = "[data-absorb]";
const HOT =
  'a, button, [role="button"], [role="option"], label, summary, input, select, textarea, [data-cursor="hot"]';

/** The lit segment's length, in px, once it has grown. */
const TRACE_LENGTH = 64;
/** Its average speed round the border, in px per second. */
const TRACE_SPEED = 150;
/** How far the speed swings either side of that average over each lap. */
const TRACE_SURGE = 0.6;
/** The comet's layers, tail to head: share of the full length each one lights. */
const TRACE_LAYERS = [1, 0.5, 0.16];

/**
 * A dot that tracks the pointer exactly and a ring that trails it, swelling
 * over anything clickable. Position is written straight to the elements from a
 * rAF loop, so React never renders on mouse move. Coarse pointers get nothing,
 * and text fields keep the native caret.
 */
export function Cursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const trace = traceRef.current;
    if (!layer || !dot || !ring || !trace) return;
    // The faint track first, then the comet's tail, body and head.
    const [track, ...comet] = Array.from(trace.querySelectorAll("rect"));
    const outlines = [track, ...comet];
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor");

    // The modal the layer was last lifted over. Anything that opens a modal
    // without saying so (a hot reload remounting one, a future dialog) is
    // caught the next time the pointer crosses into something.
    let over: Element | null = null;
    const raise = () => {
      if (!layer.showPopover) return;
      if (layer.matches(":popover-open")) layer.hidePopover();
      layer.showPopover();
      over = document.querySelector("dialog:modal");
    };
    const heal = () => {
      const modal = document.querySelector("dialog:modal");
      if (modal && (modal !== over || !layer.matches(":popover-open"))) raise();
    };
    raise();

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frame = 0;
    let visible = false;
    let absorbBox: DOMRect | null = null;

    const tick = () => {
      const toX = absorbBox ? absorbBox.left + absorbBox.width / 2 : targetX;
      const toY = absorbBox ? absorbBox.top + absorbBox.height / 2 : targetY;
      ringX += (toX - ringX) * 0.18;
      ringY += (toY - ringY) * 0.18;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame =
        Math.abs(toX - ringX) > 0.1 || Math.abs(toY - ringY) > 0.1
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Controls swallow the cursor: the ring morphs to the control's box, sits on
    // it, and the control takes the cursor's colour until you leave.
    let absorbed: HTMLElement | null = null;

    // A comet runs round the control's border while it holds the cursor: a
    // bright head trailing a fading tail over a faint lit track. It grows out
    // of a point as it sets off, then laps for as long as the cursor stays,
    // surging and easing once a lap so the tail stretches when it is quick and
    // bunches up as it slows. Drawn from a rAF loop with plain px values;
    // browsers drop a calc'd dash pattern and fall back to a solid border.
    let perimeter = 0;
    let lap = 0;
    let runStart = 0;
    let runFrame = 0;
    let fadeStart = 0;

    const renderTrace = (elapsed: number) => {
      const phase = elapsed / lap;
      const turn = 2 * Math.PI * phase;
      // Distance round the border: steady progress with a once-a-lap swell
      // (speed is the derivative, 1 + surge·cos, so it never stops).
      const head = perimeter * (phase + (TRACE_SURGE * Math.sin(turn)) / (2 * Math.PI));
      const speed = 1 + TRACE_SURGE * Math.cos(turn);
      const grow = 1 - (1 - Math.min(elapsed / 0.7, 1)) ** 3;
      const length =
        Math.min(TRACE_LENGTH * (0.6 + 0.4 * speed), perimeter * 0.45) * grow;

      comet.forEach((rect, i) => {
        const lit = length * TRACE_LAYERS[i];
        rect.style.strokeDasharray = `${lit}px ${perimeter - lit}px`;
        // Every layer's leading end on the same point, the head.
        rect.style.strokeDashoffset = `${(lit - head) % perimeter}px`;
      });
      // The head flares as it surges and dims as it eases.
      comet[comet.length - 1].style.opacity = `${0.7 + 0.3 * ((speed - (1 - TRACE_SURGE)) / (2 * TRACE_SURGE))}`;
    };

    const runTrace = (now: number) => {
      if (fadeStart && now - fadeStart > 400) {
        trace.dataset.state = "off";
        runFrame = 0;
        return;
      }
      renderTrace((now - runStart) / 1000);
      runFrame = requestAnimationFrame(runTrace);
    };

    const drawTrace = (control: HTMLElement) => {
      const radius = parseFloat(getComputedStyle(control).borderTopLeftRadius) || 0;
      // Half a stroke in from the edge, so the corner follows the border's own.
      for (const rect of outlines) rect.setAttribute("rx", `${Math.max(radius - 0.5, 0)}`);
      // A zero length would read as a solid dash, so fall back to the box.
      perimeter =
        track.getTotalLength() || 2 * (track.width.baseVal.value + track.height.baseVal.value);
      // Small controls aren't lapped in a blur, wide ones aren't left waiting.
      lap = Math.min(Math.max(perimeter / TRACE_SPEED, 1.4), 3);
      runStart = performance.now();
      fadeStart = 0;
      trace.dataset.state = "on";

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Held still, at full length, from the top-left corner.
        renderTrace(0.7);
        return;
      }
      if (!runFrame) runFrame = requestAnimationFrame(runTrace);
    };
    // The line lies on the control's own border, not around it.
    const placeTrace = (box: DOMRect) => {
      trace.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
      trace.setAttribute("width", `${box.width}`);
      trace.setAttribute("height", `${box.height}`);
      // Inset by half the stroke so the whole 1px lands inside the border box.
      for (const rect of outlines) {
        rect.setAttribute("width", `${Math.max(box.width - 1, 0)}`);
        rect.setAttribute("height", `${Math.max(box.height - 1, 0)}`);
      }
    };
    // It keeps running while it fades, so it goes out where it is.
    const fadeTrace = () => {
      if (trace.dataset.state !== "on") return;
      trace.dataset.state = "out";
      fadeStart = performance.now();
    };

    const release = () => {
      fadeTrace();
      if (absorbed) absorbed.classList.remove("absorbed");
      absorbed = null;
      ring.dataset.absorbed = "false";
      ring.style.width = "";
      ring.style.height = "";
      ring.style.margin = "";
      ring.style.borderRadius = "";
      dot.style.opacity = visible ? "1" : "0";
    };

    const fit = (control: HTMLElement) => {
      const box = control.getBoundingClientRect();
      ring.style.width = `${box.width}px`;
      ring.style.height = `${box.height}px`;
      ring.style.margin = `${-box.height / 2}px 0 0 ${-box.width / 2}px`;
      absorbBox = box;
      placeTrace(box);
    };

    const hover = (el: Element | null) => {
      const control = el?.closest?.(ABSORB) as HTMLElement | null;

      if (control) {
        const fresh = control !== absorbed;
        if (fresh) {
          if (absorbed) absorbed.classList.remove("absorbed");
          absorbed = control;
          control.classList.add("absorbed");
        }
        ring.dataset.absorbed = "true";
        ring.dataset.hot = "false";
        ring.style.borderRadius = getComputedStyle(control).borderRadius;
        dot.style.opacity = "0";
        fit(control);
        if (fresh) drawTrace(control);
        return;
      }

      if (absorbed) release();
      absorbBox = null;
      ring.dataset.hot = el?.closest?.(HOT) ? "true" : "false";
    };

    const onOver = (event: Event) => {
      heal();
      hover(event.target as Element | null);
    };

    // The page can move under a held control. The ring follows it while the
    // pointer is still on it, and lets go once the control has slid away.
    const onScroll = () => {
      if (!absorbed) return;
      const box = absorbed.getBoundingClientRect();
      const inside =
        targetX >= box.left && targetX <= box.right && targetY >= box.top && targetY <= box.bottom;
      if (inside) fit(absorbed);
      else hover(document.elementFromPoint(targetX, targetY));
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      absorbBox = null;
      fadeTrace();
      if (absorbed) {
        absorbed.classList.remove("absorbed");
        absorbed = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("blur", onLeave);
    window.addEventListener(RAISE_EVENT, raise);

    return () => {
      if (absorbed) absorbed.classList.remove("absorbed");
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll, { capture: true });
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener(RAISE_EVENT, raise);
      if (frame) cancelAnimationFrame(frame);
      if (runFrame) cancelAnimationFrame(runFrame);
    };
  }, []);

  return (
    <div ref={layerRef} popover="manual" aria-hidden className="cursor-layer">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <svg ref={traceRef} className="cursor-trace" data-state="off">
        <rect className="trace-track" x="0.5" y="0.5" />
        <rect className="trace-tail" x="0.5" y="0.5" />
        <rect className="trace-body" x="0.5" y="0.5" />
        <rect className="trace-head" x="0.5" y="0.5" />
      </svg>
    </div>
  );
}
