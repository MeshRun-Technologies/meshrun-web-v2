import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";

import { contact } from "../content";
import {
  type Envelope,
  QUESTION_LABELS,
  validateSubmission,
} from "../lib/earlyAccess";
import { findSoftware, POPULAR, searchSoftware, SOFTWARE } from "../lib/software";
import { Button } from "./Button";
import { raiseCursor } from "./Cursor";

/* --------------------------------------------------------------------------
   Early access.
   A short, branching questionnaire in a modal. Every button that asks for
   access calls openEarlyAccess(); the one dialog mounted in App listens.
   -------------------------------------------------------------------------- */

const OPEN_EVENT = "meshrun:early-access";

export function openEarlyAccess() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

// This site's own function (api/early-access.ts) unless pointed elsewhere.
const ENDPOINT =
  (import.meta.env.VITE_EARLY_ACCESS_ENDPOINT as string | undefined) || "/api/early-access";

/** Matches --dur-base, the dialog's exit. */
const EXIT_MS = 220;
/** Long enough to watch the selection draw before the step moves on. */
const ADVANCE_MS = 340;

type StepId =
  | "role"
  | "team"
  | "study"
  | "designTeam"
  | "apps"
  | "machine"
  | "current"
  | "switch"
  | "pull"
  | "keep"
  | "hours"
  | "details";

type ChoiceId = Exclude<StepId, "details">;

interface Option {
  label: string;
  desc?: string;
}

interface Choice {
  kind: "single" | "multi";
  title: string;
  hint?: string;
  /** Row label in the answers panel. */
  summary: string;
  options: Option[];
  /** The option that asks the visitor to say more. */
  other?: string;
  /** Prompt over that box, when "Tell us more" won't do. */
  otherLabel?: string;
  /** The box is a nice-to-have, not a requirement to move on. */
  otherOptional?: boolean;
  cols: string;
}

const CHOICES: Record<ChoiceId, Choice> = {
  role: {
    kind: "single",
    title: "Who are you?",
    summary: QUESTION_LABELS.role,
    cols: "",
    options: [
      { label: "Student", desc: "Studying architecture, engineering or design" },
      { label: "Maker", desc: "Personal projects, side work or freelancing" },
      { label: "Professional", desc: "CAD is part of my day job" },
    ],
  },
  team: {
    kind: "single",
    title: "How big is your team?",
    summary: QUESTION_LABELS.team,
    cols: "sm:grid-cols-2",
    options: [
      { label: "Just me" },
      { label: "2–10 people" },
      { label: "11–50 people" },
      { label: "More than 50" },
    ],
  },
  study: {
    kind: "single",
    title: "What are you studying?",
    summary: QUESTION_LABELS.study,
    cols: "sm:grid-cols-2",
    other: "Something else",
    options: [
      { label: "Architecture" },
      { label: "Engineering" },
      { label: "Industrial or product design" },
      { label: "Something else" },
    ],
  },
  designTeam: {
    kind: "single",
    title: "Are you on a student design team?",
    hint: "Formula SAE, robotics, solar car, Solar Decathlon and the like.",
    summary: QUESTION_LABELS.designTeam,
    cols: "sm:grid-cols-2",
    other: "Yes",
    otherLabel: "Which team?",
    otherOptional: true,
    options: [{ label: "Yes" }, { label: "No" }],
  },
  apps: {
    kind: "multi",
    title: "Which software do you need to run?",
    hint: "Pick from the usual suspects, or search for anything else.",
    summary: QUESTION_LABELS.apps,
    cols: "grid-cols-2 sm:grid-cols-4",
    options: POPULAR.map((label) => ({ label })),
  },
  machine: {
    kind: "single",
    title: "What do you work on today?",
    summary: QUESTION_LABELS.machine,
    cols: "sm:grid-cols-3",
    options: [{ label: "Windows" }, { label: "Mac" }, { label: "Linux" }],
  },
  current: {
    kind: "single",
    title: "How do you run Windows CAD today?",
    hint: "If you use more than one, pick the main one.",
    summary: QUESTION_LABELS.current,
    cols: "",
    other: "Other",
    options: [
      { label: "Only apps that run natively", desc: "I work around what’s missing" },
      { label: "Browser-based apps", desc: "Whatever runs in a tab" },
      { label: "Virtualization", desc: "Parallels, VMware, UTM" },
      { label: "A separate Windows machine", desc: "Dual boot, a second PC, the lab’s computers" },
      { label: "A cloud PC", desc: "Shadow, AWS, a remote desktop" },
      { label: "Other" },
    ],
  },
  switch: {
    kind: "single",
    title: "If your CAD ran perfectly on a Mac, would you switch?",
    summary: QUESTION_LABELS.switch,
    cols: "",
    options: [
      { label: "Yes", desc: "I’d make the move" },
      { label: "Maybe", desc: "It depends on the details" },
      { label: "No", desc: "I’m staying on Windows" },
    ],
  },
  pull: {
    kind: "multi",
    title: "What would make a Mac worth it?",
    hint: "Pick all that apply.",
    summary: QUESTION_LABELS.pull,
    cols: "grid-cols-2 sm:grid-cols-3",
    options: [
      { label: "Battery life" },
      { label: "Build quality" },
      { label: "Performance" },
      { label: "Display" },
      { label: "Quiet and cool" },
      { label: "macOS itself" },
    ],
  },
  keep: {
    kind: "multi",
    title: "What keeps you on Windows?",
    hint: "Pick all that apply.",
    summary: QUESTION_LABELS.keep,
    cols: "grid-cols-2 sm:grid-cols-3",
    other: "Other",
    options: [
      { label: "Other software I need" },
      { label: "I like my machine" },
      { label: "Price" },
      { label: "Work provides it" },
      { label: "Gaming" },
      { label: "Other" },
    ],
  },
  hours: {
    kind: "single",
    title: "How much heavy CAD work in a typical week?",
    hint: "Roughly. It helps us size the plans.",
    summary: QUESTION_LABELS.hours,
    cols: "sm:grid-cols-2",
    options: [
      { label: "Under 5 hours" },
      { label: "5–15 hours" },
      { label: "15–30 hours" },
      { label: "More than 30" },
    ],
  },
};

interface Answers {
  picks: Partial<Record<ChoiceId, string[]>>;
  other: Partial<Record<ChoiceId, string>>;
  name: string;
  email: string;
  /** Company for professionals, university for students. */
  org: string;
  comments: string;
  /** The field only bots fill in. */
  website: string;
}

const EMPTY: Answers = {
  picks: {},
  other: {},
  name: "",
  email: "",
  org: "",
  comments: "",
  website: "",
};

const first = (a: Answers, id: ChoiceId) => a.picks[id]?.[0];

/** The route through the questions, given what has been answered so far. */
function route(a: Answers): StepId[] {
  const role = first(a, "role");
  const machine = first(a, "machine");
  const sw = first(a, "switch");
  return [
    "role",
    ...(role === "Professional" ? ["team" as const] : []),
    ...(role === "Student" ? ["study" as const, "designTeam" as const] : []),
    "apps",
    "machine",
    ...(machine === "Windows"
      ? ["switch" as const, ...(sw === "No" ? ["keep" as const] : sw ? ["pull" as const] : [])]
      : machine
        ? ["current" as const]
        : []),
    "hours",
    "details",
  ];
}

/** An answer as one line, with "Other" replaced by what was typed. */
function describe(a: Answers, id: ChoiceId) {
  const c = CHOICES[id];
  const text = a.other[id]?.trim();
  return (a.picks[id] ?? [])
    .map((p) => {
      if (p !== c.other || !text) return p;
      return c.otherOptional ? `${p}, ${text}` : text;
    })
    .join(", ");
}

function canLeave(a: Answers, id: StepId) {
  if (id === "details") return true;
  const c = CHOICES[id];
  const picks = a.picks[id] ?? [];
  if (c.other && !c.otherOptional && picks.includes(c.other) && !a.other[id]?.trim())
    return false;
  return c.kind === "multi" || picks.length > 0;
}

/** What to ask for on the last page, given who they said they are. */
function orgLabel(a: Answers) {
  const role = first(a, "role");
  if (role === "Professional") return "Company";
  if (role === "Student") return "University";
  return null;
}


const field =
  "w-full rounded-sm border border-hairline-strong bg-bg px-3 text-base text-ink placeholder:text-ink-subtle transition-colors duration-(--dur-fast) hover:border-edge focus:border-ink focus:outline-none";

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/* ------------------------------------------------------------------------ */

export function EarlyAccess() {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const sent = useRef(false);
  /** When this attempt at the form began; the server turns away instant ones. */
  const started = useRef(0);

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [step, setStep] = useState<StepId>("role");
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);

  const path = route(answers);
  const at = path.indexOf(step);
  const done = status === "sent";

  // Open on request. A finished form starts over; one left halfway resumes.
  useEffect(() => {
    const onOpen = () => {
      if (sent.current) {
        sent.current = false;
        setAnswers(EMPTY);
        setStep("role");
        setDir(1);
        setStatus("idle");
        started.current = 0;
      }
      if (!started.current) started.current = Date.now();
      dialog.current?.showModal();
      raiseCursor();
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Hold the page still behind the dialog. The root scrolls, so the lock goes there.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Each new step takes focus on its first control, so the keyboard follows along.
  useEffect(() => {
    if (!open) return;
    const target = body.current?.querySelector<HTMLElement>(
      "button, input:not([tabindex='-1']), textarea",
    );
    target?.focus({ preventScroll: true });
  }, [step, done, open]);

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    const finish = () => {
      dialog.current?.close();
      setClosing(false);
      setOpen(false);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    setClosing(true);
    window.setTimeout(finish, EXIT_MS);
  }, []);

  const go = (to: StepId, d: number) => {
    window.clearTimeout(timer.current);
    setDir(d);
    setStep(to);
  };

  const forward = (a: Answers) => {
    const p = route(a);
    const i = p.indexOf(step);
    if (i < p.length - 1) go(p[i + 1], 1);
  };

  const back = () => {
    if (at > 0) go(path[at - 1], -1);
  };

  const pick = (id: ChoiceId, label: string) => {
    const c = CHOICES[id];
    const current = answers.picks[id] ?? [];
    const picks =
      c.kind === "single"
        ? [label]
        : current.includes(label)
          ? current.filter((p) => p !== label)
          : [...current, label];
    const next = { ...answers, picks: { ...answers.picks, [id]: picks } };
    setAnswers(next);

    window.clearTimeout(timer.current);
    if (c.kind === "single" && label !== c.other) {
      timer.current = window.setTimeout(() => forward(next), ADVANCE_MS);
    }
  };

  const submit = async () => {
    const org = orgLabel(answers);
    const envelope: Envelope = {
      answers: Object.fromEntries(
        path
          .filter((id): id is ChoiceId => id !== "details")
          .map((id) => [id, describe(answers, id)]),
      ),
      name: answers.name,
      email: answers.email,
      organisation: org ? answers.org : "",
      organisationKind: org ?? "",
      comments: answers.comments,
      website: answers.website,
      elapsedMs: Date.now() - started.current,
    };

    // The same check the server makes, so a typo is caught without a round trip.
    const check = validateSubmission(envelope);
    if (!check.ok) {
      if (check.field === "email") {
        setEmailError(true);
        body.current?.querySelector<HTMLInputElement>("input[type=email]")?.focus();
      } else {
        setStatus("error");
        setError(check.message);
      }
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
      });
      if (!res.ok) {
        const reply = (await res.json().catch(() => null)) as {
          error?: { message?: string; field?: string };
        } | null;
        if (reply?.error?.field === "email") setEmailError(true);
        throw new Error(res.status === 429 ? reply?.error?.message : undefined);
      }
      sent.current = true;
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(
        (e instanceof Error && e.message) ||
          `That didn’t go through. Try again, or write to ${contact}.`,
      );
    }
  };

  const advance = () => {
    if (!canLeave(answers, step)) return;
    if (step === "details") void submit();
    else forward(answers);
  };

  // Enter in a text box moves on; in the comments box it is a new line.
  const onFieldKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      advance();
    }
  };

  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialog.current) close();
  };

  const progress = done ? 1 : (at + 1) / path.length;
  const answered = path.filter(
    (id): id is ChoiceId => id !== "details" && (answers.picks[id]?.length ?? 0) > 0,
  );

  let action = "Continue";
  if (step === "details") action = status === "sending" ? "Sending…" : "Send";
  else if (CHOICES[step].kind === "multi" && !(answers.picks[step]?.length)) action = "Skip";

  return (
    <dialog
      ref={dialog}
      aria-label="Request early access"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={onBackdrop}
      data-closing={closing || undefined}
      className="modal m-auto h-[min(calc(100svh-2rem),680px)] max-h-none w-[min(calc(100vw-2rem),1000px)] max-w-none overflow-hidden rounded-md border border-hairline-strong bg-bg p-0 text-ink"
    >
      {open && (
        <div className="grid h-full md:grid-cols-[300px_1fr]">
          {/* The answers, filling in as a spec sheet beside the questions. */}
          <aside className="hidden flex-col border-r border-hairline bg-surface p-8 md:flex">
            <h2 className="font-display text-xl tracking-[-0.02em]">Early access</h2>
            <p className="mt-2 text-sm text-ink-muted">
              A few questions so we build the right thing first. About a minute.
            </p>
            <div className="mt-8 flex flex-col">
              {answered.map((id) => (
                <button
                  key={`${id}:${describe(answers, id)}`}
                  type="button"
                  disabled={done}
                  onClick={() => go(id, path.indexOf(id) < at ? -1 : 1)}
                  className="row-in group border-t border-hairline py-3 text-left disabled:cursor-default"
                >
                  <span className="block font-mono text-2xs tracking-wide text-ink-subtle uppercase">
                    {CHOICES[id].summary}
                  </span>
                  <span
                    className={`mt-0.5 block text-sm transition-colors duration-(--dur-fast) ${
                      id === step ? "text-accent" : "text-ink group-hover:text-accent"
                    }`}
                  >
                    {describe(answers, id)}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="relative flex min-h-0 flex-col">
            <div className="h-0.5 shrink-0 bg-hairline">
              <div
                className="h-full origin-left bg-accent transition-transform duration-(--dur-slow) ease-expressive"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>

            <div className="flex h-14 shrink-0 items-center justify-between px-6 sm:px-10">
              <span className="font-display text-md tracking-[-0.02em] md:invisible">
                Early access
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="tap -mr-1.5 inline-flex size-7 items-center justify-center rounded-sm text-ink-muted transition-colors duration-(--dur-fast) hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
                  <path d="M3 3l10 10M13 3 3 13" />
                </svg>
              </button>
            </div>

            <div ref={body} className="scroll min-h-0 flex-1 px-6 pt-4 pb-10 sm:px-10 sm:pt-8">
              {done ? (
                <Done email={answers.email.trim()} onClose={close} />
              ) : (
                <div
                  key={step}
                  className="step-in max-w-2xl"
                  style={{ "--dir": dir } as CSSProperties}
                >
                  {step === "apps" ? (
                    <SoftwarePicker
                      picks={answers.picks.apps ?? []}
                      onToggle={(name) => pick("apps", name)}
                      onDone={advance}
                    />
                  ) : step === "details" ? (
                    <Details
                      answers={answers}
                      setAnswers={setAnswers}
                      emailError={emailError}
                      clearEmailError={() => setEmailError(false)}
                      onFieldKey={onFieldKey}
                    />
                  ) : (
                    <Question
                      id={step}
                      answers={answers}
                      onPick={(label) => pick(step, label)}
                      onOther={(text) =>
                        setAnswers({ ...answers, other: { ...answers.other, [step]: text } })
                      }
                      onFieldKey={onFieldKey}
                    />
                  )}
                </div>
              )}
            </div>

            {!done && (
              <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-t border-hairline px-6 sm:px-10">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={back}
                  className={`-ml-5 ${at === 0 ? "invisible" : ""}`}
                >
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  {status === "error" && (
                    <p role="alert" className="max-w-sm text-right text-sm text-error">
                      {error}
                    </p>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    arrow={step !== "details"}
                    onClick={advance}
                    disabled={!canLeave(answers, step) || status === "sending"}
                  >
                    {action}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

/* ------------------------------------------------------------------------ */

function Title({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-8">
      <h3 className="font-display text-xl tracking-[-0.02em] text-balance sm:text-2xl">{title}</h3>
      {hint && <p className="mt-2 text-base text-ink-muted">{hint}</p>}
    </div>
  );
}

function Question({
  id,
  answers,
  onPick,
  onOther,
  onFieldKey,
}: {
  id: ChoiceId;
  answers: Answers;
  onPick: (label: string) => void;
  onOther: (text: string) => void;
  onFieldKey: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const c = CHOICES[id];
  const picks = answers.picks[id] ?? [];
  const showOther = !!c.other && picks.includes(c.other);
  const otherRef = useRef<HTMLInputElement>(null);

  // The box opens under the choices; the caret goes straight into it.
  useEffect(() => {
    if (showOther) otherRef.current?.focus({ preventScroll: true });
  }, [showOther]);

  return (
    <>
      <Title title={c.title} hint={c.hint} />
      <div
        role={c.kind === "single" ? "radiogroup" : "group"}
        aria-label={c.title}
        className={`grid gap-2 ${c.cols}`}
      >
        {c.options.map((o, i) => (
          <Tile
            key={o.label}
            kind={c.kind}
            on={picks.includes(o.label)}
            label={o.label}
            desc={o.desc}
            onClick={() => onPick(o.label)}
            style={delay(60 + i * 35)}
          />
        ))}
      </div>
      {c.other && (
        <div
          className="grid transition-[grid-template-rows] duration-(--dur-slow) ease-expressive"
          style={{ gridTemplateRows: showOther ? "1fr" : "0fr" }}
          inert={!showOther}
        >
          <div className="overflow-hidden">
            <label className="flex flex-col gap-1.5 pt-5">
              <span className="text-sm text-ink-muted">
                {c.otherLabel ?? "Tell us more"}
                {c.otherOptional && <span className="text-ink-subtle"> · optional</span>}
              </span>
              <input
                ref={otherRef}
                type="text"
                value={answers.other[id] ?? ""}
                onChange={(e) => onOther(e.target.value)}
                onKeyDown={onFieldKey}
                tabIndex={showOther ? 0 : -1}
                className={`${field} h-10`}
              />
            </label>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * A choice drawn like a cell on the page: picking it plots an ink outline
 * round its edge, and the mark beside the label fills in.
 */
function Tile({
  kind,
  on,
  label,
  desc,
  onClick,
  style,
}: {
  kind: "single" | "multi";
  on: boolean;
  label: string;
  desc?: string;
  onClick: () => void;
  style: CSSProperties;
}) {
  return (
    <button
      type="button"
      role={kind === "single" ? "radio" : "checkbox"}
      aria-checked={on}
      data-on={on}
      onClick={onClick}
      style={style}
      className="choice row-in flex w-full items-start gap-3 rounded-sm border border-hairline-strong bg-bg px-4 py-3.5 text-left hover:border-edge data-[on=true]:bg-surface"
    >
      <svg aria-hidden className="trace">
        <rect width="100%" height="100%" rx="4" pathLength={1} />
      </svg>
      {kind === "single" ? (
        <span className="ring mt-[3px] grid size-4 shrink-0 place-items-center rounded-full border border-edge">
          <span className="dot size-2 rounded-full bg-accent" />
        </span>
      ) : (
        <span className="box mt-[3px] grid size-4 shrink-0 place-items-center rounded-xs border border-edge">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
            <path className="tick" pathLength={1} d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        </span>
      )}
      <span className="flex flex-col gap-0.5">
        <span className="text-base text-ink">{label}</span>
        {desc && <span className="text-sm text-ink-muted">{desc}</span>}
      </span>
    </button>
  );
}

const popular: readonly string[] = POPULAR;

/**
 * The usual apps as tiles, with a search over the whole catalogue above them.
 * Typing swaps the tiles for matches; picking one clears the box, and anything
 * outside the tiles collects as a chip under the search. A name the catalogue
 * doesn't know can be added as typed.
 */
function SoftwarePicker({
  picks,
  onToggle,
  onDone,
}: {
  picks: string[];
  onToggle: (name: string) => void;
  onDone: () => void;
}) {
  const c = CHOICES.apps;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const q = query.trim();
  const custom =
    q && !findSoftware(q) && !picks.some((p) => p.toLowerCase() === q.toLowerCase());
  const rows = [
    ...searchSoftware(q).map((s) => ({ name: s[0], meta: `${s[1]} · ${s[2]}`, custom: false })),
    ...(custom ? [{ name: q, meta: "Add your own", custom: true }] : []),
  ];
  const extra = picks.filter((p) => !popular.includes(p));

  const choose = (name: string) => {
    onToggle(name);
    setQuery("");
    setActive(0);
    input.current?.focus({ preventScroll: true });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!rows.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + rows.length) % rows.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!q) onDone();
      else if (rows[active]) choose(rows[active].name);
    } else if (e.key === "Escape" && q) {
      // Clears the search rather than closing the dialog.
      e.preventDefault();
      setQuery("");
    }
  };

  return (
    <>
      <Title title={c.title} hint={c.hint} />

      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-subtle"
        >
          <path d="M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM11 11l3.5 3.5" />
        </svg>
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-label="Search software"
          aria-expanded={!!q}
          aria-controls="software-results"
          aria-activedescendant={q && rows[active] ? `software-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder={`Search ${SOFTWARE.length}+ apps, or type your own`}
          className={`${field} h-11 pl-10`}
        />
      </div>

      {extra.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {extra.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onToggle(p)}
              aria-label={`Remove ${p}`}
              className="pill-in group inline-flex h-7 items-center gap-1.5 rounded-sm border border-ink bg-surface pr-2 pl-2.5 text-sm text-ink transition-colors duration-(--dur-fast) hover:border-accent"
            >
              {p}
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden className="text-ink-subtle transition-colors duration-(--dur-fast) group-hover:text-accent">
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5">
        {q ? (
          <ul
            id="software-results"
            role="listbox"
            aria-multiselectable="true"
            aria-label="Matching software"
            className="flex flex-col gap-1.5"
          >
            {rows.map((r, i) => {
              const on = picks.includes(r.name);
              return (
                <li
                  key={`${r.custom}:${r.name}`}
                  id={`software-${i}`}
                  role="option"
                  aria-selected={on}
                  data-on={on}
                  // Keeps the caret in the search box while the row is clicked.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r.name)}
                  onMouseMove={() => setActive(i)}
                  style={delay(i * 25)}
                  className={`choice row-in flex items-center gap-3 rounded-sm border bg-bg px-4 py-2.5 data-[on=true]:bg-surface ${
                    i === active ? "border-edge" : "border-hairline-strong"
                  }`}
                >
                  <svg aria-hidden className="trace">
                    <rect width="100%" height="100%" rx="4" pathLength={1} />
                  </svg>
                  {r.custom ? (
                    <span className="grid size-4 shrink-0 place-items-center text-accent">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
                        <path d="M8 2v12M2 8h12" />
                      </svg>
                    </span>
                  ) : (
                    <span className="box grid size-4 shrink-0 place-items-center rounded-xs border border-edge">
                      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
                        <path className="tick" pathLength={1} d="M3 8.5 6.5 12 13 4.5" />
                      </svg>
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-base text-ink">
                    {r.custom ? <>Add &ldquo;{r.name}&rdquo;</> : r.name}
                  </span>
                  <span className="hidden shrink-0 text-sm text-ink-subtle sm:block">{r.meta}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div role="group" aria-label="Popular software" className={`grid gap-2 ${c.cols}`}>
            {popular.map((name, i) => (
              <Tile
                key={name}
                kind="multi"
                on={picks.includes(name)}
                label={name}
                onClick={() => onToggle(name)}
                style={delay(40 + i * 25)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Details({
  answers,
  setAnswers,
  emailError,
  clearEmailError,
  onFieldKey,
}: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  emailError: boolean;
  clearEmailError: () => void;
  onFieldKey: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const optional = <span className="text-ink-subtle"> · optional</span>;
  const org = orgLabel(answers);
  return (
    <>
      {/* A trap for form-filling bots: off screen, out of the tab order, and
          ignored by password managers. People never see it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={answers.website}
        onChange={(e) => setAnswers({ ...answers, website: e.target.value })}
        className="absolute -left-[9999px] size-px opacity-0"
      />
      <Title
        title="Anything else?"
        hint="Leave an email and we’ll reach out when there’s a spot for you."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="row-in flex flex-col gap-1.5" style={delay(60)}>
          <span className="text-sm text-ink-muted">Name{optional}</span>
          <input
            type="text"
            autoComplete="name"
            value={answers.name}
            onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
            onKeyDown={onFieldKey}
            className={`${field} h-10`}
          />
        </label>
        <label className="row-in flex flex-col gap-1.5" style={delay(95)}>
          <span className="text-sm text-ink-muted">Email{optional}</span>
          <input
            type="email"
            autoComplete="email"
            value={answers.email}
            aria-invalid={emailError}
            onChange={(e) => {
              clearEmailError();
              setAnswers({ ...answers, email: e.target.value });
            }}
            onKeyDown={onFieldKey}
            className={`${field} h-10 aria-invalid:border-error`}
          />
          {emailError && (
            <span className="text-sm text-error">That email doesn’t look quite right.</span>
          )}
        </label>
        {org && (
          <label className="row-in flex flex-col gap-1.5 sm:col-span-2" style={delay(130)}>
            <span className="text-sm text-ink-muted">
              {org}
              {optional}
            </span>
            <input
              type="text"
              autoComplete="organization"
              value={answers.org}
              onChange={(e) => setAnswers({ ...answers, org: e.target.value })}
              onKeyDown={onFieldKey}
              className={`${field} h-10`}
            />
          </label>
        )}
        <label className="row-in flex flex-col gap-1.5 sm:col-span-2" style={delay(165)}>
          <span className="text-sm text-ink-muted">Comments{optional}</span>
          <textarea
            rows={5}
            value={answers.comments}
            onChange={(e) => setAnswers({ ...answers, comments: e.target.value })}
            placeholder="What would make MeshRun a must-have for you?"
            className={`${field} resize-none py-2.5`}
          />
        </label>
      </div>
    </>
  );
}

function Done({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  let note = "We read every response, and this goes straight into what we build first.";
  if (email) note = `We’ll write to ${email} when there’s a spot for you.`;

  return (
    <div className="step-in flex h-full max-w-lg flex-col justify-center" style={{ "--dir": 1 } as CSSProperties}>
      <svg viewBox="0 0 48 48" className="plot size-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
        <circle cx="24" cy="24" r="22" pathLength={1} />
        <path d="M15 24.5 21.5 31 33.5 18" pathLength={1} style={delay(380)} />
      </svg>
      <h3 className="mt-8 font-display text-2xl tracking-[-0.02em]">Thanks, that’s really useful.</h3>
      <p className="mt-3 text-md text-ink-muted">{note}</p>
      <div className="mt-8">
        <Button size="lg" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
