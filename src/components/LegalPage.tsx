import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { copy, localPath } from "../i18n";
import { LangSwitch } from "./LangSwitch";
import { column } from "./layout";
import { SkipLink } from "./SkipLink";
import { Wordmark } from "./Wordmark";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export interface LegalDoc {
  title: string;
  /** Shown under the title, and as the page's description. */
  summary: string;
  updated: string;
  sections: LegalSection[];
}

/** How far down the screen a heading has to pass before its section counts as the one being read. */
const READ_LINE = 0.3;

/**
 * Which section is being read: the last one whose top has passed the reading
 * line. At the very bottom the last section wins, however short it is, since
 * it can never scroll up as far as the line.
 */
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = innerHeight * READ_LINE;
      let index = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) index = i;
      });
      const root = document.documentElement;
      if (scrollY + innerHeight >= root.scrollHeight - 2) index = ids.length - 1;
      setCurrent(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [ids]);

  return current;
}

/**
 * The contents, with a bar on its rule that runs down to whichever section is
 * being read, and that section's link lit.
 */
function Contents({ sections }: { sections: LegalSection[] }) {
  const ids = useRef(sections.map((s) => s.id)).current;
  const current = useCurrentSection(ids);
  const list = useRef<HTMLOListElement>(null);
  const [bar, setBar] = useState({ top: 0, height: 0 });

  // The bar sits beside the current link, as tall as it is; measured, since
  // a heading can wrap onto two lines.
  useLayoutEffect(() => {
    const place = () => {
      const item = list.current?.children[current] as HTMLElement | undefined;
      if (item) setBar({ top: item.offsetTop, height: item.offsetHeight });
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [current]);

  return (
    <nav aria-label={copy.legalPage.contents} className="lg:sticky lg:top-10 lg:self-start">
      <p className="text-sm font-medium text-ink">{copy.legalPage.contents}</p>
      <div className="relative mt-4">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-hairline-strong" />
        <span
          aria-hidden
          className="absolute left-0 w-0.5 -translate-x-[0.5px] rounded-full bg-accent transition-[top,height] duration-(--dur-base) ease-expressive"
          style={{ top: bar.top, height: bar.height }}
        />
        <ol ref={list} className="flex flex-col pl-4 text-sm">
          {sections.map((s, i) => (
            <li key={s.id} className="py-1.25">
              <a
                href={`#${s.id}`}
                aria-current={i === current ? "location" : undefined}
                className="link text-ink-muted transition-colors duration-(--dur-fast) aria-[current=location]:text-ink"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

/**
 * A legal page: the same black, the same type, set for reading. The title and
 * a plain summary up top, the contents beside the text on wide screens so a
 * section is one click away, and every other legal page in the footer.
 */
export function LegalPage({ doc, path }: { doc: LegalDoc; path: string }) {
  return (
    <>
      <SkipLink />
      <header className="border-b border-hairline">
        <div className={`${column} flex h-16 items-center justify-between`}>
          <Wordmark href={localPath("/")} />
          <div className="flex items-center gap-6">
            <a href={localPath("/")} className="link hidden text-sm text-ink-muted sm:inline">
              {copy.legalPage.back}
            </a>
            <LangSwitch className="-mr-1.5" />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        <div className={`${column} pt-16 pb-24 sm:pt-24`}>
          <div className="max-w-3xl">
            <p className="text-sm text-ink-subtle">
              {copy.legalPage.updated} {doc.updated}
            </p>
            <h1 className="display mt-4 text-[clamp(24px,7.5vw,72px)] leading-[0.98] text-balance">{doc.title}</h1>
            <p className="mt-6 max-w-[56ch] text-md text-ink-muted text-pretty">{doc.summary}</p>
          </div>

          <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
            <Contents sections={doc.sections} />

            <div className="legal max-w-[68ch]">
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                  <h2 id={`${s.id}-h`}>{s.heading}</h2>
                  {s.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface">
        <div className={`${column} flex flex-col gap-8 py-12 text-sm`}>
          <nav aria-label={copy.footer.legal} className="flex flex-wrap gap-x-8 gap-y-3">
            {copy.legalLinks.map(([label, page]) => (
              <a
                key={page}
                href={localPath(page)}
                aria-current={page === path ? "page" : undefined}
                className="link py-0.5 text-ink-muted aria-[current=page]:text-ink"
              >
                {label}
              </a>
            ))}
            <a href={`mailto:${copy.contact}`} className="link py-0.5 text-ink-muted">
              {copy.contact}
            </a>
          </nav>
          <div className="flex flex-col gap-4 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>{copy.footer.copyright}</p>
            <LangSwitch className="-ml-1.5 sm:ml-0 sm:-mr-1.5" />
          </div>
        </div>
      </footer>
    </>
  );
}
