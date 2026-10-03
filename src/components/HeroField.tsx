import { useEffect, useRef } from "react";

import { createField, type Field, OBJECT_VIEW, type View } from "../lib/heroField";
import { motionPaused, onMotionChange } from "../lib/motion";

/** Where the motion starts: a frame that already reads well before it moves. */
const START_S = 14;

/**
 * The landing's render, filling its pane behind the copy.
 *
 * It only runs while it can be seen: off screen or in a hidden tab the loop
 * stops, and with reduced motion, or the page's motion paused, it draws one
 * still frame. Until its first frame lands the canvas is transparent, so the
 * pane's own black shows rather than a flash; without WebGL that black simply
 * stays.
 */
export function HeroField({ view = OBJECT_VIEW, className = "" }: { view?: View; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<Field | null>(null);
  const drawRef = useRef<() => void>(() => {});
  // The first view is set at creation; later ones glide there.
  const firstView = useRef(view);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let created: Field | null = null;
    try {
      created = createField(canvas, firstView.current);
    } catch (error) {
      console.error("[hero] render unavailable:", error);
    }
    if (!created) return;
    const field = created;
    fieldRef.current = field;

    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let onScreen = true;
    // Time only advances while it's drawn, so it picks up where it left off.
    let elapsed = START_S;
    let last = 0;

    const tick = (now: number) => {
      if (last) elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      field.draw(elapsed);
      canvas.dataset.ready = "true";
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    drawRef.current = () => field.draw(elapsed);
    const update = () => {
      const held = still.matches || motionPaused();
      const run = onScreen && !document.hidden && !held;
      if (run && !frame) frame = requestAnimationFrame(tick);
      if (!run) stop();
      if (held) {
        field.draw(elapsed);
        canvas.dataset.ready = "true";
      }
    };

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    visibility.observe(canvas);
    const resize = new ResizeObserver(() => {
      field.resize();
      // A resize clears the buffer; redraw so a still frame doesn't vanish.
      field.draw(elapsed);
    });
    resize.observe(canvas);
    document.addEventListener("visibilitychange", update);
    still.addEventListener("change", update);
    const unsubscribe = onMotionChange(update);
    update();

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", update);
      still.removeEventListener("change", update);
      unsubscribe();
      field.destroy();
      fieldRef.current = null;
    };
  }, []);

  // A new view glides in while the loop runs; held still, it jumps and redraws.
  const { azimuth, polar, zoom } = view;
  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches || motionPaused();
    fieldRef.current?.setView({ azimuth, polar, zoom }, still);
    if (still) drawRef.current();
  }, [azimuth, polar, zoom]);

  return <canvas ref={canvasRef} aria-hidden className={`hero-field ${className}`} />;
}
