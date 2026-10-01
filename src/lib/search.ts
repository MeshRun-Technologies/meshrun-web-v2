// Type-ahead matching for the early access pickers: software, universities and
// companies all search the same way. It forgives what people actually type:
// short forms ("ubc", "sw", "u of t"), words in any order ("toronto
// university"), missing or extra spaces ("solid works"), and the odd slip
// ("univeristy", "solidwrks"). Better matches come first; among equally good
// ones, the better-known entry wins.

export interface Searchable {
  /** What is shown, and what gets filled in. */
  name: string;
  /** Other names it goes by: acronyms, short names, old names. */
  aliases?: readonly string[];
  /** Weaker hints, matched only when nothing better does (a vendor, a category). */
  context?: string;
  /** How well known it is; higher wins a tie. */
  rank?: number;
}

/** Lower case, no accents, punctuation as spaces: "Zürich (ETH)" → "zurich eth". */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

interface Indexed<T> {
  item: T;
  name: string;
  /** The name without its generic opening: "university of toronto" → "toronto". */
  core: string;
  compact: string;
  words: string[];
  aliases: { text: string; compact: string }[];
  aliasWords: string[];
  context: string[];
  rank: number;
  /** Every first letter worth checking a slip against. */
  initials: Set<string>;
}

export interface Index<T> {
  entries: Indexed<T>[];
}

const words = (s: string) => s.split(" ").filter(Boolean);

/** Words that open a name without saying which one it is. */
const GENERIC = new Set(
  "the of de del della di la le du des at and university universidad universidade universite universita universitat universiteit college institute school".split(
    " ",
  ),
);

const core = (name: string) => {
  const w = words(name);
  const first = w.findIndex((x) => !GENERIC.has(x));
  return first > 0 ? w.slice(first).join(" ") : name;
};

export function buildIndex<T extends Searchable>(items: readonly T[]): Index<T> {
  return {
    entries: items.map((item) => {
      const name = fold(item.name);
      const aliases = (item.aliases ?? []).map(fold).filter(Boolean);
      const nameWords = words(name);
      const aliasWords = aliases.flatMap(words);
      return {
        item,
        name,
        core: core(name),
        compact: name.replace(/ /g, ""),
        words: nameWords,
        aliases: aliases.map((text) => ({ text, compact: text.replace(/ /g, "") })),
        aliasWords,
        context: words(fold(item.context ?? "")),
        rank: item.rank ?? 0,
        initials: new Set([...nameWords, ...aliasWords].map((w) => w[0])),
      };
    }),
  };
}

/* ------------------------------------------------------------------------ */

/** Edits allowed for a typed fragment of this length: none until it's long enough to tell. */
const slack = (length: number) => (length >= 8 ? 2 : length >= 4 ? 1 : 0);

/** Optimal string alignment distance: insertions, deletions, swaps and adjacent transpositions. */
function distance(a: string, b: string, limit: number) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, prev2[j - 2] + 1);
      }
      row.push(d);
      best = Math.min(best, d);
    }
    // Every path through this row is already over: stop early.
    if (best > limit) return limit + 1;
    prev2 = prev;
    prev = row;
  }
  return prev[b.length];
}

/** How far a typed fragment is from being the start of a word, allowing for a slip. */
function prefixDistance(typed: string, word: string, limit: number) {
  let best = limit + 1;
  // The fragment may be a letter short or long of the matching stretch.
  for (let n = typed.length - limit; n <= typed.length + limit; n++) {
    if (n < 1 || n > word.length) continue;
    best = Math.min(best, distance(typed, word.slice(0, n), limit));
    if (best === 0) break;
  }
  return best;
}

const startsAWord = (pool: string[], token: string) => pool.some((w) => w.startsWith(token));

// How good a match is, best first. Gaps are wide enough that fame (worth up
// to FAME) reorders within a kind of match but rarely across kinds.
const EXACT = 100;
const NAME_START = 90;
const ALIAS_START = 80;
const ALL_WORDS = 70;
const INSIDE = 60;
const ALIAS_WORDS = 55;
const SLIP = 45;
const CONTEXT = 30;
const FAME = 8;

function score<T>(e: Indexed<T>, query: string, compact: string, tokens: string[]) {
  if (e.name === query || e.aliases.some((a) => a.text === query || a.compact === compact)) return EXACT;
  if (e.name.startsWith(query) || e.core.startsWith(query) || e.compact.startsWith(compact)) {
    return NAME_START;
  }
  if (e.aliases.some((a) => a.text.startsWith(query) || a.compact.startsWith(compact))) return ALIAS_START;
  if (tokens.every((t) => startsAWord(e.words, t))) return ALL_WORDS;
  if (compact.length >= 3 && e.compact.includes(compact)) return INSIDE;

  const pool = e.aliasWords.length ? [...e.words, ...e.aliasWords] : e.words;
  if (tokens.every((t) => startsAWord(pool, t))) return ALIAS_WORDS;

  // Slips. Only worth the work if the words start right, which they almost
  // always do; and only for fragments long enough to tell a slip from a miss.
  if (tokens.every((t) => e.initials.has(t[0]))) {
    let total = 0;
    for (const t of tokens) {
      const limit = slack(t.length);
      let best = limit + 1;
      if (startsAWord(pool, t)) best = 0;
      else if (limit) for (const w of pool) best = Math.min(best, prefixDistance(t, w, limit));
      if (best > limit) {
        total = -1;
        break;
      }
      total += best;
    }
    if (total >= 0) return SLIP - total * 3;
  }
  // The whole thing typed as one run with a slip in it: "solidwrks".
  const limit = slack(compact.length);
  if (limit && e.compact[0] === compact[0] && prefixDistance(compact, e.compact, limit) <= limit) {
    return SLIP - 3;
  }

  if (e.context.length && tokens.every((t) => startsAWord([...pool, ...e.context], t))) return CONTEXT;
  return 0;
}

/** The best matches for what's been typed, best first. */
export function search<T>(index: Index<T>, typed: string, limit = 8): T[] {
  const query = fold(typed);
  if (!query) return [];
  const compact = query.replace(/ /g, "");
  const tokens = words(query);

  const hits: { e: Indexed<T>; score: number }[] = [];
  for (const e of index.entries) {
    const s = score(e, query, compact, tokens);
    if (s) hits.push({ e, score: s + Math.min(e.rank, 200) * (FAME / 200) });
  }
  return hits
    .sort((a, b) => b.score - a.score || a.e.name.length - b.e.name.length)
    .slice(0, limit)
    .map((h) => h.e.item);
}

/** Whether what's typed is already exactly an entry's name. */
export function isKnown<T>(index: Index<T>, typed: string) {
  const query = fold(typed);
  return !!query && index.entries.some((e) => e.name === query);
}
