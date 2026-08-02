import { bump, getState } from '@/server/state'
import { bad, ok } from '@/server/http'

export async function POST() {
  const state = getState()
  if (state.players.length === 0) return bad(400, 'no players')
  state.phase = 'play'
  bump()
  return ok()
}
