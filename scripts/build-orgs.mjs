// Builds the university and company lists the early access form suggests
// from, as src/data/universities.json and src/data/companies.json.
//
//   node scripts/build-orgs.mjs
//
// Rerun it to pick up new institutions, renames and moves; nothing else needs
// to change. Sources, both open:
//   - Hipo's world universities list (github.com/Hipo/university-domains-list):
//     the names, countries and web domains of ~10k universities worldwide.
//   - Wikidata: where each one is (matched on its web domain), how widely known
//     it is (its count of Wikipedia articles, used to rank matches), and its
//     short names. Companies come from Wikidata alone: large employers, and
//     design, engineering, construction and manufacturing firms, in North
//     America, Europe and Australia.
//
// Each row is [name, area, rank, aliases]; aliases is a "|"-separated string
// of extra search terms (acronyms, short names, the domain), or absent.

import { mkdir, writeFile } from "node:fs/promises";

const UA = "MeshRunOrgBuilder/1.0 (araav@meshrun.co)";
const OUT = new URL("../src/data/", import.meta.url);

/* ------------------------------------------------------------------------ */
// Fetching

async function sparql(query, attempt = 1) {
  const res = await fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ query }),
  });
  if (!res.ok) {
    if (attempt < 4 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      return sparql(query, attempt + 1);
    }
    throw new Error(`Wikidata ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const { results } = await res.json();
  return results.bindings.map((b) =>
    Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value])),
  );
}

/** Runs a query over a long list of item ids, a batch at a time. */
async function sparqlFor(ids, build, size = 600) {
  const out = [];
  for (let i = 0; i < ids.length; i += size) {
    const values = ids.slice(i, i + size).map((x) => `wd:${x}`).join(" ");
    out.push(...(await sparql(build(values))));
    process.stdout.write(".");
  }
  return out;
}

const qid = (uri) => uri?.replace("http://www.wikidata.org/entity/", "");

const log = (...a) => console.log("\n[orgs]", ...a);

/* ------------------------------------------------------------------------ */
// Places

const countryName = new Intl.DisplayNames(["en"], { type: "region" });
const SHORT_COUNTRY = { US: "USA", GB: "UK", AE: "UAE" };
const country = (code) => SHORT_COUNTRY[code] ?? countryName.of(code) ?? code;

/** In these countries the region is known by its postal code: "BC, Canada". */
const CODED = new Set(["US", "CA", "AU"]);

/** Every current first-level region in the world, by item: its name and ISO code. */
async function loadRegions() {
  const rows = await sparql(`
    SELECT DISTINCT ?r ?rLabel ?code WHERE {
      ?r wdt:P31/wdt:P279* wd:Q10864048 ; wdt:P300 ?code .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`);
  const regions = new Map();
  for (const r of rows) regions.set(qid(r.r), { name: r.rLabel, code: r.code });
  return regions;
}

/** "BC, Canada", "Bavaria, Germany", or just the country. */
function area(region, code) {
  if (!code) return "";
  const [cc, sub] = region?.code.split("-") ?? [];
  if (!region || cc !== code) return country(code);
  const name = CODED.has(code) ? sub : region.name;
  return `${name}, ${country(code)}`;
}

/** The first first-level region up a chain of "located in" links. */
const regionOf = (regions, chain) => chain.map((c) => regions.get(c)).find(Boolean);

const locationChain = (row) => [row.l0, row.l1, row.l2, row.l3, row.l4].map(qid).filter(Boolean);

/* ------------------------------------------------------------------------ */
// Search terms

const SMALL = new Set(["of", "the", "and", "for", "in", "at", "de", "la", "le", "du", "des", "&", "-"]);

/** "University of British Columbia" → "ubc". */
function acronym(name) {
  const words = name
    .replace(/[(),.]/g, " ")
    .split(/[\s/-]+/)
    .filter((w) => w && !SMALL.has(w.toLowerCase()));
  // Two letters ("uo") match too much to be worth it.
  return words.length >= 3 ? words.map((w) => w[0]).join("").toLowerCase() : "";
}

const GENERIC = new Set(["www", "ac", "edu", "com", "org", "co", "uni", "univ", "web", "portal", "home"]);

/** The distinctive part of a web domain: "ubc.ca" → "ubc", "ox.ac.uk" → "ox". */
function domainStem(domain) {
  const host = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\d?\./, "");
  return host.split(".").find((p) => p.length >= 2 && !GENERIC.has(p)) ?? "";
}

function aliases(name, extra) {
  const fold = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const own = fold(name);
  const terms = new Set();
  for (const t of [acronym(name), ...extra]) {
    const f = fold(t).replace(/[^a-z0-9 ]+/g, "").trim();
    // Only what adds something: not the name itself, nor a word already in it.
    // Short forms only; long alternative names are mostly old or formal ones.
    if (f.length >= 2 && f.split(" ").length <= 4 && !own.includes(f)) terms.add(f);
  }
  return [...terms].join("|");
}

/** Short names and English aliases, for the items people will actually look for. */
async function loadAliases(ids) {
  const rows = await sparqlFor(
    ids,
    (values) => `
      SELECT ?item ?alias WHERE {
        VALUES ?item { ${values} }
        { ?item skos:altLabel ?alias . FILTER(LANG(?alias) = "en") }
        UNION { ?item wdt:P1813 ?alias . FILTER(LANG(?alias) = "en") }
      }`,
  );
  const map = new Map();
  for (const r of rows) {
    const id = qid(r.item);
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(r.alias);
  }
  return map;
}

/* ------------------------------------------------------------------------ */
// Universities

const host = (url) =>
  url.toLowerCase().replace(/^https?:\/\//, "").replace(/[/:?#].*$/, "").replace(/^www\d?\./, "");

async function universities(regions) {
  const res = await fetch(
    "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json",
  );
  const hipo = await res.json();
  log(`Hipo: ${hipo.length} universities`);

  // Wikidata's universities, keyed by web domain, with where they are.
  const wd = await sparql(`
    SELECT ?item ?web ?links ?l1 ?l2 ?l3 ?l4 WHERE {
      VALUES ?cls { wd:Q3918 wd:Q875538 wd:Q902104 wd:Q189004 wd:Q15936437 wd:Q2418495
                    wd:Q1336920 wd:Q1371037 wd:Q3354859 wd:Q38723 wd:Q23002054 wd:Q62078547 }
      ?item wdt:P31 ?cls ; wdt:P856 ?web ; wdt:P131 ?l1 ; wikibase:sitelinks ?links .
      OPTIONAL { ?l1 wdt:P131 ?l2 . OPTIONAL { ?l2 wdt:P131 ?l3 . OPTIONAL { ?l3 wdt:P131 ?l4 } } }
    }`);
  const byHost = new Map();
  for (const r of wd) {
    const h = host(r.web);
    const prev = byHost.get(h);
    if (!prev || Number(r.links) > prev.links) {
      byHost.set(h, { id: qid(r.item), links: Number(r.links), region: regionOf(regions, locationChain(r)) });
    }
  }
  log(`Wikidata: ${byHost.size} university domains`);

  // Hipo's own state field, where it has one, by name: "British Columbia".
  const regionByName = new Map();
  for (const r of regions.values()) regionByName.set(`${r.code.split("-")[0]}|${r.name.toLowerCase()}`, r);

  const seen = new Set();
  const rows = [];
  for (const u of hipo) {
    const name = u.name.trim().replace(/\s+/g, " ");
    const code = u.alpha_two_code;
    const key = `${name.toLowerCase()}|${code}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);

    const match = u.domains.map((d) => byHost.get(host(d))).find(Boolean);
    const region =
      (match?.region?.code.startsWith(`${code}-`) ? match.region : null) ??
      regionByName.get(`${code}|${(u["state-province"] ?? "").toLowerCase()}`);
    rows.push({ name, area: area(region, code), rank: match?.links ?? 0, id: match?.id, domains: u.domains });
  }

  // Short names for the better-known ones: "UofT", "LSE", "ETH Zurich".
  const known = rows.filter((r) => r.id && r.rank >= 8).map((r) => r.id);
  const extra = await loadAliases([...new Set(known)]);
  return rows.map((r) => [
    r.name,
    r.area,
    r.rank,
    aliases(r.name, [...r.domains.map(domainStem), ...(extra.get(r.id) ?? [])]),
  ]);
}

/* ------------------------------------------------------------------------ */
// Companies

// North America, Europe and Australia.
const COUNTRIES = `wd:Q30 wd:Q16 wd:Q96 wd:Q145 wd:Q27 wd:Q142 wd:Q183 wd:Q29 wd:Q38 wd:Q45
  wd:Q55 wd:Q31 wd:Q32 wd:Q39 wd:Q40 wd:Q35 wd:Q34 wd:Q20 wd:Q33 wd:Q189 wd:Q36 wd:Q213 wd:Q214
  wd:Q28 wd:Q218 wd:Q219 wd:Q41 wd:Q215 wd:Q224 wd:Q191 wd:Q211 wd:Q37 wd:Q229 wd:Q233 wd:Q408`;

// Where the people who use CAD work: architecture and its neighbours,
// engineering of every kind, construction, and the industries that design
// physical products (vehicles, aircraft, ships, machinery, electronics, games).
const INDUSTRIES = [
  "Q12271", // architecture
  "Q47844", // landscape architecture
  "Q179232", // interior design
  "Q1329946", // interior architecture
  "Q69883", // urban planning
  "Q11023", // engineering
  "Q65119680", // engineering consulting
  "Q77590", // civil engineering
  "Q633538", // structural engineering
  "Q101333", // mechanical engineering
  "Q43035", // electrical engineering
  "Q4917288", // control engineering
  "Q385378", // construction
  "Q187939", // industrial manufacturing
  "Q1957908", // machinery and equipment
  "Q190117", // automotive industry
  "Q3477363", // aerospace industry
  "Q2876213", // aerospace
  "Q474200", // shipbuilding
  "Q11650", // electronics
  "Q581105", // consumer electronics
  "Q82604", // design
  "Q243606", // industrial design
  "Q1043226", // product design
  "Q941594", // video game industry
]
  .map((id) => `wd:${id}`)
  .join(" ");

async function companies(regions) {
  // Large employers of any kind, then kept to businesses below.
  const big = await sparql(`
    SELECT ?c ?cLabel ?country ?links ?hq WHERE {
      VALUES ?country { ${COUNTRIES} }
      ?c wdt:P17 ?country ; wdt:P1128 ?emp . FILTER(?emp >= 4000)
      ?c wikibase:sitelinks ?links . FILTER(?links >= 4)
      OPTIONAL { ?c wdt:P159 ?hq }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`);
  const businesses = new Set(
    (
      await sparqlFor(
        [...new Set(big.map((r) => qid(r.c)))],
        // Still trading, too: no dissolution date.
        (values) => `SELECT DISTINCT ?c WHERE {
          VALUES ?c { ${values} } ?c wdt:P31/wdt:P279* wd:Q4830453 .
          FILTER NOT EXISTS { ?c wdt:P576 [] }
        }`,
      )
    ).map((r) => qid(r.c)),
  );
  log(`Large employers: ${businesses.size} businesses`);

  // Firms in the industries that draw, whatever their size, if they're known
  // well enough to have a few Wikipedia articles.
  // One query per industry: together they run past Wikidata's time limit.
  const trade = [];
  for (const pattern of [...INDUSTRIES.split(" ").map((i) => `wdt:P452 ${i}`), "wdt:P31 wd:Q4387609"]) {
    trade.push(
      ...(await sparql(`
        SELECT ?c ?cLabel ?country ?links ?hq WHERE {
          ?c ${pattern} .
          VALUES ?country { ${COUNTRIES} }
          ?c wdt:P17 ?country ; wikibase:sitelinks ?links . FILTER(?links >= 3)
          FILTER NOT EXISTS { ?c wdt:P576 [] }
          OPTIONAL { ?c wdt:P159 ?hq }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }`)),
    );
    process.stdout.write(".");
  }
  log(`Design, engineering and manufacturing firms: ${new Set(trade.map((r) => r.c)).size}`);

  const firms = new Map();
  for (const r of [...big.filter((r) => businesses.has(qid(r.c))), ...trade]) {
    const id = qid(r.c);
    const name = r.cLabel?.trim();
    // No English name: Wikidata hands back the bare id.
    if (!name || /^Q\d+$/.test(name)) continue;
    const prev = firms.get(id);
    if (prev) {
      prev.hq ??= qid(r.hq);
      continue;
    }
    firms.set(id, { id, name, code: null, country: qid(r.country), links: Number(r.links), hq: qid(r.hq) });
  }

  // Some universities, agencies and hospitals are filed as businesses too.
  const NOT_COMPANIES = "wd:Q2385804 wd:Q2659904 wd:Q245065 wd:Q16917 wd:Q327333 wd:Q484652";
  const notCompanies = await sparqlFor(
    [...firms.keys()],
    (values) => `SELECT DISTINCT ?c WHERE {
      VALUES ?c { ${values} } VALUES ?not { ${NOT_COMPANIES} } ?c wdt:P31/wdt:P279* ?not .
    }`,
  );
  for (const r of notCompanies) firms.delete(qid(r.c));
  log(`Dropped ${notCompanies.length} that aren't companies`);

  // Where each one is headquartered, up to its region.
  const hqs = [...new Set([...firms.values()].map((f) => f.hq).filter(Boolean))];
  const chains = await sparqlFor(
    hqs,
    (values) => `
      SELECT ?l0 ?l1 ?l2 ?l3 ?l4 WHERE {
        VALUES ?l0 { ${values} }
        OPTIONAL { ?l0 wdt:P131 ?l1 . OPTIONAL { ?l1 wdt:P131 ?l2 .
          OPTIONAL { ?l2 wdt:P131 ?l3 . OPTIONAL { ?l3 wdt:P131 ?l4 } } } }
      }`,
  );
  const hqRegion = new Map();
  for (const r of chains) {
    const region = regionOf(regions, locationChain(r));
    if (region && !hqRegion.has(qid(r.l0))) hqRegion.set(qid(r.l0), region);
  }

  // Country codes for the country items.
  // The Netherlands' code sits on the Kingdom, not the country.
  const codes = new Map([
    ["Q55", "NL"],
    ...(await sparql(`SELECT ?c ?code WHERE { VALUES ?c { ${COUNTRIES} } ?c wdt:P297 ?code . }`)).map((r) => [
      qid(r.c),
      r.code,
    ]),
  ]);

  const extra = await loadAliases([...firms.keys()]);

  // One row per name: the best-known company of that name wins.
  const byName = new Map();
  for (const f of firms.values()) {
    const code = codes.get(f.country);
    const region = hqRegion.get(f.hq);
    const row = [
      f.name,
      area(region?.code.startsWith(`${code}-`) ? region : null, code),
      f.links,
      aliases(f.name, extra.get(f.id) ?? []),
    ];
    const key = f.name.toLowerCase();
    if (!byName.has(key) || byName.get(key)[2] < f.links) byName.set(key, row);
  }
  for (const [name, where, alias] of ESSENTIAL) {
    const key = name.toLowerCase();
    const row = byName.get(key);
    // Already there: just make sure it answers to its other name.
    if (row) {
      if (alias) row[3] = [row[3], aliases(name, [alias])].filter(Boolean).join("|");
      continue;
    }
    // Ranked as well known: they're who this audience is most likely to type.
    byName.set(key, [name, where, 25, aliases(name, alias ? [alias] : [])]);
  }
  return [...byName.values()];
}

// Firms this audience is likely to type that Wikidata doesn't file under an
// industry, or files without a headquarters. Added if the query missed them;
// if it found them, their other name is added to what they answer to.
const ESSENTIAL = [
  ["BIG", "Denmark", "bjarke ingels group"],
  ["Arup", "England, UK", "ove arup"],
  ["Skidmore, Owings & Merrill", "IL, USA", "som"],
  ["Dyson", "England, UK"],
  ["Mott MacDonald", "England, UK"],
  ["Grimshaw Architects", "England, UK", "grimshaw"],
  ["Heatherwick Studio", "England, UK", "heatherwick"],
  ["BDP", "England, UK", "building design partnership"],
  ["Buro Happold", "England, UK", "burohappold"],
  ["AtkinsRéalis", "QC, Canada", "atkins snc lavalin"],
  ["Stantec", "AB, Canada"],
  ["Diamond Schmitt", "ON, Canada"],
  ["DIALOG", "AB, Canada"],
  ["Zeidler Architecture", "ON, Canada", "zeidler"],
  ["B+H Architects", "ON, Canada", "bh"],
  ["Perkins Eastman", "NY, USA"],
  ["HDR", "NE, USA", "hdr inc"],
  ["Thornton Tomasetti", "NY, USA"],
  ["Walter P Moore", "TX, USA"],
  ["SmithGroup", "MI, USA"],
  ["NBBJ", "WA, USA"],
  ["ZGF Architects", "OR, USA", "zgf"],
  ["Morphosis", "CA, USA"],
  ["Studio Gang", "IL, USA"],
  ["Pelli Clarke & Partners", "CT, USA", "pelli clarke pelli"],
  ["Woods Bagot", "SA, Australia"],
  ["Hassell", "VIC, Australia"],
  ["Bates Smart", "VIC, Australia"],
  ["Aurecon", "VIC, Australia"],
  ["GHD", "VIC, Australia"],
  ["Henning Larsen", "Denmark"],
  ["3XN", "Denmark"],
  ["MVRDV", "Netherlands"],
  ["OMA", "Netherlands", "office for metropolitan architecture"],
  ["UNStudio", "Netherlands"],
  ["Mecanoo", "Netherlands"],
  ["Snøhetta", "Norway", "snohetta"],
  ["White Arkitekter", "Sweden", "white"],
  ["gmp Architekten", "Germany", "von gerkan marg und partner"],
  ["Behnisch Architekten", "Germany", "behnisch"],
  ["Wilkinson Eyre", "England, UK", "wilkinsoneyre"],
  ["Allies and Morrison", "England, UK"],
  ["Rogers Stirk Harbour + Partners", "England, UK", "rshp"],
];

/* ------------------------------------------------------------------------ */

const byRank = (a, b) => b[2] - a[2] || a[0].localeCompare(b[0]);
const compact = (rows) => rows.map((r) => (r[3] ? r : r.slice(0, 3)));

const regions = await loadRegions();
log(`${regions.size} regions`);

const unis = (await universities(regions)).sort(byRank);
const firms = (await companies(regions)).sort(byRank);

await mkdir(OUT, { recursive: true });
await writeFile(new URL("universities.json", OUT), JSON.stringify(compact(unis)));
await writeFile(new URL("companies.json", OUT), JSON.stringify(compact(firms)));
log(`Wrote ${unis.length} universities and ${firms.length} companies to src/data/.`);
