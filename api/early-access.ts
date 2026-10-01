// Vercel function: POST /api/early-access. The logic lives in server/ so the
// Vite dev server can run the very same handler.

import { handleEarlyAccess } from "../server/earlyAccess.js";

export function POST(request: Request) {
  return handleEarlyAccess(request, process.env);
}
