// The universities and companies the early access form suggests from, built
// by scripts/build-orgs.mjs. Each list is its own chunk, fetched the first time
// someone needs it, so the page itself carries none of it.

import { buildIndex, type Index, type Searchable } from "./search";

export type OrgKind = "University" | "Company";

export interface Org extends Searchable {
  /** Where it is: "BC, Canada". */
  area: string;
}

type Row = [name: string, area: string, rank: number, aliases?: string];

const loaders: Record<OrgKind, () => Promise<{ default: unknown }>> = {
  University: () => import("../data/universities.json"),
  Company: () => import("../data/companies.json"),
};

const cache = new Map<OrgKind, Promise<Index<Org>>>();

export function loadOrgs(kind: OrgKind): Promise<Index<Org>> {
  let index = cache.get(kind);
  if (!index) {
    index = loaders[kind]().then(({ default: rows }) =>
      buildIndex(
        (rows as Row[]).map(([name, area, rank, aliases]) => ({
          name,
          area,
          rank,
          aliases: aliases?.split("|"),
        })),
      ),
    );
    // A failed fetch can be tried again next time.
    index.catch(() => cache.delete(kind));
    cache.set(kind, index);
  }
  return index;
}
