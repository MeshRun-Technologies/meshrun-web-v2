import { useSyncExternalStore } from "react";

/**
 * Whether the visitor has paused the page's motion. Anything that moves on its
 * own for more than a few seconds (the live blobs) needs a way to stop it, and
 * not everyone who wants that has reduced motion set in their system, so the
 * page carries its own switch. The choice is kept in this browser only.
 */

const KEY = "meshrun:motion";
const listeners = new Set<() => void>();

let paused = read();

function read() {
  try {
    return localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
}

export function setMotionPaused(value: boolean) {
  paused = value;
  try {
    if (value) localStorage.setItem(KEY, "paused");
    else localStorage.removeItem(KEY);
  } catch {
    // Private windows and blocked storage: the switch still works for this visit.
  }
  document.documentElement.toggleAttribute("data-motion-paused", value);
  listeners.forEach((listener) => listener());
}

export function motionPaused() {
  return paused;
}

export function onMotionChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMotionPaused() {
  return useSyncExternalStore(onMotionChange, motionPaused, () => false);
}

if (typeof document !== "undefined") document.documentElement.toggleAttribute("data-motion-paused", paused);
