import { bad, bump, getState, ok, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const current = state.players[state.current]
  if (state.phase !== 'play' || !current || current.id !== body.playerId) {
    return bad(400, 'not your turn')
  }
  if (!state.spinRequested) {
    state.spinRequested = true
    bump()
  }
  return ok()
}
