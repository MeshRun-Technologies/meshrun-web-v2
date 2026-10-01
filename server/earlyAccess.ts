// Receives early access submissions and passes them on. Written against the
// web-standard Request and Response, so the same handler runs as a Vercel
// function (api/early-access.ts) and inside the Vite dev server.
//
// Where a submission goes is set by environment variables; see .env.example.
// Every configured destination is tried; the visitor sees success if at least
// one of them took it.

import {
  formatSubmission,
  MIN_ELAPSED_MS,
  type Submission,
  validateSubmission,
} from "../src/lib/earlyAccess.js";

export type Env = Record<string, string | undefined>;

/** A submission as it is delivered: what they sent, and when and from where. */
export interface Received extends Submission {
  receivedAt: string;
  page: string;
}

export interface Sink {
  name: string;
  deliver: (record: Received) => Promise<void>;
}

/** The largest body worth reading; a full form is a few kilobytes. */
const MAX_BODY = 32 * 1024;

const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };
// Per instance, so on serverless it is a speed bump rather than a wall. Enough
// to stop one tab hammering the button; put a real limiter in front for more.
const recent = new Map<string, number[]>();

function limited(key: string, now: number) {
  const hits = (recent.get(key) ?? []).filter((t) => now - t < RATE.windowMs);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > RATE.limit;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const fail = (status: number, message: string, field?: string) =>
  json(status, { ok: false, error: { message, field } });

/* ------------------------------------------------------------------------ */

/**
 * One private JSON file per submission in a Vercel Blob store. Linking a store
 * to the project sets BLOB_READ_WRITE_TOKEN; browse them under Storage.
 */
function blobSink(env: Env): Sink | null {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  return {
    name: "blob",
    async deliver(r) {
      const { put } = await import("@vercel/blob");
      // Timestamped names list in the order they arrived.
      const stamp = r.receivedAt.replace(/[:.]/g, "-");
      await put(`early-access/${stamp}.json`, JSON.stringify(r, null, 2), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: true,
        token,
      });
    },
  };
}

/** Email to the team through Resend. Needs RESEND_API_KEY and EARLY_ACCESS_FROM. */
function resendSink(env: Env): Sink | null {
  const key = env.RESEND_API_KEY;
  const from = env.EARLY_ACCESS_FROM;
  if (!key || !from) return null;
  const to = (env.EARLY_ACCESS_TO ?? "info@meshrun.co").split(",").map((s) => s.trim());

  return {
    name: "resend",
    async deliver(r) {
      const who = r.name || r.email || "Someone";
      const role = r.answers.role ? ` (${r.answers.role})` : "";
      await sendEmail(key, {
        from,
        to,
        reply_to: r.email || undefined,
        subject: `Early access: ${who}${role}`,
        text: `${formatSubmission(r)}\n\nReceived ${r.receivedAt}${r.page ? ` from ${r.page}` : ""}`,
      });
    },
  };
}

async function sendEmail(key: string, message: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/**
 * A POST to any URL. Slack and Discord webhooks get a message in their own
 * format; anything else (Zapier, Make, a Google Apps Script bound to a sheet,
 * your own API) gets the whole record as JSON.
 */
function webhookSink(env: Env): Sink | null {
  const url = env.EARLY_ACCESS_WEBHOOK_URL;
  if (!url) return null;
  const host = new URL(url).hostname;
  const secret = env.EARLY_ACCESS_WEBHOOK_SECRET;

  return {
    name: "webhook",
    async deliver(r) {
      const text = `*New early access request*\n${formatSubmission(r)}`;
      const body =
        host === "hooks.slack.com"
          ? { text }
          : host.endsWith("discord.com")
            ? { content: text.replace(/^\*(.+)\*/, "**$1**").slice(0, 2000) }
            : r;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}: ${await res.text()}`);
    },
  };
}

/** A thank-you to the visitor, when they left an email and it's switched on. */
async function confirm(env: Env, r: Received) {
  if (env.EARLY_ACCESS_CONFIRM !== "true" || !r.email) return;
  if (!env.RESEND_API_KEY || !env.EARLY_ACCESS_FROM) return;
  await sendEmail(env.RESEND_API_KEY, {
    from: env.EARLY_ACCESS_FROM,
    to: [r.email],
    reply_to: env.EARLY_ACCESS_TO?.split(",")[0]?.trim() || "info@meshrun.co",
    subject: "You’re on the MeshRun early access list",
    text: [
      `Hi${r.name ? ` ${r.name.split(" ")[0]}` : ""},`,
      "",
      "Thanks for telling us how you work. MeshRun isn’t open yet, and we’re bringing people in a few at a time. We’ll write to this address when there’s a spot for you.",
      "",
      "If there’s anything else you want us to know, just reply.",
      "",
      "The MeshRun team",
    ].join("\n"),
  });
}

export function sinksFrom(env: Env): Sink[] {
  return [blobSink(env), resendSink(env), webhookSink(env)].filter((s): s is Sink => s !== null);
}

/* ------------------------------------------------------------------------ */

export async function handleEarlyAccess(
  request: Request,
  env: Env,
  options: { fallback?: Sink } = {},
): Promise<Response> {
  if (request.method !== "POST") return fail(405, "Use POST.");
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "Send JSON.");
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, "That’s more than we can take in one go.");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "That wasn’t valid JSON.");
  }

  // Bots get a cheerful success and nothing is delivered, so they learn nothing.
  const elapsed = Number(body?.elapsedMs);
  if ((typeof body?.website === "string" && body.website.trim()) || !(elapsed >= MIN_ELAPSED_MS)) {
    return json(200, { ok: true });
  }

  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  if (limited(ip, Date.now())) {
    return fail(429, "You’ve sent a few of these already. Try again in a few minutes.");
  }

  const result = validateSubmission(body);
  if (!result.ok) return fail(400, result.message, result.field);

  const record: Received = {
    ...result.data,
    receivedAt: new Date().toISOString(),
    page: request.headers.get("referer") ?? "",
  };

  const sinks = sinksFrom(env);
  if (!sinks.length && options.fallback) sinks.push(options.fallback);
  if (!sinks.length) {
    console.error("[early-access] No destination configured; see .env.example.", record);
    return fail(503, "We can’t take requests right now.");
  }

  const results = await Promise.allSettled(sinks.map((s) => s.deliver(record)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[early-access] ${sinks[i].name} failed:`, r.reason);
  });
  if (!results.some((r) => r.status === "fulfilled")) {
    return fail(502, "That didn’t go through.");
  }

  // Best effort: a failed thank-you shouldn't fail a request we already have.
  await confirm(env, record).catch((e) => console.error("[early-access] confirmation failed:", e));

  return json(200, { ok: true });
}
