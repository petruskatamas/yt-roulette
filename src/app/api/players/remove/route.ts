import { bump, getState, ok, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  state.players = state.players.filter((p) => p.id !== body.id)
  if (state.current >= state.players.length) state.current = 0
  bump()
  return ok()
}
