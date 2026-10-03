// Writes the site's HTML entry points: every page in both languages, under
// /ca-en and /ca-fr. Each carries its language, title and description, and
// links to its twin in the other language for search engines.
//
//   node scripts/pages.mjs
//
// Run it after changing anything below; the files it writes are committed.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const ORIGIN = 'https://meshrun.co'

const LOCALES = {
  en: { prefix: '/ca-en', tag: 'en-CA' },
  fr: { prefix: '/ca-fr', tag: 'fr-CA' },
}

/** Page path within a language, its script, and its words in each language. */
const PAGES = [
  {
    path: '',
    script: '/src/main.tsx',
    en: {
      title: 'meshrun | Cloud CAD workstations for Mac',
      description:
        'Run SolidWorks, Inventor and other Windows-only CAD on your Mac. meshrun provisions a GPU workstation in the cloud and streams it to your laptop.',
    },
    fr: {
      title: 'meshrun | Stations de travail CAO dans le nuage pour Mac',
      description:
        'Utilisez SolidWorks, Inventor et d’autres logiciels de CAO réservés à Windows sur votre Mac. meshrun met en service une station de travail à GPU dans le nuage et la diffuse sur votre portable.',
    },
  },
  {
    path: '/privacy',
    page: 'privacy',
    script: '/src/legal.tsx',
    en: {
      title: 'Privacy policy | meshrun',
      description:
        'What meshrun collects when you visit meshrun.co or ask for early access, how it’s used, and how to have it changed or deleted.',
    },
    fr: {
      title: 'Politique de confidentialité | meshrun',
      description:
        'Ce que meshrun recueille quand vous visitez meshrun.co ou demandez un accès anticipé, comment c’est utilisé, et comment le faire corriger ou supprimer.',
    },
  },
  {
    path: '/cookies',
    page: 'cookies',
    script: '/src/legal.tsx',
    en: {
      title: 'Cookie policy | meshrun',
      description: 'meshrun.co sets no cookies. What the site keeps in your browser, and why.',
    },
    fr: {
      title: 'Politique relative aux témoins | meshrun',
      description: 'meshrun.co ne dépose aucun témoin. Ce que le site garde dans votre navigateur, et pourquoi.',
    },
  },
  {
    path: '/terms',
    page: 'terms',
    script: '/src/legal.tsx',
    en: {
      title: 'Terms of use | meshrun',
      description: 'The terms for using meshrun.co and joining the meshrun early access list.',
    },
    fr: {
      title: 'Conditions d’utilisation | meshrun',
      description: 'Les conditions d’utilisation de meshrun.co et de la liste d’accès anticipé de meshrun.',
    },
  },
  {
    path: '/accessibility',
    page: 'accessibility',
    script: '/src/legal.tsx',
    en: {
      title: 'Accessibility | meshrun',
      description: 'The accessibility standard meshrun.co is held to, known limitations, and how to report a barrier.',
    },
    fr: {
      title: 'Accessibilité | meshrun',
      description:
        'La norme d’accessibilité visée par meshrun.co, les limites connues, et comment signaler un obstacle.',
    },
  },
]

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const page of PAGES) {
  for (const [lang, locale] of Object.entries(LOCALES)) {
    const words = page[lang]
    const url = (l) => `${ORIGIN}${LOCALES[l].prefix}${page.path}`
    const html = `<!doctype html>
<html lang="${locale.tag}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escape(words.title)}</title>
    <meta name="description" content="${escape(words.description)}" />
    <meta name="theme-color" content="#050505" />
    <link rel="canonical" href="${url(lang)}" />
    <link rel="alternate" hreflang="en-CA" href="${url('en')}" />
    <link rel="alternate" hreflang="fr-CA" href="${url('fr')}" />
    <link rel="alternate" hreflang="x-default" href="${url('en')}" />
  </head>
  <body${page.page ? ` data-page="${page.page}"` : ''}>
    <div id="root"></div>
    <script type="module" src="${page.script}"></script>
  </body>
</html>
`
    const file = `${locale.prefix.slice(1)}${page.path}/index.html`
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
    console.log('wrote', file)
  }
}
