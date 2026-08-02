import { bump, getState } from '@/server/state'
import { bad, ok, readBody } from '@/server/http'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const current = state.players[state.current]
  if (state.phase !== 'play' || !current || current.id !== body.playerId) {
    return bad(400, 'not your turn')
  }
  if (state.searchOpen) return bad(409, 'tv is busy')
  if (state.claims.length) return bad(409, 'claims pending')
  if (!state.spinRequested) {
    state.spinRequested = true
    bump()
  }
  return ok()
}
