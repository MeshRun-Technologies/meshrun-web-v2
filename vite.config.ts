import { appendFile, mkdir } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { type Env, handleEarlyAccess, type Sink } from './server/earlyAccess'

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

export default defineConfig(({ mode }) => ({
  // '' loads every variable in .env*, not only VITE_ ones; the server-side
  // keys stay here in Node and never reach the bundle.
  plugins: [react(), tailwindcss(), api(loadEnv(mode, process.cwd(), ''))],
  // host:true so the dev server is reachable from the Windows browser over WSL2.
  server: { host: true, port: 5173, strictPort: true },
}))
