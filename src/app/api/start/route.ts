import { bad, bump, getState, ok } from '@/server/game'

export async function POST() {
  const state = getState()
  if (state.players.length === 0) return bad(400, 'no players')
  state.phase = 'play'
  bump()
  return ok()
}
