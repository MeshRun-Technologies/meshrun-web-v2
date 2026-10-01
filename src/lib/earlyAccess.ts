// The early access submission: its shape, its limits, and how it is checked.
// Shared by the form, which validates before sending, and the server, which
// trusts nothing and validates again.

/** Every question the form can ask, with the label it carries in the panel and in emails. */
export const QUESTION_LABELS = {
  role: "Role",
  team: "Team",
  study: "Studying",
  designTeam: "Design team",
  apps: "Software",
  machine: "Machine",
  current: "Runs CAD via",
  switch: "Switch to Mac",
  pull: "Mac appeal",
  keep: "Staying for",
  hours: "CAD per week",
} as const;

export type QuestionId = keyof typeof QUESTION_LABELS;

/** Asked on every route through the form, so a submission without them is not from it. */
const REQUIRED: QuestionId[] = ["role", "machine", "hours"];

export type OrganisationKind = "Company" | "University";

export interface Submission {
  /** Each answer as one line, as the visitor saw it. */
  answers: Partial<Record<QuestionId, string>>;
  name: string;
  email: string;
  organisation: string;
  organisationKind: OrganisationKind | "";
  comments: string;
}

/** What the browser sends: the submission plus two quiet bot checks. */
export interface Envelope extends Submission {
  /** A field people never see. Anything in it came from a bot. */
  website: string;
  /** Milliseconds from opening the form to sending it. */
  elapsedMs: number;
}

export const LIMITS = {
  answer: 600,
  name: 120,
  email: 254,
  organisation: 160,
  comments: 4000,
} as const;

/** Anything faster than this was not filled in by a person. */
export const MIN_ELAPSED_MS = 3000;

export type FieldError = { field: string; message: string };

export type Validation<T> = { ok: true; data: T } | ({ ok: false } & FieldError);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (s: string) => EMAIL.test(s);

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Checks and normalises a submission from anywhere. */
export function validateSubmission(input: unknown): Validation<Submission> {
  if (!input || typeof input !== "object") {
    return { ok: false, field: "body", message: "Expected a JSON object." };
  }
  const raw = input as Record<string, unknown>;
  const rawAnswers =
    raw.answers && typeof raw.answers === "object" ? (raw.answers as Record<string, unknown>) : {};

  const answers: Submission["answers"] = {};
  for (const id of Object.keys(QUESTION_LABELS) as QuestionId[]) {
    const value = text(rawAnswers[id]);
    if (!value) continue;
    if (value.length > LIMITS.answer) {
      return { ok: false, field: id, message: "That answer is too long." };
    }
    answers[id] = value;
  }
  for (const id of REQUIRED) {
    if (!answers[id]) {
      return { ok: false, field: id, message: `Missing an answer for “${QUESTION_LABELS[id]}”.` };
    }
  }

  const name = text(raw.name);
  const email = text(raw.email);
  const organisation = text(raw.organisation);
  const comments = text(raw.comments);
  const kind = text(raw.organisationKind);
  const organisationKind: Submission["organisationKind"] =
    kind === "Company" || kind === "University" ? kind : "";

  if (name.length > LIMITS.name) return { ok: false, field: "name", message: "That name is too long." };
  if (email.length > LIMITS.email || (email && !isEmail(email))) {
    return { ok: false, field: "email", message: "That email doesn’t look quite right." };
  }
  if (organisation.length > LIMITS.organisation) {
    return { ok: false, field: "organisation", message: "That name is too long." };
  }
  if (comments.length > LIMITS.comments) {
    return { ok: false, field: "comments", message: "That’s a bit long. Could you trim it down?" };
  }

  return {
    ok: true,
    data: {
      answers,
      name,
      email,
      organisation: organisationKind ? organisation : "",
      organisationKind,
      comments,
    },
  };
}

/** A submission as plain text, one line per answer, for emails and logs. */
export function formatSubmission(s: Submission) {
  const lines = (Object.keys(QUESTION_LABELS) as QuestionId[])
    .filter((id) => s.answers[id])
    .map((id) => `${QUESTION_LABELS[id]}: ${s.answers[id]}`);
  lines.push("");
  lines.push(`Name: ${s.name || "—"}`);
  lines.push(`Email: ${s.email || "—"}`);
  if (s.organisationKind) lines.push(`${s.organisationKind}: ${s.organisation || "—"}`);
  if (s.comments) lines.push("", "Comments:", s.comments);
  return lines.join("\n");
}
