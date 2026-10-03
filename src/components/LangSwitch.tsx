import type { MouseEvent } from "react";

import { copy, lang, LOCALES, otherLanguagePath, type Lang } from "../i18n";

const ORDER: Lang[] = ["en", "fr"];

/**
 * EN / FR: the language the page is in, and a link to the same page in the
 * other one. The link is worked out again on click, so a section scrolled to
 * since the page loaded (#pricing) comes along.
 */
export function LangSwitch({ className = "" }: { className?: string }) {
  const follow = (to: Lang) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = otherLanguagePath(to);
  };

  return (
    <div role="group" aria-label={copy.nav.language} className={`flex items-center text-sm ${className}`}>
      {ORDER.map((code, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="px-0.5 text-ink-subtle">
              /
            </span>
          )}
          {code === lang ? (
            <span aria-current="true" className="px-1.5 py-1 text-ink" title={LOCALES[code].name}>
              {LOCALES[code].short}
              <span className="sr-only"> ({LOCALES[code].name})</span>
            </span>
          ) : (
            <a
              href={otherLanguagePath(code)}
              onClick={follow(code)}
              hrefLang={LOCALES[code].tag}
              lang={LOCALES[code].tag}
              title={LOCALES[code].name}
              className="link px-1.5 py-1 text-ink-muted hover:text-ink"
            >
              {LOCALES[code].short}
              <span className="sr-only"> ({LOCALES[code].name})</span>
            </a>
          )}
        </span>
      ))}
    </div>
  );
}
