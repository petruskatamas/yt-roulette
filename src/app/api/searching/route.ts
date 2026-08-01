import { bump, getState, ok, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const open = body.open === true
  const state = getState()
  if (state.searchOpen !== open) {
    state.searchOpen = open
    bump()
  }
  return ok()
}
