import '@fontsource-variable/unbounded'
import '@fontsource-variable/host-grotesk'
import './styles/site.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { LegalPage, type LegalDoc } from './components/LegalPage'
import { lang } from './i18n'
import { accessibility } from './legal/accessibility'
import { accessibility as accessibilityFr } from './legal/accessibility.fr'
import { cookies } from './legal/cookies'
import { cookies as cookiesFr } from './legal/cookies.fr'
import { privacy } from './legal/privacy'
import { privacy as privacyFr } from './legal/privacy.fr'
import { terms } from './legal/terms'
import { terms as termsFr } from './legal/terms.fr'

// Each legal page is its own HTML file, so it has a real address and works
// without the landing's script; the body says which document it shows, and
// <html lang> which language.
const DOCS: Record<'en' | 'fr', Record<string, LegalDoc>> = {
  en: { privacy, cookies, terms, accessibility },
  fr: { privacy: privacyFr, cookies: cookiesFr, terms: termsFr, accessibility: accessibilityFr },
}

const page = document.body.dataset.page ?? 'privacy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LegalPage doc={DOCS[lang][page]} path={`/${page}`} />
  </StrictMode>,
)
