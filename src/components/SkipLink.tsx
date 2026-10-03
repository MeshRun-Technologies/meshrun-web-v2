import { copy } from "../i18n";

/** The first thing a keyboard reaches: straight past the bar to the page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-full bg-cta px-5 py-3 text-sm font-medium text-on-cta focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {copy.nav.skip}
    </a>
  );
}
