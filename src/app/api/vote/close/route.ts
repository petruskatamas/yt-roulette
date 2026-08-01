import { bad, bump, getState, ok, readBody, resolveClaim } from '@/server/game'

/** Host decides now with whatever votes were cast (a dead phone shouldn't stall the room). */
export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  if (!resolveClaim(state, String(body.claimId), true)) return bad(404, 'no such claim')
  bump()
  return ok()
}
