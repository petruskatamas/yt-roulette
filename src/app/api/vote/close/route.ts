import { bump, getState } from '@/server/state'
import { bad, ok, readBody } from '@/server/http'
import { resolveClaim } from '@/server/rules'

// Host decides now with whatever votes were cast (a dead phone shouldn't stall the room).
export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  if (!resolveClaim(state, String(body.claimId), true)) return bad(404, 'no such claim')
  bump()
  return ok()
}
