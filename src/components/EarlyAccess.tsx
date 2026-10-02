import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";

import { contact } from "../content";
import {
  type Envelope,
  QUESTION_LABELS,
  validateSubmission,
} from "../lib/earlyAccess";
import { loadOrgs, type Org, type OrgKind } from "../lib/orgs";
import { fold, type Index, search } from "../lib/search";
import { findSoftware, POPULAR, searchSoftware, SOFTWARE } from "../lib/software";
import { Button } from "./Button";
import { HeroField } from "./HeroField";
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

/**
 * Four steps, a minute between them: who you are, what you run, the machine
 * you are on with how much you use it, and how to reach you. The questions
 * kept are the ones that size the product; the rest can wait for a call.
 */
type StepId = "role" | "apps" | "setup" | "details";

type ChoiceId = "role" | "apps" | "machine" | "hours";

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
    cols: "sm:grid-cols-3",
    options: [
      { label: "Student", desc: "Studying architecture, engineering or design" },
      { label: "Maker", desc: "Personal projects, side work or freelancing" },
      { label: "Professional", desc: "CAD is part of my day job" },
    ],
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
  hours: {
    kind: "single",
    title: "Heavy CAD in a typical week",
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

const ROUTE: StepId[] = ["role", "apps", "setup", "details"];

/**
 * Where the blob is seen from at each step: close in on a different part of
 * it each time, the hot orange, the tan highlight, the blue side, the lilac,
 * so answering the questions walks you round it. Once sent, it pulls back to
 * the whole object.
 */
const JOURNEY: Record<StepId | "done", { azimuth: number; polar: number; zoom: number }> = {
  role: { azimuth: 270, polar: 180, zoom: 5.4 },
  apps: { azimuth: 215, polar: 148, zoom: 4.6 },
  setup: { azimuth: 330, polar: 122, zoom: 4.2 },
  details: { azimuth: 400, polar: 100, zoom: 3.8 },
  done: { azimuth: 270, polar: 180, zoom: 1.7 },
};

/** The choices asked for on each step. */
const ASKS: Record<Exclude<StepId, "details">, ChoiceId[]> = {
  role: ["role"],
  apps: ["apps"],
  setup: ["machine", "hours"],
};

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

function canLeave(a: Answers, step: StepId) {
  if (step === "details") return true;
  return ASKS[step].every((id) => {
    const c = CHOICES[id];
    const picks = a.picks[id] ?? [];
    if (c.other && !c.otherOptional && picks.includes(c.other) && !a.other[id]?.trim())
      return false;
    return c.kind === "multi" || picks.length > 0;
  });
}

/** What to ask for on the last page, given who they said they are. */
function orgLabel(a: Answers) {
  const role = first(a, "role");
  if (role === "Professional") return "Company";
  if (role === "Student") return "University";
  return null;
}


const field =
  "w-full rounded-full border border-hairline-strong bg-surface px-5 text-base text-ink placeholder:text-ink-subtle transition-colors duration-(--dur-fast) hover:border-edge focus:border-ink focus:outline-none";

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

  const path = ROUTE;
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
    // Focus without the ring: someone who clicked their way here shouldn't
    // see a first choice that looks already picked. Keyboard users still
    // land on it, and the ring returns as soon as they press Tab.
    target?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
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

  const forward = () => {
    if (at < path.length - 1) go(path[at + 1], 1);
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

    // A step with one single choice moves on by itself; the setup step,
    // which asks two, waits for Continue.
    window.clearTimeout(timer.current);
    if (c.kind === "single" && label !== c.other && step !== "details" && ASKS[step].length === 1) {
      timer.current = window.setTimeout(forward, ADVANCE_MS);
    }
  };

  const submit = async () => {
    const org = orgLabel(answers);
    const envelope: Envelope = {
      answers: Object.fromEntries(
        (Object.keys(CHOICES) as ChoiceId[]).map((id) => [id, describe(answers, id)]),
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
    else forward();
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

  let action = "Continue";
  if (step === "details") action = status === "sending" ? "Sending…" : "Send";
  else if (step === "apps" && !answers.picks.apps?.length) action = "Skip";

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
      className="modal m-auto h-[min(calc(100svh-2rem),720px)] max-h-none w-[min(calc(100vw-2rem),1080px)] max-w-none overflow-hidden rounded-lg border border-hairline-strong bg-bg p-0 text-ink"
    >
      {open && (
        <div className="relative h-full">
          {/* The blob, live, beside the questions; it ends in the corner. */}
          <div aria-hidden data-done={done || undefined} className="ea-blob">
            <HeroField view={JOURNEY[done ? "done" : step]} />
          </div>
          <div data-done={done || undefined} className="ea-main relative flex h-full min-h-0 flex-col">
          {/* Where you are: four segments, filling as you go. */}
          <div className="flex h-20 shrink-0 items-center gap-6 px-6 sm:px-10">
            <span className={`font-display text-sm tracking-[-0.02em] ${done ? "invisible" : ""}`}>meshrun</span>
            <div aria-hidden className={`flex flex-1 gap-1.5 ${done ? "invisible" : ""}`}>
              {path.map((id, i) => (
                <span key={id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-hairline-strong">
                  <span
                    className="block h-full origin-left bg-accent transition-transform duration-(--dur-slow) ease-expressive"
                    style={{ transform: `scaleX(${done || i < at ? 1 : i === at ? 0.5 : 0})` }}
                  />
                </span>
              ))}
            </div>
            {!done && <span className="text-sm text-ink-subtle tabular-nums">{`${at + 1} of ${path.length}`}</span>}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="press -mr-2 inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors duration-(--dur-fast) hover:bg-raised hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>

          <div ref={body} className="scroll min-h-0 flex-1 px-6 pt-6 pb-10 sm:px-10 sm:pt-10">
            {done ? (
              <Done email={answers.email.trim()} onClose={close} />
            ) : (
              <div key={step} className="step-in" style={{ "--dir": dir } as CSSProperties}>
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
                ) : step === "setup" ? (
                  <Setup answers={answers} onPick={pick} />
                ) : (
                  <Question
                    id="role"
                    answers={answers}
                    onPick={(label) => pick("role", label)}
                    onOther={(text) => setAnswers({ ...answers, other: { ...answers.other, role: text } })}
                    onFieldKey={onFieldKey}
                  />
                )}
              </div>
            )}
          </div>

          {!done && (
            <div className="flex h-20 shrink-0 items-center justify-between gap-4 border-t border-hairline px-6 sm:px-10">
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
    <div className="mb-9">
      <h3 className="display text-[clamp(26px,3.6vw,38px)] leading-[1.02] text-balance">{title}</h3>
      {hint && <p className="mt-3 text-base text-ink-muted">{hint}</p>}
    </div>
  );
}

/**
 * The machine and the hours, asked together: two short rows of pills on one
 * screen rather than two screens of tiles.
 */
function Setup({ answers, onPick }: { answers: Answers; onPick: (id: ChoiceId, label: string) => void }) {
  return (
    <>
      <Title title="Your setup" hint="So we size the machines and the plans right." />
      <div className="flex flex-col gap-9">
        {(["machine", "hours"] as const).map((id, g) => (
          <div key={id} role="radiogroup" aria-label={CHOICES[id].title} className="row-in flex flex-col gap-3" style={delay(60 + g * 80)}>
            <span className="text-base text-ink">{CHOICES[id].title}</span>
            <div className="flex flex-wrap gap-2">
              {CHOICES[id].options.map((o) => {
                const on = answers.picks[id]?.includes(o.label) ?? false;
                return (
                  <button
                    key={o.label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onPick(id, o.label)}
                    className={`press h-12 rounded-full border px-5 text-[15px] transition-colors duration-(--dur-fast) ${
                      on
                        ? "border-cta bg-cta font-medium text-on-cta"
                        : "border-hairline-strong text-ink-muted hover:border-ink/40 hover:text-ink"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
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
                className={`${field} h-12`}
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
      className="choice row-in flex h-full w-full items-start gap-3 rounded-md border border-hairline-strong bg-bg px-5 py-4 text-left hover:border-edge hover:bg-surface data-[on=true]:bg-surface"
    >
      <svg aria-hidden className="trace">
        <rect width="100%" height="100%" rx="16" pathLength={1} />
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
          className="pointer-events-none absolute top-1/2 left-4.5 -translate-y-1/2 text-ink-subtle"
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
          className={`${field} h-12 !pl-11`}
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
                    <rect width="100%" height="100%" rx="10" pathLength={1} />
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
                  <span className={`min-w-0 truncate text-base text-ink ${r.custom ? "flex-1" : ""}`}>
                    {r.custom ? <>Add &ldquo;{r.name}&rdquo;</> : r.name}
                  </span>
                  {!r.custom && (
                    <>
                      <Leader className="hidden sm:block" />
                      <span className="hidden shrink-0 text-sm text-ink-subtle sm:block">{r.meta}</span>
                    </>
                  )}
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
        title="Where do we reach you?"
        hint="We’ll write when there’s a spot for you. Everything here is optional."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="row-in flex flex-col gap-2 sm:col-span-2" style={delay(60)}>
          <span className="text-sm text-ink-muted">Email</span>
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
            placeholder="you@example.com"
            className={`${field} h-12 aria-invalid:border-error`}
          />
          {emailError && (
            <span className="text-sm text-error">That email doesn’t look quite right.</span>
          )}
        </label>
        <label className="row-in flex flex-col gap-2" style={delay(95)}>
          <span className="text-sm text-ink-muted">Name</span>
          <input
            type="text"
            autoComplete="name"
            value={answers.name}
            onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
            onKeyDown={onFieldKey}
            className={`${field} h-12`}
          />
        </label>
        {org && (
          <div className="row-in flex flex-col gap-2" style={delay(130)}>
            <OrgField
              kind={org}
              label={org}
              value={answers.org}
              onChange={(value) => setAnswers({ ...answers, org: value })}
              onFieldKey={onFieldKey}
            />
          </div>
        )}
        <Note
          value={answers.comments}
          onChange={(comments) => setAnswers({ ...answers, comments })}
        />
      </div>
    </>
  );
}

/** A note to the team, folded away until someone wants to leave one. */
function Note({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(!!value);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (open) box.current?.focus({ preventScroll: true });
  }, [open]);
  return (
    <div className="row-in sm:col-span-2" style={delay(165)}>
      {open ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink-muted">Note</span>
          <textarea
            ref={box}
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="What would make meshrun a must-have for you?"
            className={`${field} resize-none rounded-lg py-3`}
          />
        </label>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="link text-sm text-ink-muted">
          Add a note for the team
        </button>
      )}
    </div>
  );
}

/** The dotted run between a name and its detail: "UBC ........ BC, Canada". */
function Leader({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`mb-[0.3em] min-w-4 flex-1 self-end border-b border-dotted border-edge ${className}`}
    />
  );
}

/**
 * The company or university box: free text, with the known ones suggested as
 * you type, best match first and where each one is on the right. Picking one
 * fills in its name. Whatever is typed stands as it is, and unless it is
 * already one of the names, the last row offers exactly that.
 */
function OrgField({
  kind,
  label,
  value,
  onChange,
  onFieldKey,
}: {
  kind: OrgKind;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onFieldKey: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [index, setIndex] = useState<Index<Org> | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // The list is ten thousand long; typing stays ahead of the matching.
  const query = useDeferredValue(value).trim();

  useEffect(() => {
    let live = true;
    // If it never arrives, the box still takes whatever is typed.
    loadOrgs(kind).then(
      (i) => live && setIndex(i),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [kind]);

  const matches = useMemo(() => (index && query ? search(index, query, 6) : []), [index, query]);
  const rows = [
    ...matches.map((m) => ({ name: m.name, area: m.area, custom: false })),
    ...(query && !matches.some((m) => fold(m.name) === fold(query))
      ? [{ name: query, area: "", custom: true }]
      : []),
  ];
  const shown = open && rows.length > 0;
  const current = Math.min(active, rows.length - 1);
  const noun = kind === "University" ? "universities" : "companies";

  const choose = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!shown) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + rows.length) % rows.length);
    } else if (e.key === "Enter" && shown) {
      e.preventDefault();
      choose(rows[current].name);
    } else if (e.key === "Escape" && shown) {
      // Closes the list rather than the dialog.
      e.preventDefault();
      setOpen(false);
    } else {
      onFieldKey(e);
    }
  };

  return (
    <>
      <label htmlFor={`${id}-input`} className="text-sm text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={shown}
          aria-controls={`${id}-list`}
          aria-activedescendant={shown ? `${id}-${current}` : undefined}
          aria-autocomplete="list"
          autoComplete="organization"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={onKey}
          placeholder={`Start typing to search ${noun}`}
          className={`${field} h-12`}
        />
        {shown && (
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-label={`Matching ${noun}`}
            className="menu-in absolute inset-x-0 top-full z-20 mt-1.5 flex flex-col rounded-sm border border-edge bg-raised py-1"
          >
            {rows.map((r, i) => (
              <li
                key={`${r.custom}:${r.name}:${r.area}`}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === current}
                // Keeps the caret in the box while the row is clicked.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(r.name)}
                onMouseMove={() => setActive(i)}
                className={`flex items-center gap-2 px-3 py-2 transition-colors duration-(--dur-fast) ${
                  i === current ? "bg-surface" : ""
                }`}
              >
                {r.custom ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden className="shrink-0 text-accent">
                      <path d="M8 2v12M2 8h12" />
                    </svg>
                    <span className="min-w-0 flex-1 truncate text-base text-ink">
                      Use &ldquo;{r.name}&rdquo;
                    </span>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 truncate text-base text-ink">{r.name}</span>
                    <Leader />
                    <span className="max-w-[45%] shrink-0 truncate text-sm text-ink-subtle">{r.area}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
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
    <div className="step-in flex h-full flex-col justify-end pb-4" style={{ "--dir": 1 } as CSSProperties}>
      <h3 className="display text-[clamp(48px,8vw,104px)] leading-[0.92]">Thank you</h3>
      <p className="mt-6 max-w-[40ch] text-md text-ink-muted">
        That’s really useful. {note}
      </p>
      <div className="mt-10">
        <Button size="lg" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
