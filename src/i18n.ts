import * as en from './content'
import * as fr from './content.fr'

/**
 * The site in two languages, each under its own prefix: /ca-en and /ca-fr.
 * A page's language is fixed by its HTML (<html lang>), so there's nothing to
 * switch at runtime: the switcher is a link to the same page in the other one.
 */

export type Lang = 'en' | 'fr'

export const LOCALES = {
  en: { prefix: '/ca-en', name: 'English', short: 'EN', tag: 'en-CA' },
  fr: { prefix: '/ca-fr', name: 'Français', short: 'FR', tag: 'fr-CA' },
} as const

export const lang: Lang = document.documentElement.lang.toLowerCase().startsWith('fr') ? 'fr' : 'en'

/** Any string widened to string, so a translation can say something else in the same shape. */
export type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T

export type Copy = { [K in keyof typeof en]: Widen<(typeof en)[K]> }

const french: Copy = fr

/** Every string for this page's language. */
export const copy: Copy = lang === 'fr' ? french : en

/** A path on this site, in this page's language: "/privacy" becomes "/ca-fr/privacy". */
export function localPath(path: string) {
  return LOCALES[lang].prefix + (path === '/' ? '' : path)
}

/** This page in the other language, keeping the section it's on. */
export function otherLanguagePath(to: Lang) {
  const rest = location.pathname.replace(/^\/ca-(en|fr)/, '').replace(/\/$/, '')
  return LOCALES[to].prefix + rest + location.hash
}
