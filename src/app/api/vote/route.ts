import { bad, bump, getState, ok, readBody, resolveClaim } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const claim = state.claims.find((c) => c.id === body.claimId)
  const voter = state.players.find((p) => p.id === body.playerId)
  if (!claim || !voter) return bad(404, 'no such claim or player')
  if (claim.playerId === voter.id) return bad(403, 'cannot judge your own claim')

  const valid = body.valid === true
  claim.votes[voter.id] = valid
  // recorded here because resolving removes the claim, taking its votes with it
  state.lastVote = { valid, n: Object.keys(claim.votes).length, ts: Date.now() }
  resolveClaim(state, claim.id)
  bump()
  return ok()
}
