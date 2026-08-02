import { bump, getState } from '@/server/state'
import { ok, readBody } from '@/server/http'
import { resolveClaim } from '@/server/rules'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  state.voteMode = body.on === true
  // turning it off shouldn't swallow claims people already made in good faith
  if (!state.voteMode) {
    for (const claim of [...state.claims]) resolveClaim(state, claim.id, true)
  }
  bump()
  return ok()
}
