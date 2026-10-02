/**
 * The blob's voice: a short, glassy droplet. A sine that bends up into its
 * note, with a quiet octave above for the glass, gone in a quarter second.
 *
 * Each tap takes a different note of a pentatonic scale, so tapping away plays
 * a little tune rather than the same blip; any run of them sounds in key.
 * Synthesised, so there is nothing to download, and the context is only made
 * on the first tap, inside the gesture, as iOS requires.
 */

/** C major pentatonic, C5 to C6. */
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

let context: AudioContext | null = null;
let lastNote = -1;

export function bloop() {
  try {
    context ??= new AudioContext();
  } catch {
    return;
  }
  const audio = context;
  if (audio.state === "suspended") void audio.resume();

  let note = Math.floor(Math.random() * NOTES.length);
  if (note === lastNote) note = (note + 1 + Math.floor(Math.random() * (NOTES.length - 1))) % NOTES.length;
  lastNote = note;
  const pitch = NOTES[note];

  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.32, now + 0.008);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
  out.connect(audio.destination);

  // The drop: rises a fifth into the note, as water does when it lands.
  const body = audio.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(pitch * 0.66, now);
  body.frequency.exponentialRampToValueAtTime(pitch, now + 0.045);
  body.connect(out);

  // The glass: an octave up, quieter and shorter.
  const ring = audio.createOscillator();
  const ringGain = audio.createGain();
  ring.type = "sine";
  ring.frequency.setValueAtTime(pitch * 1.32, now);
  ring.frequency.exponentialRampToValueAtTime(pitch * 2, now + 0.045);
  ringGain.gain.setValueAtTime(0.0001, now);
  ringGain.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
  ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  ring.connect(ringGain).connect(out);

  for (const osc of [body, ring]) {
    osc.start(now);
    osc.stop(now + 0.3);
  }
  body.onended = () => out.disconnect();
}
