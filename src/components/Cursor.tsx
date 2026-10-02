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
    const outline = trace?.querySelector("rect");
    if (!layer || !dot || !ring || !trace || !outline) return;
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

    // The control's border is plotted the way a ruled card's is on hover: two
    // lines leave the top-left corner, one each way round, and meet at the
    // bottom-right. Leaving plots it back the way it came.
    const drawTrace = (control: HTMLElement) => {
      const box = control.getBoundingClientRect();
      // A pill's radius is "9999px": clamp it to the box, and set both axes,
      // or SVG rounds each axis on its own and the outline comes out an oval.
      const radius = Math.min(
        parseFloat(getComputedStyle(control).borderTopLeftRadius) || 0,
        box.width / 2,
        box.height / 2,
      );
      // Half a stroke in from the edge, so the corner follows the border's own.
      const r = `${Math.max(radius - 0.5, 0)}`;
      outline.setAttribute("rx", r);
      outline.setAttribute("ry", r);
      // Start from nothing, even if the last control's lines were still
      // being taken back when the cursor got here.
      trace.dataset.state = "reset";
      void trace.getBoundingClientRect();
      trace.dataset.state = "on";
    };
    // The line lies on the control's own border, not around it.
    const placeTrace = (box: DOMRect) => {
      trace.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
      trace.setAttribute("width", `${box.width}`);
      trace.setAttribute("height", `${box.height}`);
      // Inset by half the stroke so the whole 1px lands inside the border box.
      outline.setAttribute("width", `${Math.max(box.width - 1, 0)}`);
      outline.setAttribute("height", `${Math.max(box.height - 1, 0)}`);
    };
    // Stays where it was drawn while it unwinds.
    const fadeTrace = () => {
      if (trace.dataset.state === "on") trace.dataset.state = "off";
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
    };
  }, []);

  return (
    <div ref={layerRef} popover="manual" aria-hidden className="cursor-layer">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <svg ref={traceRef} className="cursor-trace" data-state="off">
        {/* The blob's cooler side, turning slowly round the control: a soft
            apricot into tan, lilac, blue and teal, with no deep red. */}
        <defs>
          <linearGradient id="trace-blob" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb27a" />
            <stop offset="0.22" stopColor="#f3cc9c" />
            <stop offset="0.42" stopColor="#c9c1d6" />
            <stop offset="0.62" stopColor="#8da0ce" />
            <stop offset="0.82" stopColor="#6f9bff" />
            <stop offset="1" stopColor="#73bfc4" />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 0.5 0.5"
              to="360 0.5 0.5"
              dur="5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <rect x="0.5" y="0.5" pathLength={1} />
      </svg>
    </div>
  );
}
