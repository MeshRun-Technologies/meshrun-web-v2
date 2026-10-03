import { appendFile, mkdir } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { type Env, handleEarlyAccess, type Sink } from './server/earlyAccess.js'

// With nothing configured, local submissions land in a file instead of
// failing, so the form can be worked on without any keys.
const DEV_LOG = '.data/early-access.jsonl'
const devSink: Sink = {
  name: 'file',
  async deliver(record) {
    await mkdir('.data', { recursive: true })
    await appendFile(DEV_LOG, `${JSON.stringify(record)}\n`)
    console.log(`[early-access] saved to ${DEV_LOG}`)
  },
}

/** Serves the api/ functions from the dev and preview servers, as Vercel would. */
function api(env: Env): Plugin {
  const serve = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
    const request = new Request(new URL(req.url ?? '/', 'http://localhost'), {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
    })
    const response = await handleEarlyAccess(request, env, { fallback: devSink })
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(Buffer.from(await response.arrayBuffer()))
  }
  return {
    name: 'meshrun-api',
    configureServer: (server) => void server.middlewares.use('/api/early-access', serve),
    configurePreviewServer: (server) => void server.middlewares.use('/api/early-access', serve),
  }
}

/**
 * Every page in both languages: /ca-en and /ca-fr, each with the landing and
 * the legal pages. scripts/pages.mjs writes the HTML for each.
 */
const LOCALES = ['ca-en', 'ca-fr']
const PAGES = ['', 'privacy', 'cookies', 'terms', 'accessibility']
const ENTRIES = Object.fromEntries(
  LOCALES.flatMap((locale) =>
    PAGES.map((page) => [`${locale}${page ? `-${page}` : ''}`, `${locale}/${page ? `${page}/` : ''}index.html`]),
  ),
)

/**
 * The addresses as Vercel serves them (vercel.json), for the dev and preview
 * servers: clean paths onto their index.html, and the root and the old
 * unprefixed legal paths redirected into a language.
 */
const PAGE = /^\/(ca-en|ca-fr)(?:\/(privacy|cookies|terms|accessibility))?\/?(\?.*)?$/
const OLD = /^\/(privacy|cookies|terms|accessibility)\/?$/
function localeRoutes(): Plugin {
  const route = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? '/'
    const redirect = (to: string) => {
      res.statusCode = 307
      res.setHeader('Location', to)
      res.end()
    }
    if (url === '/' || url.startsWith('/?')) {
      const french = /^fr\b/i.test(req.headers['accept-language'] ?? '')
      return redirect(french ? '/ca-fr' : '/ca-en')
    }
    const old = url.match(OLD)
    if (old) return redirect(`/ca-en/${old[1]}`)
    const page = url.match(PAGE)
    if (page) req.url = `/${page[1]}/${page[2] ? `${page[2]}/` : ''}index.html${page[3] ?? ''}`
    next()
  }
  return {
    name: 'meshrun-locale-routes',
    configureServer: (server) => void server.middlewares.use(route),
    configurePreviewServer: (server) => void server.middlewares.use(route),
  }
}

export default defineConfig(({ mode }) => ({
  // '' loads every variable in .env*, not only VITE_ ones; the server-side
  // keys stay here in Node and never reach the bundle.
  plugins: [react(), tailwindcss(), localeRoutes(), api(loadEnv(mode, process.cwd(), ''))],
  // host:true so the dev server is reachable from the Windows browser over WSL2.
  server: { host: true, port: 5173, strictPort: true },
  // Each page, in each language, as its own document at its own address.
  build: { rolldownOptions: { input: ENTRIES } },
}))
