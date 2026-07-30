import { bad, bump, getState, ok, readBody } from '@/server/game'
import type { Spin } from '@/types'

export async function POST(req: Request) {
  const body = await readBody(req)
  const spin = body.spin as Spin | undefined
  if (!spin?.query) return bad(400, 'bad spin')
  const state = getState()
  state.lastSpin = spin
  state.current = state.players.length ? (state.current + 1) % state.players.length : 0
  state.spinRequested = false
  bump()
  return ok()
}
